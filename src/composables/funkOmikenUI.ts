// src/composables/funkOmikenUI.ts
import { ref } from "vue";
import type {
  ItemCategory,
  placeType,
  omikujiType,
  rulesType,
  EditorItem,
} from "../types";
import _ from 'lodash';
/*
UIコンポーネントとインタラクションを担当
useOmikujiDialog: おみくじダイアログの管理
useNavigation: ナビゲーション機能
*/

export function funkUI() {
  // UI
  const uiDark = ref("dark"); // ダークモード
  const uiDrawer = ref(null); // ナビゲーションドロワーの表示/非表示

  // リスト用:選択したカテゴリ
  const selectCategory = ref<ItemCategory>("rules");

  // ダイアログで表示させるアイテム
  const selectItem = ref({
    rules: <Record<string, rulesType> | null>null,
    omikuji: <Record<string, omikujiType> | null>null,
    place: <Record<string, placeType> | null>null,
    preferences:null
  });
  // ダイアログでの表示モード
  const selectMode = ref<string | null>(null);

  // ダイアログ表示
  const dialogs = ref({
    rules: false,
    omikuji: false,
    place: false,
    preferences: false,
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
    uiDark,
    uiDrawer,
    selectCategory,
    selectItem,
    selectMode,
    dialogs,
    openEditor,
  };
}
