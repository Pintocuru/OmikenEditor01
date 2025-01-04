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
 <v-sheet>
  <v-btn block @click="addItem('places')" color="primary" variant="flat" class="mt-6">
   <v-icon left>mdi-plus</v-icon> 📍 プレースホルダーの追加
  </v-btn>
 </v-sheet>
</template>

<script setup lang="ts">
import { computed, inject, Ref } from 'vue';
import { ListCategory, ListEntry, OmikujiType, OmikenEntry, AppEditorType } from '@type';
import { FunkEmits } from '@/composables/FunkEmits';
import { generateUniqueKey } from '@/composables/FunkOmikenUpdater';

const props = defineProps<{
 currentItem: OmikujiType;
 modelValue: 'places' | 'post' | 'threshold' | 'status' | 'scripts';
}>();

const emit = defineEmits<{
 (e: 'update:Omiken', payload: OmikenEntry<ListCategory>): void;
 (e: 'open-editor', editorItem: ListEntry<ListCategory>): void;
}>();

// inject
const AppEditor = inject<Ref<AppEditorType>>('AppEditorKey');
const places = computed(() => AppEditor?.value.Omiken.places || {});

// コンポーザブル:FunkEmits
const { openEditorItem, updateOmikenEntry } = FunkEmits(emit);

// placeItems の実装を修正
const placeItems = computed(() => {
 if (!places.value) return [];
 return Object.entries(places.value).map(([id, place]) => ({
  id: place.id,
  name: place.name
 }));
});

const addItem = (type: ListCategory) => {
 // 新規のプレースホルダーを追加
 const id = generateUniqueKey();
 emit('update:Omiken', {
  type,
  addKeys: [
   {
    id,
    name: 'NewPlace',
    values: [{ weight: 1, value: '' }]
   }
  ]
 });
 // プレースホルダーを追加
 const newItem = props.currentItem;
 newItem.placeIds.push(id);
 updateOmikenEntry('omikujis', newItem)
 // エディタを開く
 openEditorItem(type, id);
};
</script>
