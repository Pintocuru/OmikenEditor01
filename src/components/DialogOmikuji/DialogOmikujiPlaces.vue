<!-- src/components/DialogOmikuji/DialogOmikujiStatus.vue -->
<template>
 <v-select
  v-model="currentItem.placeIds"
  :items="placeItems"
  label="プレースホルダー"
  item-title="name"
  item-value="id"
  multiple
  chips
  clearable
  @update:modelValue="updateOmikenEntry('omikujis', currentItem)"
 />
</template>

<script setup lang="ts">
import { computed, inject, Ref } from 'vue';
import { ListCategory, ListEntry, OmikujiType, OmikenEntry, AppEditorType, ScriptsType, PlaceType } from '@/type';
import { FunkEmits } from '@/composables/FunkEmits';

const props = defineProps<{
 currentItem: OmikujiType;
}>();

const emit = defineEmits<{
 (e: 'update:Omiken', payload: OmikenEntry<ListCategory>): void;
 (e: 'open-editor', editorItem: ListEntry<ListCategory>): void;
}>();

// inject
const AppEditor = inject<Ref<AppEditorType>>('AppEditorKey');
const places = AppEditor?.value.Omiken.places;

// コンポーザブル:FunkEmits
const { updateOmikenEntry } = FunkEmits(emit);

// placeItems の実装を修正
const placeItems = computed(() => {
 if (!places) return [];
 return Object.entries(places).map(([id, place]) => ({
  id: place.id,
  name: place.name
 }));
});
</script>
