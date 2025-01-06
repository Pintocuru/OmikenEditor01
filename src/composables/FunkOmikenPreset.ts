// composables/FunkOmikenPreset.ts
import { OmikenType, ListCategory, TypesType, PresetOmikenType, OmikenSchema } from '@type';

export function FunkOmikenPreset() {
 // メインの処理関数
 const handlePresetUpdate = (state: OmikenType, presetRaw: PresetOmikenType): OmikenType => {
  const isOverwrite = presetRaw.isOverwrite ?? false;
  const preset = OmikenSchema.parse(presetRaw.item) as OmikenType;
  const categories: ListCategory[] = ['types', 'rules', 'omikujis', 'places'];

  return categories.reduce((updatedState, category) => processCategory(updatedState, category, preset, isOverwrite), {
   ...state
  });
 };

 // カテゴリ別の処理
 const processCategory = (
  state: OmikenType,
  category: ListCategory,
  presetData: OmikenType,
  isOverwrite: boolean
 ): OmikenType => {
  const updatedState = { ...state };

  if (category === 'types') {
   updatedState.types = processTypes(state.types, presetData.types, isOverwrite);
  }

  if (category === 'rules') {
   updatedState.rules = processItems(state[category], presetData[category], isOverwrite);
  }
  if (category === 'omikujis') {
   updatedState.omikujis = processItems(state[category], presetData[category], isOverwrite);
  }
  if (category === 'places') {
   updatedState.places = processItems(state[category], presetData[category], isOverwrite);
  }

  return updatedState;
 };

 // typesカテゴリの処理
 const processTypes = (
  current: Record<TypesType, string[]>,
  preset: Record<TypesType, string[]> | undefined,
  isOverwrite: boolean
 ): Record<TypesType, string[]> => {
  if (!preset) return current;
  if (isOverwrite) return { ...preset };

  return Object.entries(preset).reduce(
   (result, [key, values]) => {
    result[key as TypesType] = [...new Set([...(current[key as TypesType] || []), ...values])];
    return result;
   },
   { ...current }
  );
 };

 // 他のカテゴリの処理
 const processItems = <T extends Record<string, any>>(current: T, preset: T, isOverwrite: boolean): T => {
  if (isOverwrite) return preset;
  const result: T = { ...current };
  for (const [key, value] of Object.entries(preset)) {
   if (!(key in current)) result[key as keyof T] = value;
  }
  return result;
 };;

 return {
  handlePresetUpdate
 };
}
