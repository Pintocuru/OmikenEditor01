// src/composables/funkOmikenJSON.ts
import { ref } from 'vue';
import type { STATEType, omikujiType, rulesType, placeType, postType } from '../types';

/*
JSONデータの操作を担当
useDataFetcher: JSONデータの読み込み機能を提供
useDataSaver: JSONデータの保存機能を提供
*/


// データ読み込み
export function useDataFetcher() {
  const loading = ref(false);

  const fetchData = async (STATE: STATEType) => {
    try {
      loading.value = true;
      const response = await fetch('/src/state.json');
      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.statusText);
      }
      const data = await response.json();

      // データの検証と正規化
      const validatedData: STATEType = {
        rules: validateRules(data.rules),
        omikuji: validateOmikuji(data.omikuji),
        place: validatePlace(data.place),
        rulesOrder: generateOrder(data.rules),
        omikujiOrder: generateOrder(data.omikuji),
        placeOrder: generateOrder(data.place),
      };

      Object.assign(STATE, validatedData);
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


// rulesの検証
export function validateRules(items: { [key: string]: any }): { [key: string]: rulesType } {
  const validatedRules: { [key: string]: rulesType } = {};
  for (const [key, item] of Object.entries(items)) {
    validatedRules[key] = {
      // ID
      id: typeof item.id === 'string' ? item.id : key,
      // おみくじルール名
      name: typeof item.name === 'string' ? item.name : 'おみくじ',
      // ルールの有効/無効 0:OFF/1:だれでも/2:メンバー以上/3:モデレーター/4:管理者
      switch: [0, 1, 2, 3, 4].includes(item.switch) ? item.switch : 1,
      // omikujiの適用しないIDリスト
      disabledIds: Array.isArray(item.disabledIds) ? item.disabledIds.filter((id: any) => typeof id === 'number') : [],
      // キーワード(完全一致/前方一致/部分一致)
      matchExact: Array.isArray(item.matchExact) ? item.matchExact.filter((phrase: any) => typeof phrase === 'string') : ['*'],
      matchStartsWith: Array.isArray(item.matchStartsWith) ? item.matchStartsWith.filter((phrase: any) => typeof phrase === 'string') : [],
      matchIncludes: Array.isArray(item.matchIncludes) ? item.matchIncludes.filter((phrase: any) => typeof phrase === 'string') : [],
    };
  }
  return validatedRules;
}

// Omikujiの検証
export function validateOmikuji(items: { [key: string]: any }): { [key: string]: omikujiType } {
  const validatedOmikuji: { [key: string]: omikujiType } = {};

  for (const [key, item] of Object.entries(items)) {
    // ランダムな運勢を取得
    const getRandomFortune = () => ["大吉", "中吉", "小吉", "末吉", "吉", "凶", "福沢諭吉"][Math.floor(Math.random() * 7)];

    validatedOmikuji[key] = {
      // ID
      id: typeof item.id === 'string' ? item.id : key,
      // おみくじの結果名(「大吉」など)
      name: typeof item.name === 'string' ? item.name : getRandomFortune(),
      // メッセージの重み付け
      weight: typeof item.weight === 'number' || typeof item.weight === 'string'
        ? Math.abs(parseInt(item.weight)) || 1
        : 1,
      // フィルタリング基準
      threshold: {
        // タイプ
        type: ['none', 'time', 'lc', 'no', 'tc', 'second', 'minute', 'hour', 'day', 'price', 'custom'].includes(item.threshold?.type) ? item.threshold.type : 'none',
        // 比較方法
        comparison: ['min', 'equal', 'max', 'loop', 'range'].includes(item.threshold?.comparison) ? item.threshold.comparison : 'equal',
        // 基準となる数値
        value: typeof item.threshold?.value === 'number' ? Math.abs(item.threshold.value) : 0,
        valueMax: typeof item.threshold?.valueMax === 'number' ? Math.abs(item.threshold.valueMax) : 0,
      },
      // メッセージの投稿情報 message:わんコメ party:WordParty toast:トースト speech:わんコメspeech
      post: Array.isArray(item.post) ?
        (item.post as postType[]).map((post: any): postType => ({
          type: ['onecomme', 'party', 'toast', 'speech'].includes(post.type) ? post.type : 'onecomme',
          botKey: typeof post.botKey === 'string' ? post.botKey : "mamono",
          iconKey: typeof post.iconKey === 'string' ? post.iconKey : "Default",
          delaySeconds: typeof post.delaySeconds === 'number' ? post.delaySeconds : 0,
          content: typeof post.content === 'string' ? post.content : '<<user>>さんの運勢は【大吉】',
        }))
          .sort((a, b) => a.delaySeconds - b.delaySeconds) : [],
    };
  }
  return validatedOmikuji;
}

// placeの検証
export function validatePlace(items: { [key: string]: any }): { [key: string]: placeType } {
  const validatedPlace: { [key: string]: placeType } = {};

  for (const [key, item] of Object.entries(items)) {
    validatedPlace[key] = {
      // ID
      id: typeof item.id === 'string' ? item.id : key,
      // プレースホルダー名
      name: typeof item.name === 'string' ? item.name : '<<random>>',
      // ランダム選択時の重み付け
      weight: typeof item.weight === 'number' ? Math.abs(item.weight) : 1,
      // グループ番号
      group: typeof item.group === 'number' ? item.group : 0,
      // メッセージ内容
      content: typeof item.content === 'string' ? item.content : '',
    };
  }

  return validatedPlace;
}

// xxxOrderの生成関数
function generateOrder(items: { [key: string]: any }): string[] {
  return Object.keys(items);
}


// データ保存
export function useDataSaver() {
  const saveStatus = ref('');
  const showSnackbar = ref(false);

  const saveData = async (STATE: STATEType) => {
    try {
      saveStatus.value = 'Saving...';
      const response = await fetch('/src/state.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(STATE)
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



/*
2024/10/19  1:26　Claudeにだしてもらったやつ↓ // TODO

// src/composables/funkOmikenJSON.ts
import { ref } from 'vue';
import { z } from 'zod';
import _ from 'lodash';
import type { STATEType, omikujiType, rulesType, placeType, postType } from '../types';

// Zodスキーマの定義
const ruleSchema = z.object({
  id: z.string(),
  name: z.string(),
  switch: z.number().int().min(0).max(4),
  disabledIds: z.array(z.number()),
  matchExact: z.array(z.string()),
  matchStartsWith: z.array(z.string()),
  matchIncludes: z.array(z.string()),
});

const omikujiSchema = z.object({
  id: z.string(),
  name: z.string(),
  weight: z.number().int().positive(),
  threshold: z.object({
    type: z.enum(['none', 'time', 'lc', 'no', 'tc', 'second', 'minute', 'hour', 'day', 'price', 'custom']),
    comparison: z.enum(['min', 'equal', 'max', 'loop', 'range']),
    value: z.number().nonnegative(),
    valueMax: z.number().nonnegative(),
  }),
  post: z.array(z.object({
    type: z.enum(['onecomme', 'party', 'toast', 'speech']),
    botKey: z.string(),
    iconKey: z.string(),
    delaySeconds: z.number().nonnegative(),
    content: z.string(),
  })),
});

const placeSchema = z.object({
  id: z.string(),
  name: z.string(),
  weight: z.number().int().positive(),
  group: z.number().int().nonnegative(),
  content: z.string(),
});

// データ読み込み
export function useDataFetcher() {
  const loading = ref(false);

  const fetchData = async (STATE: STATEType) => {
    try {
      loading.value = true;
      const response = await fetch('/src/state.json');
      if (!response.ok) throw new Error('Network response was not ok: ' + response.statusText);
      const data = await response.json();

      // データの検証と正規化
      const validatedData: STATEType = {
        rules: validateData(data.rules, ruleSchema),
        omikuji: validateData(data.omikuji, omikujiSchema),
        place: validateData(data.place, placeSchema),
        rulesOrder: _.keys(data.rules),
        omikujiOrder: _.keys(data.omikuji),
        placeOrder: _.keys(data.place),
      };

      Object.assign(STATE, validatedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      loading.value = false;
    }
  };

  return { loading, fetchData };
}

// 汎用的なデータ検証関数
function validateData<T>(data: { [key: string]: any }, schema: z.ZodType<T>): { [key: string]: T } {
  return _.mapValues(data, item => schema.parse(item));
}

// データ保存
export function useDataSaver() {
  const saveStatus = ref('');
  const showSnackbar = ref(false);

  const saveData = async (STATE: STATEType) => {
    try {
      saveStatus.value = 'Saving...';
      const response = await fetch('/src/state.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(STATE)
      });
      if (!response.ok) throw new Error('Network response was not ok');
      saveStatus.value = 'Saved successfully!';
      showSnackbar.value = true;
    } catch (error) {
      console.error('Error saving data:', error);
      saveStatus.value = 'Error saving data';
      showSnackbar.value = true;
    }
  };

  return { saveData, saveStatus, showSnackbar };
}
*/