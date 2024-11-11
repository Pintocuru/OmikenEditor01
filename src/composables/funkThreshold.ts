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

// 基本的な型定義
interface ThresholdItem {
  label: string;
  value: ConditionType;
  icon: string;
  description: string;
}

interface ComparisonItem {
  title: string;
  value: ComparisonType;
}

interface ValueLabel {
  value1: string;
  value2: string;
}

interface UnitItem {
  title: string;
  value: string;
}

// 定数定義を分離して管理性を向上
const CONSTANTS = {
  // しきい値の設定項目一覧
  THRESHOLD_ITEMS: [
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
  ] as ThresholdItem[],

  // アクセス権限の設定項目
  ACCESS_ITEMS: [
    { title: "OFF", value: AccessCondition.OFF },
    { title: "だれでも", value: AccessCondition.ANYONE },
    { title: "メンバー", value: AccessCondition.MEMBER },
    { title: "モデレーター", value: AccessCondition.MODERATOR },
    { title: "管理者", value: AccessCondition.ADMIN },
  ],

  // 初見判定の設定項目
  SYOKEN_ITEMS: [
    { title: "初見さん", value: SyokenCondition.SYOKEN },
    { title: "枠初コメ", value: SyokenCondition.HI },
    { title: "久しぶり", value: SyokenCondition.AGAIN },
  ],

  // マッピング定義をグループ化
  MAPPINGS: {
    // 比較演算子の定義
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
    // 値のラベル定義
    value: {
      [ConditionType.CLOCK]: { value1: "時刻", value2: "終了時刻" },
      [ConditionType.ELAPSED]: { value1: "経過時間", value2: "経過時間(終了)" },
      [ConditionType.COUNT]: { value1: "コメント数", value2: "コメント数(終了)" },
      [ConditionType.GIFT]: { value1: "ポイント", value2: "ポイント(終了)" },
    } as Partial<Record<ConditionType, ValueLabel>>,
    // 単位の定義
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
    // 初見判定の表示テキスト
    syoken: {
      [SyokenCondition.SYOKEN]: "初見さん",
      [SyokenCondition.HI]: "配信枠初コメント",
      [SyokenCondition.AGAIN]: "7日以上ぶり",
    } as Record<SyokenCondition, string>,
    // アクセス権限の表示テキスト
    access: {
      [AccessCondition.OFF]: "無効",
      [AccessCondition.ANYONE]: "制限なし",
      [AccessCondition.MEMBER]: "メンバー以上",
      [AccessCondition.MODERATOR]: "モデレーター以上",
      [AccessCondition.ADMIN]: "管理者のみ",
    } as Record<AccessCondition, string>,
  },
};

/**
 * しきい値の設定に関する機能を提供する関数
 * @returns しきい値関連の各種ユーティリティ関数
 */
export function FunkThreshold() {
  /**
   * 発動条件が設定されているかチェック
   * @param threshold チェック対象のしきい値
   * @returns 発動条件があればtrue
   */
  const isThreshold = (threshold: ThresholdType): boolean => {
    if (threshold.conditionType === ConditionType.NONE) return false;

    if (threshold.conditionType === ConditionType.ACCESS) {
      return 'access' in threshold && threshold.access !== AccessCondition.ANYONE;
    }

    if (threshold.conditionType === ConditionType.MATCH) {
      return 'match' in threshold && Array.isArray(threshold.match) && threshold.match.length > 0;
    }

    return true;
  };

  /**
   * 条件タイプに応じた比較演算子の一覧を取得
   * @param type 条件タイプ
   * @returns 利用可能な比較演算子の一覧
   */
  const getComparisonItems = (type: ConditionType): ComparisonItem[] => {
    const additionalItems = CONSTANTS.MAPPINGS.comparison.additional[type] || [];
    return [...CONSTANTS.MAPPINGS.comparison.base, ...additionalItems];
  };

  /**
   * 条件タイプに応じた値のラベルを取得
   * @param type 条件タイプ
   * @param isValue2 終了値のラベルを取得する場合はtrue
   * @returns 値のラベル文字列
   */
  const getValueLabel = (type: ConditionType, isValue2 = false): string => {
    const labels = CONSTANTS.MAPPINGS.value[type];
    return labels ? (isValue2 ? labels.value2 : labels.value1) : (isValue2 ? "値(終了)" : "値");
  };

  /**
   * 条件タイプに応じた単位の一覧を取得
   * @param type 条件タイプ
   * @returns 利用可能な単位の一覧
   */
  const getUnitItems = (type: ConditionType): UnitItem[] => {
    return CONSTANTS.MAPPINGS.unit[type] || [];
  };

  /**
   * しきい値の説明文を生成
   * @param threshold しきい値の設定
   * @returns 人間が読める形式の説明文
   */
  const getExampleText = (threshold: ThresholdType): string => {
    if (!threshold) return "";

    const handlers: Record<ConditionType, (threshold: any) => string> = {
      [ConditionType.TIMER]: ({ timer }: { timer?: TimerCondition }) => {
        if (!timer) return "";
        return `${timer.isBaseZero ? "0分" : "起動時"}から${timer.minutes}分ごと`;
      },

      [ConditionType.SYOKEN]: ({ syoken }: { syoken: SyokenCondition }) =>
        `${CONSTANTS.MAPPINGS.syoken[syoken || SyokenCondition.SYOKEN]}の場合`,

      [ConditionType.ACCESS]: ({ access }: { access: AccessCondition }) =>
        CONSTANTS.MAPPINGS.access[access || AccessCondition.OFF],

      [ConditionType.MATCH]: ({ match }: { match?: string[] }) =>
        match?.length ? `「${match.join("」「")}」を含む場合` : "キーワード未設定",

      [ConditionType.CLOCK]: ({ clock }: { clock?: ClockCondition }) => {
        if (!clock) return "";
        const endHour = (clock.startHour + clock.durationHours) % 24;
        return `${clock.startHour}時～${endHour}時の範囲`;
      },

      [ConditionType.ELAPSED]: ({ elapsed }: { elapsed?: ElapsedCondition }) => {
        if (!elapsed) return "";
        const unitMap = { second: "秒", minute: "分", hour: "時間", day: "日" };
        return `最後のコメントから${getComparisonText(elapsed, unitMap[elapsed.unit])}`;
      },

      [ConditionType.COUNT]: ({ count }: { count?: CountCondition }) => {
        if (!count) return "";
        const unitMap = {
          lc: "配信枠のコメント数",
          no: "個人コメント数",
          tc: "総個人コメント数",
        };
        return `${unitMap[count.unit]}が${getComparisonText(count, "")}`;
      },

      [ConditionType.GIFT]: ({ gift }: { gift?: GiftCondition }) => {
        if (!gift) return "";
        return `ギフト金額が${getComparisonText(gift, "pt")}`;
      },

      [ConditionType.NONE]: () => "制限なし",
    };

    return handlers[threshold.conditionType]?.(threshold) || "制限なし";
  };

  /**
   * 比較条件のテキストを生成
   * @param condition 比較条件
   * @param unit 単位
   * @returns 人間が読める形式の比較条件文
   */
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
      threshold: CONSTANTS.THRESHOLD_ITEMS,
      access: CONSTANTS.ACCESS_ITEMS,
      syoken: CONSTANTS.SYOKEN_ITEMS,
    },
    isThreshold,
    getComparisonItems,
    getValueLabel,
    getUnitItems,
    getExampleText,
  };
}

/**
 * Thresholdの初期値を生成する関数
 * @returns rulesとomikujiのThreshold初期値
 */
export function FunkThresholdInitial() {
  // 共通の初期値
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

  return {
    // rules用の初期値
    rule: {
      ...commonThreshold,
      conditionType: ConditionType.MATCH,
      access: AccessCondition.ANYONE,
      syoken: SyokenCondition.SYOKEN,
      timer: {
        type: ConditionType.TIMER,
        minutes: 1 as number & { _brand: "1-180" },
        isBaseZero: false
      }
    } as RuleThresholdType,

    // omikuji用の初期値
    omikuji: {
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
    } as OmikujiThresholdType
  };
}