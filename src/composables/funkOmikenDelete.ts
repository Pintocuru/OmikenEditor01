// src/composables/funkOmikenDelete.ts
import { reactive, ref, computed } from 'vue';
import type { DefaultState, OmikujiMessage, omikujiRule, Post, Placeholder } from '../types';
import type { SelectedItem, ItemType } from '../AppTypes';
/*
アイテムの削除機能を担当
useDeleteItem: アイテムの削除ダイアログと削除処理を管理
*/

// データ削除
export function useDeleteItem(state: DefaultState) {
 const deleteDialog = ref(false);
 const deleteTarget = ref<SelectedItem>({ type: 'rule', index: -1 });

 const openDeleteDialog = (type: ItemType, index: number) => {
  deleteTarget.value = { type, index };
  deleteDialog.value = true;
 };

 const closeDeleteDialog = () => {
  deleteDialog.value = false;
 };

 const confirmDelete = () => {
  if (deleteTarget.value) {
   const { type, index } = deleteTarget.value;
   if (type === 'rules') {
    state.rules.splice(index, 1);
   } else if (type === 'omikuji') {
    state.omikuji.splice(index, 1);
   } else if (type === 'placeholder') {
    state.placeholder.splice(index, 1);
   }
  }
  closeDeleteDialog();
 };

 return {
  deleteDialog, deleteTarget,
  openDeleteDialog,
  closeDeleteDialog,
  confirmDelete
 };
}
