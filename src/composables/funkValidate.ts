// src/composables/funkValidate.ts
import {
 OmikenType,
 TypesType,
 RulesType,
 ThresholdType,
 OmikujiType,
 PlaceType,
 AppEditorType,
 ListCategory,
 OmikenTypeMap
} from '@type';
import {
 OmikenSchema,
 omikujiSchema,
 placeSchema,
 ruleSchema,
 thresholdSchema,
 typesSchema
} from '@/types/OmikenSchemas';
import { number, z, ZodError, ZodSchema } from 'zod';

// ---

// データadd用バリデーション
export const OmikenEntryValidate = <T extends Exclude<ListCategory, 'types'>>(
 type: T,
 data: unknown
): Omit<OmikenTypeMap, 'types'>[T] => {
 const schemas: Record<keyof Omit<OmikenTypeMap, 'types'>, z.ZodType> = {
  rules: ruleSchema,
  omikujis: omikujiSchema,
  places: placeSchema
 };
 try {
  return schemas[type].parse(data);
 } catch (e) {
  console.error(`Validation error for ${type}:`, e instanceof Error ? e.message : e);
  return schemas[type].parse({});
 }
};

// メインのバリデーション関数
export function OmikenValidate(data: Partial<OmikenType>): OmikenType {
 try {
  // 依存関係の順序に従ってバリデーション
  const places = OmikenPlacesValidate(data.places);
  const omikujis = OmikenOmikujisValidate(data.omikujis, places);
  const rules = OmikenRulesValidate(data.rules, omikujis);
  const types = OmikenTypesValidate(data.types, rules);

  return { types, rules, omikujis, places };
 } catch (error) {
  console.error('Omiken validation failed:', error);
  return OmikenSchema.parse({}) as OmikenType;
 }
}

// プレースホルダーのバリデーション
export const OmikenPlacesValidate = (placesRaw: Partial<Record<string, PlaceType>> = {}): Record<string, PlaceType> => {
 try {
  return Object.entries(placesRaw).reduce(
   (acc, [key, item]) => {
    if (!item) return acc;
    const validKey = OmikenIdValidate(key, item.id);
    acc[validKey] = placeSchema.parse(item);
    return acc;
   },
   {} as Record<string, PlaceType>
  );
 } catch (error) {
  throw wrapError('Places validation error:', error);
 }
};

// おみくじのバリデーション
export const OmikenOmikujisValidate = (
 omikujisRaw: Partial<Record<string, OmikujiType>> = {},
 places: Record<string, PlaceType>
): Record<string, OmikujiType> => {
 try {
  return Object.entries(omikujisRaw).reduce(
   (acc, [key, item]) => {
    if (!item) return acc;
    const validKey = OmikenIdValidate(key, item.id);

    // placeIdsのフィルタリングと重複除去
    item.placeIds = [...new Set(item.placeIds.filter((id) => places[id]))];
    item.threshold = OmikenThresholdValidate(item.threshold);

    acc[validKey] = omikujiSchema.parse(item);
    return acc;
   },
   {} as Record<string, OmikujiType>
  );
 } catch (error) {
  throw wrapError('Omikujis validation error:', error);
 }
};

// ルールのバリデーション
export const OmikenRulesValidate = (
 rulesRaw: Partial<Record<string, RulesType>> = {},
 omikujis: Record<string, OmikujiType>
): Record<string, RulesType> => {
 try {
  return Object.entries(rulesRaw).reduce(
   (acc, [key, item]) => {
    if (!item) return acc;
    const validKey = OmikenIdValidate(key, item.id);

    // enableIdsのフィルタリングと重複除去
    item.enableIds = [...new Set(item.enableIds.filter((id) => omikujis[id]))];
    item.threshold = OmikenThresholdValidate(item.threshold);

    acc[validKey] = ruleSchema.parse(item);
    return acc;
   },
   {} as Record<string, RulesType>
  );
 } catch (error) {
  throw wrapError('Rules validation error:', error);
 }
};

// タイプのバリデーション
export const OmikenTypesValidate = (
 types: Record<TypesType, string[]> = typesSchema.parse({}) as Record<TypesType, string[]>,
 rules: Record<string, RulesType>
): Record<TypesType, string[]> => {
 const validatedTypes = JSON.parse(JSON.stringify(types));

 // 各タイプの配列をバリデート
 Object.keys(validatedTypes).forEach((typeKey) => {
  validatedTypes[typeKey] = Array.from(new Set(validatedTypes[typeKey].filter((id: TypesType) => id in rules)));
 });

 // 未使用のルールIDを'unused'に追加
 const usedIds = new Set(Object.values(validatedTypes).flat());
 const unusedIds = Object.keys(rules).filter((ruleId) => !usedIds.has(ruleId));
 validatedTypes.unused = [...validatedTypes.unused, ...unusedIds];

 return validatedTypes;
};

// ヘルパー関数
const OmikenIdValidate = (key: string, id: string): string =>
 key !== id ? (console.warn(`Warning: Key "${key}" does not match id "${id}".`), id) : key;

const OmikenThresholdValidate = (thresholds: any[]): ThresholdType[] =>
 thresholds.map((threshold) => thresholdSchema.parse(threshold));

const wrapError = (message: string, error: unknown): Error =>
 error instanceof Error ? error : new Error(`${message} ${error}`);
