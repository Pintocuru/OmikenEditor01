// src/composables/funkOmiken.ts

import { computed, onMounted, provide, Ref, ref } from 'vue';
import type {
  OmikenEditType,
  OmikenEntry,
  EditerType,
  AppStateType,
  OrderKey,
  OmikenCategory,
  ListEntries} from '../types';
import { funkJSON,  } from "./funkJSON";
import { validateData } from "./funkValidate";

export function funkOmiken(listEntry: Ref<ListEntries>) {
  const AppState = ref<AppStateType>({
    Omiken: {
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
      },
    },
    CHARA: {},
    Preset: {},
  });
  const isOmikenChanged = ref(false); // 保存フラグ

  // ダイアログがすべて閉じている+保存フラグならtrue
  const isOmikenSave = computed(() => {
    const isDialogsClosed = !Object.values(listEntry.value).some(entry => entry.isOpen);
    return isDialogsClosed && isOmikenChanged.value;
  });

  // provide
  provide("AppStateKey", AppState);

  const { fetchOmiken, fetchPreset, saveOmiken, } = funkJSON();

  // アプリケーションの初期化を一元管理
  const initializeApp = async () => {
    try {
      // 外部データの読み込み
      const { charaData, presetData } = await fetchPreset();
      AppState.value.CHARA = charaData;
      console.log(charaData);
      AppState.value.Preset = presetData;
      console.log(presetData);

      // 使用しているOmikenデータの読み込み
      const omikenData = await fetchOmiken();
      if (omikenData) AppState.value.Omiken = omikenData;

      // 自動保存の開始
      startOmikenSave();
    } catch (error) {
      console.error('Failed to initialize app:', error);
      throw error;
    }
  };

  // 自動保存の処理 // TODO 別にsetInterval使わなくてもいいのでは…
  const startOmikenSave = () => {
    const autoSaveInterval = 2000;
    const interval = setInterval(() => {
      if (isOmikenSave.value) {
        saveOmiken(AppState.value.Omiken);
        isOmikenChanged.value = false;
      }
    }, autoSaveInterval);

  };

  // 初期化処理の実行
  onMounted(initializeApp);


  const updateOmiken = (payload: OmikenEntry<OmikenCategory>) => {
    if (!payload) return;
    const { type, update, addKeys, delKeys, reorder, preferences } = payload;

    // 現在のステートのディープコピーを作成
    const newState: OmikenEditType = JSON.parse(JSON.stringify(AppState.value.Omiken));

    // preferences の更新
    if (type === 'preferences' && preferences) {
      newState.preferences = {
        ...newState.preferences,
        ...preferences
      };
    } else if (type === 'rules' || type === 'omikuji' || type === 'place') {
      const orderKey: OrderKey<typeof type> = `${type}Order`;

      // 更新処理
      if (update) {
        const validatedUpdate = validateData(type, update);
        Object.assign(newState[type], validatedUpdate);
      }

      // 追加処理
      if (addKeys?.length) {
        addKeys.forEach(item => {
          const newKey = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
          const validatedItem = validateData(type, { [newKey]: item as EditerType });
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
      if (reorder) newState[orderKey] = reorder;

    }
    // ステートの一括更新
    AppState.value.Omiken = newState;
    console.log('保存フラグが立ったよ');
    isOmikenChanged.value = true;
  };

  // 強制保存用 // TODO これは閉じた時のみ使うのでreturnしなくてもいいかも
  const forceSave = () => {
    if (isOmikenChanged.value) {
      saveOmiken(AppState.value.Omiken);
      isOmikenChanged.value = false;
    }
  };

  return {
    AppState,
    updateOmiken,
  };
}