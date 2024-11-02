// src/composables/funkThreshold.ts

import { AccessLevel, BaseCondition, ComparisonType, ConditionType, SyokenType, ThresholdType } from "@/types";

export function funkThreshold(
  threshold: ThresholdType
) {

  // 定数
  const conditionTypeItems = [
    { label: "制限なし", value: ConditionType.NONE },
    { label: "メンバー・モデ判定", value: ConditionType.ACCESS },
    { label: "初見・久しぶり", value: ConditionType.SYOKEN },
    { label: "キーワード一致", value: ConditionType.MATCH },
    { label: "時間指定", value: ConditionType.TIME },
    { label: "経過時間", value: ConditionType.ELAPSED },
    { label: "コメント数", value: ConditionType.COUNT },
    { label: "ギフト", value: ConditionType.GIFT },
  ];

  const accessLevelItems = [
    { title: "OFF", value: AccessLevel.OFF },
    { title: "だれでも", value: AccessLevel.ANYONE },
    { title: "メンバー", value: AccessLevel.MEMBER },
    { title: "モデレーター", value: AccessLevel.MODERATOR },
    { title: "管理者", value: AccessLevel.ADMIN },
  ];

  // AccessLevel用のticks (数値enum用)
  const accessTicks = {
    [AccessLevel.OFF]: "OFF",
    [AccessLevel.ANYONE]: "だれでも",
    [AccessLevel.MEMBER]: "メンバー",
    [AccessLevel.MODERATOR]: "モデレーター",
    [AccessLevel.ADMIN]: "管理者"
  };

  // TODO 後でまとめられないかなあ
  const syokenTypeItems = [
    { title: "初見さん", value: SyokenType.SYOKEN },
    { title: "枠初コメ", value: SyokenType.HI },
    { title: "久しぶり", value: SyokenType.AGAIN },
  ];

  const syokenTicks = {
    0: "初見さん",
    1: "枠初コメ",
    2: "久しぶり"
  };


  // 表示用の例文生成
  const getExampleText = () => {
    if (!threshold) return "";

    switch (threshold.conditionType) {
      case ConditionType.SYOKEN:
        const syokenValue = threshold.syoken !== undefined ? threshold.syoken : SyokenType.SYOKEN;
        const syokenMap = {
          [SyokenType.SYOKEN]: "初見さん",
          [SyokenType.HI]: "配信枠初コメント",
          [SyokenType.AGAIN]: "7日以上ぶり",
        };
        return `${syokenMap[syokenValue]}の場合`;

      case ConditionType.ACCESS:
        const accessMap = {
          [AccessLevel.OFF]: "無効",
          [AccessLevel.ANYONE]: "制限なし",
          [AccessLevel.MEMBER]: "メンバー以上",
          [AccessLevel.MODERATOR]: "モデレーター以上",
          [AccessLevel.ADMIN]: "管理者のみ"
        };
        return `${accessMap[threshold.access || AccessLevel.OFF]}`;

      case ConditionType.MATCH:
        return threshold.match?.length
          ? `「${threshold.match.join('」「')}」を含む場合`
          : "キーワード未設定";

      case ConditionType.TIME:
        if (!threshold.time) return "";
        const {  value1, value2 } = threshold.time;
        return `${value1}時～${value2}時の範囲`;

      case ConditionType.ELAPSED:
        if (!threshold.elapsed) return "";
        const elapsedUnitMap = {
          second: "秒",
          minute: "分",
          hour: "時間",
          day: "日"
        };
        return `最後のコメントから${getComparisonText(threshold.elapsed, elapsedUnitMap[threshold.elapsed.unit])}`;


      case ConditionType.COUNT:
        if (!threshold.count) return "";
        const countUnitMap = {
          lc: "配信枠のコメント数",
          no: "個人コメント数",
          tc: "総個人コメント数"
        };
        return `${countUnitMap[threshold.count.unit]}が${getComparisonText(threshold.count, "")}`;


      case ConditionType.GIFT:
        if (!threshold.gift) return "";
        return `ギフト金額が${getComparisonText(threshold.gift, "pt")}`;

      default:
        return "制限なし";
    }
  };

  // 比較文生成用のヘルパー関数
  const getComparisonText = (condition: BaseCondition & { comparison: ComparisonType }, unit: string) => {
    const { comparison, value1, value2 } = condition;
    switch (comparison) {
      case "range": return `${value1}${unit}～${value2}${unit}の範囲`;
      case "equal": return `${value1}${unit}に等しい`;
      case "loop": return `${value1}${unit}ごと`;
      default: return `${value1}${unit}${comparison === "min" ? "以下" : "以上"}`;
    }
  };


  return {
    accessTicks, syokenTicks,
    conditionTypeItems,
    accessLevelItems,
    syokenTypeItems,
    getExampleText,
  };
}