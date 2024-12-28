// src/composables/FunkEmits.ts

import {
  ListCategory,
  ListEntry,
  OmikenTypeMap,
  OmikenEntry,
  PresetOmikenType,
} from "@type";

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
  const updateOmiken = (payload: OmikenEntry<ListCategory>) =>
    emit("update:Omiken", payload);

  const updateOmikenEntry = <T extends ListCategory>(
    type: T,
    update: Record<string, OmikenTypeMap[T]>
  ) => {
    emit("update:Omiken", { type, update });
  };

  // Preset更新
  const updateOmikenPreset = (preset: PresetOmikenType) =>
    emit("update:OmikenPreset", preset);

  return {
    // ダイアログを開く
    openEditorItem,
    openEditor,

    // Omiken のアップデート
    updateOmiken,
    updateOmikenEntry,
    updateOmikenPreset,
  };
}
