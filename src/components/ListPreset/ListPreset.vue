<!-- src/components/ListPreset/ListPreset.vue -->
<template>
 <!-- 各種リストコンポーネントの条件付きレンダリング -->
 <component
  :is="currentListComponent"
  :AppEditor="AppEditor"
  @update:Omiken="updateOmiken"
  @update:OmikenPreset="updateOmikenPreset"
  @update:category="openList"
 />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { AppEditorType, CategoryActive, ListCategory, ListEntry, OmikenEntry, PresetType } from '@type';
import ListPresetOmiken from './ListPresetOmiken.vue';
import ListPresetCharas from './ListPresetCharas.vue';
import ListPresetScripts from './ListPresetScripts.vue';
import { FunkEmits } from '@/composables/FunkEmits';

// Props Emits
const props = defineProps<{
 AppEditor: AppEditorType;
 categoryActive: CategoryActive;
}>();

const emit = defineEmits<{
 (e: 'update:Omiken', payload: OmikenEntry<ListCategory>): void;
 (e: 'update:OmikenPreset', preset: PresetType): void;
 (e: 'update:category', value: CategoryActive): void;
}>();

// コンポーザブル:FunkEmits
const { openList, updateOmiken, openEditor, updateOmikenPreset } = FunkEmits(emit);

// 子コンポーネントの指定
const currentListComponent = computed(() => {
 // categoryActiveが存在しない場合は空のオブジェクトを返す
 if (!props.categoryActive) return {};

 const componentMap = {
  Omiken: ListPresetOmiken,
  Charas: ListPresetCharas,
  Scripts: ListPresetScripts
 } as const;

 // categoryActiveが存在する場合にsubプロパティを安全に参照
 const categorySub = props.categoryActive.sub;
 if (!categorySub) return {};
 return componentMap[categorySub] || null; // マップに存在しない場合はnullを返す
});
</script>
