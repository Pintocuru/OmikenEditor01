// src/composables/funkValidate.ts
import { type ListCategory, type ListTypeMap, AccessCondition, OmikenType, OmikujiType, RulesType } from "../types";
import { z } from "zod";
import _ from "lodash";

// threshold共通の数値変換
const thresholdValueTransform = z.number().transform((val) => {
  return typeof val !== "number" || val < 0 ? 0 : val;
});

// value1とvalue2のチェック関数
const thresholdValueRangeSwap = (schema: any) =>
  schema.transform((data: any) => {
    if (data.comparison === "range" && data.value1 > data.value2) {
      [data.value1, data.value2] = [data.value2, data.value1];
    }
    return data;
  });

// タイマー用のスキーマ
const thresholdTimerSchema = z.object({
  type: z.literal("timer"),
  minutes: z.number().int().min(1).max(60),
  isBaseZero: z.boolean()
});

// 時間フィルターのスキーマ
const thresholdClockSchema = z.object({
  type: z.literal("clock"), 
  startHour: thresholdValueTransform.refine((val) => val >= 0 && val < 24, {
    message: "0-23の範囲で指定してください",
  }),
  durationHours: thresholdValueTransform.refine((val) => val >= 1 && val < 24, {
    message: "0-23の範囲で指定してください",
  }),
});

// 経過時間フィルターのスキーマ
const thresholdElapsedSchema = thresholdValueRangeSwap(
  z.object({
    type: z.literal("elapsed"), 
    unit: z.enum(["second", "minute", "hour", "day"]),
    comparison: z.enum(["min", "max", "range"]),
    value1: thresholdValueTransform,
    value2: thresholdValueTransform.optional(),
  })
);

// カウントフィルターのスキーマ
const thresholdCountSchema = thresholdValueRangeSwap(
  z.object({
    type: z.literal("count"), 
    unit: z.enum(["lc", "no", "tc"]),
    comparison: z.enum(["min", "equal", "max", "loop", "range"]),
    value1: thresholdValueTransform,
    value2: thresholdValueTransform.optional(),
  })
);

// ギフトフィルターのスキーマ
const thresholdGiftSchema = thresholdValueRangeSwap(
  z.object({
    type: z.literal("gift"), 
    comparison: z.enum(["min", "equal", "max", "range"]),
    value1: thresholdValueTransform,
    value2: thresholdValueTransform.optional(),
  })
);


// 共通のthresholdスキーマ
const thresholdTypeCommonSchema = z.object({
  match: z.array(z.string()).optional().default(["おみくじ"]),
  count: thresholdCountSchema.optional(),
  gift: thresholdGiftSchema.optional(),
  access: z.nativeEnum(AccessCondition).optional(),
});

// rules用thresholdのスキーマ
const ruleThresholdSchema = thresholdTypeCommonSchema.extend({
  conditionType: z.enum(["match", "access", "syoken", "timer", "count", "gift"]).default("match") ,
  syoken: z.enum(["syoken", "hi", "again"]).optional(),
  timer: thresholdTimerSchema.optional(),
}).transform((data) => {
  const result = { conditionType: data.conditionType };
  // conditionTypeに応じて必要なキーのみを残す
  switch (data.conditionType) {
    case "access":
      return { ...result, access: data.access };
    case "syoken":
      return { ...result, syoken: data.syoken };
    case "match":
      return { ...result, match: data.match };
    case "timer":
      return { ...result, timer: data.timer };
    case "count":
      return { ...result, count: data.count };
    case "gift":
      return { ...result, gift: data.gift };
    default:
      return result;
  }
});

// omikuji用thresholdのスキーマ
const omikujiThresholdSchema = thresholdTypeCommonSchema.extend({
  conditionType: z.enum(["none", "access", "match", "clock", "elapsed", "count", "gift"]).default("none"),
  clock: thresholdClockSchema.optional(),
  elapsed: thresholdElapsedSchema.optional(),
}).transform((data) => {
  const result = { conditionType: data.conditionType };
  // conditionTypeに応じて必要なキーのみを残す
  switch (data.conditionType) {
    case "none":
      return result;
    case "access":
      return { ...result, access: data.access };
    case "match":
      return { ...result, match: data.match };
    case "clock":
      return { ...result, clock: data.clock };
    case "elapsed":
      return { ...result, elapsed: data.elapsed };
    case "count":
      return { ...result, count: data.count };
    case "gift":
      return { ...result, gift: data.gift };
    default:
      return result;
  }
});




// enabledIdsの検証用スキーマ
const enabledIdsSchema = z.array(z.string())
  .transform(ids => {
    // 重複を除去して返す
    return [...new Set(ids)];
  });

// rulesのZodスキーマ
const rulesSchema = z.record(
  z.object({
    id: z.string(),
    name: z.string().default("おみくじ"),
    color: z.string().default(""),
    description: z.string().default(""),
    enabledIds: enabledIdsSchema.default([]),
    threshold: ruleThresholdSchema,
  })
);

// omikuji.postスキーマ
export const omikujiPostSchema = z
  .array(
    z.object({
      type: z
        .enum(["onecomme", "party", "toast", "speech"])
        .default("onecomme"),
      botKey: z.string().default("mamono"),
      iconKey: z.string().default("Default"),
      delaySeconds: z.number().default(0),
      content: z.string().default("<<user>>さんの運勢は【大吉】<<random>>"),
    })
  )
  .transform((posts) =>
    posts.sort((a, b) => {
      // delaySecondsで昇順ソート
      if (a.delaySeconds !== b.delaySeconds) {
        return a.delaySeconds - b.delaySeconds;
      }
      // delaySecondsが同じ場合はtypeの順序でソート
      const typeOrder = ["onecomme", "party", "toast", "speech"];
      return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
    })
  );

// omikujiのZodスキーマ
const omikujiSchema = z.record(
  z.object({
    id: z.string(),
    name: z.string().default("大吉"),
    description: z.string().default(""),
    weight: z.number().int().nonnegative().default(1),
    threshold: omikujiThresholdSchema,
    post: omikujiPostSchema.default([]),
  })
);

// placeのZodスキーマ
const placeSchema = z.record(
  z.object({
    // ID
    id: z.string(),
    // プレースホルダー名
    name: z.string().default("random"),
    // 説明文
    description: z.string().default(""),
    // タイプ(出現割合の有無)
    isWeight: z.boolean().default(false),

    // 値の配列
    values: z
      .array(
        z.object({
          // 出現割合
          weight: z.number().nonnegative().default(1),
          // 内容(1度だけプレースホルダーを利用可能)
          value: z.string().default(""),
        })
      )
      .default([]),
  })
);

// rulesOrderスキーマを修正
const rulesOrderSchema = (rules: Record<string, RulesType>) =>
  z.array(z.string())
    .transform(order => {
      const rulesKeys = Object.keys(rules);

      // 1. 重複を除去
      const uniqueOrder = [...new Set(order)];

      // 2. rulesに存在しないキーを除去
      const validOrder = uniqueOrder.filter(key => rulesKeys.includes(key));

      // 3. rulesにあるが順序にないキーを追加
      const missingKeys = rulesKeys.filter(key => !validOrder.includes(key));

      return [...validOrder, ...missingKeys];
    });

const preferencesSchema = z.record(
  z.object({
    // コメントしてからBotが反応するまでの遅延(秒)
    basicDelay: z.number().nonnegative().default(1),
    // おみくじ機能のクールダウン時間（秒)
    omikujiCooldown: z.number().positive().default(2),
    // コメントしてからおみくじを有効とする時間(秒)
    commentDuration: z.number().positive().default(5),
    // このスクリプトBOTのcomment.data.userId
    BotUserIDname: z.string().default("FirstCounter"),
  })
);

// スキーマをまとめる
const schemas = {
  rules: rulesSchema,
  omikuji: omikujiSchema,
  place: placeSchema,
  preferences: preferencesSchema,
} as const;

// デフォルト値の設定
const defaultValues = {
  rules: {
    name: "おみくじ",
    description: "",
    color: "",
    enabledIds: [],
    threshold: {},
  },
  omikuji: {
    name: "大吉",
    description: "",
    weight: 1,
    threshold: {},
    post: [
      {
        type: "onecomme",
        botKey: "mamono",
        iconKey: "Default",
        delaySeconds: 0,
        content: "<<user>>さんの運勢は【大吉】",
      },
    ],
  },
  place: {
    name: "random",
    description: "",
    isWeight: false,
    values: [
      {
        weight: 1,
        value: "",
      },
    ],
  },
  preferences: {},
};

// rules omikuji placeのバリデーション
// validateDataの型定義を拡張
type ValidationCategory = ListCategory | 'rulesOrder';
type ValidationTypeMap = ListTypeMap & {
  rulesOrder: string[];
};

export function validateData<T extends ValidationCategory>(
  type: T,
  items: Record<string, unknown> | string[],
  options?: {
    rules?: Record<string, RulesType>;
    omikuji?: Record<string, OmikujiType>;
  }
): T extends 'rulesOrder' ? string[] : Record<string, ValidationTypeMap[T]> {
  // rulesOrderの検証
  if (type === 'rulesOrder' && Array.isArray(items) && options?.rules) {
    try {
      const order = items as string[];
      const schema = rulesOrderSchema(options.rules);
      return schema.parse(order) as any;
    } catch (error) {
      console.error('RulesOrder validation warning:', error);
      // エラー時は全てのルールキーを返す
      return Object.keys(options.rules) as any;
    }
  }

  // 既存のvalidateDataロジック
  const validatedData: Record<string, any> = {};
  const itemsRecord = items as Record<string, unknown>;

  for (const [key, item] of Object.entries(itemsRecord)) {
    const itemWithDefaults = _.merge(
      {},
      defaultValues[type as ListCategory],
      { id: key },
      item
    );

    try {
      if ('enabledIds' in itemWithDefaults && options?.omikuji) {
        const enabledIds = (itemWithDefaults).enabledIds;
        // おみくじに存在するIDのみをフィルタリング
        const omikujiKeys = Object.keys(options.omikuji);
        itemWithDefaults.enabledIds = enabledIds.filter(id => omikujiKeys.includes(id));
      }

      const validatedItem = schemas[type as ListCategory].parse({ [key]: itemWithDefaults });
      console.log(type);
      validatedData[key] = { ...validatedItem[key], id: key };
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error(
          `Validation warning for ${type} item ${key}:`,
          JSON.stringify(error.errors, null, 2),
          '\nInput value:',
          JSON.stringify(itemWithDefaults, null, 2)
        );
      } else {
        console.error(`Validation warning: ${(error as Error).message}`);
      }

      validatedData[key] = {
        ...defaultValues[type as ListCategory],
        id: key,
        ..._.pick(itemWithDefaults, ['name', 'description'])
      };
    }
  }

  return validatedData as any;
}

export const generateOrder = (items: { [key: string]: any }): string[] => {
  return Object.keys(items);
};
