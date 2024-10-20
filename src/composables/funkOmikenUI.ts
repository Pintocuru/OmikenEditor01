// src/composables/funkOmikenUI.ts
import { ref, computed, Ref } from "vue";
import type {
  STATEType,
  ItemCategory,
  ItemContent,
  SelectItem,
  placeType,
  omikujiType,
  rulesType,
  EditorItem,
} from "../types";
/*
UIコンポーネントとインタラクションを担当
useOmikujiDialog: おみくじダイアログの管理
useNavigation: ナビゲーション機能
*/

export function funkUI() {
  // UI:ダークモード
  const dark = ref("dark");

  // リスト用:選択したカテゴリ
  const selectCategory = ref<ItemCategory>("rules");

  // ダイアログで表示させるアイテム
  const selectItem = ref({
    rules: <Record<string, rulesType> | null>null,
    omikuji: <Record<string, omikujiType> | null>null,
    place: <Record<string, placeType> | null>null,
  });
  // ダイアログでの表示モード
  const selectMode = ref<string | null>(null);

  // ダイアログ表示
  const dialogs = ref({
    rules: false,
    omikuji: false,
    place: false,
  });

  // ダイアログを開く
  const openEditor = (editorItem: EditorItem) => {
    const { type, item, mode } = editorItem;
    console.log("funkOmikenUI - openEditor called:", type, item, selectItem.value);
    if (type === "rules") {
      selectItem.value.rules = item as Record<string, rulesType>;
      dialogs.value.rules = true;
    } else if (type === "omikuji") {
      selectItem.value.omikuji = item as Record<string, omikujiType>;
      console.log(selectItem.value.omikuji);
      dialogs.value.omikuji = true;
    } else if (type === "place") {
      selectItem.value.place = item as Record<string, placeType>;
      dialogs.value.place = true;
      if (mode) selectMode.value = mode;
    }
  };

  return {
    dark,
    selectCategory,
    selectItem,
    selectMode,
    dialogs,
    openEditor,
  };
}
