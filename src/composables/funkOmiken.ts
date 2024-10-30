// src/composables/funkOmiken.ts
import { computed, onMounted, provide, Ref, ref } from 'vue';
import type {
  OmiEditType,
  OmikenEntry,
  EditerType,
  AppStateType,
  OrderKey,
  OmikenCategory,
  ListEntries
} from '../types';
import { funkJSON, validateData } from "./funkJSON";


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
    preset: {},
    activePresetId: null,
  });

  // 保存フラグ
  const isOmikenChanged = ref(false);
  // ダイアログがすべて閉じている+保存フラグならtrue
  const isOmikenSave = computed(() => {
    const isAllDialogsClosed = !Object.values(listEntry.value).some(entry => entry.isOpen);
    return isAllDialogsClosed && isOmikenChanged.value;
  });
  let saveInterval: ReturnType<typeof setInterval> | null = null;

  // provide
  provide("AppStateKey", AppState);

  const { fetchOmiken: fetchOmiken, saveOmiken: saveOmiken, fetchCHARA } = funkJSON();

  // 初期読み込み // TODO プリセット読み込みを実装
  const AppStateInitialize = async () => {
    // CHARA読み込み
    const charaFileNames = ['reimu.json', 'marisa.json',];
    const CHARAData = await fetchCHARA(charaFileNames);
    if (CHARAData) AppState.value.CHARA = CHARAData;

    // Omiken読み込み
    const OmikenData = await fetchOmiken();
    if (OmikenData) AppState.value.Omiken = OmikenData;
  };

  // コンポーネントのマウント時にデータを取得
  onMounted(async () => {
    await AppStateInitialize();
  });

  // 保存フラグがあり、ダイアログがすべて閉じているなら、APIを飛ばす
  const startOmikenSave = () => {
    // 既存のインターバルをクリア
    if (saveInterval) clearInterval(saveInterval);

    // 2秒ごとにチェック
    saveInterval = setInterval(() => {
      if (isOmikenSave.value) {
        saveOmiken(AppState.value.Omiken);
        isOmikenChanged.value = false;

      }
    }, 2000);
  };
  // コンポーネントのマウント時に自動保存を開始
  onMounted(() => {
    startOmikenSave();
  });

  const updateOmiken = (payload: OmikenEntry<OmikenCategory>) => {
    if (!payload) return;
    const { type, update, addKeys, delKeys, reorder, preferences } = payload;

    // 現在のステートのディープコピーを作成
    const newState: OmiEditType = JSON.parse(JSON.stringify(AppState.value.Omiken));

    if (type === 'preferences' && preferences) {
      // preferences の更新
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
      if (reorder) {
        newState[orderKey] = reorder;
      }
    }

    // ステートの一括更新
    AppState.value.Omiken = newState;
    console.log('保存フラグが立ったよ');
    isOmikenChanged.value = true; // 保存フラグ
    // saveOmiken(newState);
  };

  // 強制保存用
  const forceSave = () => {
    if (isOmikenChanged.value) {
      saveOmiken(AppState.value.Omiken);
      isOmikenChanged.value = false;
    }
  };


  return {
    AppState,
    isOmikenChanged: isOmikenChanged,
    updateOmiken: updateOmiken,
    forceSave
  };
}
