<!-- src/components/ListPreset/ListPresetOmiken.vue -->
<template>
 <v-row>
  <v-col v-for="preset in Presets" :key="preset.id" cols="12" sm="6" md="4">
   <v-card class="preset-card h-100" elevation="3">
    <v-img :src="preset.banner" height="200" cover class="align-end">
     <v-card-title class="preset-title text-white">{{ preset.name }}</v-card-title>
    </v-img>

    <v-card-text>
     <div class="d-flex align-center mb-2">
      <v-chip color="primary" size="small" class="mr-2"> おみくじプリセット </v-chip>
     </div>
     <p class="preset-description mb-3">{{ preset.description }}</p>
    </v-card-text>

    <v-card-actions>
     <v-spacer></v-spacer>
     <v-btn color="primary" variant="outlined" @click="presetSelect(preset)"> 適用する </v-btn>
    </v-card-actions>
   </v-card>
  </v-col>
 </v-row>
</template>

<script setup lang="ts">
import { computed, inject, ref, Ref } from 'vue';
import { AppEditorType, CategoryActive, ListCategory, ListEntry, OmikenEntry, PresetOmikenType } from '@type';
import { FunkEmits } from '@/composables/FunkEmits';
import Swal from 'sweetalert2';

// props/emits
const props = defineProps<{
 AppEditor: AppEditorType;
}>();

const emit = defineEmits<{
 (e: 'update:Omiken', payload: OmikenEntry<ListCategory>): void;
 (e: 'update:OmikenPreset', preset: PresetOmikenType): void;
 (e: 'update:category', value: CategoryActive): void;
}>();
// コンポーザブル:FunkEmits
const { openList, openEditor, openEditorItem } = FunkEmits(emit);

const Presets = props.AppEditor.Presets;

const presetSelect = async (preset: PresetOmikenType) => {
 try {
  const result = await Swal.fire({
   title: preset.name,
   text: '適用方法を選択してください',
   html: `
    <div class="mb-4">${preset.description}</div>
    <div class="text-sm text-gray-600">
      上書き：既存のデータを削除して新しいデータを設定します<br>
      追加：既存のデータに新しいデータを追加します
    </div>
  `,
   imageUrl: preset.banner,
   imageWidth: 400,
   imageAlt: `${preset.name} banner`,
   showCancelButton: true,
   confirmButtonText: '上書き',
   cancelButtonText: 'キャンセル',
   showDenyButton: true,
   denyButtonText: '追加',
   denyButtonColor: '#3085d6',
   confirmButtonColor: '#d33',
   cancelButtonColor: '#6e7881'
  });

  if (result.isConfirmed || result.isDenied) {
   const isOverwrite = result.isConfirmed;
   emit('update:OmikenPreset', { ...preset, isOverwrite });

   // ListRules を開く
   openList({ main: 'rules' });

   await Swal.fire({
    icon: 'success',
    title: '適用完了',
    text: `${preset.name}を${isOverwrite ? '上書き' : '追加'}で適用しました`,
    timer: 2000,
    showConfirmButton: false
   });
  }
 } catch (error) {
  await Swal.fire({
   icon: 'error',
   title: 'エラー',
   text: '設定の適用に失敗しました'
  });
 }
};
</script>
