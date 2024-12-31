// composables/FunkOmikenUpdater.ts
import { OmikenType, ListCategory, TypesType, OmikenEntry } from '@type';
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
  const addItems = Array.isArray(addKeys) ? addKeys : addKeys ? [addKeys] : [];

  addItems.forEach((item) => {
   const newKey = generateUniqueKey();
   const validatedItem = validateData(type, { [newKey]: item });

   Object.assign(state[type], validatedItem);

   // types:指定したtypeにrulesIdを追加
   if (type === 'rules' && 'types' in item && item.types) {
    const types = item.types as TypesType;
    state.types[types].push(newKey);
    state.types = validateData('types', state.types, {
     rules: state.rules
    });
   }

   // rules:指定したtypeにomikujiIdを追加
   if (type === 'omikujis' && 'rulesId' in item && item.rulesId) {
    updateRulesEnableIds(state, item.rulesId, newKey);
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
      typeArray = typeArray.filter((id) => id !== key);
     });
     break;
    case 'omikujis':
     Object.values(state.rules).forEach((rule) => {
      rule.enableIds = rule.enableIds.filter((id) => id !== key);
     });
     break;
   }
  });
 };

 // 順序の再編成
 const handleReTypes = (state: OmikenType, type: ListCategory, reTypes: Partial<Record<TypesType, string[]>>) => {
  if (reTypes && type === 'rules') {
   state.types = { ...state.types, ...reTypes };
  }
 };

 return {
  generateUniqueKey,
  handleUpdate,
  handleAddItems,
  handleDeleteItems,
  handleReTypes
 };
}
