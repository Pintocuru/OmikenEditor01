// src/composables/funkOmikenSTATE.ts
import { provide, ref } from 'vue';
import type {
  STATEType,
  SelectItem,
  ItemCategory,
  ItemContent,
  AppStateType
} from '../types';
import { useInitializeFunkOmiken, validateData } from "../composables/funkOmikenJSON";

// 型安全なマッピングの定義
type OrderMapping = {
  [K in ItemCategory]: K extends 'preferences' ? never : `${K}Order`;
};

const typeToOrderMap: OrderMapping = {
  rules: 'rulesOrder',
  omikuji: 'omikujiOrder',
  place: 'placeOrder',
  preferences: null as never
} as const;

// 型ガードの定義
function isDataCategory(type: ItemCategory): type is Exclude<ItemCategory, 'preferences'> {
  return type !== 'preferences';
}

export function funkSTATE() {
  const AppState = ref<AppStateType>({
    STATE: {
      rules: {},
      omikuji: {},
      place: {},
      rulesOrder: [],
      omikujiOrder: [],
      placeOrder: [],
      preferences: {
        basicDelay: 1,
        omikujiCooldown: 2,
        commentDuration: 5,
        BotUserIDname: 'FirstCounter'
      }
    },
    CHARA: {},
    activePresetId: null
  });

  // provide
  provide("AppStateKey", AppState);

  const { fetchSTATE, saveSTATE, fetchCHARA } = useInitializeFunkOmiken();

  // 初期読み込み
  const initializeAppState = async () => {
    // CHARA読み込み
    const charaFileNames = ['reimu.json', 'marisa.json',];
    const CHARAData = await fetchCHARA(charaFileNames);
    if (CHARAData) AppState.value.CHARA = CHARAData;

    // STATE読み込み
    const STATEData = await fetchSTATE();
    if (STATEData) AppState.value.STATE = STATEData;


  };

  const updateSTATE = (payload: SelectItem) => {
    if (!payload) return;
    const { type, update, addKeys, delKeys, reorder, preferences } = payload;

    // 現在のステートのディープコピーを作成
    const newState: STATEType = JSON.parse(JSON.stringify(AppState.value.STATE));

    if (type === 'preferences' && preferences) {
      // preferences の更新
      newState.preferences = {
        ...newState.preferences,
        ...preferences
      };
    } else if (isDataCategory(type)) {
      const orderKey = typeToOrderMap[type];
      // 他のタイプの更新処理
      // 更新処理
      if (update) {
        const validatedUpdate = validateData(type, update);
        Object.assign(newState[type], validatedUpdate);
      }

      // 追加処理
      if (addKeys?.length) {
        addKeys.forEach(item => {
          const newKey = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
          const validatedItem = validateData(type, { [newKey]: item as ItemContent });
          Object.assign(newState[type], validatedItem);
          newState[orderKey].push(newKey);
        });
      }

      // 削除処理
      if (delKeys?.length) {
        delKeys.forEach(key => {
          delete newState[type][key];
          newState[orderKey] = newState[orderKey].filter(id => id !== key);
        });
      }

      // 順序の更新
      if (reorder) {
        newState[orderKey] = reorder;
      }
    }

    // ステートの一括更新
    AppState.value.STATE = newState;
    saveSTATE(newState);
  };


  return {
    AppState,
    initializeAppState,
    updateSTATE
  };
}
