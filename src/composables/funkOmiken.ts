// src/composables/funkOmiken.ts

import { computed, onMounted, provide, Ref, ref } from 'vue';
import type {
  OmikenType,
  OmikenEntry,
  ListType,
  AppStateType,
  OrderKey,
  OmikenCategory,
  ListEntryCollect,
  ListCategory,
  PresetOmikenEditType,
  RulesType,
  OmikujiType,
  PlaceType} from '../types';
import { funkJSON,  } from "./FunkJSON";
import { generateOrder, validateData } from "./FunkValidate";

export function funkOmiken(listEntry: Ref<ListEntryCollect>) {
  const AppState = ref<AppStateType>({
    Omiken: {
      rules: {},
      rulesOrder: [],
      omikuji: {},
      place: {},
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
      AppState.value.Preset = presetData;

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


  // Omikenの更新
  const updateOmiken = (payload: OmikenEntry<OmikenCategory>) => {
    if (!payload) return;
    const { type, update, addKeys, delKeys, reorder, preferences } = payload;

    // 現在のステートのディープコピーを作成
    const newState: OmikenType = JSON.parse(JSON.stringify(AppState.value.Omiken));

    // preferences の更新
    if (type === 'preferences' && preferences) {
      newState.preferences = {
        ...newState.preferences,
        ...preferences
      };
    } else if (type === 'rules' || type === 'omikuji' || type === 'place') {
      const orderKey: OrderKey | undefined = type === 'rules' ? 'rulesOrder' : undefined;

      // 更新処理
      if (update) {
        const validatedUpdate = validateData(type, update);
        Object.assign(newState[type], validatedUpdate);
      }

      // 追加処理
      const addItems = Array.isArray(addKeys) ? addKeys : addKeys ? [addKeys] : [];
      if (addItems.length) {
        addItems.forEach(item => {
          const newKey = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
          const validatedItem = validateData(type, { [newKey]: item as ListType });
          Object.assign(newState[type], validatedItem);
          if (orderKey) newState[orderKey].push(newKey); // orderKey が存在する場合のみ push

          if (type === 'omikuji' && 'rulesId' in item && item.rulesId) {
            const rulesId = item.rulesId;
            newState.rules[rulesId].enabledIds.push(newKey);
          }
        });
      }

      // 削除処理
      const delItems = Array.isArray(delKeys) ? delKeys : delKeys ? [delKeys] : [];
      if (delItems.length) {
        delItems.forEach(key => {
          delete newState[type][key];
          if (orderKey) newState[orderKey] = newState[orderKey].filter(id => id !== key);
          if (type === 'omikuji') {
            Object.values(newState.rules).forEach(rule => {
              rule.enabledIds = rule.enabledIds.filter(id => id !== key);
            });
          }
        });
      }

      // 順序の更新
      if (reorder && orderKey === 'rulesOrder') newState[orderKey] = reorder;

    }
    // ステートの一括更新
    AppState.value.Omiken = newState;
    console.log('保存フラグが立ったよ');
    isOmikenChanged.value = true;
  };

  // Presetからの上書き・追加
  const updateOmikenPreset = (preset: PresetOmikenEditType) => {
    // 現在のpreferencesとステートのコピーを保持
    const currentPreferences = AppState.value.Omiken.preferences;
    const newState: OmikenType = JSON.parse(JSON.stringify(AppState.value.Omiken));

    const categories: ListCategory[] = ['rules', 'omikuji', 'place'];

    if (preset.mode === 'overwrite') {
      // 上書きモード：プリセットの内容で完全に置き換え（preferences除く）
      categories.forEach(type => {
        switch (type) {
          case 'rules':
            newState[type] = validateData(type, preset.item[type]) as Record<string, RulesType>;
            newState[`${type}Order`] = generateOrder(newState[type]);
            break;
          case 'omikuji':
            newState[type] = validateData(type, preset.item[type]) as Record<string, OmikujiType>;
            break;
          case 'place':
            newState[type] = validateData(type, preset.item[type]) as Record<string, PlaceType>;
            break;
        }
      });
    } else {
      // 追加モード：既存のデータを保持しながら新しいデータを追加
      categories.forEach(type => {
        const orderKey = `${type}Order` as const;
        const validatedNewData = validateData(type, preset.item[type]);

        // 重複するIDを検出し、新しいIDを生成
        const existingIds = new Set(Object.keys(newState[type]));
        const renamedData: Record<string, any> = {};

        Object.entries(validatedNewData).forEach(([key, value]) => {
          let newKey = key;
          let counter = 1;
          // 重複するIDがある場合、新しいIDを生成
          while (existingIds.has(newKey)) {
            newKey = `${key}_${counter}`;
            counter++;
          }
          renamedData[newKey] = {
            ...value,
            id: newKey, // IDも更新
            name: `${value.name}${counter > 1 ? ` (${counter - 1})` : ''}` // 名前も区別
          };
          existingIds.add(newKey);
        });

        // データの結合
        newState[type] = {
          ...newState[type],
          ...renamedData
        };

        // OrderArrayの更新（既存の順序を保持しつつ、新規キーを追加）
        const newKeys = Object.keys(renamedData);
        if (orderKey === 'rulesOrder') newState[orderKey] = [...newState[orderKey], ...newKeys];
      });
    }

    // preferencesを復元
    newState.preferences = currentPreferences;

    // ステートの更新
    AppState.value.Omiken = newState;
    console.log(`プリセットを${preset.mode === 'overwrite' ? '上書き' : '追加'}で適用しました`);
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
    updateOmikenPreset,
  };
}