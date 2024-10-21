// src/composables/funkOmikenJSON.ts
import { ref } from 'vue';
import type { STATEType, ItemCategory } from '../types';
import { z } from 'zod';
import _ from 'lodash';
import Swal from 'sweetalert2';
import { useToast } from 'vue-toastification';

// JSONデータの読み込み・書き込み
export function useInitializeFunkOmiken() {
  const canUpdateJSON = ref(false); // テストモード:JSONを書き込みするか
  const isLoading = ref(false); // 読み込み中かどうか、読み込み失敗ならずっとtrue
  const noAppBoot = ref(false); // 起動できたか
  const lastSavedState = ref<STATEType | null>(null); // 1つ前へ戻る機能
  const toast = useToast(); // vue-toastification

  const fetchData = async (): Promise<STATEType | null> => {
    // 取得中ならreturn
    if (isLoading.value) {
      console.warn('データの取得が既に進行中です');
      return null;
    }
    isLoading.value = true;

    try {
      // fetchを使って読み込み
      const response = await fetch('/src/state.json');
      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.statusText);
      }
      const data = await response.json();

      // データの検証と正規化
      const validatedData: STATEType = {
        rules: validateData('rules', data.rules),
        omikuji: validateData('omikuji', data.omikuji),
        place: validateData('place', data.place),
        rulesOrder: generateOrder(data.rules),
        omikujiOrder: generateOrder(data.omikuji),
        placeOrder: generateOrder(data.place),
      };

      lastSavedState.value = _.cloneDeep(validatedData);
      await Swal.fire({
        title: '読み込み完了',
        text: 'データの読み込みが完了しました。',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      isLoading.value = false;
      return validatedData;
    } catch (error) {
      noAppBoot.value = true;
      await Swal.fire({
        title: '読み込み失敗',
        text: 'データの読み込みに失敗しました。アプリケーションを起動できません。',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      throw new Error('データ読み込み失敗');
    } 
  };

  const saveData = async (STATE: STATEType): Promise<void> => {
    if (noAppBoot.value) {
      toast('🚫データ保存はできません');
      return;
    }
    // テストモード:保存できたことをログに表示
    if (!canUpdateJSON.value ) {
      console.warn('🚫canUpdateJSON:false, saveDataまで届きました');
      return;
    }
    // ロード中ならreturn(書き込みONの表示も兼ねて)
    if (isLoading.value) {
      console.warn('💾canUpdateJSON:true');
      return;
    }

    isLoading.value = true;
    toast('💾データ保存中…');
    try {
      const response = await fetch('/api/save-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(STATE)
      });
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      // 最後の状態を取得
      lastSavedState.value = _.cloneDeep(STATE);
      toast('💾データ保存が完了しました。');
      console.log('💾データの保存が完了しました。');
    } catch (error) {
      console.error('Error saving data:', error);
      await Swal.fire({
        title: '保存失敗',
        text: 'データの保存に失敗しました。',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      isLoading.value = false;
    }
  };

  // 1つ前に戻る機能(使えるだろうか…？)
  const undoLastChange = () => {
    if (lastSavedState.value) {
      return _.cloneDeep(lastSavedState.value);
    }
    return null;
  };


  return {
    canUpdateJSON,
    isLoading,
    fetchData,
    saveData,
    undoLastChange
  };
}




// rulesのZodスキーマ
const rulesSchema = z.record(z.object({
  // ID
  id: z.string(),
  // おみくじルール名
  name: z.string().default('おみくじ'),
  // ルールの有効/無効 0:OFF/1:だれでも/2:メンバー以上/3:モデレーター/4:管理者
  switch: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).default(1),
  // omikujiの適用しないIDリスト
  disabledIds: z.array(z.string()).default([]),
  // キーワード(完全一致/前方一致/部分一致)
  matchExact: z.array(z.string()).default(['*']),
  matchStartsWith: z.array(z.string()).default([]),
  matchIncludes: z.array(z.string()).default([])
}));

// omikuji.thresholdスキーマ
const baseThresholdSchema = z.object({
  type: z.enum(['none', 'time', 'lc', 'no', 'tc', 'second', 'minute', 'hour', 'day', 'price', 'custom']).default('none'),
  // 比較方法
  comparison: z.enum(['min', 'equal', 'max', 'loop', 'range']).default('equal'),
  // 基準となる数値
  value: z.number().nonnegative().default(0),
  valueMax: z.number().nonnegative().default(0),
});

// 入力制限チェック
function validateThreshold(data: z.infer<typeof baseThresholdSchema>) {
  let { type, comparison, value, valueMax } = data;

  // 数値の調整
  const sanitizeNumber = (num: number, min: number, max: number) => {
    return Math.max(min, Math.min(num, max));
  };

  switch (type) {
    // 時間指定
    case "time":
      comparison = "range";
      value = sanitizeNumber(value, 0, 23);
      valueMax = sanitizeNumber(valueMax ?? 0, 0, 23);
      if (value > valueMax && valueMax !== value) {
        // OK
      } else if (value === valueMax) {
        valueMax = (value + 1) % 24;
      }
      break;

      // 経過時間系
    case "second": case "minute": case "hour": case "day": case "price":
      if (["equal", "loop"].includes(comparison) && type !== "price") {
        comparison = "min";
      }
      value = Math.max(0, value);
      if (comparison === "range") {
        valueMax = Math.max(value + 1, valueMax ?? 0);
      }
      break;

    // コメント数関系
    case "lc":
    case "no":
    case "tc":
    case "custom":
      value = Math.max(0, value);
      if (comparison === "range") {
        valueMax = Math.max(value + 1, valueMax ?? 0);
      }
      break;

    default:
      // "none" の場合は何もしない
      break;
  }

  return { type, comparison, value, valueMax };
}


// Zodスキーマとカスタムバリデーションを組み合わせる
const thresholdSchema = baseThresholdSchema.refine(
  (data) => {
    const validated = validateThreshold(data);
    return true;
  },
  // エラーメッセージ
  { message: "Invalid threshold settings", path: ["threshold"], }
).transform(validateThreshold);

// omikujiのZodスキーマ
const omikujiSchema = z.record(z.object({
  // ID
  id: z.string(),
  // おみくじの結果名(「大吉」など)
  name: z.string(),
  // メッセージの重み付け
  weight: z.number().int().positive().default(1),
  // フィルタリング基準
  threshold: thresholdSchema,
  // メッセージの投稿情報 message:わんコメ party:WordParty toast:トースト speech:わんコメspeech
  post: z.array(z.object({
    type: z.enum(['onecomme', 'party', 'toast', 'speech']).default('onecomme'),
    botKey: z.string().default('mamono'),
    iconKey: z.string().default('Default'),
    delaySeconds: z.number().nonnegative().default(0),
    content: z.string().default('<<user>>さんの運勢は【大吉】')
  })).default([])
}));

// placeのZodスキーマ
const placeSchema = z.record(z.object({
  // ID
  id: z.string(),
  // プレースホルダー名
  name: z.string().default('<<random>>'),
  // ランダム選択時の重み付け
  weight: z.number().positive().default(1),
  // グループ番号
  group: z.number().nonnegative().default(0),
  // メッセージ内容
  content: z.string().default('')
}));


// スキーマをまとめる
const schemas = {
  rules: rulesSchema,
  omikuji: omikujiSchema,
  place: placeSchema,
} as const;

// デフォルト値の設定
const defaultValues = {
  rules: {
    name: 'おみくじ',
    switch: 1,
    disabledIds: [],
    matchExact: ['*'],
    matchStartsWith: [],
    matchIncludes: []
  },
  omikuji: {
    name: getRandomFortune(),
    weight: 1,
    threshold: {
      type: 'none',
      comparison: 'equal',
      value: 0,
      valueMax: 0
    },
    post: [{
      type: 'onecomme',
      botKey: 'mamono',
      iconKey: 'Default',
      delaySeconds: 0,
      content: '<<user>>さんの運勢は【大吉】'
    }]
  },
  place: {
    name: '<<random>>',
    weight: 1,
    group: 0,
    content: ''
  }
};

// ランダムな運勢を取得
function getRandomFortune() {
  return ["大吉", "中吉", "小吉", "末吉", "吉", "凶", "福沢諭吉"][Math.floor(Math.random() * 7)];
}

// rules omikuji placeのバリデーション
// TODO 返り値がanyなので　ItemContent　にしたい(すると型エラーになるが)
export function validateData(type: ItemCategory, items: Record<string, any>): Record<string, any> {
  const validatedData: Record<string, any> = {};

  for (const [key, item] of Object.entries(items)) {
    // デフォルト値とマージ
    const itemWithDefaults = _.merge({}, defaultValues[type], { id: key }, item);

    try {
      // Zodスキーマでバリデーション
      const validatedItem = schemas[type].parse({ [key]: itemWithDefaults });
      validatedData[key] = validatedItem[key];
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error(`Validation error for ${type} item ${key}:`, error.errors);
      } else {
        console.error(`Unexpected error validating ${type} item ${key}:`, error);
      }
      // エラーが発生した場合は、デフォルト値を使用
      validatedData[key] = defaultValues[type];
    }
  }

  return validatedData;
}

// xxxOrderの生成
function generateOrder(items: { [key: string]: any }): string[] {
  return Object.keys(items);
}

