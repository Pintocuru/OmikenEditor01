// src/composables/funkOmikenSTATE.ts
import { ref } from 'vue';
import type { STATEType, ItemCategory, ItemContent, SelectItem } from '../types';
import { useInitializeFunkOmiken, validateData } from "../composables/funkOmikenJSON";
import _ from 'lodash';

export function funkSTATE() {
  const STATE = ref<STATEType>({
    rules: {},
    omikuji: {},
    place: {},
    rulesOrder: [],
    omikujiOrder: [],
    placeOrder: [],
  });

  const { fetchData, saveData } = useInitializeFunkOmiken();

  // 初期読み込み
  const initializeSTATE = async () => {
    const data = await fetchData();
    if (data) STATE.value = data;
  };

  const updateSTATE = (payload: SelectItem) => {
    if (!payload) return;
    const { type, update, addKeys, delKeys, reorder } = payload;

    // 現在のステートのディープコピーを作成
    const newState: STATEType = JSON.parse(JSON.stringify(STATE.value));

    // 更新処理
    if (update) {
      const validatedUpdate = validateData(type, update);
      Object.assign(newState[type], validatedUpdate);
    }

    // 追加処理
    if (addKeys?.length) {
      addKeys.forEach(item => {
        const newKey = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const validatedItem = validateData(type, { [newKey]: item });
        Object.assign(newState[type], validatedItem);
        newState[`${type}Order`].push(newKey);
      });
    }

    // 削除処理
    if (delKeys?.length) {
      delKeys.forEach(key => {
        delete newState[type][key];
        newState[`${type}Order`] = newState[`${type}Order`].filter(id => id !== key);
      });
    }

    // 順序の更新
    if (reorder) {
      newState[`${type}Order`] = reorder;
    }

    // ステートの一括更新
    STATE.value = newState;
    saveData(newState);
  };


  return {
    STATE,
    initializeSTATE,
    updateSTATE
  };
}
