// src/composables/FunkThreshold.ts

import {
  AccessLevel,
  BaseCondition,
  ComparisonType,
  ConditionType,
  SyokenType,
  ThresholdType,
} from "@/types";

// 型定義
type ThresholdItem = {
  label: string;
  value: ConditionType;
  icon: string;
  description: string;
};

type ComparisonItem = {
  title: string;
  value: ComparisonType;
};

type ValueLabel = {
  value1: string;
  value2: string;
};

type UnitItem = {
  title: string;
  value: string;
};

// しきい値の設定に関する関数群を提供
export function funkThreshold() {
  // 定数定義
  const THRESHOLD_ITEMS: ThresholdItem[] = [
    {
      label: "制限なし",
      value: ConditionType.NONE,
      icon: "mdi-block-helper",
      description: "条件による制限を設定しません",
    },
    {
      label: "メンバー・モデ判定",
      value: ConditionType.ACCESS,
      icon: "mdi-account-check",
      description: "メンバーシップやモデレーター権限を判定",
    },
    {
      label: "初見・久しぶり",
      value: ConditionType.SYOKEN,
      icon: "mdi-account-clock",
      description: "視聴者の初見や復帰を判定",
    },
    {
      label: "キーワード一致",
      value: ConditionType.MATCH,
      icon: "mdi-text-search",
      description: "特定のキーワードを含むコメントを判定",
    },
    {
      label: "時間指定",
      value: ConditionType.TIME,
      icon: "mdi-clock-time-four",
      description: "指定した時間帯のみ有効",
    },
    {
      label: "経過時間",
      value: ConditionType.ELAPSED,
      icon: "mdi-timer",
      description: "配信開始からの経過時間で判定",
    },
    {
      label: "コメント数",
      value: ConditionType.COUNT,
      icon: "mdi-comment-multiple",
      description: "コメント投稿回数による判定",
    },
    {
      label: "ギフト",
      value: ConditionType.GIFT,
      icon: "mdi-gift",
      description: "ギフト送信による判定",
    },
  ];

  const ACCESS_ITEMS = [
    { title: "OFF", value: AccessLevel.OFF },
    { title: "だれでも", value: AccessLevel.ANYONE },
    { title: "メンバー", value: AccessLevel.MEMBER },
    { title: "モデレーター", value: AccessLevel.MODERATOR },
    { title: "管理者", value: AccessLevel.ADMIN },
  ];

  const SYOKEN_ITEMS = [
    { title: "初見さん", value: SyokenType.SYOKEN },
    { title: "枠初コメ", value: SyokenType.HI },
    { title: "久しぶり", value: SyokenType.AGAIN },
  ];

  // マッピング定義
  const MAPPINGS = {
    comparison: {
      base: [
        { title: "以下", value: "min" },
        { title: "以上", value: "max" },
        { title: "範囲", value: "range" },
      ] as ComparisonItem[],
      additional: {
        [ConditionType.COUNT]: [
          { title: "等しい", value: "equal" },
          { title: "繰り返し", value: "loop" },
        ],
        [ConditionType.GIFT]: [{ title: "等しい", value: "equal" }],
      } as Partial<Record<ConditionType, ComparisonItem[]>>,
    },
    value: {
      [ConditionType.TIME]: { value1: "時刻", value2: "終了時刻" },
      [ConditionType.ELAPSED]: { value1: "経過時間", value2: "経過時間(終了)" },
      [ConditionType.COUNT]: {
        value1: "コメント数",
        value2: "コメント数(終了)",
      },
      [ConditionType.GIFT]: { value1: "ポイント", value2: "ポイント(終了)" },
    } as Partial<Record<ConditionType, ValueLabel>>,
    unit: {
      [ConditionType.ELAPSED]: [
        { title: "秒", value: "second" },
        { title: "分", value: "minute" },
        { title: "時間", value: "hour" },
        { title: "日", value: "day" },
      ],
      [ConditionType.COUNT]: [
        { title: "配信枠のコメント番号", value: "lc" },
        { title: "個人コメント数", value: "no" },
        { title: "総個人コメント数", value: "tc" },
      ],
    } as Partial<Record<ConditionType, UnitItem[]>>,
    syoken: {
      [SyokenType.SYOKEN]: "初見さん",
      [SyokenType.HI]: "配信枠初コメント",
      [SyokenType.AGAIN]: "7日以上ぶり",
    } as Record<SyokenType, string>,
    access: {
      [AccessLevel.OFF]: "無効",
      [AccessLevel.ANYONE]: "制限なし",
      [AccessLevel.MEMBER]: "メンバー以上",
      [AccessLevel.MODERATOR]: "モデレーター以上",
      [AccessLevel.ADMIN]: "管理者のみ",
    } as Record<AccessLevel, string>,
  };

  // 発動条件があるか
  const isThreshold = (threshold: ThresholdType): boolean => {
    return !(
      threshold.conditionType === ConditionType.NONE ||
      (threshold.conditionType === ConditionType.ACCESS && threshold.access === AccessLevel.ANYONE) ||
      (threshold.conditionType === ConditionType.MATCH && (!threshold.match || threshold.match.length === 0))
    );
  };


  // 条件タイプに応じた比較項目を取得
  const getComparisonItems = (type: ConditionType): ComparisonItem[] => {
    const additionalItems = MAPPINGS.comparison.additional[type] || [];
    return [...MAPPINGS.comparison.base, ...additionalItems];
  };

  // 条件タイプに応じた値ラベルを取得
  const getValueLabel = (type: ConditionType, isValue2 = false): string => {
    const labels = MAPPINGS.value[type];
    return labels
      ? isValue2
        ? labels.value2
        : labels.value1
      : isValue2
      ? "値(終了)"
      : "値";
  };

  // 条件タイプに応じた単位項目を取得
  const getUnitItems = (type: ConditionType): UnitItem[] => {
    return MAPPINGS.unit[type] || [];
  };

  // しきい値の説明文を生成
  const getExampleText = (threshold: ThresholdType): string => {
    if (!threshold) return "";

    const handlers: Partial<Record<ConditionType, () => string>> = {
      [ConditionType.SYOKEN]: () =>
        `${MAPPINGS.syoken[threshold.syoken || SyokenType.SYOKEN]}の場合`,

      [ConditionType.ACCESS]: () =>
        MAPPINGS.access[threshold.access || AccessLevel.OFF],

      [ConditionType.MATCH]: () =>
        threshold.match?.length
          ? `「${threshold.match.join("」「")}」を含む場合`
          : "キーワード未設定",

      [ConditionType.TIME]: () => {
        if (!threshold.time) return "";
        const { value1, value2 } = threshold.time;
        return `${value1}時～${value2}時の範囲`;
      },

      [ConditionType.ELAPSED]: () => {
        if (!threshold.elapsed) return "";
        const unitMap = {
          second: "秒",
          minute: "分",
          hour: "時間",
          day: "日",
        };
        return `最後のコメントから${getComparisonText(
          threshold.elapsed,
          unitMap[threshold.elapsed.unit]
        )}`;
      },

      [ConditionType.COUNT]: () => {
        if (!threshold.count) return "";
        const unitMap = {
          lc: "配信枠のコメント数",
          no: "個人コメント数",
          tc: "総個人コメント数",
        };
        return `${unitMap[threshold.count.unit]}が${getComparisonText(
          threshold.count,
          ""
        )}`;
      },

      [ConditionType.GIFT]: () => {
        if (!threshold.gift) return "";
        return `ギフト金額が${getComparisonText(threshold.gift, "pt")}`;
      },

      [ConditionType.NONE]: () => "制限なし",
    };

    const handler = handlers[threshold.conditionType];
    return handler ? handler() : "制限なし";
  };

  // 比較条件のテキストを生成
  const getComparisonText = (
    condition: BaseCondition & { comparison: ComparisonType },
    unit: string
  ): string => {
    const { comparison, value1, value2 } = condition;
    const comparisonMap: Record<ComparisonType, () => string> = {
      range: () => `${value1}${unit}～${value2}${unit}の範囲`,
      equal: () => `${value1}${unit}に等しい`,
      loop: () => `${value1}${unit}ごと`,
      min: () => `${value1}${unit}以下`,
      max: () => `${value1}${unit}以上`,
    };

    return comparisonMap[comparison]();
  };

  return {
    items: {
      threshold: THRESHOLD_ITEMS,
      access: ACCESS_ITEMS,
      syoken: SYOKEN_ITEMS,
    },
    isThreshold,
    getComparisonItems,
    getValueLabel,
    getUnitItems,
    getExampleText,
  };
}
