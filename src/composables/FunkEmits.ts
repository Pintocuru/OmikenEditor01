// src/composables/FunkEmits.ts

import { ListCategory, ListEntry, OmikenTypeMap, OmikenEntry, PresetOmikenType, CategoryActive } from '@type';

export function FunkEmits(emit: any) {
 // リスト開閉関数
 const openList = (category: CategoryActive) => emit('update:category', category);

 // ダイアログを表示するemit
 const openEditorItem = (type: ListCategory, id: string) => {
  emit('open-editor', {
   isOpen: true,
   type,
   mode: null,
   key: id
  });
 };
 const openEditor = (editorItem: ListEntry<ListCategory>) => emit('open-editor', editorItem);

 // Omiken のアップデート(バケツリレー用)
 const updateOmiken = (payload: OmikenEntry<ListCategory>) => emit('update:Omiken', payload);

 // Omiken のアップデート(アイテム)
 const updateOmikenEntry = <T extends keyof OmikenTypeMap>(
  type: T,
  update: Record<string, OmikenTypeMap[T]> | OmikenTypeMap[T]
 ) => {
  const normalizedUpdate =
   typeof update === 'object' && !(update instanceof Array) && 'id' in update
    ? { [(update as any).id]: update }
    : update;

  emit('update:Omiken', { type, update: normalizedUpdate });
 };

 // Preset更新
 const updateOmikenPreset = (preset: PresetOmikenType) => emit('update:OmikenPreset', preset);

 return {
  // ナビゲーション操作
  openList,
  
  // ダイアログを開く
  openEditorItem,
  openEditor,

  // Omiken のアップデート
  updateOmiken,
  updateOmikenEntry,
  updateOmikenPreset
 };
}
