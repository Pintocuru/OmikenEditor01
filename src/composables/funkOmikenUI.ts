// src/composables/funkOmikenUI.ts
import { reactive, ref, computed } from 'vue';
import type { DefaultState, OmikujiMessage, omikujiRule, Post, Placeholder } from '../types';
import type { SelectedItem, ItemType } from '../AppTypes';
/*

UIコンポーネントとインタラクションを担当
useOmikujiDialog: おみくじダイアログの管理
useNavigation: ナビゲーション機能
*/


// ダイアログ
// 今はおみくじ専用、後で汎用にしたい
export function useOmikujiDialog(state: DefaultState, onSave: () => void) {
 const showOmikujiDialog = ref(false);

 const openOmikujiDialog = (omikuji: OmikujiMessage | null = null) => {
  showOmikujiDialog.value = true;
 };

 const closeOmikujiDialog = () => {
  showOmikujiDialog.value = false;
  onSave();
 };

 return {
  showOmikujiDialog,
  openOmikujiDialog,
  closeOmikujiDialog,
 };
}

// ナビゲーション
export function useNavigation(state: DefaultState, selectedItem: SelectedItem | null, emit: any) {

 const sections = computed(() => [
  {
   key: 'rules' as const,
   title: 'ルール',
   items: state.rules,
   color: 'primary',
  },
  {
   key: 'omikuji' as const,
   title: 'おみくじ',
   items: state.omikuji,
   color: 'secondary',
  },
  {
    key: 'placeholder' as const,
   title: 'ランダム',
   items: state.placeholder,
   color: 'accent',
  },
 ]);

 const isSelected = (type: ItemType, index: number): boolean => {
  return selectedItem?.type === type && selectedItem.index === index;
 };

 const getItemTitle = (item: any, index: number, itemKey: ItemType): string => {
  switch (itemKey) {
    case 'placeholder':
    return `${item.placeholder} (${item.content.split('\n').length} items)`;
    case 'rules':
    return item.name || `ルール ${index + 1}`;
   case 'omikuji':
      return item.name ||`おみくじ ${index + 1}`;
   default:
    return item.name || `アイテム ${index + 1}`;
  }
 };

 const handleSelectItem = (type: ItemType, index: number) => {
  emit('select-item', type, index);
 };

 const handleAddItem = (type: ItemType) => {
  emit('update', type, null);  // nullを渡して新規アイテム追加を示す
 };

 return {
  sections,
  isSelected,
  getItemTitle,
  handleSelectItem,
  handleAddItem,
 };
}

export function funkOmikenNavi(state: DefaultState, selectedItem: SelectedItem, emit: any) {
  const sections = computed(() => [
    {
      key: 'rules' as const,
      title: 'ルール',
      items: state.rules,
      color: 'primary',
    },
    {
      key: 'omikuji' as const,
      title: 'おみくじ',
      items: state.omikuji,
      color: 'secondary',
    },
    {
      key: 'placeholder' as const,
      title: 'プレースホルダー',
      items: state.placeholder,
      color: 'accent',
    },
  ]);

  const addItem = (type: ItemType, state: DefaultState): DefaultState => {
    const newState = { ...state };
    if (type === 'rules') {
      newState.rules.push({ name: `新しいルール ${newState.rules.length + 1}`, modes: '', modeSelect: [], switch: 0 });
    } else if (type === 'omikuji') {
      newState.omikuji.push({
        name: '大吉',
        weight: 1,
        threshold: { type: 'none', value: 0, valueMax: 0, comparison: 'equal' },
      });
    } else if (type === 'placeholder') {
      newState.placeholder.push({ name: `新しいタグ ${newState.placeholder.length + 1}`, weight: 1, group: 0, content: '' });
    }
    return newState;
  };

  const deleteItem = (type: ItemType, index: number, state: DefaultState): DefaultState => {
    const newState = { ...state };
    if (type === 'rules') {
      newState.rules.splice(index, 1);
    } else if (type === 'omikuji') {
      newState.omikuji.splice(index, 1);
    } else if (type === 'placeholder') {
      newState.placeholder.splice(index, 1);
    }
    return newState;
  };

  const isSelected = (type: ItemType, index: number): boolean => {
    return selectedItem?.type === type && selectedItem.index === index;
  };

  const getItemTitle = (item: any, index: number, itemKey: ItemType): string => {
    switch (itemKey) {
      case 'placeholder':
        return `${item.tag} (${item.content.split('\n').length} items)`;
      case 'rules':
        return item.name || `ルール ${index + 1}`;
      case 'omikuji':
        return `おみくじ ${index + 1}`;
      default:
        return item.name || `アイテム ${index + 1}`;
    }
  };

  // アイテム選択のハンドラ
  const handleSelectItem = (type: ItemType, index: number) => {
    emit('select-item', type, index);
  };

  // 新しいアイテムの追加
  const handleAddItem = (type: ItemType) => {
    const newState = addItem(type, state);
    emit('update', type, newState);
  };

  return {
    sections,
    addItem,
    deleteItem,
    isSelected,
    getItemTitle,
    handleSelectItem,
    handleAddItem,

  };
}

// リスト一覧用
export function useMainList(state: DefaultState, type: ItemType) {
  const listItems = computed(() => {
    switch (type) {
      case 'rules':
        return state.rules.map(rule => ({ name: rule.name }));
      case 'omikuji':
        return state.omikuji.map(item => ({ name: item.name }));
      case 'placeholder':
        return state.placeholder.map(item => ({ name: item.name }));
      default:
        return [];
    }
  });

  return {
    listItems
  };
}