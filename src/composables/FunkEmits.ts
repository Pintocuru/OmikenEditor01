// src/composables/FunkEmits.ts

import { ListCategory, ListEntry, OmikenTypeMap, OmikenEntry, PresetOmikenType } from '@type';

export function FunkEmits(emit: any) {
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
  // ダイアログを開く
  openEditorItem,
  openEditor,

  // Omiken のアップデート
  updateOmiken,
  updateOmikenEntry,
  updateOmikenPreset
 };
}

const hogedata: PresetOmikenType = {
 id: 'presetNull',
 name: 'presetNull',
 description: 'リセット用',
 version: '0.0.0',
 item: {
  types: {
   comment: [],
   timer: [],
   meta: [],
   waitingList: [],
   setList: [],
   reactions: [],
   unused: []
  },
  rules: {},
  omikujis: {},
  places: {}
 }
};
