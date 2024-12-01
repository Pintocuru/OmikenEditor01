// src/composables/FunkOmiken.ts

import { computed, onMounted, provide, Ref, ref } from "vue";
import type {
  OmikenType,
  OmikenEntry,
  ListType,
  AppEditerType,
  OrderKey,
  OmikenCategory,
  ListEntryCollect,
  ListCategory,
  PresetOmikenType,
} from "@/types/index";
import { funkJSON } from "./FunkJSON";
import { validateData } from "./FunkValidate";

export function FunkOmiken(listEntry: Ref<ListEntryCollect>) {
  const AppEditer = ref<AppEditerType>({
    Omiken: {
      rules: {},
      rulesOrder: [],
      omikujis: {},
      places: {},
    },
    Charas: {},
    Presets: {},
  });
  const isOmikenChanged = ref(false); // 保存フラグ

  // ダイアログがすべて閉じている+保存フラグならtrue
  const isOmikenSave = computed(() => {
    const isDialogsClosed = !Object.values(listEntry.value).some(
      (entry) => entry.isOpen
    );
    return isDialogsClosed && isOmikenChanged.value;
  });

  // provide
  provide("AppEditerKey", AppEditer);

  const { fetchOmiken, fetchPreset, saveOmiken } = funkJSON();

  // アプリケーションの初期化を一元管理
  const initializeApp = async () => {
    try {
      // 外部データの読み込み
      const { charaData, presetData } = await fetchPreset();
      AppEditer.value.Charas = charaData;
      AppEditer.value.Presets = presetData;

      // 使用しているOmikenデータの読み込み
      const omikenData = await fetchOmiken();
      if (omikenData) AppEditer.value.Omiken = omikenData;

      // 自動保存の開始
      startOmikenSave();
    } catch (error) {
      console.error("Failed to initialize app:", error);
      throw error;
    }
  };

  // 自動保存の処理 // TODO 別にsetInterval使わなくてもいいのでは…
  const startOmikenSave = () => {
    const autoSaveInterval = 2000;
    const interval = setInterval(() => {
      if (isOmikenSave.value) {
        saveOmiken(AppEditer.value.Omiken);
        isOmikenChanged.value = false;
      }
    }, autoSaveInterval);
  };

  // 初期化処理の実行
  onMounted(initializeApp);

  // Omikenの更新
  const updateOmiken = (payload: OmikenEntry<OmikenCategory>) => {
    if (!payload) return;
    const { type, update, addKeys, delKeys, reorder } = payload;

    // 現在のステートのディープコピーを作成
    const newState: OmikenType = JSON.parse(
      JSON.stringify(AppEditer.value.Omiken)
    );

     if (type === "rules" || type === "omikujis" || type === "places") {
      const orderKey: OrderKey | undefined =
        type === "rules" ? "rulesOrder" : undefined;

      // 更新処理
      if (update) {
        const validatedUpdate = validateData(type, update);
        Object.assign(newState[type], validatedUpdate);
      }

      // 追加処理
      const addItems = Array.isArray(addKeys)
        ? addKeys
        : addKeys
        ? [addKeys]
        : [];
      if (addItems.length) {
        for (const item of addItems) {
          const newKey = `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 7)}`;

          // rulesの場合はomikujiデータも渡す
          const validatedItem =
            type === "rules"
              ? validateData(
                  type,
                  { [newKey]: item as ListType }
                )
              : validateData(type, { [newKey]: item as ListType });

          Object.assign(newState[type], validatedItem);

          if (type === "rules" && orderKey) {
            newState[orderKey].push(newKey);
            newState[orderKey] = validateData(
              "rulesOrder",
              newState[orderKey]
            );
          }

          if (type === "omikujis" && "rulesId" in item && item.rulesId) {
            const rulesId = item.rulesId;
            // enableIdsの検証を含むvalidateData呼び出し
            const updatedRule = validateData(
              "rules",
              {
                [rulesId]: {
                  ...newState.rules[rulesId],
                  enableIds: [...newState.rules[rulesId].enableIds, newKey],
                },
              },
            );
            Object.assign(newState.rules, updatedRule);
          }
        }
      }

      // 削除処理
      const delItems = Array.isArray(delKeys)
        ? delKeys
        : delKeys
        ? [delKeys]
        : [];
      if (delItems.length) {
        delItems.forEach((key) => {
          delete newState[type][key];
          if (orderKey)
            newState[orderKey] = newState[orderKey].filter((id) => id !== key);
          if (type === "omikujis") {
            Object.values(newState.rules).forEach((rule) => {
              rule.enableIds = rule.enableIds.filter((id) => id !== key);
            });
          }
        });
      }

      // 順序の更新
      if (reorder && orderKey === "rulesOrder") newState[orderKey] = reorder;
    }
    // ステートの一括更新
    AppEditer.value.Omiken = newState;
    console.log("保存フラグが立ったよ");
    isOmikenChanged.value = true;
  };

  // Presetからの上書き・追加
  const updateOmikenPreset = (preset: PresetOmikenType) => {
    // 深いコピーを作成
    const newState: OmikenType = JSON.parse(
      JSON.stringify(AppEditer.value.Omiken)
    );
    const categories: ListCategory[] = ["rules", "omikujis", "places"];

    if (preset.mode === "overwrite") {
      // 上書きモード
      categories.forEach((type) => {
        // プリセットデータをバリデート
        const validatedData = validateData(type, preset.item[type]);
        newState[type] = validatedData;

        // rulesの場合、rulesOrderも更新
        if (type === "rules") {
          // rulesOrderは既存のrulesのキーから生成
          const validKeys = Object.keys(validatedData);
          newState.rulesOrder = validateData("rulesOrder", validKeys);
        }
      });
    } else {
      // 追加モード
      categories.forEach((type) => {
        // プリセットデータを先にバリデート
        const validatedNewData = validateData(type, preset.item[type]);
        const existingIds = new Set(Object.keys(newState[type]));
        const renamedData: Record<string, any> = {};

        // 各アイテムの処理
        Object.entries(validatedNewData).forEach(([key, value]) => {
          let newKey = key;
          let counter = 1;

          // 重複IDの解決
          while (existingIds.has(newKey)) {
            newKey = `${key}_${counter}`;
            counter++;
          }

          // タイプ別の特殊処理
          const baseItem = {
            ...value,
            id: newKey,
            name: `${value.name}${counter > 1 ? ` (${counter - 1})` : ""}`,
          };

          // タイプ別の追加処理
          switch (type) {
            case "rules":
              renamedData[newKey] = {
                ...baseItem,
                threshold: {
                  ...baseItem.threshold,
                  match: baseItem.threshold?.match ?? ["おみくじ"],
                },
              };
              break;
            case "omikujis":
              renamedData[newKey] = {
                ...baseItem,
                weight: typeof value.weight === "number" ? value.weight : 1,
              };
              break;
            case "places":
              renamedData[newKey] = {
                ...baseItem,
                isWeight: !!value.isWeight,
                values: Array.isArray(value.values) ? value.values : [],
              };
              break;
          }

          existingIds.add(newKey);
        });

        // バリデート済みデータの結合
        newState[type] = {
          ...newState[type],
          ...renamedData,
        };

        // rulesOrderの更新（rulesの場合のみ）
        if (type === "rules") {
          const newKeys = Object.keys(renamedData);
          newState.rulesOrder = validateData("rulesOrder", [
            ...newState.rulesOrder,
            ...newKeys,
          ]);
        }
      });
    }

    // ステートの更新
    AppEditer.value.Omiken = newState;
    console.log(
      `プリセットを${
        preset.mode === "overwrite" ? "上書き" : "追加"
      }で適用しました`
    );
    isOmikenChanged.value = true;
  };

  return {
    AppEditer,
    updateOmiken,
    updateOmikenPreset,
  };
}
