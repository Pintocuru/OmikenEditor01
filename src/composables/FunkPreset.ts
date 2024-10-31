// src/composables/FunkPreset.ts
import { ref, Ref } from 'vue';
import { AppStateType, fetchJSONType, } from "@/types";


export function usePresetManager(appState: Ref<AppStateType> | undefined) {
  const availablePresets = ref<fetchJSONType[]>([]);
  const isLoading = ref(false);

  // プリセット一覧の読み込み - omikujiのみを取得
  const loadPresetList = async () => {
    isLoading.value = true;
    try {
      const response = await fetch('/presets/index.json');
      const presets = await response.json();
      // Omikenタイプのプリセットのみをフィルタリング
      availablePresets.value = presets.filter((preset: fetchJSONType) =>
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
    if (!appState) return
    isLoading.value = true;
    try {
      const preset = availablePresets.value.find(p => p.id === presetId);
      if (!preset) {
        throw new Error('プリセットが見つかりません');
      }

      const response = await fetch(preset.path);
      const presetData = await response.json();

      // omikujiタイプのみの処理
      if (mode === 'overwrite') {
        appState.value.Omiken = {
          ...appState.value.Omiken,
          ...presetData.Omiken
        };
      } else {
        // 追加モード：既存のデータを保持しながら新しいデータを追加
        appState.value.Omiken = {
          ...appState.value.Omiken,
          rules: {
            ...appState.value.Omiken.rules,
            ...presetData.Omiken.rules
          },
          omikuji: {
            ...appState.value.Omiken.omikuji,
            ...presetData.Omiken.omikuji
          },
          place: {
            ...appState.value.Omiken.place,
            ...presetData.Omiken.place
          },
          // OrderArraysの更新
          rulesOrder: [...new Set([...appState.value.Omiken.rulesOrder, ...presetData.Omiken.rulesOrder])],
          omikujiOrder: [...new Set([...appState.value.Omiken.omikujiOrder, ...presetData.Omiken.omikujiOrder])],
          placeOrder: [...new Set([...appState.value.Omiken.placeOrder, ...presetData.Omiken.placeOrder])]
        };
      }

      appState.value.activePresetId = presetId;
    } catch (error) {
      console.error('Failed to apply preset:', error);
      throw new Error('プリセットの適用に失敗しました');
    } finally {
      isLoading.value = false;
    }
  };

  return {
    availablePresets,
    isLoading,
    loadPresetList,
    applyPreset
  };
}