// src/composables/FunkOmiken.ts

import { provide, ref } from "vue";
import type {
  OmikenType,
  OmikenEntry,
  AppEditorType,
  ListCategory,
  PresetOmikenType,
  TypesType,
} from "@/type";
import { DataService, defaultAppEditor } from '@/composables/FunkJSON';
import { validateData } from '@/composables/FunkValidate';
import Swal from "sweetalert2";

export function FunkOmiken() {
  const AppEditor = ref<AppEditorType>(defaultAppEditor);
  const isAppEditorLoading = ref(true); // 読込中かどうか
  // provide
  provide("AppEditorKey", AppEditor);

  // 初期化処理の実行
  async function AppEditorInitialize() {
    try {
      AppEditor.value = await DataService.fetchInitialData();
      isAppEditorLoading.value = false; // ローディング完了
      // データ読み込み成功の通知
      await Swal.fire({
        title: "読み込み完了",
        text: "データの読み込みが完了しました。",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("Initialization failed", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "データの読み込みに失敗しました。";

      await Swal.fire({
        title: "読み込み失敗",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  }

  // Omikenの更新(rules/omikujis/places)
  function updateOmiken(payload: OmikenEntry<ListCategory>) {
    if (!payload || !AppEditor.value) return;
    const { type, update, addKeys, delKeys, reTypes } = payload;

    // ディープコピー
    const newState: OmikenType = JSON.parse(
      JSON.stringify(AppEditor.value.Omiken)
    );

    handleUpdate(newState, type, update);
    handleAddItems(newState, type, addKeys);
    handleDeleteItems(newState, type, delKeys);
    if (reTypes) handleReTypes(newState, type, reTypes);

    // ステートの一括更新
    AppEditor.value.Omiken = newState;
    console.log("保存フラグが立ったよ");
  }

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

      // types:指定したtypeにrulesIdを追加
      if (type === "rules" && "types" in item && item.types) {
        const types = item.types as TypesType;
        state.types[types].push(newKey);
        state.types = validateData("types", state.types, {
          rules: state.rules,
        });
      }

      // rules:指定したtypeにomikujiIdを追加
      if (type === "omikujis" && "rulesId" in item && item.rulesId) {
        updateRulesEnableIds(state, item.rulesId, newKey);
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
        Object.values(state.types).forEach((type) => {
          type = type.filter((id) => id !== key);
        });
      }

      if (type === "omikujis") {
        Object.values(state.rules).forEach((rule) => {
          rule.enableIds = rule.enableIds.filter((id) => id !== key);
        });
      }
    });
  };

  // 順序の再編成
  const handleReTypes = (
    state: OmikenType,
    type: ListCategory,
    reTypes: Partial<Record<TypesType, string[]>>
  ) => {
    if (reTypes && type === "rules") {
      state.types = {
        ...state.types,
        ...reTypes,
      };
    }
  };

  // ユニークキーの生成
  const generateUniqueKey = (): string =>
    `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  // Presetからの上書き・追加
  const updateOmikenPreset = (preset: PresetOmikenType) => {
    if (!AppEditor.value) return;
    // 深いコピーを作成
    const newState: OmikenType = JSON.parse(
      JSON.stringify(AppEditor.value.Omiken)
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
        // 上書き
        newState[type] = validatedData;

        if (type === "rules") {
          newState.types = validateData("types", Object.keys(validatedData));
        }
      } else {
        // 追加
        const updatedData = addNewItems(
          newState[type] as OmikenType[T],
          validatedData,
          type
        ) as OmikenType[T];

        newState[type] = updatedData;

        if (type === "rules") {
          const newKeys = Object.keys(updatedData).filter(
            (key): key is TypesType => key in newState.types // 型チェックを追加
          );

          newState.types = validateData("types", {
            ...newState.types,
            ...Object.fromEntries(
              newKeys.map((key) => [key, newState.types[key]])
            ),
          });
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

    AppEditor.value.Omiken = newState;
    console.log(
      `プリセットを${
        preset.mode === "overwrite" ? "上書き" : "追加"
      }で適用しました`
    );
  };

  return {
    AppEditor,
    AppEditorInitialize,
    isAppEditorLoading,
    updateOmiken,
    updateOmikenPreset,
  };
}
