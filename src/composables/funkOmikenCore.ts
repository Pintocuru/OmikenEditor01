// src/composables/funkOmikenCore.ts
import { reactive, ref } from 'vue';
import type { DefaultState, OmikujiMessage, omikujiRule, Placeholder } from '../types';
import type { SelectedItem, ItemType, ItemContent } from '../AppTypes';

/*
アプリケーションの中核となる状態管理とデータ操作を担当
useAppState: アプリケーションの全体的な状態を管理
useSelection: アイテムの選択状態を管理
*/

export function useAppCore() {
  const state = ref<DefaultState>({
    defaultRules: [],
    rules: [],
    omikuji: [],
    placeholder: []
  });

  // ナビゲーション状態の管理
  const selectedItem = ref<SelectedItem | null>(null);
  const selectItem = (type: ItemType, item: ItemContent) => {
    selectedItem.value = { type, item };
  };

  const addItem = (type: ItemType) => {
    let newItem: ItemContent;
    switch (type) {
      case 'rules':
        newItem = {
          name: `新しいルール ${state.value.rules.length + 1}`,
          modes: '',
          modeSelect: [],
          switch: 0
        };
        state.value.rules.push(newItem);
        break;
      case 'omikuji':
        newItem = {
          name: '大吉',
          weight: 1,
          threshold: {
            type: 'none',
            value: 0,
            valueMax: 0,
            comparison: 'equal'
          },
        };
        state.value.omikuji.push(newItem);
        break;
      case 'placeholder':
        newItem = {
          name: `新しいタグ ${state.value.placeholder.length + 1}`,
          weight: 1,
          group: 0,
          content: ''
        };
        state.value.placeholder.push(newItem);
        break;
    }
    selectItem(type, newItem);
  };


  // アイテム選択の更新
  const updateItem = (type: ItemType, updatedItem: ItemContent) => {
    const index = state.value[type].findIndex(i => i === updatedItem);
    if (index !== -1) {
      state.value[type][index] = updatedItem;
      selectItem(type, updatedItem);
    }
  };

  const deleteItem = (type: ItemType, item: ItemContent) => {
    const index = state.value[type].findIndex(i => i === item);
    if (index !== -1) {
      state.value[type].splice(index, 1);
      selectedItem.value = null;
    }
  };

  return {
    state,
    selectedItem,
    selectItem,
    addItem,
    updateItem,
    deleteItem,
  };
}