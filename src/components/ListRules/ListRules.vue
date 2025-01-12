<!-- src/components/ListRules/ListRules.vue -->
<template>
 <div v-for="(rule, index) in currentItems" :key="rule.id" class="mb-2">
  <!-- ヘッダー部分 -->
  <v-card elevation="0" class="w-100" @click="togglePanel(rule.id)" :class="{ 'cursor-pointer': true }">
   <v-toolbar :color="rule?.color">
    <v-toolbar-title class="ml-2">
     <DialogTypes :rule="rule" :Omiken="AppEditor.Omiken" @update:Omiken="updateOmiken" />
     {{ rule?.name }}
     <!-- 名前・説明の編集 -->
     <PartsNameEditor type="rules" :currentItem="rule" @update:Omiken="updateOmiken" />

     <!-- enableIdsにあるアイテム数 -->
     <v-chip label class="ml-4"> {{ rule?.enableIds.length }} items </v-chip>
     <!-- rulesのカラー -->
     <PartsToolbarColor v-model="rule.color" @update:model-value="updateOmikenEntry('rules', rule)" />
     <!-- 展開状態を示すアイコン -->
     <v-icon class="ml-2">
      {{ uiState.expandedPanels.includes(rule.id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
     </v-icon>
    </v-toolbar-title>
    <template #append>
     <!-- バーガーメニュー -->
     <PartsArrayAction editMode="rule" :entry="rule" @update:Omiken="updateOmiken" />
    </template>
   </v-toolbar>
   <v-card-text class="list-group d-flex flex-wrap">
    {{ rule?.description }}
   </v-card-text>
  </v-card>

  <!-- 展開部分 -->
  <v-expand-transition>
   <div v-show="uiState.expandedPanels.includes(rule.id)">
  <!-- タブ -->
  <v-tabs v-model="tab" align-tabs="center" stacked>
   <v-tab v-for="tabItem in tabs" :key="tabItem.value" :value="tabItem.value">
     <v-icon :icon="tabItem.icon"></v-icon>
    {{ tabItem.label }}
   </v-tab>
  </v-tabs>

    <v-tabs-window v-model="tab">
     <v-tabs-window-item  value="threshold">
      <!-- Threshold -->
      <ThresholdMain :item="rule" mode="rules" type="comment" @update:Omiken="updateOmiken" />
     </v-tabs-window-item>
     <v-tabs-window-item  value="list">
      <!-- 有効リスト -->
      <v-select
       v-model="rule.enableIds"
       :items="omikujiLists"
       label="有効にするおみくじ"
       chips
       multiple
       item-title="name"
       item-value="id"
       @update:model-value="updateOmikenEntry('rules', { ...rule, enableIds: $event })"
      />
     </v-tabs-window-item>
      <!-- 出現割合 -->
     <v-tabs-window-item  value="percent"></v-tabs-window-item>
    </v-tabs-window>

    <v-card-text>
     <v-row>
      <!-- enableIds順におみくじを並べる -->
      <ListRulesOmikujiView
       :rule="rule"
       :omikujis="AppEditor.Omiken.omikujis"
       :showWeightEdit="showWeightEdit"
       @open-editor="openEditor"
       @update:Omiken="updateOmiken"
      />
     </v-row>
    </v-card-text>
   </div>
  </v-expand-transition>
 </div>
 <v-sheet>
  <v-btn block @click="addItem('rules')" color="primary" variant="flat" class="mt-6">
   <v-icon left>mdi-plus</v-icon> ルールの追加
  </v-btn>
 </v-sheet>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { OmikenEntry, ListCategory, ListEntry, CategoryActive, AppEditorType, RulesType } from '@type';
import PartsArrayAction from '@/components/common/PartsArrayAction.vue';
import DialogTypes from '@/components/DialogTypes.vue';
import ListRulesOmikujiSetting from '@/components/ListRules/ListRulesSetting.vue';
import ListRulesOmikujiView from '@/components/ListRules/ListRulesOmikujis.vue';
import ThresholdMain from '@/components/DialogThreshold/DialogThreshold.vue';
import PartsNameEditor from '@/components/common/PartsNameEditor.vue';
import PartsToolbarColor from '@/components/common/PartsToolbarColor.vue';
import { FunkEmits } from '@/composables/FunkEmits';
import { FunkRules } from '@/composables/FunkRules';

const props = defineProps<{
 AppEditor: AppEditorType;
 categoryActive: CategoryActive;
}>();

const emit = defineEmits<{
 (e: 'update:Omiken', payload: OmikenEntry<ListCategory>): void;
 (e: 'open-editor', editorItem: ListEntry<ListCategory>): void;
}>();

// コンポーザブル:FunkEmits
const { updateOmiken, openEditor, updateOmikenEntry } = FunkEmits(emit);
const { omikujiLists } = FunkRules();

// UIの各種ref
const uiState = ref({
 expandedPanels: [] as string[], // 展開状態を管理
 showEnabledIds: false,
 showWeightEditor: false
});

// タブ
const tab = ref<'threshold' | 'list' | 'percent'>('threshold'); // タブの状態管理
const tabs = [
 { value: 'threshold', icon: 'mdi-tune', label: '条件設定' },
 { value: 'list', icon: 'mdi-format-list-checks', label: '有効リスト' },
 { value: 'percent', icon: 'mdi-percent', label: '出現割合' }
 // { value: 'scripts', icon: 'mdi-script-text', label: 'スクリプト' }
];

const showWeightEdit = computed(() =>{
return tab.value === 'percent'}
)

// 全てのtypes配列を連結し、並び替えを行う
const currentItems = computed(() => {
 const { types, rules } = props.AppEditor.Omiken;
 const ids = Object.values(types).flat();
 return Object.fromEntries(Object.entries(rules).sort((a, b) => ids.indexOf(a[0]) - ids.indexOf(b[0])));
});

// パネルの開閉を切り替える関数
const togglePanel = (ruleId: string) => {
 const { expandedPanels } = uiState.value;
 expandedPanels.includes(ruleId)
  ? expandedPanels.splice(expandedPanels.indexOf(ruleId), 1)
  : expandedPanels.push(ruleId);
};

// アイテムを追加
const addItem = (type: ListCategory) => {
 emit('update:Omiken', { type, addKeys: [{ name: '新しいルール' }] });
};
</script>
