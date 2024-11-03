// src/composables/funkUI.ts
import { Ref, ref } from "vue";
import type {
  ListCategory,
  ListEntry,
  ListEntryCollect,
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
  const listEntry: Ref<ListEntryCollect> = ref({
    rules: { isOpen: false, type: 'rules', key: null, item: null, mode: null },
    omikuji: { isOpen: false, type: 'omikuji', key: null, item: null, mode: null },
    place: { isOpen: false, type: 'place', key: null, item: null, mode: null },
  });

  // ダイアログを開く
  const openEditor = <T extends ListCategory>(editorItem: ListEntry<T>) => {
    const { type, key, mode } = editorItem;

    if (listEntry.value && listEntry.value[type]) {
      const entry = listEntry.value[type] as ListEntry<T>;
      entry.key = key
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


export function funkList(emit:any) {
  const openEditor = (item: { id: any; }, type = "rules") => {
    const payload = { [item.id]: item };
    emit("open-editor", {
      isOpen: true,
      type: type,
      item: payload,
    });
  };

  return { openEditor };
}
