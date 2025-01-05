// src/composables/funkValidate.ts
import { OmikenType, TypesType, RulesType, ThresholdType, OmikujiType, PlaceType } from '@type';
import { OmikenSchema, omikujiSchema, ruleSchema, thresholdSchema } from '@/types/OmikenSchemas';
import { ZodError } from 'zod';

// Omikenのバリデーション
export function OmikenValidate(data: Partial<OmikenType>): OmikenType {
 try {
  return {
   types: OmikenTypesValidate(data.types, data.rules),
   rules: OmikenRulesValidate(data.rules, data.omikujis),
   omikujis: OmikenOmikujisValidate(data.omikujis),
   places: OmikenPlacesValidate(data.places)
  };
 } catch (error) {
  console.error('Omiken fetch failed:', error);
  return OmikenSchema.parse({});
 }
}

// Rules のバリデーション
const OmikenRulesValidate = (
 rulesRaw: Partial<Record<string, RulesType>>,
 omikujis: Record<string, OmikujiType>
): Record<string, RulesType> => {
 try {
   return Object.entries(rulesRaw).reduce(
    (acc, [key, item]) => {
     if (!item) return acc;

     // キー名とIDの整合性を確認し、新しいキーを生成
     const newKey = OmikenIdValidate(key, item.id);

     // enableIdsの重複除去とomikujisとの整合性チェック
     item.enableIds = [...new Set(item.enableIds.filter((id) => omikujis[id]))];

     // thresholdの検証
     item.threshold = OmikenThresholdValidate(item.threshold);

     // Zodスキーマによる検証と結果の格納
     acc[newKey] = ruleSchema.parse(item);
     return acc;
    },
    {} as Record<string, RulesType>
   );
 } catch (error) {
  // zodのエラーはすべてcatchして値を返してるのでここへは来れないはず
  console.error('Rules validation error:', error);
  throw error instanceof Error ? error : new Error(String(error));
 }
};

// ---

// omikujis のバリデーション
const OmikenOmikujisValidate = (
 omikujisRaw: Partial<Record<string, OmikujiType>>,
 places: Record<string, PlaceType>
): Record<string, OmikujiType> => {
 try {
  return Object.entries(omikujisRaw).reduce(
   (acc, [key, item]) => {
    if (!item) return acc;

    // キー名とIDの整合性を確認し、新しいキーを生成
    const newKey = OmikenIdValidate(key, item.id);

    // placeIdsの重複除去とplacesとの整合性チェック
    item.placeIds = [...new Set(item.placeIds.filter((id) => places[id]))];

    // scriptの検証(scriptのidと異なっていたら警告を出す)

    // thresholdの検証
    item.threshold = OmikenThresholdValidate(item.threshold);

    // botKeyにCharasのidが入っていない場合、sweetalert2でポップアップを出す

    // Zodスキーマによる検証と結果の格納
    acc[newKey] = omikujiSchema.parse(item);
    return acc;
   },
   {} as Record<string, OmikujiType>
  );
 } catch (error) {
  console.error('Omikujis validation error:', error);
  throw error instanceof Error ? error : new Error(String(error));
 }
};


// ---

// キーがidと異なっていたら、idを変更するバリデーション
const OmikenIdValidate = (key: string, id: string): string =>
 id !== key ? (console.warn(`Warning: Key "${key}" does not match id "${id}".`), id) : key;


// threshold バリデーションを行う関数
const OmikenThresholdValidate = (thresholds: any[]): ThresholdType[] => {
 return thresholds.map((threshold) => thresholdSchema.parse(threshold));
};

// validateData
export const validateData = <T extends keyof OmikenType>(
 type: T,
 data: unknown,
 option?: { rules?: Record<string, RulesType> }
): OmikenType[T] => {
 try {
  const schema = OmikenSchema.shape[type];

  if (type === 'types' && option?.rules) {
   const parsedData = schema.parse(data) as Record<TypesType, string[]>;
   return validateTypes(parsedData, option.rules) as OmikenType[T];
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
   if (type === 'types' && option?.rules) {
    // types用の特別なデフォルト処理
    const defaultData = {} as Record<TypesType, string[]>;
    return validateTypes(defaultData, option.rules) as OmikenType[T];
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
   return OmikenSchema.shape.rules.safeParse(data).success
    ? (data as OmikenType[T])
    : (OmikenSchema.shape.rules.parse({}) as OmikenType[T]);
  case 'omikujis':
   return OmikenSchema.shape.omikujis.safeParse(data).success
    ? (data as OmikenType[T])
    : (OmikenSchema.shape.omikujis.parse({}) as OmikenType[T]);
  case 'places':
   return OmikenSchema.shape.places.safeParse(data).success
    ? (data as OmikenType[T])
    : (OmikenSchema.shape.places.parse({}) as OmikenType[T]);
  case 'types': // typesのケースを追加
   return OmikenSchema.shape.types.safeParse(data).success
    ? (data as OmikenType[T])
    : (OmikenSchema.shape.types.parse({}) as OmikenType[T]);
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
