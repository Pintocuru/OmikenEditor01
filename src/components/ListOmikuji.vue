<!-- src/components/ListOmikuji.vue -->
<template>
 <!-- Omikuji List View -->
 <v-row dense>
  <v-col v-for="omikuji in omikujisNameSort" :key="omikuji.id" cols="12" sm="6" md="4" lg="3">
   <v-card variant="tonal">
    <!-- タイトルバーと操作ボタン -->
    <v-toolbar density="compact" :color="getPostTypeColor(omikuji.post, true)">
     <v-toolbar-title @click="openEditorItem('omikujis', omikuji.id)">
      <span v-if="omikuji?.threshold.length !== 0">🔐</span>
      {{ omikuji.name }}
     </v-toolbar-title>
     <template #append>
      <PartsArrayAction
       category="omikujis"
       :omikujiEntry="omikuji"
       @edit="openEditorItem('omikujis', omikuji.id)"
       @update:Omiken="updateOmiken"
      />
     </template>
    </v-toolbar>

    <!-- おみくじ内容 -->
    <v-card-text class="py-4">
     <div class="pb-3" v-if="omikuji.post">
      {{ getOnecommeContent(omikuji.post) }}
     </div>

     <div class="list-group d-flex flex-wrap">
      <!-- 発動条件の表示 -->
      <v-chip v-if="omikuji?.threshold.length !== 0" density="compact" variant="outlined" color="yellow lighten-3">
       🔐 {{ getExampleText(omikuji.threshold) }}
      </v-chip>
     </div>
    </v-card-text>
   </v-card>
  </v-col>
 </v-row>

 <v-sheet>
  <v-btn block @click="addItemOmikuji" color="primary" variant="flat" class="mt-6">
   <v-icon left>mdi-plus</v-icon> 🥠 おみくじの追加
  </v-btn>
 </v-sheet>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ListCategory, ListEntry, OmikenEntry, OmikenType, CategoryActive, AppEditorType } from '@type';
import PartsArrayAction from '@/components/common/PartsArrayAction.vue';
import { FunkOmikuji } from '@/composables/FunkOmikuji';
import { FunkThreshold } from '@/composables/FunkThreshold';
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
const { updateOmiken, openEditorItem } = FunkEmits(emit);
// コンポーザブル:FunkOmikuji
const { getOnecommeContent, getPostTypeColor } = FunkOmikuji();
// コンポーザブル:FunkThreshold
const { getExampleText } = FunkThreshold();

// omikujisをソート
const omikujisNameSort = computed(() => {
 return Object.values(props.AppEditor.Omiken.omikujis).sort((a, b) => {
  return (a.name || '').localeCompare(b.name || '');
 });
});

// アイテムを追加
const addItemOmikuji = () => {
 emit('update:Omiken', {
  type: 'omikujis',
  addKeys: [{}]
 });
};
</script>
