// src/composables/funkValidate.ts
import { AccessCondition, ListItemTypeMap, OmikenType, SyokenCondition } from "../types";
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

// threshold.countスキーマ
const thresholdCountSchema = thresholdValueRangeSwap(
  z.object({
    comparison: z.enum(["min", "equal", "max", "loop", "range"]),
    unit: z.enum(["draws", "gift", "lc", "no", "tc", "interval"]),
    value1: thresholdValueTransform,
    value2: thresholdValueTransform.optional(),
  })
);

// threshold.matchスキーマ
const thresholdMatchSchema = z.object({
  target: z.enum(["status", "comment", "name", "displayName"]),
  case: z.enum(["exact", "starts", "include"]),
  value: z.array(z.string()).default([]),
});

// thresholdスキーマ
const thresholdSchema = z
  .object({
    conditionType: z
      .enum(["target", "cooldown", "syoken", "access", "count", "match"])
      .default("match"),
    target: z.literal(null).optional(),
    cooldown: z.number().default(3).optional(),
    syoken: z.nativeEnum(SyokenCondition).optional(),
    access: z.nativeEnum(AccessCondition).optional(),
    match: thresholdMatchSchema.optional(),
    count: thresholdCountSchema.optional(),
  })
  .transform((data) => {
    const result = { conditionType: data.conditionType };
    // conditionTypeに応じて必要なキーのみを残す
    switch (data.conditionType) {
      case "target":
        return { ...result, target: data.target }; // targetのみ保持
      case "cooldown":
        return { ...result, cooldown: data.cooldown }; // cooldownのみ保持
      case "syoken":
        return { ...result, syoken: data.syoken }; // syokenのみ保持
      case "access":
        return { ...result, access: data.access }; // accessのみ保持
      case "match":
        return { ...result, match: data.match }; // matchのみ保持
      case "count":
        return { ...result, count: data.count }; // countのみ保持
      default:
        return result;
    }
  });

// rulesOrder/enableIdsの配列用スキーマ
const arraySchema = z.array(z.string()).transform((ids) => {
  // 重複を除去して返す
  return [...new Set(ids)];
});

// BaseType をマージして定義
const baseSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  description: z.string().default(""),
});

// rulesのZodスキーマ
const rulesSchema = z.record(
  baseSchema.merge(
    z.object({
      color: z.string().default("#66FFFF"),
      ruleType: z.union([z.literal(false), z.enum(["comment", "timer"])]),
      enableIds: z.array(z.string()).default([]),
      threshold: z
        .array(thresholdSchema)
        .default([
          {
            conditionType: "match",
            match: { target: "comment", case: "starts", value: ["おみくじ"] },
          },
        ]),
    })
  )
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
      party: z.string().default(""),
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
  baseSchema.merge(
    z.object({
      rank: z.number().int().nonnegative().default(1),
      weight: z.number().int().nonnegative().default(1),
      threshold: z.array(thresholdSchema).default([]),
      status: z.string().optional(),
      delete: z.boolean().default(false),
      script: z
        .object({
          scriptId: z.string(),
          parameter: z.string(),
        })
        .optional(),
      placeIds: z.array(z.string()).default([]),
      post: omikujiPostSchema.default([]),
    })
  )
);

// placeのZodスキーマ
const placeSchema = z.record(
  baseSchema.merge(
    z.object({
      values: z
        .array(
          z.object({
            weight: z.number().int().nonnegative().default(1),
            value: z.string(),
          })
        )
        .default([]),
    })
  )
);

// スキーマをまとめる
const schemas = {
  rules: rulesSchema,
  rulesOrder: arraySchema.default([]),
  omikujis: omikujiSchema,
  places: placeSchema,
} as const;

// 型の定義
const validators = {
  rules: (data: unknown) => (schemas.rules.safeParse(data).success ? data : {}),
  rulesOrder: (data: unknown) =>
    schemas.rulesOrder.safeParse(data).success ? data : [],
  omikujis: (data: unknown) =>
    schemas.omikujis.safeParse(data).success ? data : {},
  places: (data: unknown) => (schemas.places.safeParse(data).success ? data : {}),
} as const;

// validateData
export const validateData = <T extends keyof ListItemTypeMap>(
  type: T,
  data: unknown
): ListItemTypeMap[T] => {
  try {
    console.log(data);
    const schema = schemas[type];
    // parseを使用することで、スキーマ定義に基づいた
    // バリデーション・変換・デフォルト値の適用が自動的に行われる
    return schema.parse(data) as ListItemTypeMap[T];
  } catch (e) {
    // エラーログ
    console.error(`Validation error for ${type}:`, e);
    // デフォルト値を返す
    return validateDefault(type, data);
  }
};

// schemasからデフォルト値を取得する関数
const validateDefault = <T extends keyof OmikenType>(
  type: T,
  data: unknown
): OmikenType[T] => {
  switch (type) {
    case "rules":
      return schemas.rules.safeParse(data).success
        ? (data as OmikenType[T])
        : (schemas.rules.parse({}) as OmikenType[T]);
    case "rulesOrder":
      return schemas.rulesOrder.safeParse(data).success
        ? (data as OmikenType[T])
        : (schemas.rulesOrder.parse([]) as OmikenType[T]);
    case "omikujis":
      return schemas.omikujis.safeParse(data).success
        ? (data as OmikenType[T])
        : (schemas.omikujis.parse({}) as OmikenType[T]);
    case "places":
      return schemas.places.safeParse(data).success
        ? (data as OmikenType[T])
        : (schemas.places.parse({}) as OmikenType[T]);
    default:
      throw new Error(`Unknown type: ${type}`);
  }
};
