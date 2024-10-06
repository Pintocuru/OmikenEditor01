import { ref } from 'vue';
import type { DefaultState, SelectedItem, ItemType } from '../types';

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
    const { type, index } = deleteTarget.value;
    if (type === 'rule') {
      state.rules.splice(index, 1);
    } else if (type === 'omikuji') {
      state.botMessage.omikuji.splice(index, 1);
    } else if (type === 'random') {
      state.botMessage.random.splice(index, 1);
    }
    closeDeleteDialog();
  };

  return {
    deleteDialog,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete
  };
}