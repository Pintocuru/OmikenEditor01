// composables/FunkOmikenUpdater.ts
import { OmikenType, ListCategory, TypesType, OmikenEntry, AddKeysCategory } from '@type';
import { validateData } from '@/composables/FunkValidate';

 // ユニークキーの生成
export const generateUniqueKey = (): string => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export function FunkOmikenUpdater() {

 // 更新処理
 const handleUpdate = (state: OmikenType, type: ListCategory, update?: Record<string, any>) => {
  if (update) {
   const validatedUpdate = validateData(type, update);
   Object.assign(state[type], validatedUpdate);
  }
 };

 // 追加処理
const handleAddItems = <T extends Exclude<ListCategory, 'types'>>(
 state: OmikenType,
 type: T,
 addKeys?: OmikenEntry<T>['addKeys']
) => {
 // 型ガードを追加
 const hasId = (item: AddKeysCategory[T]): item is AddKeysCategory[T] & { id: string } => {
  return 'id' in item && typeof item.id === 'string';
 };

 // addKeys が配列でない場合、配列に変換する
 const addItems: AddKeysCategory[T][] = Array.isArray(addKeys)
  ? addKeys
  : addKeys
    ? [addKeys as AddKeysCategory[T]]
    : [];

 // 型ガードの定義
 const hasOptionId = (item: AddKeysCategory[T]): item is AddKeysCategory[T] & { optionId: string } => {
  return 'optionId' in item && item.optionId !== undefined;
 };

 // 使用例
 addItems.forEach((item: AddKeysCategory[T]) => {
  console.log(item);
  // idがない場合は新規生成
  const newItem = {
   ...item,
   id: !('id' in item) ? generateUniqueKey() : item.id
  } as AddKeysCategory[T] & { id: string };

  const validatedItem = validateData(type, { [newItem.id]: newItem });

  Object.assign(state[type], validatedItem);

  // rulesの場合はtypesにも追加
  if (type === 'rules') {
   const optionId = 'optionId' in newItem ? newItem.optionId : null;

   // 一致フラグ
   let matched = false;

   // optionIdがstringであることを確認
   if (typeof optionId === 'string') {
    // `types` の各配列をチェック
    for (const key in state.types) {
     const typeKey = key as TypesType; // 明示的に型をアサート
     if (state.types[typeKey].includes(optionId)) {
      // newKeyをpush
      state.types[typeKey].push(newItem.id);

      // push後の状態を確認
      matched = true;
      break;
     }
    }
   }

   // どこにも一致しなかった場合 `unused` に追加
   if (!matched) state.types.unused.push(newItem.id);

   // データの検証と更新
   state.types = validateData('types', state.types, {
    rules: state.rules
   });
  }

  // omikujisの場合はrulesのenableIdsにも追加(optionIdがある場合)
  if (type === 'omikujis' && hasOptionId(newItem)) {
   updateRulesEnableIds(state, newItem.optionId, newItem.id);
  }
 });
};

 // ルールの有効IDを更新
 const updateRulesEnableIds = (state: OmikenType, rulesId: string, newKey: string) => {
  const updatedRule = validateData('rules', {
   [rulesId]: {
    ...state.rules[rulesId],
    enableIds: [...state.rules[rulesId].enableIds, newKey]
   }
  });
  Object.assign(state.rules, updatedRule);
 };

 const handleDeleteItems = (state: OmikenType, type: ListCategory, delKeys?: string | string[]) => {
  // typesの場合は処理をスキップ
  if (type === 'types') return;

  const delItems = Array.isArray(delKeys) ? delKeys : delKeys ? [delKeys] : [];

  delItems.forEach((key) => {
   delete state[type][key];

   switch (type) {
    case 'rules':
     Object.values(state.types).forEach((typeArray) => {
      // typeArrayの内容を直接変更
      const index = typeArray.indexOf(key);
      if (index !== -1) {
       typeArray.splice(index, 1); // 元の配列から削除
      }
     });
     break;

    case 'omikujis':
     Object.values(state.rules).forEach((rule) => {
      // enableIds配列を直接変更
      const index = rule.enableIds.indexOf(key);
      if (index !== -1) {
       rule.enableIds.splice(index, 1); // 元の配列から削除
      }
     });
     break;
   }
  });
 };

 // 順序の再編成
 const handleReTypes = (state: OmikenType, reTypes: Record<TypesType, string[]>) => {
  state.types = { ...state.types, ...reTypes };
 };

 return {
  generateUniqueKey,
  handleUpdate,
  handleAddItems,
  handleDeleteItems,
  handleReTypes
 };
}
