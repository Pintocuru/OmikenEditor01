<!-- src/components/ListRules.vue -->
<template>
 <div v-for="(rule, index) in rules" :key="rule.id" class="mb-2">
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
    <!-- Threshold -->
    <ThresholdMain :item="rule" mode="rules" type="comment" @update:Omiken="updateOmiken" />

    <!-- 追加ボタン等 -->
    <ListRulesOmikujiSetting :rulesEntry="rule" v-model="uiState" @update:Omiken="updateOmiken" />
    <v-card-text>
     <v-row>
      <!-- enableIds順におみくじを並べる -->
      <ListRulesOmikujiView
       :rule="rule"
       :omikujis="AppEditor.Omiken.omikujis"
       :uiState="uiState"
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
import { OmikenEntry, ListCategory, ListEntry, CategoryActive, TypesType, AppEditorType } from '@type';
import PartsArrayAction from '@/components/common/PartsArrayAction.vue';
import DialogTypes from '@/components/DialogTypes.vue';
import ListRulesOmikujiSetting from '@/components/ListRulesOmikujiSetting.vue';
import ListRulesOmikujiView from '@/components/ListRulesOmikujiView.vue';
import ThresholdMain from '@/components/DialogThreshold/DialogThreshold.vue';
import PartsNameEditor from '@/components/common/PartsNameEditor.vue';
import PartsToolbarColor from '@/components/common/PartsToolbarColor.vue';
import { FunkEmits } from '@/composables/FunkEmits';

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

// UIの各種ref
const uiState = ref({
 expandedPanels: [] as string[], // 展開状態を管理
 showEnabledIds: false,
 showWeightEditor: false
});

const rules = computed(() => {
  // 全てのtypes配列を連結して、ルールIDの順序配列を作成
  const orderedRuleIds = Object.values(props.AppEditor.Omiken.types).flat();
  
  // rulesオブジェクトのエントリーを配列に変換
  const rulesEntries = Object.entries(props.AppEditor.Omiken.rules);
  
  // orderedRuleIdsの順序に基づいて並び替え
  const sortedEntries = rulesEntries.sort((a, b) => {
    const indexA = orderedRuleIds.indexOf(a[0]);
    const indexB = orderedRuleIds.indexOf(b[0]);
    return indexA - indexB;
  });

  return Object.fromEntries(sortedEntries);
});

// パネルの開閉を切り替える関数
const togglePanel = (ruleId: string) => {
 const index = uiState.value.expandedPanels.indexOf(ruleId);
 if (index === -1) {
  uiState.value.expandedPanels.push(ruleId);
 } else {
  uiState.value.expandedPanels.splice(index, 1);
 }
};

// アイテムを追加
const addItem = (type: ListCategory) => {
 emit('update:Omiken', { type, addKeys: [{ name: '新しいルール' }] });
};
</script>
