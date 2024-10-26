// src/composables/funkOmikenUI.ts
import { ref } from "vue";
import type {
  ListCategory,
  PlaceType,
  OmikujiType,
  RulesType,
  ListEntry,
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
  const selectCategory = ref<ListCategory>("rules");

  // ダイアログで表示させるアイテム
  const selectItem = ref({
    rules: <Record<string, RulesType> | null>null,
    omikuji: <Record<string, OmikujiType> | null>null,
    place: <Record<string, PlaceType> | null>null,
    preset: null,
    preferences:null,
  });
  // ダイアログでの表示モード
  const selectMode = ref<string | null>(null);

  // ダイアログ表示
  const dialogs = ref({
    rules: false,
    omikuji: false,
    place: false,
    preset: false,
    preferences: false,
  });

  // ダイアログを開く
  const openEditor = (editorItem: ListEntry<ListCategory>) => {
    const { type, item, mode } = editorItem;
    if (type === "rules") {
      selectItem.value.rules = item as Record<string, RulesType>;
      dialogs.value.rules = true;
    } else if (type === "omikuji") {
      selectItem.value.omikuji = item as Record<string, OmikujiType>;
      dialogs.value.omikuji = true;
    } else if (type === "place") {
      selectItem.value.place = item as Record<string, PlaceType>;
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
