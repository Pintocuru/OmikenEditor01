// funkOmikenEdit.ts
import { reactive, ref } from 'vue';
import type { DefaultState } from '../types';
import type { SelectedItem, ItemType } from '../AppTypes';

// データセット
export function useAppState() {
  const state = reactive<DefaultState>({
    defaultRules: [],
    rules: [],
    botMessage: {
      omikuji: [],
      random: []
    },
  });


  return {
    state,
  };
}

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


// データ読み込み
export function useDataFetcher() {
  const loading = ref(false);

  const fetchData = async (state: DefaultState) => {
    try {
      loading.value = true;
      const response = await fetch('/src/state.json');
      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.statusText);
      }
      const data = await response.json();

      Object.assign(state, {
        rules: data.rules || [],
        botMessage: {
          omikuji: data.botMessage.omikuji || [],
          random: data.botMessage.random || []
        }
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    fetchData
  };
}

// データ保存
export function useDataSaver() {
  const saveStatus = ref('');
  const showSnackbar = ref(false);

  const saveData = async (state: DefaultState) => {
    try {
      saveStatus.value = 'Saving...';
      const response = await fetch('/src/state.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(state)
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      saveStatus.value = 'Saved successfully!';
      showSnackbar.value = true;
    } catch (error) {
      console.error('Error saving data:', error);
      saveStatus.value = 'Error saving data';
      showSnackbar.value = true;
    }
  };

  return {
    saveData,
    saveStatus,
    showSnackbar
  };
}