// src/composables/FunkThreshold.ts

import {
  AccessCondition,
  BaseCondition,
  ClockCondition,
  ComparisonType,
  ConditionType,
  CountCondition,
  ElapsedCondition,
  GiftCondition,
  OmikujiThresholdType,
  RuleThresholdType,
  SyokenCondition,
  ThresholdType,
  ThresholdTypeCommon,
  TimerCondition,
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
export function FunkThreshold() {
  // 定数定義
  const THRESHOLD_ITEMS: ThresholdItem[] = [
    {
      label: "制限なし",
      value: ConditionType.NONE,
      icon: "mdi-block-helper",
      description: "条件による制限を設定しません",
    },
    {
      label: "タイマー投稿",
      value: ConditionType.TIMER,
      icon: "mdi-clock-time-four",
      description: "一定の時間ごとに自動でBOTが話します",
    },
    {
      label: "メンバー・モデレーター判定",
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
      description: "特定のキーワードのコメントを判定",
    },
    {
      label: "時間指定",
      value: ConditionType.CLOCK,
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
    { title: "OFF", value: AccessCondition.OFF },
    { title: "だれでも", value: AccessCondition.ANYONE },
    { title: "メンバー", value: AccessCondition.MEMBER },
    { title: "モデレーター", value: AccessCondition.MODERATOR },
    { title: "管理者", value: AccessCondition.ADMIN },
  ];

  const SYOKEN_ITEMS = [
    { title: "初見さん", value: SyokenCondition.SYOKEN },
    { title: "枠初コメ", value: SyokenCondition.HI },
    { title: "久しぶり", value: SyokenCondition.AGAIN },
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
      [ConditionType.CLOCK]: { value1: "時刻", value2: "終了時刻" },
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
      [SyokenCondition.SYOKEN]: "初見さん",
      [SyokenCondition.HI]: "配信枠初コメント",
      [SyokenCondition.AGAIN]: "7日以上ぶり",
    } as Record<SyokenCondition, string>,
    access: {
      [AccessCondition.OFF]: "無効",
      [AccessCondition.ANYONE]: "制限なし",
      [AccessCondition.MEMBER]: "メンバー以上",
      [AccessCondition.MODERATOR]: "モデレーター以上",
      [AccessCondition.ADMIN]: "管理者のみ",
    } as Record<AccessCondition, string>,
  };

  // 発動条件があるか
  const isThreshold = (threshold: ThresholdType): boolean => {
    // 型ガードを使用して、thresholdがRuleThresholdTypeかOmikujiThresholdTypeかを判定
    if (threshold.conditionType === ConditionType.NONE) {
      return false;
    }

    if (threshold.conditionType === ConditionType.ACCESS) {
      // thresholdがRuleThresholdTypeであることが保証される
      if ('access' in threshold) {
        return threshold.access !== AccessCondition.ANYONE;
      }
    }

    if (threshold.conditionType === ConditionType.MATCH) {
      // thresholdがRuleThresholdTypeであることが保証される
      if ('match' in threshold) {
        // matchがundefinedでないことを確認
        return Array.isArray(threshold.match) && threshold.match.length > 0;
      }
    }

    return true; // その他の条件を満たす場合
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

    const handlers: Record<ConditionType, (threshold: any) => string> = {

      [ConditionType.TIMER]: (t: { timer?: TimerCondition; }) => {
        if (!t.timer) return "";
        const { minutes, isBaseZero } = t.timer;
        return `${isBaseZero ? "0分" : "起動時"}から${minutes}分ごと`;
      },
      [ConditionType.SYOKEN]: (t: { syoken: SyokenCondition; }) => `${MAPPINGS.syoken[t.syoken || SyokenCondition.SYOKEN]}の場合`,

      [ConditionType.ACCESS]: (t: { access: AccessCondition; }) => MAPPINGS.access[t.access || AccessCondition.OFF],

      [ConditionType.MATCH]: (t: { match?: string[]; }) => t.match?.length
        ? `「${t.match.join("」「")}」を含む場合`
        : "キーワード未設定",

      [ConditionType.CLOCK]: (t: { clock?: ClockCondition; }) => {
        if (!t.clock) return "";
        const { startHour, durationHours } = t.clock;
        const endHour = (startHour + durationHours) % 24;
        return `${startHour}時～${endHour}時の範囲`;
      },

      [ConditionType.ELAPSED]: (t: { elapsed?: ElapsedCondition; }) => {
        if (!t.elapsed) return "";
        const unitMap = {
          second: "秒",
          minute: "分",
          hour: "時間",
          day: "日",
        };
        return `最後のコメントから${getComparisonText(
          t.elapsed,
          unitMap[t.elapsed.unit]
        )}`;
      },

      [ConditionType.COUNT]: (t: { count?: CountCondition; }) => {
        if (!t.count) return "";
        const unitMap = {
          lc: "配信枠のコメント数",
          no: "個人コメント数",
          tc: "総個人コメント数",
        };
        return `${unitMap[t.count.unit]}が${getComparisonText(
          t.count,
          ""
        )}`;
      },

      [ConditionType.GIFT]: (t: { gift?: GiftCondition; }) => {
        if (!t.gift) return "";
        return `ギフト金額が${getComparisonText(t.gift, "pt")}`;
      },

      [ConditionType.NONE]: () => "制限なし",

    };

    const handler = handlers[threshold.conditionType];
    return handler ? handler(threshold) : "制限なし";
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

// 初期化用
export function FunkThresholdInitial() {
  // 共通
  const commonThreshold: ThresholdTypeCommon = {
    conditionType: ConditionType.MATCH,
    match: ['yaa'],
    count: {
      type: ConditionType.COUNT,
      comparison: 'max',
      unit: 'lc',
      value1: 0
    },
    gift: {
      type: ConditionType.GIFT,
      comparison: 'max',
      value1: 0
    },
  };

  // rules用
  const ruleThreshold: RuleThresholdType = {
    ...commonThreshold,
    conditionType: ConditionType.MATCH,
    access: AccessCondition.ANYONE,
    syoken: SyokenCondition.SYOKEN,
    timer: {
      type: ConditionType.TIMER,
      minutes: 1 as number & { _brand: "1-180" },
      isBaseZero: false
    }
  };

  // omikuji用
  const omikujiThreshold: OmikujiThresholdType = {
    ...commonThreshold,
    conditionType: ConditionType.NONE,
    clock: {
      type: ConditionType.CLOCK,
      startHour: 0,
      durationHours: 1
    },
    elapsed: {
      type: ConditionType.ELAPSED,
      comparison: "min",
      unit: "minute",
      value1: 0
    }
  };

  return {
    rule: ruleThreshold,
    omikuji: omikujiThreshold
  };
}