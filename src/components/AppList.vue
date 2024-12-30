<!-- src/components/AppList.vue -->
<template>
 <!-- 各種リストコンポーネントの条件付きレンダリング -->
 <component
  :is="currentListComponent"
  :AppEditor="AppEditor"
  :categoryActive="categoryActive"
  @update:Omiken="updateOmiken"
  @update:OmikenPreset="updateOmikenPreset"
  @open-editor="openEditor"
 />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ListRules from './ListRules.vue';
import ListOmikuji from './ListOmikuji.vue';
import ListPlace from './ListPlace.vue';
import ListPreset from './ListPreset.vue';
import { ListCategory, OmikenEntry, ListEntry, PresetType, CategoryActive, AppEditorType } from '@type';
import { FunkEmits } from '@/composables/FunkEmits';

// Props Emits
const props = defineProps<{
 AppEditor: AppEditorType;
 categoryActive: CategoryActive;
}>();

const emit = defineEmits<{
 (e: 'update:Omiken', payload: OmikenEntry<ListCategory>): void;
 (e: 'update:OmikenPreset', preset: PresetType): void;
 (e: 'open-editor', editorItem: ListEntry<ListCategory>): void;
}>();

// コンポーザブル:FunkEmits
const { updateOmiken, openEditor, updateOmikenPreset } = FunkEmits(emit);

// 子コンポーネントの指定
const currentListComponent = computed(() => {
 const componentMap = {
  types: null,
  rules: ListRules,
  omikujis: ListOmikuji,
  places: ListPlace,
  presets: ListPreset
 } as const;

 return componentMap[props.categoryActive.main];
});
</script>
