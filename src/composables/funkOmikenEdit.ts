// src/composables/funkOmikenEdit.ts
import { Ref } from "vue";
import _ from 'lodash';

import type {
  STATEType,
  OmikujiType,
  PlaceType,
  CHARAType,
  OmikujiPostType} from "../types";
/*

アイテムの編集機能を担当
useOmikujiEditor: おみくじアイテムの編集機能を提供
useRuleEditor: ルールの編集機能を提供（新規追加）
useRandomItemEditor: ランダムアイテムの編集機能を提供（新規追加）
*/


// おみくじエディット用
export function useEditOmikuji(
  CHARA: CHARAType | undefined = {}
) {
  // メッセージタイプの配列

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

  // 新しいメッセージを追加 // TODO 移行終了
  const addPost = (omikuji: OmikujiType, ) => {
    // CHARAの最初のキーを取得
    const firstKey = Object.keys(CHARA)[0];

    if (!Array.isArray(omikuji.post)) {
      omikuji.post = [];
    }
    (omikuji.post as OmikujiPostType[]).push({
      type: "onecomme",
      botKey: firstKey || "mamono",
      iconKey: "Default",
      delaySeconds: 0,
      content: "<<user>>さんの運勢は【大吉】",
    });
  };

  // メッセージを削除
  const removePost = (
    omikuji: OmikujiType,
    index: number
  ) => {
    (omikuji.post as OmikujiPostType[])?.splice(index, 1);
  };

  // TODO 統合したのでもう不要です
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


  return {
    addPost,
    thresholdTypes,
    comparisonItems,
    removePost,
    sanitizeThresholdSettings,
  };
}





// プレースホルダー用
export function useEditRandom(  STATE: STATEType,) {
 
  // 新しいメッセージを追加
  const addRandomItem = (place: PlaceType,) => {


  };




  return {
  };
}