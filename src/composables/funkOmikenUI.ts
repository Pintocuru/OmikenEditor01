// src/composables/funkOmikenUI.ts
import { Ref, ref } from "vue";
import type {
  ListCategory,
  ListEntry,
  ListEntries,
  NaviCategory,
  EditerTypeMap,
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
  const openEditor = <T extends ListCategory>(editorItem: ListEntry<T>) => {
    console.log(editorItem);
    const { type, item, mode } = editorItem;

    if (listEntry.value && listEntry.value[type]) {
      const entry = listEntry.value[type] as ListEntry<T>;
      entry.item = item as Record<string, EditerTypeMap[T]> | null;
      entry.mode = mode || null;
      entry.isOpen = true;
    }
  };

  return {
    uiDark,
    uiDrawer,
    naviCategory,
     listEntry,
    openEditor,
  };
}
