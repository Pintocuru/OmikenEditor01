// src/composables/funkValidate.ts
import type { ListCategory, EditerTypeMap } from '../types';
import { z } from 'zod';
import _ from 'lodash';


// rulesのZodスキーマ
const rulesSchema = z.record(z.object({
  // ID
  id: z.string(),
  // おみくじルール名
  name: z.string().default('おみくじ'),
  // 説明文
  description: z.string().default(''),
  // ルールの有効/無効 0:OFF/1:だれでも/2:メンバー以上/3:モデレーター/4:管理者
  switch: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).default(1),
  // omikujiの適用しないIDリスト
  enabledIds: z.array(z.string()).default([]),
  // キーワード(完全一致/前方一致/部分一致)
  matchExact: z.array(z.string()).default([]),
  matchStartsWith: z.array(z.string()).default([]),
  matchIncludes: z.array(z.string()).default([])
}));


// omikujiのZodスキーマ
// 共通の数値変換
const thresholdValueTransform = z.number().transform(val => {
  return typeof val !== 'number' || val < 0 ? 0 : val;
});

// value1とvalue2のチェック関数
const thresholdValueRangeSwap = (schema: any) => schema.transform((data: any) => {
  if (data.comparison === 'range' && data.value1 > data.value2) {
    [data.value1, data.value2] = [data.value2, data.value1];
  }
  return data;
});

// 時間フィルターのスキーマ
const thresholdTimeSchema = z.object({
  isEnabled: z.boolean().default(false),
  value1: thresholdValueTransform.refine(val => val >= 0 && val < 24, { message: "0-23の範囲で指定してください" }),
  value2: thresholdValueTransform.refine(val => val >= 0 && val < 24, { message: "0-23の範囲で指定してください" })
});

// 経過時間フィルターのスキーマ
const thresholdElapsedSchema = thresholdValueRangeSwap(z.object({
  isEnabled: z.boolean().default(false),
  unit: z.enum(['second', 'minute', 'hour', 'day']),
  comparison: z.enum(['min', 'max', 'range']),
  value1: thresholdValueTransform,
  value2: thresholdValueTransform
}));

// カウントフィルターのスキーマ
const thresholdCountSchema = thresholdValueRangeSwap(z.object({
  isEnabled: z.boolean().default(false),
  unit: z.enum(['lc', 'no', 'tc']),
  comparison: z.enum(['min', 'equal', 'max', 'loop', 'range']),
  value1: thresholdValueTransform,
  value2: thresholdValueTransform
}));

// ギフトフィルターのスキーマ
const thresholdGiftSchema = thresholdValueRangeSwap(z.object({
  isEnabled: z.boolean().default(false),
  comparison: z.enum(['min', 'equal', 'max', 'range']),
  value1: thresholdValueTransform,
  value2: thresholdValueTransform
}));

// omikuji.thresholdスキーマ
const omikujiThresholdSchema = z.object({
  isSyoken: z.boolean().default(false),
  time: thresholdTimeSchema,
  elapsed: thresholdElapsedSchema,
  count: thresholdCountSchema,
  gift: thresholdGiftSchema,
});

// omikuji.postスキーマ
export const omikujiPostSchema = z.array(z.object({
  type: z.enum(['onecomme', 'party', 'toast', 'speech']).default('onecomme'),
  botKey: z.string().default('mamono'),
  iconKey: z.string().default('Default'),
  delaySeconds: z.number().default(0),
  content: z.string().default('<<user>>さんの運勢は【大吉】<<random>>')
}))
  .transform((posts) =>
    posts.sort((a, b) => {
      // delaySecondsで昇順ソート
      if (a.delaySeconds !== b.delaySeconds) {
        return a.delaySeconds - b.delaySeconds;
      }
      // delaySecondsが同じ場合はtypeの順序でソート
      const typeOrder = ['onecomme', 'party', 'toast', 'speech'];
      return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
    })
  );

// omikujiのZodスキーマ
const omikujiSchema = z.record(z.object({
  id: z.string(),
  name: z.string().default('大吉'),
  description: z.string().default(''),
  weight: z.number().int().positive().default(1),
  threshold: omikujiThresholdSchema,
  post: omikujiPostSchema.default([])
}));


// placeのZodスキーマ
const placeSchema = z.record(z.object({
  // ID
  id: z.string(),
  // プレースホルダー名
  name: z.string().default('random'),
  // 説明文
  description: z.string().default(''),
  // タイプ(出現割合の有無)
  isWeight: z.boolean().default(false),

  // 値の配列
  values: z.array(z.object({
    // 出現割合
    weight: z.number().positive().default(1),
    // 内容(1度だけプレースホルダーを利用可能)
    value: z.string().default('')
  })).default([])
}));

const preferencesSchema = z.record(z.object({
  // コメントしてからBotが反応するまでの遅延(秒)
  basicDelay: z.number().default(1),
  // おみくじ機能のクールダウン時間（秒)
  omikujiCooldown: z.number().default(2),
  // コメントしてからおみくじを有効とする時間(秒)
  commentDuration: z.number().positive().default(5),
  // このスクリプトBOTのcomment.data.userId
  BotUserIDname: z.string().default('FirstCounter')
}));


// スキーマをまとめる
const schemas = {
  rules: rulesSchema,
  omikuji: omikujiSchema,
  place: placeSchema,
  preferences: preferencesSchema
} as const;

// デフォルト値の設定
const defaultValues = {
  rules: {
    name: 'おみくじ',
    description: '',
    switch: 1,
    enabledIds: [],
    matchExact: [],
    matchStartsWith: [],
    matchIncludes: []
  },
  omikuji: {
    name: '大吉',
    description: '',
    weight: 1,
    threshold: {
      isSyoken: false,
      time: {
        isEnabled: false, // 時間指定が無効
        value1: 0, // 開始時間
        value2: 0, // 終了時間
      },
      elapsed: {
        isEnabled: false, // 経過時間が無効
        unit: 'hour', // デフォルトの単位
        value1: 0, // 開始値
        value2: 0, // 終了値
        comparison: 'max', // デフォルトの比較方法
      },
      count: {
        isEnabled: false, // コメント数が無効
        unit: 'no', // デフォルトの単位
        value1: 0, // 開始値
        value2: 0, // 終了値
        comparison: 'max', // デフォルトの比較方法
      },
      gift: {
        isEnabled: false, // ギフトが無効
        value1: 0, // 開始値
        value2: 0, // 終了値
        comparison: 'max', // デフォルトの比較方法
      },
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
    name: 'random',
    description: '',
    isWeight: false,
    values: [{
      weight: 1,
      value: '',
    }],
  },
  preferences: {
    basicDelay: 1,
    omikujiCooldown: 2,
    commentDuration: 5,
    BotUserIDname: 'FirstCounter'
  }
};

// rules omikuji placeのバリデーション
export function validateData<T extends ListCategory>(
  type: T,
  items: Record<string, unknown>
): Record<string, EditerTypeMap[T]> {
  const validatedData: Record<string, EditerTypeMap[T]> = {};

  for (const [key, item] of Object.entries(items)) {
    const itemWithDefaults = _.merge({}, defaultValues[type], { id: key }, item);

    try {
      const validatedItem = schemas[type].parse({ [key]: itemWithDefaults });
      validatedData[key] = validatedItem[key] as EditerTypeMap[T];
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error(`Validation error for ${type} item ${key}:`, error.errors);
      } else {
        console.error(`Unexpected error validating ${type} item ${key}:`, error);
      }
      validatedData[key] = defaultValues[type] as unknown as EditerTypeMap[T];
    }
  }

  return validatedData;
}

// xxxOrderの検証
export const generateOrder = (items: { [key: string]: any }): string[] => {
  return Object.keys(items);
}
