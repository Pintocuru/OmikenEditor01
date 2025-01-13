<!-- src/components/ListPreset/ListPresetOmiken.vue -->
<template>
 <!-- タグフィルター部分 -->
 <div class="mb-4">
  <v-chip-group v-model="selectedTags" column multiple>
   <v-chip v-for="tag in uniqueTags" :key="tag" :value="tag" filter variant="outlined">
    {{ tag }}
   </v-chip>
  </v-chip-group>
 </div>
 <v-row>
  <v-col v-for="preset in filteredPresets" :key="preset.id" cols="12" sm="6" md="4">
   <v-card class="preset-card h-100" elevation="3">
    <v-img
     :src="getPresetsImage(preset.banner)"
     height="200"
     cover
     class="align-end"
     gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
    >
     <v-card-title class="preset-title text-white text-h6 font-weight-bold">
      {{ preset.name }}
     </v-card-title>
    </v-img>

    <v-card-text>
     <div class="d-flex align-center mb-2">
      <v-chip color="primary" size="small" class="mr-2"> おみくじプリセット </v-chip>
     </div>
     <p class="preset-description mb-3">{{ preset.description }}</p>

     <!-- タグをリスト表示 -->
     <div class="d-flex flex-wrap mt-2">
      <v-chip v-for="(tag, index) in preset.tags" :key="index" color="secondary" size="small" class="mr-1 mb-1">
       {{ tag }}
      </v-chip>
     </div>
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
import { AppEditorType, CategoryActive, ListCategory, ListEntry, OmikenEntry, PresetOmikenType } from '@type';
import { FunkEmits } from '@/composables/FunkEmits';
import { FunkPresets } from '@/composables/FunkPresets';
import { MySwal } from '@/config';
import { computed, ref } from 'vue';

// props/emits
const props = defineProps<{
 AppEditor: AppEditorType;
}>();

const emit = defineEmits<{
 (e: 'open-editor', editorItem: ListEntry<ListCategory>): void;
 (e: 'update:Omiken', payload: OmikenEntry<ListCategory>): void;
 (e: 'update:OmikenPreset', preset: PresetOmikenType): void;
 (e: 'update:category', value: CategoryActive): void;
}>();
// コンポーザブル:FunkEmits
const { openList } = FunkEmits(emit);
const {} = FunkPresets();

const Presets = props.AppEditor.Presets;

const selectedTags = ref<string[]>([]);

// すべてのプリセットから重複のないタグリストを作成
const uniqueTags = computed(() => {
 const tags = Object.values(Presets || {}).reduce((acc: string[], preset) => {
  if (preset && preset.tags) {
   acc.push(...preset.tags);
  }
  return acc;
 }, []);
 return [...new Set(tags)];
});

// 選択されたタグでフィルタリングされたプリセット
const filteredPresets = computed(() => {
 if (!selectedTags.value.length) return Presets;

 return Object.entries(Presets).reduce(
  (acc, [key, preset]) => {
   if (preset?.tags && selectedTags.value.some((tag) => preset.tags.includes(tag))) {
    acc[key] = preset;
   }
   return acc;
  },
  {} as Record<string, PresetOmikenType>
 );
});

// 画像を取得する関数
const getPresetsImage = (banner?: string): string => {
 if (!banner) return '';
 const basePath = process.env.NODE_ENV === 'development' ? './Presets' : './Presets';
 return `${basePath}/${banner}`;
};

const presetSelect = async (preset: PresetOmikenType) => {
 try {
  const result = await MySwal.fire({
   title: preset.name,
   text: '適用方法を選択してください',
   html: `
        <div class="mb-4">${preset.description}</div>
        <div class="text-sm text-gray-600">
          上書き：既存のデータを削除して新しいデータを設定します<br>
          追加：既存のデータに新しいデータを追加します
        </div>
      `,
   imageUrl: getPresetsImage(preset.banner),
   imageWidth: 400,
   imageAlt: `${preset.name} banner`,
   showCancelButton: true,
   confirmButtonText: '追加',
   cancelButtonText: 'キャンセル',
   showDenyButton: true,
   denyButtonText: '上書き',
   confirmButtonColor: '#F44336', // 第1ボタン:Material Red 500
   denyButtonColor: '#2196F3', // 第2ボタン:Material Blue 500
   cancelButtonColor: '#9E9E9E' // キャンセル:Material Gray 500
  });

  // 初回選択後に再確認のポップアップを表示
  if (result.isConfirmed || result.isDenied) {
   const isOverwrite = result.isDenied;

   // 再確認のポップアップを表示
   const finalConfirmation = await MySwal.fire({
    title: `【${isOverwrite ? '上書き' : '追加'}】の確認`,
    text: `本当に${isOverwrite ? '上書き' : '追加'}で適用しますか？ 一度適用すると元には戻せません。`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: `${isOverwrite ? '上書き' : '追加'}する`,
    cancelButtonText: 'キャンセル',
    confirmButtonColor: isOverwrite ? '#2196F3' : '#F44336'
   });

   // 再確認後にemitを実行
   if (finalConfirmation.isConfirmed) {
    emit('update:OmikenPreset', { ...preset, isOverwrite });

    // ListRules を開く
    openList({ main: 'rules' });

    await MySwal.fire({
     icon: 'success',
     title: '適用完了',
     text: `${preset.name}を${isOverwrite ? '上書き' : '追加'}で適用しました`,
     timer: 2000,
     showConfirmButton: false
    });
   }
  }
 } catch (error) {
  await MySwal.fire({
   icon: 'error',
   title: 'エラー',
   text: '設定の適用に失敗しました'
  });
 }
};
</script>

