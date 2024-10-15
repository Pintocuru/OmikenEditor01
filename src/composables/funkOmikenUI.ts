// src/composables/funkOmikenUI.ts
import { ref, computed, Ref } from 'vue';
import type { DefaultState } from '../types';
import type { ItemType, ItemContent, SelectItem } from '../AppTypes';
/*

UIコンポーネントとインタラクションを担当
useOmikujiDialog: おみくじダイアログの管理
useNavigation: ナビゲーション機能
*/

export function useFunkOmikenUI(STATE: Ref<DefaultState>) {
  const dark = ref('dark');
  const selectCols = ref<number>(1);
  const showEditorDialog = ref(false);
  const selectItem = ref<SelectItem | null>(null);

  const openEditorDialog = (item: SelectItem) => {
    if (item) {
      selectItem.value = item;
      showEditorDialog.value = true;
    }
  };


  const closeEditorDialog = () => {
    showEditorDialog.value = false;
    selectItem.value = null;
  };

  // ナビゲーション関連の機能
  const sections = computed(() => [
    {
      key: 'rules' as const,
      title: 'ルール',
      items: STATE.value.rules,
      color: 'primary',
    },
    {
      key: 'omikuji' as const,
      title: 'おみくじ',
      items: STATE.value.omikuji,
      color: 'secondary',
    },
    {
      key: 'placeholder' as const,
      title: 'プレースホルダー',
      items: STATE.value.placeholder,
      color: 'accent',
    },
  ]);

  const getItemTitle = (item: any, index: number, itemKey: ItemType): string => {
    switch (itemKey) {
      case 'placeholder':
        return `${item.name} (${item.content.split('\n').length} items)`;
      case 'rules':
        return item.name || `ルール ${index + 1}`;
      case 'omikuji':
        return item.name || `おみくじ ${index + 1}`;
      default:
        return item.name || `アイテム ${index + 1}`;
    }
  };

  // メインリスト用の機能
  const getListItems = (type: ItemType) => {
    switch (type) {
      case 'rules':
        return STATE.value.rules.map(rule => ({ name: rule.name }));
      case 'omikuji':
        return STATE.value.omikuji.map(item => ({ name: item.name }));
      case 'placeholder':
        return STATE.value.placeholder.map(item => ({ name: item.name }));
      default:
        return [];
    }
  };

  return {
    dark,
    selectCols,
    showEditorDialog,
    selectItem,
    openEditorDialog,
    closeEditorDialog,
    sections,
    getItemTitle,
    getListItems,
  };
}