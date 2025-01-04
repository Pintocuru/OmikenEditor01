// src/composables/funkValidate.ts
import { AccessCondition, OmikenType, SyokenCondition, TypesType, RulesType, GiftCondition } from '@type';
import { z, ZodError } from 'zod';

// threshold共通の数値変換
const thresholdValueTransform = z.number().transform((val) => {
 return typeof val !== 'number' || val < 0 ? 0 : val;
});

// value1とvalue2のチェック関数
const thresholdValueRangeSwap = (schema: any) =>
 schema.transform((data: any) => {
  if (data.comparison === 'range' && data.value1 > data.value2) {
   [data.value1, data.value2] = [data.value2, data.value1];
  }
  return data;
 });

// threshold.countスキーマ
const thresholdCountSchema = thresholdValueRangeSwap(
 z.object({
  comparison: z.enum(['min', 'equal', 'max', 'loop', 'range']),
  unit: z.enum(['draws', 'gift', 'lc', 'no', 'tc', 'interval']),
  value1: thresholdValueTransform,
  value2: thresholdValueTransform.optional()
 })
);

// threshold.matchスキーマ
const thresholdMatchSchema = z.object({
 target: z.enum(['status', 'comment', 'name', 'displayName']),
 case: z.enum(['exact', 'starts', 'include']),
 value: z.array(z.string()).default([])
});

// thresholdスキーマ
const thresholdSchema = z
 .object({
  conditionType: z.enum(['target', 'coolDown', 'syoken', 'access', 'gift', 'count', 'match']).default('match'),
  target: z.literal(null).optional(),
  coolDown: z.number().default(3).optional(),
  syoken: z.nativeEnum(SyokenCondition).optional(),
  access: z.nativeEnum(AccessCondition).optional(),
  gift: z.nativeEnum(GiftCondition).optional(),
  match: thresholdMatchSchema.optional(),
  count: thresholdCountSchema.optional()
 })
 .transform((data) => {
  const result = { conditionType: data.conditionType };
  // conditionTypeに応じて必要なキーのみを残す
  switch (data.conditionType) {
   case 'target':
    return { ...result, target: data.target }; // targetのみ保持
   case 'coolDown':
    return { ...result, coolDown: data.coolDown }; // coolDownのみ保持
   case 'syoken':
    return { ...result, syoken: data.syoken }; // syokenのみ保持
   case 'access':
    return { ...result, access: data.access }; // accessのみ保持
   case 'gift':
    return { ...result, gift: data.gift }; // accessのみ保持
   case 'match':
    return { ...result, match: data.match }; // matchのみ保持
   case 'count':
    return { ...result, count: data.count }; // countのみ保持
   default:
    return result;
  }
 });

// BaseType をマージして定義
const baseSchema = z.object({
 id: z.string(),
 name: z.string().default(''),
 description: z.string().default('')
});

// rulesのZodスキーマ
const rulesSchema = z.record(
 baseSchema.merge(
  z.object({
   color: z.string().default('#66FFFF'),
   enableIds: z.array(z.string()).default([]),
   threshold: z.array(thresholdSchema).default([
    {
     conditionType: 'match',
     match: { target: 'comment', case: 'starts', value: ['おみくじ'] }
    }
   ]),
   timerConfig: z
    .object({
     minutes: z.number().int().nonnegative(), // 分単位
     isBaseZero: z.boolean() // ベースがゼロかどうか
    })
    .optional()
  })
 )
);

// omikuji.postスキーマ
export const omikujiPostSchema = z
 .array(
  z.object({
   type: z.enum(['onecomme', 'party', 'speech', 'error']).default('onecomme'),
   botKey: z.string().default('mamono'),
   iconKey: z.string().default('Default'),
   party: z.string().nullable().optional(),
   isSilent: z.boolean().optional(),
   generatorParam: z.string().optional(),
   delaySeconds: z.number().default(0),
   content: z.string().default('<<user>>さんの運勢は【大吉】<<random>>')
  })
 )
 .transform((posts) =>
  posts.sort((a, b) => {
   // delaySecondsで昇順ソート
   if (a.delaySeconds !== b.delaySeconds) {
    return a.delaySeconds - b.delaySeconds;
   }
   // delaySecondsが同じ場合はtypeの順序でソート
   const typeOrder = ['onecomme', 'party', 'speech'];
   return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
  })
 );

// omikujiのZodスキーマ
const omikujiValueSchema = z.object({
 ...baseSchema.shape, // baseSchemaのフィールドを展開
 rank: z.number().int().nonnegative().default(0),
 weight: z.number().int().nonnegative().default(1),
 threshold: z.array(thresholdSchema).default([]),
 status: z.string().nullable().optional().default(''),
 script: z
  .object({
   scriptId: z.string().nullable().default(''),
   params: z
    .array(
     baseSchema.merge(
      z.object({
       value: z.string().default('')
      })
     )
    )
    .default([])
  })
  .optional(),
 placeIds: z.array(z.string()).default([]),
 post: omikujiPostSchema.default([])
});

const omikujiSchema = z.record(z.string(), omikujiValueSchema);

// placeのZodスキーマ
const placeSchema = z.record(
 baseSchema.merge(
  z.object({
   values: z
    .array(
     z.object({
      weight: z.number().int().nonnegative().default(1),
      value: z.string()
     })
    )
    .default([])
  })
 )
);

// typesのZodスキーマ
const TypesType = z.enum(['comment', 'timer', 'meta', 'waitingList', 'setList', 'reactions', 'unused']);

// typesフィールドのZodスキーマ
const typesSchema = z.record(TypesType, z.array(z.string()));

// スキーマをまとめる
const schemas = {
 types: typesSchema,
 rules: rulesSchema,
 omikujis: omikujiSchema,
 places: placeSchema
} as const;

// validateData
export const validateData = <T extends keyof OmikenType>(
 type: T,
 data: unknown,
 additionalContext?: { rules?: Record<string, RulesType> }
): OmikenType[T] => {
 try {
  const schema = schemas[type];

  if (type === 'types' && additionalContext?.rules) {
   const parsedData = schema.parse(data) as Record<TypesType, string[]>;
   return validateTypes(parsedData, additionalContext.rules) as OmikenType[T];
  }
  const parsed = schema.parse(data);
  return parsed as OmikenType[T];
 } catch (e) {
  console.error(`Validation error for ${type}:`, e instanceof Error ? e.message : e);
  if (e instanceof ZodError) {
   console.error(e.errors);
  }

  // エラー時にデフォルト値を返す
  try {
   if (type === 'types' && additionalContext?.rules) {
    // types用の特別なデフォルト処理
    const defaultData = {} as Record<TypesType, string[]>;
    return validateTypes(defaultData, additionalContext.rules) as OmikenType[T];
   }
   return validateDefault(type, {});
  } catch (defaultError) {
   console.error('Failed to create default data:', defaultError);
   throw e;
  }
 }
};

// schemasからデフォルト値を取得する関数
const validateDefault = <T extends keyof OmikenType>(type: T, data: unknown): OmikenType[T] => {
 switch (type) {
  case 'rules':
   return schemas.rules.safeParse(data).success ? (data as OmikenType[T]) : (schemas.rules.parse({}) as OmikenType[T]);
  case 'omikujis':
   return schemas.omikujis.safeParse(data).success
    ? (data as OmikenType[T])
    : (schemas.omikujis.parse({}) as OmikenType[T]);
  case 'places':
   return schemas.places.safeParse(data).success
    ? (data as OmikenType[T])
    : (schemas.places.parse({}) as OmikenType[T]);
  case 'types': // typesのケースを追加
   return schemas.types.safeParse(data).success ? (data as OmikenType[T]) : (schemas.types.parse({}) as OmikenType[T]);
  default:
   throw new Error(`Unknown type: ${type}`);
 }
};

const validateTypes = (
 types: Record<TypesType, string[]>,
 rules: Record<string, RulesType>
): Record<TypesType, string[]> => {
 // 深いコピーを作成
 const validatedTypes = JSON.parse(JSON.stringify(types));

 // すべてのtypesの配列を処理
 (Object.keys(validatedTypes) as TypesType[]).forEach((typeKey) => {
  // 重複を除去し、かつ存在するrulesのidのみを残す
  validatedTypes[typeKey] = Array.from(new Set(validatedTypes[typeKey])).filter(
   (ruleId): ruleId is string => typeof ruleId === 'string' && ruleId in rules
  );
 });

 // どの配列にも存在しないrulesのidを'unused'に追加
 const allUsedIds = new Set<string>();

 // 型ガードでtypeArrayがstring[]であることを確認
 Object.values(validatedTypes).forEach((typeArray) => {
  if (Array.isArray(typeArray)) {
   typeArray.forEach((id) => allUsedIds.add(id));
  }
 });

 // 'unused' に追加すべきIDを決定
 const unusedIds = Object.keys(rules).filter((ruleId) => !allUsedIds.has(ruleId));

 // 'unused' に追加
 validatedTypes.unused = [...validatedTypes.unused, ...unusedIds];

 return validatedTypes;
};
