import { reactive, ref } from 'vue';
import type { DefaultState,  } from '../types';
import type {  SelectedItem } from '../AppTypes';

export function useAppState() {
  const state = reactive<DefaultState>({
    defaultRules: [],
    rules: [],
    botMessage: {
      omikuji: [],
      random: []
    },
  });

  const selectedItem = ref<SelectedItem | null>(null);

  const updateSelectedItem = (item: SelectedItem) => {
    selectedItem.value = item;
  };

  return {
    state,
    selectedItem,
    updateSelectedItem
  };
}