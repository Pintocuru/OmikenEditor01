// src/composables/FunkEmits.ts

import { ListCategory, ListEntry, OmikenCategory, OmikenEntry, PresetOmikenEditType } from "@/types";

export function FunkEmits(emit: any) {
 
  // ダイアログを表示するemit
  const openEditorItem = (type: ListCategory, id: string) => {
    emit("open-editor", {
      isOpen: true,
      type,
      mode: null,
      key: id,
    });
  };
  const openEditor = (editorItem: ListEntry<ListCategory>) =>
    emit("open-editor", editorItem);

  // Omiken のアップデート
  const updateOmiken = (payload: OmikenEntry<OmikenCategory>) =>
    emit("update:Omiken", payload);

  // Preset更新
  const updateOmikenPreset = (preset: PresetOmikenEditType) =>
    emit("update:OmikenPreset", preset);

  return {
    // ダイアログを開く
    openEditorItem,
    openEditor,

    // Omiken のアップデート
    updateOmiken,
    updateOmikenPreset

  };
}
