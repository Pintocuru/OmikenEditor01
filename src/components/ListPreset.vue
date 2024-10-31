<!-- src/components/ListPreset.vue -->
<template>
  <div class="preset-selector pa-4">
    <v-tabs v-model="activeTab">
      <v-tab value="preset">プリセット</v-tab>
      <v-tab value="chara">キャラクター</v-tab>
    </v-tabs>

    <v-window v-model="activeTab">
      <!-- プリセットタブ -->
      <v-window-item value="preset">
        <v-row>
          <v-col v-for="preset in presetList" :key="preset.id" cols="12" sm="6" md="4">
            <v-card class="preset-card h-100" elevation="3" :loading="isLoading">
              <v-img :src="preset.banner" height="200" cover class="align-end">
                <v-card-title class="preset-title text-white">{{ preset.name }}</v-card-title>
              </v-img>

              <v-card-text>
                <div class="d-flex align-center mb-2">
                  <v-chip
                    :color="preset.type === 'Omiken' ? 'primary' : 'success'"
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
      </v-window-item>

      <!-- キャラクタータブ -->
      <v-window-item value="chara">
        <v-row>
          <v-col v-for="[id, chara] in Object.entries(charaList)" :key="id" cols="12" sm="6" md="4">
            <v-card class="h-100" elevation="3">
              <v-img
                :src="chara.item.image.Default"
                height="200"
                cover
                class="align-end"
              >
                <v-card-title class="text-white">{{ chara.name }}</v-card-title>
              </v-img>
              <v-card-text>
                <div class="mb-2">
                  <v-chip
                    v-if="chara.item.frameId"
                    color="info"
                    size="small"
                    class="mr-2"
                  >
                    Frame ID: {{ chara.item.frameId }}
                  </v-chip>
                </div>
                <div class="d-flex align-center gap-2">
                  <div class="px-2 rounded" :style="{ backgroundColor: chara.item.color['--lcv-background-color'] }">
                    <span :style="{ color: chara.item.color['--lcv-name-color'] }">名前</span>
                    <span :style="{ color: chara.item.color['--lcv-text-color'] }">テキスト</span>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>
    </v-window>

    <v-overlay v-model="isLoading" class="align-center justify-center">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, Ref } from 'vue';
import Swal from 'sweetalert2';
import { AppStateType, OmikenCategory, OmikenEntry, PresetOmikenEditType, fetchJSONType } from '@/types';

// props/emits
const props = defineProps<{
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
}>();


// これはなに?
const isLoading = ref(false);

// キャラクターデータのインジェクト
const AppState = inject<Ref<AppStateType>>("AppStateKey");

// タブの制御
const activeTab = ref('preset');
// データの整形
const presetList = computed(() => {
  const presets = AppState?.value.Preset;
  if (!presets) return [];
  return Object.entries(presets).map(([id, data]) => ({
    id,
    ...data
  })) as Array<{ id: string } & PresetOmikenEditType>;
});

const charaList = computed(() => AppState?.value.CHARA || {});

const handlePresetSelect = async (preset: fetchJSONType) => {
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
      // TODO emitsでOmikenを更新する

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

const getTypeLabel = (type: fetchJSONType['type']) => {
  const labels = {
    Omiken: 'おみくじ',
    CHARA: 'キャラクター',
  };
  return labels[type];
};
</script>

