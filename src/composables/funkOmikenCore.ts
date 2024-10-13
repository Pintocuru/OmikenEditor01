// src/composables/funkOmikenCore.ts
import { computed, Ref, ref } from 'vue';
import type { DefaultState } from '../types';
import type { ItemType, ItemContent } from '../AppTypes';

/*
アプリケーションの中核となる状態管理とデータ操作を担当
useAppState: アプリケーションの全体的な状態を管理
useSelection: アイテムの選択状態を管理
*/

export function useFunkOmikenCore(STATE: Ref<DefaultState>) {

  const selectCategory = ref<ItemType>("rules");
  const selectedItem = ref<{ type: ItemType; item: ItemContent } | null>(null);

  const displayCategory = (type: ItemType) => {
    selectCategory.value = type;
  };

  const selectItem = (type: ItemType, item: ItemContent) => {
    selectedItem.value = { type, item };
  };

  const updateState = (newState: DefaultState) => {
    STATE.value = newState;
    console.log('App STATE updated:', STATE.value);
  };

  // Omikenでは使わないが、チャッデコで使うかもなので残す
  const selectedItemIndex = computed(() => {
    const item = selectedItem.value;
    if (item) {
      return STATE.value[item.type].findIndex(i => i === item.item);
    }
    return -1;
  });

  return {
    STATE,
    selectCategory,
    selectedItem,
    displayCategory,
    selectItem,
    updateState,
    selectedItemIndex,
  };
}