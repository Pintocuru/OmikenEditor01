<!-- src/components/common/PartsArrayAction.vue -->
<template>
 <v-menu v-model="menu" :close-on-content-click="false">
  <template v-slot:activator="{ props }">
   <v-btn v-bind="props" size="small" icon>
    <v-icon>mdi-dots-vertical</v-icon>
   </v-btn>
  </template>
  <v-list>
   <v-list-item v-for="item in menuItems" :key="item.action" @click="menuAction(item.action)">
    <v-icon :class="item.iconClass">{{ item.icon }}</v-icon>
    <span :class="`${item.iconClass} pl-6`">{{ item.label }}</span>
   </v-list-item>
  </v-list>
 </v-menu>
</template>

<script setup lang="ts">
import { ref, computed, inject, Ref } from 'vue';
import type { OmikenEntry, OmikujiType, RulesType, AppEditorType, PlaceType, ListCategory } from '@type';
import Swal from 'sweetalert2';

const props = defineProps<{
 category: ListCategory;
 rulesEntry?: RulesType;
 omikujiEntry?: OmikujiType;
 placeEntry?: PlaceType;
}>();

const emit = defineEmits<{
 (e: 'edit'): void;
 (e: 'update:Omiken', payload: OmikenEntry<ListCategory>): void;
}>();

const menu = ref(false);

// Inject
const AppEditor = inject<Ref<AppEditorType>>('AppEditorKey');

/**
 * メニュー項目の定義
 */
const menuItems = computed(() =>
 [
  {
   action: 'edit',
   icon: 'mdi-pencil',
   iconClass: 'text-primary',
   label: '編集'
  },
  {
   action: 'duplicate',
   icon: 'mdi-content-copy',
   iconClass: 'text-info',
   label: '複製'
  },
  {
   action: props.rulesEntry ? 'remove' : 'add',
   icon: props.rulesEntry ? 'mdi-playlist-remove' : 'mdi-playlist-plus',
   iconClass: 'text-warning',
   label: props.rulesEntry ? 'リストから除外' : 'リストに追加'
  },
  {
   action: 'delete',
   icon: 'mdi-delete',
   iconClass: 'text-error',
   label: 'データの削除'
  }
 ].filter((item) => props.category === 'omikujis' || (item.action !== 'remove' && item.action !== 'add'))
);

/**
 * メニューアクションのハンドラー
 */
const menuAction = (action: string) => {
 const actionMap: Record<string, () => void> = {
  edit: editItem,
  duplicate: duplicateItem,
  remove: removeList,
  add: addList,
  delete: deleteItem
 };

 actionMap[action]();
 menu.value = false;
};

const getEntryByCategory = (category: ListCategory) => {
 switch (category) {
  case 'rules':
   return props.rulesEntry;
  case 'omikujis':
   return props.omikujiEntry;
  case 'places':
   return props.placeEntry;
  default:
   return null;
 }
};

/**
 * 編集アクション
 */
const editItem = () => {
 emit('edit');
};

// 項目の複製
const duplicateItem = () => {
 const entry = getEntryByCategory(props.category);
 if (!entry) return;

 const duplicatedItem = JSON.parse(JSON.stringify(entry));
 duplicatedItem.name = `${duplicatedItem.name} (コピー)`;
 // rulesEntryがあるならrules.enableIdsにも入れる
 if (props.rulesEntry) duplicatedItem.rulesId = props.rulesEntry.id;

 emit('update:Omiken', {
  type: props.category,
  addKeys: duplicatedItem
 });
};

// 項目の削除
const deleteItem = () => {
 const entry = getEntryByCategory(props.category);
 if (!entry) return;

 Swal.fire({
  title: `${entry.name} を削除する`,
  text: 'この設定を削除しますか？',
  icon: 'warning',
  confirmButtonText: 'OK',
  confirmButtonColor: '',
  showDenyButton: true,
  denyButtonColor: '',
  denyButtonText: 'キャンセル'
 }).then((result) => {
  if (result.isConfirmed) {
   emit('update:Omiken', {
    type: props.category,
    delKeys: [entry.id]
   });
  }
 });
};

// リストからの除外 (omikuji)
const removeList = () => {
 if (!props.rulesEntry || !props.omikujiEntry) return;
 const update: Record<string, RulesType> = {
  [props.rulesEntry.id]: {
   ...props.rulesEntry,
   enableIds: props.rulesEntry.enableIds.filter((id: string) => id !== props.omikujiEntry?.id)
  }
 };

 emit('update:Omiken', {
  type: 'rules',
  update
 });
};

// rules選択リストの生成 (omikuji)
const rulesList = computed(() => {
 if (!AppEditor?.value.Omiken.rules) return [];

 return Object.entries(AppEditor.value.Omiken.rules).map(([id, rule]) => ({
  id,
  name: rule.name
 }));
});

// リストへの追加 (omikuji)
const addList = async () => {
 const { value: ruleId } = await Swal.fire({
  title: 'ルールを選択',
  input: 'select',
  inputOptions: Object.fromEntries(rulesList.value.map((rule) => [rule.id, rule.name])),
  showCancelButton: true,
  inputPlaceholder: 'ルールを選択してください',
  confirmButtonText: 'OK',
  cancelButtonText: 'キャンセル'
 });

 if (ruleId) {
  const rulesEntry = AppEditor?.value.Omiken.rules[ruleId];
  if (!rulesEntry) return;
  if (!props.omikujiEntry) return;
  emit('update:Omiken', {
   type: 'rules',
   update: {
    [ruleId]: {
     ...rulesEntry,
     enableIds: [...rulesEntry.enableIds, props.omikujiEntry.id]
    }
   }
  });
 }
};
</script>
