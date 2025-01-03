// composables/FunkOmikenUpdater.ts
import { OmikenType, ListCategory, TypesType, OmikenEntry, AddKeysCategory } from '@type';
import { validateData } from '@/composables/FunkValidate';

export function FunkOmikenUpdater() {
 // ユニークキーの生成
 const generateUniqueKey = (): string => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

 // 更新処理
 const handleUpdate = (state: OmikenType, type: ListCategory, update?: Record<string, any>) => {
  if (update) {
   const validatedUpdate = validateData(type, update);
   Object.assign(state[type], validatedUpdate);
  }
 };

 // 追加処理
 const handleAddItems = <T extends ListCategory>(state: OmikenType, type: T, addKeys?: OmikenEntry<T>['addKeys']) => {
  if (type === 'types') return;

  // 配列にする
  const addItems = Array.isArray(addKeys) ? addKeys : addKeys ? [addKeys] : [];

  // 型ガードの定義
  const hasOptionId = (item: AddKeysCategory[T]): item is AddKeysCategory[T] & { optionId: string } => {
   return 'optionId' in item && item.optionId !== undefined;
  };

  // 使用例
  addItems.forEach((item: AddKeysCategory[T]) => {
   const newKey = generateUniqueKey();
   // @ts-ignore 何故かtypesがあるよと怒られるので無視
   if (type !== 'types') item.id = newKey;
   const validatedItem = validateData(type, { [newKey]: item });

   Object.assign(state[type], validatedItem);

   // rulesの場合はtypesにも追加(optionIdがある場合)
   if (type === 'rules' && hasOptionId(item)) {
    const optionId = item.optionId;

    // 一致フラグ
    let matched = false;

    // `types` の各配列をチェック
    for (const key in state.types) {
     const typeKey = key as TypesType; // 明示的に型をアサート
     if (state.types[typeKey].includes(optionId)) {
      // デバッグ: state.types[typeKey]が正しいか確認
      console.log(`TypeKey: ${typeKey}, state.types[${typeKey}]:`, state.types[typeKey]);

      // newKeyをpushする前の状態を確認
      console.log('Before push:', state.types[typeKey]);

      // newKeyをpush
      state.types[typeKey].push(newKey);

      // push後の状態を確認
      console.log('After push:', state.types[typeKey]);
      matched = true;
      break;
     }
    }

    // どこにも一致しなかった場合
    if (!matched) {
     console.error(`Option ID '${optionId}' not found in any types. Moving to 'unused'.`);
     state.types.unused.push(newKey); // `unused` に追加
    }

    // データの検証と更新
    state.types = validateData('types', state.types, {
     rules: state.rules
    });
   }
   // 追加後の確認
   console.log('ここか？:', state.types);

   // omikujisの場合はrulesのenableIdsにも追加(optionIdがある場合)
   if (type === 'omikujis' && hasOptionId(item)) {
    updateRulesEnableIds(state, item.optionId, newKey);
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
