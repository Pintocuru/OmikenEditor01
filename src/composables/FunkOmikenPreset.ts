import { OmikenType, ListCategory, TypesType, PresetOmikenType, OmikenSchema } from '@type';

export function FunkOmikenPreset() {
 const handlePresetUpdate = (state: OmikenType, presetRaw: PresetOmikenType): OmikenType => {
  const isOverwrite = presetRaw.isOverwrite ?? false;
  const preset = OmikenSchema.parse(presetRaw.item) as OmikenType;
  const updatedState = { ...state };

  // typesの処理
  updatedState.types = processTypes(state.types, preset.types, isOverwrite);

  // その他のカテゴリの処理
  (['rules', 'omikujis', 'places'] as const).forEach((category) => {
   // @ts-ignore どうしても型定義が混在するので
   updatedState[category] = processItems(state[category], preset[category], isOverwrite);
  });

  return updatedState;
 };

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

 const processItems = <T extends Record<string, any>>(current: T, preset: T, isOverwrite: boolean): T => {
  if (isOverwrite) return preset;
  const result: T = { ...current };
  for (const [key, value] of Object.entries(preset)) {
   if (!(key in current)) result[key as keyof T] = value;
  }
  return result;
 };


 return {
  handlePresetUpdate
 };
}
