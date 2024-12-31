// composables/FunkOmikenPreset.ts
import { OmikenType, ListCategory, TypesType, PresetOmikenType } from '@type';
import { validateData } from '@/composables/FunkValidate';

export function FunkOmikenPreset() {
 const categories: ListCategory[] = ['rules', 'omikujis', 'places'];

 // IDの重複チェックと新しいID生成
 const resolveUniqueId = (key: string, existingIds: Set<string>) => {
  let newKey = key;
  let counter = 1;

  while (existingIds.has(newKey)) {
   newKey = `${key}_${counter}`;
   counter++;
  }

  return { newKey, counter };
 };

 // タイプ別のアイテム処理
 const processItemByType = (baseItem: any, type: ListCategory, originalValue: any) => {
  switch (type) {
   case 'rules':
    return { ...baseItem };
   case 'omikujis':
    return {
     ...baseItem,
     weight: typeof originalValue.weight === 'number' ? originalValue.weight : 1
    };
   case 'places':
    return {
     ...baseItem,
     values: Array.isArray(originalValue.values) ? originalValue.values : []
    };
   default:
    return baseItem;
  }
 };

 // 新しいアイテムの追加処理
 const addNewItems = (
  existingData: Record<string, any>,
  newData: Record<string, any>,
  type: ListCategory
 ): Record<string, any> => {
  const existingIds = new Set(Object.keys(existingData));
  const renamedData: Record<string, any> = {};

  Object.entries(newData).forEach(([key, value]) => {
   const { newKey, counter } = resolveUniqueId(key, existingIds);

   const baseItem = {
    ...value,
    id: newKey,
    name: `${value.name}${counter > 1 ? ` (${counter - 1})` : ''}`
   };

   renamedData[newKey] = processItemByType(baseItem, type, value);
   existingIds.add(newKey);
  });

  return { ...existingData, ...renamedData };
 };

 // カテゴリ別の処理
 const processCategory = <T extends ListCategory>(
  state: OmikenType,
  type: T,
  presetData: PresetOmikenType['item'],
  isOverwrite: boolean
 ): OmikenType => {
  const validatedData = validateData(type, presetData[type]) as OmikenType[T];
  const newState = { ...state };

  if (isOverwrite) {
   newState[type] = validatedData;

   if (type === 'rules') {
    newState.types = validateData('types', Object.keys(validatedData));
   }
  } else {
   const updatedData = addNewItems(newState[type] as OmikenType[T], validatedData, type) as OmikenType[T];
   newState[type] = updatedData;

   if (type === 'rules') {
    const newKeys = Object.keys(updatedData).filter((key): key is TypesType => key in newState.types);

    newState.types = validateData('types', {
     ...newState.types,
     ...Object.fromEntries(newKeys.map((key) => [key, newState.types[key]]))
    });
   }
  }

  return newState;
 };

 // メインの処理関数
 const handlePresetUpdate = (currentState: OmikenType, preset: PresetOmikenType): OmikenType => {
  let newState = { ...currentState };

  categories.forEach((category) => {
   const isOverwrite = preset.isOverwrite ?? false; // undefined の場合は false を使用
   newState = processCategory(newState, category, preset.item, isOverwrite);
  });

  return newState;
 };

 return {
  handlePresetUpdate
 };
}
