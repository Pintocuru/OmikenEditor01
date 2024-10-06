import { ref } from 'vue';
import type { DefaultState } from '../types';

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