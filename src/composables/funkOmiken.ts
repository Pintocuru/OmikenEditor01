// src/composables/FunkOmiken.ts

import { computed, onMounted, provide, Ref, ref } from "vue";
import type {
  OmikenType,
  OmikenEntry,
  ListType,
  AppEditerType,
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
    Scripts: {},
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
      const { Charas, Presets, Scripts } = await fetchPreset();
      AppEditer.value.Presets = Presets;
      AppEditer.value.Charas = Charas;
      AppEditer.value.Scripts = Scripts;

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

  // Omikenの更新(rules/omikujis/places)
  const updateOmiken = (payload: OmikenEntry<ListCategory>) => {
    if (!payload) return;
    const { type, update, addKeys, delKeys, reorder } = payload;

    // ディープコピー
    const newState: OmikenType = JSON.parse(
      JSON.stringify(AppEditer.value.Omiken)
    );

    handleUpdate(newState, type, update);
    handleAddItems(newState, type, addKeys);
    handleDeleteItems(newState, type, delKeys);
    handleReorder(newState, type, reorder);

    // ステートの一括更新
    AppEditer.value.Omiken = newState;
    console.log("保存フラグが立ったよ");
    isOmikenChanged.value = true;
  };

  // 更新処理
  const handleUpdate = (
    state: OmikenType,
    type: ListCategory,
    update?: Record<string, any>
  ) => {
    if (update) {
      const validatedUpdate = validateData(type, update);
      Object.assign(state[type], validatedUpdate);
    }
  };

  // 追加処理
  const handleAddItems = <T extends ListCategory>(
    state: OmikenType,
    type: T,
    addKeys?: OmikenEntry<T>["addKeys"]
  ) => {
    const addItems = Array.isArray(addKeys)
      ? addKeys
      : addKeys
      ? [addKeys]
      : [];

    addItems.forEach((item) => {
      const newKey = generateUniqueKey();
      const validatedItem = validateData(type, { [newKey]: item });

      Object.assign(state[type], validatedItem);

      if (type === "rules") {
        state["rulesOrder"].push(newKey);
        state["rulesOrder"] = validateData("rulesOrder", state["rulesOrder"]);
      }

      if (type === "omikujis" && "rulesId" in item && item.rulesId) {
        updateRulesEnableIds(state, item.rulesId, newKey);
      }
    });
  };

  // 削除処理
  const handleDeleteItems = (
    state: OmikenType,
    type: ListCategory,
    delKeys?: string | string[]
  ) => {
    const delItems = Array.isArray(delKeys)
      ? delKeys
      : delKeys
      ? [delKeys]
      : [];

    delItems.forEach((key) => {
      delete state[type][key];

      if (type === "rules") {
        state["rulesOrder"] = state["rulesOrder"].filter((id) => id !== key);
      }

      if (type === "omikujis") {
        Object.values(state.rules).forEach((rule) => {
          rule.enableIds = rule.enableIds.filter((id) => id !== key);
        });
      }
    });
  };

  // ルールの有効IDを更新
  const updateRulesEnableIds = (
    state: OmikenType,
    rulesId: string,
    newKey: string
  ) => {
    const updatedRule = validateData("rules", {
      [rulesId]: {
        ...state.rules[rulesId],
        enableIds: [...state.rules[rulesId].enableIds, newKey],
      },
    });
    Object.assign(state.rules, updatedRule);
  };

  // 順序の再編成
  const handleReorder = (
    state: OmikenType,
    type: ListCategory,
    reorder?: string[]
  ) => {
    if (reorder && type === "rules") state["rulesOrder"] = reorder;
  };

  // ユニークキーの生成
  const generateUniqueKey = (): string =>
    `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  // Presetからの上書き・追加
  const updateOmikenPreset = (preset: PresetOmikenType) => {
    // 深いコピーを作成
    const newState: OmikenType = JSON.parse(
      JSON.stringify(AppEditer.value.Omiken)
    );
    const categories: ListCategory[] = ["rules", "omikujis", "places"];

    // カテゴリごとに追加/上書きを行う
    const processCategory = <T extends ListCategory>(
      type: T,
      mode: "overwrite" | "add"
    ) => {
      const validatedData = validateData(
        type,
        preset.item[type]
      ) as OmikenType[T];

      if (mode === "overwrite") {
        newState[type] = validatedData;

        if (type === "rules") {
          newState.rulesOrder = validateData(
            "rulesOrder",
            Object.keys(validatedData)
          );
        }
      } else {
        const updatedData = addNewItems(
          newState[type] as OmikenType[T],
          validatedData,
          type
        ) as OmikenType[T];

        newState[type] = updatedData;

        if (type === "rules") {
          const newKeys = Object.keys(updatedData).filter(
            (key) => !Object.keys(newState[type]).includes(key)
          );
          newState.rulesOrder = validateData("rulesOrder", [
            ...newState.rulesOrder,
            ...newKeys,
          ]);
        }
      }
    };

    // 上書きモード用
    const addNewItems = (
      existingData: Record<string, any>,
      newData: Record<string, any>,
      type: ListCategory
    ): Record<string, any> => {
      const existingIds = new Set(Object.keys(existingData));
      const renamedData: Record<string, any> = {};

      Object.entries(newData).forEach(([key, value]) => {
        const { newKey, counter } = resolveUniqueId(key, existingIds);

        const baseItem = {
          ...value,
          id: newKey,
          name: `${value.name}${counter > 1 ? ` (${counter - 1})` : ""}`,
        };

        renamedData[newKey] = processItemByType(baseItem, type, value);
        existingIds.add(newKey);
      });

      return { ...existingData, ...renamedData };
    };

    // 重複した場合はIDを入れ直し
    const resolveUniqueId = (key: string, existingIds: Set<string>) => {
      let newKey = key;
      let counter = 1;

      while (existingIds.has(newKey)) {
        newKey = `${key}_${counter}`;
        counter++;
      }

      return { newKey, counter };
    };

    // タイプ別の追加処理 // TODO これはなに？
    const processItemByType = (
      baseItem: any,
      type: ListCategory,
      originalValue: any
    ) => {
      switch (type) {
        case "rules":
          return { ...baseItem };
        case "omikujis":
          return {
            ...baseItem,
            weight:
              typeof originalValue.weight === "number"
                ? originalValue.weight
                : 1,
          };
        case "places":
          return {
            ...baseItem,
            values: Array.isArray(originalValue.values)
              ? originalValue.values
              : [],
          };
        default:
          return baseItem;
      }
    };

    categories.forEach((category) =>
      processCategory(
        category,
        preset.mode === "overwrite" ? "overwrite" : "add"
      )
    );

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
