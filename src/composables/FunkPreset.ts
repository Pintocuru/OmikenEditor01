// src/composables/FunkPreset.ts
import { ref, Ref } from 'vue';
import { AppEditerType,  PresetType, } from "@/types";


export function usePresetManager(AppEditer: Ref<AppEditerType> | undefined) {
  const Presets = ref<PresetType[]>([]);
  const isLoading = ref(false);

  // プリセット一覧の読み込み - omikujiのみを取得
  const loadPresetList = async () => {
    isLoading.value = true;
    try {
      const response = await fetch('/presets/index.json');
      const presets = await response.json();
      // Omikenタイプのプリセットのみをフィルタリング
      Presets.value = presets.filter((preset: PresetType) =>
        preset.type === 'Omiken'
      );
    } catch (error) {
      console.error('Failed to load preset list:', error);
      throw new Error('プリセット一覧の読み込みに失敗しました');
    } finally {
      isLoading.value = false;
    }
  };

  const applyPreset = async (presetId: string, mode: 'overwrite' | 'append') => {
    if (!AppEditer) return
    isLoading.value = true;
    try {
      const preset = Presets.value.find(p => p.id === presetId);
      if (!preset) {
        throw new Error('プリセットが見つかりません');
      }

      const response = await fetch(preset.path);
      const presetData = await response.json();

      // omikujiタイプのみの処理
      if (mode === 'overwrite') {
        AppEditer.value.Omiken = {
          ...AppEditer.value.Omiken,
          ...presetData.Omiken
        };
      } else {
        // 追加モード：既存のデータを保持しながら新しいデータを追加
        AppEditer.value.Omiken = {
          ...AppEditer.value.Omiken,
          types: {
            ...AppEditer.value.Omiken.types,
            ...presetData.Omiken.types,
          },
          rules: {
            ...AppEditer.value.Omiken.rules,
            ...presetData.Omiken.rules,
          },
          omikujis: {
            ...AppEditer.value.Omiken.omikujis,
            ...presetData.Omiken.omikuji,
          },
          places: {
            ...AppEditer.value.Omiken.places,
            ...presetData.Omiken.place,
          },
        };
      }

    } catch (error) {
      console.error('Failed to apply preset:', error);
      throw new Error('プリセットの適用に失敗しました');
    } finally {
      isLoading.value = false;
    }
  };

  return {
    availablePresets: Presets,
    isLoading,
    loadPresetList,
    applyPreset
  };
}