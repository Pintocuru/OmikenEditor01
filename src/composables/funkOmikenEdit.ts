// src/composables/funkOmikenEdit.ts
import { reactive, ref, computed, Ref, onMounted, watch } from "vue";

import { validateRules, validateOmikuji, validateRandomItems } from "../composables/funkOmikenJSON";

import type {
  DefaultState,
  OmikujiMessage,
  omikujiRule,
  Post,
  Placeholder,
  CharaStyles,
} from "../types";
import type { SelectedItem, ItemType, ItemContent } from "../AppTypes";
/*

アイテムの編集機能を担当
useOmikujiEditor: おみくじアイテムの編集機能を提供
useRuleEditor: ルールの編集機能を提供（新規追加）
useRandomItemEditor: ランダムアイテムの編集機能を提供（新規追加）
*/
// TODO useFunkOmikenEdit　の名前を変えたい
export function useFunkOmikenEdit(STATE: Ref<DefaultState>) {
  // アイテムを更新
  const updateItem = (type: ItemType, updatedItem: ItemContent) => {
    const index = STATE.value[type].findIndex((i) => i === updatedItem);
    if (index !== -1) {
      STATE.value[type][index] = updatedItem;
    }
  };

  // アイテムを追加するための変数群
  const typeValidators = {
    rules: validateRules,
    omikuji: validateOmikuji,
    placeholder: validateRandomItems,
  } as const;
  const typeStateKeys = {
    rules: "rules",
    omikuji: "omikuji",
    placeholder: "placeholder",
  } as const;
  // タイプごとの `name` フォーマット関数を用意
  const generateName = {
    rules: (count: number) => `新しいルール ${count + 1}`,
    omikuji: (count: number) => `${getRandomFortune()}`,
    placeholder: (count: number) => `<<random${count + 1}>>`,
  } as const;

  const omikujiFortunes = ["大吉", "中吉", "小吉", "末吉", "吉", "凶", "福沢諭吉"];
  // ランダムな結果を返す関数
  const getRandomFortune = () =>
    omikujiFortunes[Math.floor(Math.random() * omikujiFortunes.length)];

  // アイテムを追加する
    const addItem = (type: ItemType): void => {
    const validator = typeValidators[type];
    const stateKey = typeStateKeys[type];
    // カウントに基づいて `name` を生成
    const name = generateName[type](STATE.value[stateKey].length);
    // バリデータで新しいアイテムを生成
    const newItem = validator({ name })[0];
    // アイテムを対応する配列に追加
    (STATE.value[stateKey] as any[]).push(newItem);
  };

  
  // アイテムを削除
  const deleteItem = (type: ItemType, index: number) => {
    if (index !== -1 && STATE.value[type][index]) {
      STATE.value[type].splice(index, 1);
    }
  };

  return {
    updateItem,
    addItem,
    deleteItem,
  };
}

// おみくじエディット用
export function useEditOmikuji(
  STATE: DefaultState,
  CHARA: CharaStyles | undefined = {}
) {
  // メッセージタイプの配列
  const messageTypes = ["message", "party", "toast", "speech"] as const;
  type MessageType = (typeof messageTypes)[number];

  // フィルタリング基準の選択肢
  const thresholdTypes = [
    { text: "なし", value: "none" },
    { text: "時間指定(0-23時)", value: "time" },
    { text: "配信枠:コメント数", value: "lc" },
    { text: "配信枠:個人コメント数", value: "no" },
    { text: "総数:個人コメント数", value: "tc" },
    { text: "前回からの経過時間(秒)", value: "second" },
    { text: "前回からの経過時間(分)", value: "minute" },
    { text: "前回からの経過時間(時)", value: "hour" },
    { text: "前回からの経過時間(日数)", value: "day" },
    { text: "ギフト金額", value: "price" },
    { text: "その他(script参照)", value: "custom" },
  ];
  // 比較方法の選択肢
  const comparisonItems = [
    { text: "以下", value: "min" },
    { text: "等しい", value: "equal" },
    { text: "以上", value: "max" },
    { text: "ループ", value: "loop" },
    { text: "範囲", value: "range" },
  ];

  // 新しいメッセージを追加
  const addPost = (omikuji: OmikujiMessage, type: MessageType) => {
    // CHARAの最初のキーを取得
    const firstKey = Object.keys(CHARA)[0];

    if (!Array.isArray(omikuji[type])) {
      omikuji[type] = [];
    }
    (omikuji[type] as Post[]).push({
      botKey: firstKey || "mamono",
      iconKey: "Default",
      delaySeconds: 0,
      content: "<<user>>さんの運勢は【大吉】",
    });
  };

  // メッセージを削除
  const removePost = (
    omikuji: OmikujiMessage,
    type: MessageType,
    index: number
  ) => {
    (omikuji[type] as Post[])?.splice(index, 1);
  };

  function sanitizeThresholdSettings(editingItem: Ref<any>) {
    if (!editingItem.value || !editingItem.value.threshold) {
      return false;
    }

    const threshold = editingItem.value.threshold;
    let { type, comparison, value, valueMax } = threshold;
    let modified = false;

    const sanitizeNumber = (num: number, min: number, max: number) => {
      return Math.max(min, Math.min(num, max));
    };

    switch (type) {
      case "time":
        comparison = "range";
        value = sanitizeNumber(value, 0, 23);
        valueMax = sanitizeNumber(valueMax, 0, 23);
        // 23時から6時のような指定を許可
        if (value > valueMax && valueMax !== value) {
          // この場合は正常なので何もしない
        } else if (value === valueMax) {
          valueMax = (value + 1) % 24; // 1時間の範囲を設定
        }
        break;

      case "second":
      case "minute":
      case "hour":
      case "day":
        if (["equal", "loop"].includes(comparison)) {
          comparison = "min";
          modified = true;
        }
        value = Math.max(0, value);
        if (comparison === "range") {
          valueMax = Math.max(value + 1, valueMax);
        }
        break;

      case "price":
        if (comparison === "loop") {
          comparison = "min";
          modified = true;
        }
        value = Math.max(0, value);
        if (comparison === "range") {
          valueMax = Math.max(value + 1, valueMax);
        }
        break;

      case "lc":
      case "no":
      case "tc":
      case "custom":
        value = Math.max(0, value);
        if (comparison === "range") {
          valueMax = Math.max(value + 1, valueMax);
        }
        break;

      default:
        return false;
    }

    // 変更があった場合、編集中のアイテムを更新
    if (
      modified ||
      threshold.comparison !== comparison ||
      threshold.value !== value ||
      threshold.valueMax !== valueMax
    ) {
      editingItem.value.threshold = {
        ...threshold,
        comparison,
        value,
        valueMax,
      };
      console.log(
        "Threshold settings were adjusted:",
        editingItem.value.threshold
      );
      return true; // 変更があったことを示す
    }

    return false; // 変更がなかったことを示す
  }

  // TODO 計算が100%を超えるバグがある
  // weight の数値を合計したものと、引数に対しての％を返す
  // 後で他でも使えるようにしたいな
  const sumWeightValues = (num: number) => {
    const total = STATE.omikuji.reduce(
      (sum, obj) => sum + (obj.hasOwnProperty("weight") ? obj.weight : 0), 0);

    // totalが0の場合は0を返す
    if (total <= 0) return 0;

    return Math.round((num / total) * 100);
  };

  return {
    addPost,
    messageTypes,
    thresholdTypes,
    comparisonItems,
    removePost,
    sanitizeThresholdSettings,
    sumWeightValues,
  };
}

export function useItemEditor(
  props: {
    STATE: DefaultState;
    selectedItem: SelectedItem;
  },
  emit: (event: "update:item", value: any) => void
) {
  const editingItem = ref<any>(null);

  // 編集対象のアイテムを初期化する関数
  const initializeEditingItem = () => {
    if (props.selectedItem?.index !== undefined) {
      const { type, index } = props.selectedItem;
      const itemArray = props.STATE[type as keyof DefaultState] as any[];

      // アイテムタイプに応じてバリデーション関数を選択
      const validationFunction = {
        rules: validateRules,
        omikuji: validateOmikuji,
        placeholder: validateRandomItems
      }[type];

      // バリデーション関数が存在する場合、それを適用
      if (validationFunction) {
        const newItem = validationFunction(itemArray);
        editingItem.value = newItem[index];
      }
    } else {
      editingItem.value = null;
    }
  };

  onMounted(initializeEditingItem);

  // editingItemの変更を監視し、親コンポーネントに通知
  watch(
    editingItem,
    (newValue) => newValue && emit("update:item", newValue),
    { deep: true }
  );

  return { editingItem };
}




// プレースホルダー用
export function useEditRandom(  STATE: DefaultState,) {
 
  // 新しいメッセージを追加
  const addRandomItem = (placeholder: Placeholder,) => {


  };




  return {
  };
}