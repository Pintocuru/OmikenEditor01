<!-- src/components/ListPreset.vue -->
<template>
  <div class="preset-selector pa-4">
    <v-row>
      <v-col
        v-for="preset in availablePresets"
        :key="preset.id"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card class="preset-card h-100" elevation="3" :loading="isLoading">
          <v-img :src="preset.banner" height="200" cover class="align-end">
            <v-card-title class="preset-title text-white">
              {{ preset.name }}
            </v-card-title>
          </v-img>

          <v-card-text>
            <div class="d-flex align-center mb-2">
              <v-chip
                :color="
                  preset.type === 'Omiken'
                    ? 'primary'
                    : preset.type === 'CHARA'
                    ? 'success'
                    : 'info'
                "
                size="small"
                class="mr-2"
              >
                {{ getTypeLabel(preset.type) }}
              </v-chip>
            </div>
            <p class="preset-description mb-3">{{ preset.description }}</p>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              variant="outlined"
              @click="handlePresetSelect(preset)"
              :disabled="isLoading"
            >
              適用する
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-overlay v-model="isLoading" class="align-center justify-center">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, Ref } from 'vue';
import { funkOmiken } from '../composables/funkOmiken';
import { usePresetManager } from '../composables/FunkPreset';
import Swal from 'sweetalert2';
import { AppStateType } from '@/types';

interface PresetInfo {
  id: string;
  name: string;
  description: string;
  type: 'Omiken' | 'CHARA' | 'full';
  path: string;
  banner: string; // バナー画像のパス
}

// キャラクターデータのインジェクト
const AppState = inject<Ref<AppStateType>>("AppStateKey");
const rules = AppState?.value.Omiken.rules;
const omikuji = AppState?.value.Omiken.omikuji;
const CHARA = AppState?.value.CHARA;



const {
  availablePresets,
  isLoading,
  loadPresetList,
  applyPreset
} = usePresetManager(AppState);

onMounted(async () => {
  await loadPresetList();
});

const handlePresetSelect = async (preset: PresetInfo) => {
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
  cancelButtonColor: '#6e7881',
});


    if (result.isConfirmed || result.isDenied) {
      const mode = result.isConfirmed ? 'overwrite' : 'append';
      await applyPreset(preset.id, mode);

await Swal.fire({
  icon: 'success',
  title: '適用完了',
  text: `${preset.name}を${mode === 'overwrite' ? '上書き' : '追加'}で適用しました`,
  timer: 2000,
  showConfirmButton: false
});
    }
  } catch (error) {
    await Swal.fire({
      icon: 'error',
      title: 'エラー',
      text: '設定の適用に失敗しました',
    });
  }
};

const getTypeLabel = (type: PresetInfo['type']) => {
  const labels = {
    Omiken: 'おみくじ',
    CHARA: 'キャラクター',
    full: '全体'
  };
  return labels[type];
};
</script>

<style scoped>
.preset-selector {
  background-color: #f5f5f5;
}

.preset-card {
  transition: transform 0.2s;
}

.preset-card:hover {
  transform: translateY(-4px);
}

.preset-title {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0));
  padding: 16px;
  font-size: 1.5rem;
}

.preset-description {
  min-height: 60px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>
