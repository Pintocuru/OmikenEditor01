<!-- src/components/ListRules.vue -->
<template>
 <div class="pt-2">
  <div v-for="(rule, index) in rules" :key="rule.id" class="mb-2">
   <!-- ヘッダー部分 -->
   <v-card elevation="0" class="w-100" @click="togglePanel(rule.id)" :class="{ 'cursor-pointer': true }">
    <v-toolbar :color="rule?.color">
     <v-toolbar-title class="ml-2">
      <v-icon class="mx-2">
       {{ TYPE_ICON_MAP[findType(rule.id)?.type || 'unused'] }}
      </v-icon>
      {{ rule?.name }}
      <!-- enableIdsにあるアイテム数 -->
      <v-chip label class="ml-4"> {{ rule?.enableIds.length }} items </v-chip>
      <!-- rulesのカラー -->
      <PartsToolbarColor v-model="rule.color" @update:model-value="updateItem(rule)" />
      <!-- 展開状態を示すアイコン -->
      <v-icon class="ml-2">
       {{ expandedPanels.includes(rule.id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
      </v-icon>
     </v-toolbar-title>
     <template #append>
      <PartsToolbarAction
       selectCategory="rules"
       :item="rule"
       @edit="openEditorItem('rules', rule.id)"
       @update:Omiken="updateOmiken"
      />
     </template>
    </v-toolbar>
    <v-card-text class="list-group d-flex flex-wrap">
     {{ rule?.description }}
    </v-card-text>
   </v-card>

   <!-- 展開部分 -->
   <v-expand-transition>
    <div v-show="expandedPanels.includes(rule.id)">
     <!-- Threshold -->
     <ThresholdMain
      :Thresholds="rule.threshold"
      :mode="'rule'"
      :type="'comment'"
      @update:Thresholds="updateItem(rule)"
     />

     <!-- 追加ボタン等 -->
     <ListRulesOmikujiSetting :rulesEntry="rule" :uiState="uiState" @update:Omiken="updateOmiken" />
     <v-card-text>
      <v-row>
       <!-- enableIds順におみくじを並べる -->
       <ListRulesOmikujiView
        :rule="rule"
        :omikujis="Omiken.omikujis"
        :uiState="uiState"
        @open-editor="openEditor"
        @update:Omiken="updateOmiken"
       />
      </v-row>
     </v-card-text>
    </div>
   </v-expand-transition>
  </div>
 </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { OmikenEntry, ListCategory, ListEntry, CategoryActive, OmikenType, TypesType, RulesType } from '@type';
import ListRulesOmikujiSetting from '@/components/ListRulesOmikujiSetting.vue';
import ListRulesOmikujiView from '@/components/ListRulesOmikujiView.vue';
import ThresholdMain from '@/components/DialogThreshold/ThresholdMain.vue';
import { FunkThreshold } from '@/composables/FunkThreshold';
import { FunkEmits } from '@/composables/FunkEmits';
import PartsToolbarColor from '@/components/common/PartsToolbarColor.vue';
import PartsToolbarAction from '@/components/common/PartsToolbarAction.vue';

// 展開状態を管理する配列
const expandedPanels = ref<string[]>([]);

// パネルの開閉を切り替える関数
const togglePanel = (ruleId: string) => {
 const index = expandedPanels.value.indexOf(ruleId);
 if (index === -1) {
  expandedPanels.value.push(ruleId);
 } else {
  expandedPanels.value.splice(index, 1);
 }
};

const props = defineProps<{
 Omiken: OmikenType;
 categoryActive: CategoryActive;
}>();

const emit = defineEmits<{
 (e: 'update:Omiken', payload: OmikenEntry<ListCategory>): void;
 (e: 'open-editor', editorItem: ListEntry<ListCategory>): void;
}>();

const rules = computed(() => props.Omiken.rules);

// コンポーザブル:FunkEmits
const { updateOmiken, openEditor, openEditorItem } = FunkEmits(emit);
// コンポーザブル:funkThreshold
const { getExampleText } = FunkThreshold();

const findType = (id: string): { type: TypesType; index: number } | null => {
 for (const [type, ids] of Object.entries(props.Omiken.types)) {
  const index = ids.indexOf(id);
  if (index !== -1) {
   return { type: type as TypesType, index };
  }
 }
 return null; // 見つからなかった場合
};

const TYPE_ICON_MAP: Record<TypesType, string> = {
 comment: 'mdi-comment-outline',
 timer: 'mdi-timer-outline',
 meta: 'mdi-information-outline',
 waitingList: 'mdi-format-list-bulleted',
 setList: 'mdi-checkbox-multiple-marked-outline',
 reactions: 'mdi-emoticon-outline',
 unused: 'mdi-cancel'
};

// UIの各種ref
const uiState = ref({
 showEnabledIds: false,
 showWeightEditor: false
});

// 更新処理
const updateItem = (rule: RulesType) => {
 emit('update:Omiken', {
  type: 'rules',
  update: rule
 });
};
</script>
