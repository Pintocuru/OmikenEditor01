// src/composables/funkOmikenUI.ts
import { ref, computed, Ref } from 'vue';
import type { STATEType, ItemCategory, ItemContent, SelectItem } from '../types';
/*
UIコンポーネントとインタラクションを担当
useOmikujiDialog: おみくじダイアログの管理
useNavigation: ナビゲーション機能
*/

export function funkUI() {
  // UI:ダークモード
  const dark = ref('dark');
  // Mainのcols変更 //TODO 不要かも…細長いの1種類だけでいいなあと
  const selectCols = ref<number>(1);

  // リスト用:選択したカテゴリ
  const selectCategory = ref<ItemCategory>("rules");

  // ダイアログ用:選択したアイテム
  const selectItem = ref<SelectItem | null>(null);

  // ダイアログ表示
  const dialogs = ref({
    rules: false,
    omikuji: false,
    place: false,
  });

  // ダイアログを開く
  const openEditor = (item: SelectItem) => {
    console.log('item:',item);
    if (item) {
      selectItem.value = item;
      dialogs.value[item.type] = true;
    }
  };

  return {
    dark,
    selectCols,
    selectCategory,
    selectItem,
    dialogs,
    openEditor,
  };
}