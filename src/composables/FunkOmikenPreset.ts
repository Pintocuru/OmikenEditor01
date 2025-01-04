// composables/FunkOmikenPreset.ts
import { OmikenType, ListCategory, TypesType, PresetOmikenType } from '@type';
import { validateData } from '@/composables/FunkValidate';


// 重複チェック用の関数を追加
const isDuplicateItem = (
  existingData: Record<string, any>,
  newItem: any,
  key: string
): boolean => {
  return Object.keys(existingData).includes(key);
};
export function FunkOmikenPreset() {
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
  const renamedData: Record<string, any> = {};

  Object.entries(newData).forEach(([key, value]) => {
   // 重複チェック
   if (isDuplicateItem(existingData, value, key)) {
    return; // 重複する場合はスキップ
   }

   const baseItem = {
    ...value,
    id: key,
    name: value.name
   };

   renamedData[key] = processItemByType(baseItem, type, value);
  });

  return { ...existingData, ...renamedData };
 };

 // types の処理を専用の関数として分離
 const processTypes = (
  currentTypes: Record<TypesType, string[]>,
  newTypes: Record<TypesType, string[]>
 ): Record<TypesType, string[]> => {
  const result = { ...currentTypes };

  Object.entries(newTypes).forEach(([key, values]) => {
   if (key in result) {
    // 既存の配列と新しい配列を結合し、重複を除去
    result[key as TypesType] = [...new Set([...result[key as TypesType], ...values])];
   } else {
    result[key as TypesType] = values;
   }
  });

  return result;
 };

 // カテゴリ別の処理
const processCategory = <T extends ListCategory>(
 state: OmikenType,
 type: T,
 presetData: OmikenType,
 isOverwrite: boolean
): OmikenType => {
 const validatedData = validateData(type, presetData[type]) as OmikenType[T];
 const newState = { ...state };

 if (type === 'types') {
  newState.types = isOverwrite
   ? (validatedData as Record<TypesType, string[]>)
   : processTypes(newState.types as Record<TypesType, string[]>, validatedData as Record<TypesType, string[]>);
  return newState;
 }

 if (isOverwrite) {
  newState[type] = validatedData;
 } else {
  const updatedData = addNewItems(newState[type] as OmikenType[T], validatedData, type) as OmikenType[T];
  newState[type] = updatedData;
 }

 return newState;
};

 // メインの処理関数
 const handlePresetUpdate = (currentState: OmikenType, preset: PresetOmikenType): OmikenType => {
  let newState = { ...currentState };
  const categories: ListCategory[] = ['types', 'rules', 'omikujis', 'places'];
  categories.forEach((category) => {
   const isOverwrite = preset.isOverwrite ?? false;
   newState = processCategory(newState, category, preset.item, isOverwrite);
  });

  return newState;
 };

 return {
  handlePresetUpdate
 };
}
