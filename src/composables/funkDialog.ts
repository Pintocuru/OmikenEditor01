// src/composables/funkDialog.ts
import type { CharaType } from "@type";


// おみくじエディット用
export function funkOmikuji(
  Chara: CharaType | undefined = {}
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

  return {
    thresholdTypes,
    comparisonItems,
  };
}

