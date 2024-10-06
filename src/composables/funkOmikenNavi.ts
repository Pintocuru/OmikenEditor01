// src/composables/funkOmikenNavi.ts

import { computed } from 'vue';
import type { DefaultState } from '../types';
import type { SelectedItem, ItemType } from '../AppTypes';

export function funkOmikenNavi(state: DefaultState, selectedItem: SelectedItem) {
  const sections = computed(() => [
    {
      key: 'rule' as const,
      title: 'ルール',
      items: state.rules,
      color: 'primary',
    },
    {
      key: 'omikuji' as const,
      title: 'おみくじ',
      items: state.botMessage.omikuji,
      color: 'secondary',
    },
    {
      key: 'random' as const,
      title: 'ランダム',
      items: state.botMessage.random,
      color: 'accent',
    },
  ]);

  const addItem = (type: ItemType, state: DefaultState): DefaultState => {
    const newState = { ...state };
    if (type === 'rule') {
      newState.rules.push({ name: `新しいルール ${newState.rules.length + 1}`, modes: '', modeSelect: [], switch: 0 });
    } else if (type === 'omikuji') {
      newState.botMessage.omikuji.push({ weight: 1, threshold: { type: 'none', value: 0, loop: false, comparison: 0 } });
    } else if (type === 'random') {
      newState.botMessage.random.push({ tag: `新しいタグ ${newState.botMessage.random.length + 1}`, weight: 1, group: 0, content: '' });
    }
    return newState;
  };

  const deleteItem = (type: ItemType, index: number, state: DefaultState): DefaultState => {
    const newState = { ...state };
    if (type === 'rule') {
      newState.rules.splice(index, 1);
    } else if (type === 'omikuji') {
      newState.botMessage.omikuji.splice(index, 1);
    } else if (type === 'random') {
      newState.botMessage.random.splice(index, 1);
    }
    return newState;
  };

  const isSelected = (type: ItemType, index: number): boolean => {
    return selectedItem?.type === type && selectedItem.index === index;
  };

  const getItemTitle = (item: any, index: number, itemKey: ItemType): string => {
    switch (itemKey) {
      case 'random':
        return `${item.tag} (${item.content.split('\n').length} items)`;
      case 'rule':
        return item.name || `ルール ${index + 1}`;
      case 'omikuji':
        return `おみくじ ${index + 1}`;
      default:
        return item.name || `アイテム ${index + 1}`;
    }
  };

  return {
    sections,
    addItem,
    deleteItem,
    isSelected,
    getItemTitle,
  };
}