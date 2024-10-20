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

  const { isInitialized, canUpdateJSON, fetchData, saveData } = useInitializeFunkOmiken();

  // 初期読み込み
  const initializeSTATE = async () => {
    const data = await fetchData();
    if (data) {
      STATE.value = data;
    }
  };

  // emitsから送られたデータの処理
  const updateSTATEInternal = (payload: SelectItem) => {
    // 読み込み失敗なら一切の編集不可 // TODO 編集不可のスナックバーを出す
    if (!isInitialized.value) {
      return;
    }

    if (!payload) return;
    const { type, update, addKeys, delKeys, reorder } = payload;

    if (update) updateItem(type, update); // カテゴリの更新
    addKeys?.forEach(item => addItem(type, item)); // 追加
    delKeys?.forEach(key => deleteItem(type, key)); // 削除
    if (Array.isArray(reorder)) updateOrder(type, reorder); // 順番の再設定

    saveData(STATE.value);
  };

  // デバウンスされた updateSTATE 関数
  const updateSTATE = _.debounce(updateSTATEInternal, 500);

  // カテゴリの更新
  const updateItem = (type: ItemCategory, item: Record<string, ItemContent>) => {
    const newItem = validateData(type, item);
    (STATE.value[type] as Record<string, ItemContent>) = _.merge({}, STATE.value[type], newItem);
  };

  // アイテムの追加
  const addItem = (type: ItemCategory, item: object) => {
    console.log(type, item);
    const newKey = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newItem = validateData(type, { [newKey]: item });
    (STATE.value[type] as Record<string, ItemContent>) = _.merge({}, STATE.value[type], newItem);
    STATE.value[`${type}Order`].push(newKey);
  };

  // アイテムの削除
  const deleteItem = (type: ItemCategory, itemId: string) => {
    STATE.value[type] = _.omit(STATE.value[type], [itemId]);
    // xxxOrderから削除
    STATE.value[`${type}Order`] = STATE.value[`${type}Order`].filter(id => id !== itemId);
  };

  // 順番(xxxOrder)の更新
  const updateOrder = (type: ItemCategory, newOrder: string[]) => {
    if (!Array.isArray(newOrder)) {
      throw new Error(`newOrder must be an array for type: ${type}`);
    }
    STATE.value[`${type}Order`] = newOrder;
  };


  return {
    STATE,
    isInitialized,
    canUpdateJSON,
    initializeSTATE,
    updateSTATE
  };
}
