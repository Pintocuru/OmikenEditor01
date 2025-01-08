<!-- src/components/ListRules/ListRulesSetting.vue -->
<template>
 <v-sheet class="d-flex ga-2 justify-end">
   <v-select
    v-model="currentItem.enableIds"
    :items="omikujiLists"
    label="有効にするおみくじ"
    chips
    multiple
    item-title="name"
    item-value="id"
    @update:model-value="updateRulesEnabledIds($event, currentItem.id)"
   />
   <v-tooltip v-for="btn in toolButtons" :key="btn.key" :text="btn.tooltip" location="top">
    <template #activator="{ props }">
     <v-btn
      icon
      v-bind="props"
      :color="btn.key !== 'addItem' && modelValue[btn.key as keyof typeof modelValue] ? 'primary' : btn.color"
      @click="btn.onClick"
     >
      <v-icon>{{ btn.icon }}</v-icon>
     </v-btn>
    </template>
   </v-tooltip>
 </v-sheet>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ListCategory, OmikenEntry, RulesType } from '@type';
import { FunkRules } from '@/composables/FunkRules';
import { FunkEmits } from '@/composables/FunkEmits';

const props = defineProps<{
 rulesEntry: RulesType;
 modelValue: { showEnabledIds: boolean; showWeightEditor: boolean };
}>();

const emit = defineEmits<{
 (e: 'update:Omiken', payload: OmikenEntry<ListCategory>): void;
 (e: 'update:modelValue', value: { showEnabledIds: boolean; showWeightEditor: boolean }): void;
}>();

// コンポーザブル:FunkEmits
const { updateOmikenEntry } = FunkEmits(emit);
const { omikujiLists } = FunkRules();

const currentItem = computed({
 get: () => props.rulesEntry,
 set: (value: RulesType) => {
  if (value?.id && props.rulesEntry) {
   updateRulesEnabledIds(value.enableIds, props.rulesEntry.id);
  }
 }
});

const toolButtons = [
 {
  key: 'showWeightEditor',
  tooltip: '出現割合を編集する',
  icon: 'mdi-percent',
  onClick: () => toggleState('showWeightEditor')
 },
 {
  key: 'addItem',
  tooltip: 'アイテムを追加する',
  icon: 'mdi-plus',
  onClick: addItemOmikuji,
  color: 'primary',
 }
];

const toggleState = (key: keyof typeof props.modelValue) => {
 emit('update:modelValue', { ...props.modelValue, [key]: !props.modelValue[key] });
};

function addItemOmikuji() {
 if (!props.rulesEntry) return;
 if (props.rulesEntry.id) {
  emit('update:Omiken', {
   type: 'omikujis',
   addKeys: [{ name: '新しいおみくじ', optionId: props.rulesEntry.id }]
  });
 }
}

// rules.enableIds の更新
const updateRulesEnabledIds = (enableIds: string[], ruleId: string) => {
 if (ruleId && props.rulesEntry) {
  updateOmikenEntry('rules', { ...props.rulesEntry, enableIds });
 }
};
</script>
