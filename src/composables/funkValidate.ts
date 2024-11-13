// src/composables/funkValidate.ts
import { type ListCategory, type ListTypeMap, AccessCondition, ListItemTypeMap, OmikenType, OmikujiType, PlaceType, RulesType } from "../types";
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
  isBaseZero: z.boolean(),
});

// 時間フィルターのスキーマ
const thresholdClockSchema = z.object({
  type: z.literal("clock"),
  startHour: thresholdValueTransform.transform(
    (val) => (val >= 0 && val < 24 ? val : 0) // 0-23 以外の値はデフォルトの 0 に変換
  ),
  durationHours: thresholdValueTransform.transform(
    (val) => (val >= 1 && val < 24 ? val : 1) // 1-23 以外の値はデフォルトの 1 に変換
  ),
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
const ruleThresholdSchema = thresholdTypeCommonSchema
  .extend({
    conditionType: z
      .enum(["match", "access", "syoken", "timer", "count", "gift"])
      .default("match"),
    syoken: z.enum(["syoken", "hi", "again"]).optional(),
    timer: thresholdTimerSchema.optional(),
  })
  .transform((data) => {
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
const omikujiThresholdSchema = thresholdTypeCommonSchema
  .extend({
    conditionType: z
      .enum(["none", "access", "match", "clock", "elapsed", "count", "gift"])
      .default("none"),
    clock: thresholdClockSchema.optional(),
    elapsed: thresholdElapsedSchema.optional(),
  })
  .transform((data) => {
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

// rulesOrder/enabledIdsの配列用スキーマ
const arraySchema = z.array(z.string()).transform((ids) => {
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
    enabledIds: arraySchema.default([]),
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
  rulesOrder: arraySchema.default([]),
  omikuji: omikujiSchema,
  place: placeSchema,
  preferences: preferencesSchema,
} as const;


// 型の定義
const validators = {
  rules: (data: unknown) => schemas.rules.parse(data) as Record<string, RulesType>,
  omikuji: (data: unknown) => schemas.omikuji.parse(data) as Record<string, OmikujiType>,
  place: (data: unknown) => schemas.place.parse(data) as Record<string, PlaceType>,
  rulesOrder: (data: unknown) => schemas.rulesOrder.parse(data) as string[],
} as const;

// バリデーション関数
export const validateData = <T extends keyof ListItemTypeMap>(
  type: T,
  data: unknown
): ListItemTypeMap[T] => {
  try {
    // バリデーションを行い、通った場合はそのまま返す
    return validators[type](data) as ListItemTypeMap[T]; // 明示的に型をキャスト
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation errors:", error.errors);
      // schemasからデフォルト値を取得して返す
      return validateDefault(type);
    }
    // その他のエラーが発生した場合もschemasからデフォルト値を取得
    return validateDefault(type);
  }
};

// schemasからデフォルト値を取得する関数
const validateDefault = <T extends keyof typeof validators>(
  type: T
): ListItemTypeMap[T] => {
  try {
    switch (type) {
      case "rules": {
        const emptyRules = validators.rules({});
        return emptyRules as unknown as ListItemTypeMap[T];
      }
      case "omikuji": {
        const emptyOmikuji = validators.omikuji({});
        return emptyOmikuji as unknown as ListItemTypeMap[T];
      }
      case "place": {
        const emptyPlace = validators.place({});
        return emptyPlace as unknown as ListItemTypeMap[T];
      }
      case "rulesOrder": {
        const emptyOrder = validators.rulesOrder([]);
        return emptyOrder as unknown as ListItemTypeMap[T];
      }
      default:
        throw new Error(`Unknown type: ${type}`);
    }
  } catch {
    // 型に応じたフォールバック値を返す
    switch (type) {
      case "rules":
        return {} as Record<string, RulesType> as ListItemTypeMap[T];
      case "omikuji":
        return {} as Record<string, OmikujiType> as ListItemTypeMap[T];
      case "place":
        return {} as Record<string, PlaceType> as ListItemTypeMap[T];
      case "rulesOrder":
        return [] as string[] as ListItemTypeMap[T];
      default:
        throw new Error(`Unknown type: ${type}`);
    }
  }
};