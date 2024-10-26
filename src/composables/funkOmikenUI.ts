// src/composables/funkOmikenUI.ts
import { Ref, ref } from "vue";
import type {
  ListCategory,
  ListEntry,
  ListEntries,
  NaviCategory,
} from "../types";
import _ from 'lodash';

export function funkUI() {
  // UI
  const uiDark = ref("dark"); // ダークモード
  const uiDrawer = ref(null); // ナビゲーションドロワーの表示/非表示

  // ナビゲーション用:選択したカテゴリ
  const naviCategory = ref<NaviCategory>("rules");

  // ダイアログで表示させるアイテム 
  const listEntry: Ref<ListEntries> = ref({
    rules: { isOpen: false, type: 'rules', item: null, mode: null },
    omikuji: { isOpen: false, type: 'omikuji', item: null, mode: null },
    place: { isOpen: false, type: 'place', item: null, mode: null },
  });

  // ダイアログを開く
  const openEditor = (editorItem: ListEntry<ListCategory>) => {
    console.log(editorItem);
    const { type, item, mode } = editorItem;
    listEntry.value[type].item = item || null;
    listEntry.value[type].mode = mode || null;
    listEntry.value[type].isOpen = true; // ダイアログを開く
  };

  return {
    uiDark,
    uiDrawer,
    naviCategory,
     listEntry,
    openEditor,
  };
}
