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
     <span class="mr-2">ID : {{ rule?.id }}</span>
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
    <ListRulesTabs :rule="rule" @showWeightEdit="isWeightEdit" @update:Omiken="updateOmiken" />

    <v-card-text>
     <v-row>
      <!-- enableIds順におみくじを並べる -->
      <ListRulesOmikujiView
       :rule="rule"
       :omikujis="AppEditor.Omiken.omikujis"
       :showWeightEdit="uiState.showWeightEditor"
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
import { OmikenEntry, ListCategory, ListEntry, CategoryActive, AppEditorType } from '@type';
import PartsArrayAction from '@/components/common/PartsArrayAction.vue';
import DialogTypes from '@/components/DialogTypes.vue';
import ListRulesOmikujiView from '@/components/ListRules/ListRulesOmikujis.vue';
import ListRulesTabs from '@/components/ListRules/ListRulesTabs.vue';
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
 expandedPanels: [] as string[], // v-expand-transition の展開状態
 showWeightEditor: false // 出現割合の展開
});

const isWeightEdit = (showWeightEditor: boolean) => {
 uiState.value.showWeightEditor = showWeightEditor;
};

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
