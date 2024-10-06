import { ref } from 'vue';
import type { DefaultState } from '../types';

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