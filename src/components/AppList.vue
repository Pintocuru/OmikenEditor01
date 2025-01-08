<!-- src/components/AppList.vue -->
<template>
 <!-- 各種リストコンポーネントの条件付きレンダリング -->
 <component
  :is="currentListComponent"
  :AppEditor="AppEditor"
  :categoryActive="categoryActive"
  @update:Omiken="updateOmiken"
  @update:OmikenPreset="updateOmikenPreset"
  @update:category="openList"
  @open-editor="openEditor"
 />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ListRules from '@/components/ListRules/ListRules.vue';
import ListOmikuji from '@/components/ListOmikuji.vue';
import ListPlace from '@/components/ListPlace.vue';
import ListPreset from '@/components/ListPreset/ListPreset.vue';
import { ListCategory, OmikenEntry, ListEntry, CategoryActive, AppEditorType, PresetOmikenType } from '@type';
import { FunkEmits } from '@/composables/FunkEmits';

// Props Emits
const props = defineProps<{
 AppEditor: AppEditorType;
 categoryActive: CategoryActive;
}>();

const emit = defineEmits<{
 (e: 'update:Omiken', payload: OmikenEntry<ListCategory>): void;
 (e: 'update:OmikenPreset', preset: PresetOmikenType): void;
  (e: 'update:category', value: CategoryActive): void;
 (e: 'open-editor', editorItem: ListEntry<ListCategory>): void;
}>();

// コンポーザブル:FunkEmits
const { openList, updateOmiken, openEditor, updateOmikenPreset } = FunkEmits(emit);

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
