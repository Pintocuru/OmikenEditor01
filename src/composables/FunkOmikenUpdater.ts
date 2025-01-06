// composables/FunkOmikenUpdater.ts
import { OmikenType, ListCategory, TypesType, OmikenEntry, AddKeysCategory } from '@type';
import { OmikenEntryValidate } from '@/composables/FunkValidate';

export function FunkOmikenUpdater() {
 // 更新処理
 const handleUpdate = <T extends Exclude<ListCategory, 'types'>>(
  state: OmikenType,
  type: T,
  update: Record<string, any>
 ) => {
  Object.assign(state[type], update);
 };

 // 追加処理
 const handleAddItems = <T extends Exclude<ListCategory, 'types'>>(
  state: OmikenType,
  type: T,
  addKeys: OmikenEntry<T>['addKeys']
 ) => {
  // addKeys が配列でない場合、配列に変換する
  const addItems: AddKeysCategory[T][] = Array.isArray(addKeys)
   ? addKeys
   : addKeys
     ? [addKeys as AddKeysCategory[T]]
     : [];

  addItems.forEach((item: AddKeysCategory[T]) => {
   // optionId がある場合は取り出す
   const optionId = 'optionId' in item ? item.optionId : undefined;
   // 足りないデータを付与してstateに追加
   const newItem = OmikenEntryValidate(type, item);
   Object.assign(state[type], { [newItem.id]: newItem });

   // rulesの場合はtypesにも追加
   if (type === 'rules' && typeof optionId === 'string') {
    // optionId がある箇所にpush(万が一なければunusedへ)
    const matched = Object.keys(state.types).some((key) => {
     const typeKey = key as TypesType;
     if (state.types[typeKey].includes(optionId)) {
      state.types[typeKey].push(newItem.id);
      return true; // 一致した場合、ループを終了
     }
     return false;
    });
    if (!matched) state.types.unused.push(newItem.id);
   }

   // omikujisの場合はrulesのenableIdsにも追加(optionIdがある場合)
   if (type === 'omikujis' && typeof optionId === 'string') {
    const updatedRule = {
     [optionId]: {
      ...state.rules[optionId],
      enableIds: [...state.rules[optionId].enableIds, newItem.id]
     }
    };
    Object.assign(state.rules, updatedRule);
   }
  });
 };

// 削除処理
 const handleDeleteItems = <T extends Exclude<ListCategory, 'types'>>(
  state: OmikenType,
  type: T,
  delKeys: string | string[]
 ) => {
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
  handleUpdate,
  handleAddItems,
  handleDeleteItems,
  handleReTypes
 };
}
