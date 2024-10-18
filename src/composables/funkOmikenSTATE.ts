// src/composables/funkOmikenSTATE.ts
import { ref } from 'vue';
import type { STATEType, ItemCategory, ItemContent, SelectItem } from '../types';
import _ from 'lodash';
import { z } from 'zod';

// Zodスキーマの定義
const rulesSchema = z.record(z.object({
  someRulesProperty: z.string(),
}));

const omikujiSchema = z.record(z.object({
  weight: z.number(),
  threshold: z.number(),
  postts: z.string(),
}));

const placeSchema = z.record(z.object({
  location: z.string(),
  capacity: z.number(),
}));

// スキーマをまとめる
const schemas = {
  rules: rulesSchema,
  omikuji: omikujiSchema,
  place: placeSchema,
} as const;

type Schemas = typeof schemas;

export function funkSTATE() {
  const STATE = ref<STATEType>({
    rules: {},
    omikuji: {},
    place: {},
    rulesOrder: [],
    omikujiOrder: [],
    placeOrder: [],
  });

  // emitsから送られたデータの処理
  const updateSTATE = (payload: SelectItem) => {
    if (!payload) return;
    const { type, update, addKeys, delKeys, reorder } = payload;

    if (update) {
      updateItem(type, update);
    }

    addKeys?.forEach(item => addItem(type, item));
    delKeys?.forEach(key => deleteItem(type, key));

    if (Array.isArray(reorder)) {
      updateOrder(type, reorder);
    }
  };

  // 順番(xxxOrder)の更新
  const updateOrder = (type: ItemCategory, newOrder: string[]) => {
    if (!Array.isArray(newOrder)) {
      throw new Error(`newOrder must be an array for type: ${type}`);
    }
    STATE.value[`${type}Order`] = newOrder;
  };

  // カテゴリの更新
  const updateItem = (type: ItemCategory, item: Record<string, ItemContent>) => {
    schemas[type].parse(item);
    (STATE.value[type] as Record<string, ItemContent>) = _.merge({}, STATE.value[type], item);
  };

  // アイテムの追加
  const addItem = (type: ItemCategory, item: object) => {
    const newKey = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const validatedItem = schemas[type].parse({ [newKey]: item }); // Zodでバリデーション
    (STATE.value[type] as Record<string, ItemContent>) = _.merge({}, STATE.value[type], validatedItem);
    STATE.value[`${type}Order`].push(newKey);
  };

  // アイテムの削除
  const deleteItem = (type: ItemCategory, itemId: string) => {
    STATE.value[type] = _.omit(STATE.value[type], [itemId]);
    // xxxOrderから削除
    STATE.value[`${type}Order`] = STATE.value[`${type}Order`].filter(id => id !== itemId);
  };

  return {
    STATE,
    updateSTATE,
  };
}
