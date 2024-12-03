// src/composables/FunkThreshold.ts

import {
  AccessCondition,
  ConditionType,
  CountCondition,
  SyokenCondition,
  ThresholdType,
} from "@/types/index";

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
      label: "多重投稿",
      value: "tauget",
      icon: "",
      description: "前回と今回のおみくじが同じ人かを判定",
    },
    {
      label: "クールダウン",
      value: "cooldown",
      icon: "",
      description: "一定の時間(秒)経過していなければ対象です",
    },
    {
      label: "初見・久しぶり",
      value: "syoken",
      icon: "mdi-account-clock",
      description: "初見判定ちゃん。配信枠の最初のコメントを判定",
    },
    {
      label: "メンバー・モデレーター判定",
      value: "access",
      icon: "mdi-account-check",
      description: "メンバーシップやモデレーター権限を判定",
    },
    {
      label: "カウント・ギフト",
      value: "count",
      icon: "mdi-comment-multiple",
      description: "ギフト金額や回数など、数に関する判定",
    },
    {
      label: "キーワード",
      value: "match",
      icon: "mdi-text-search",
      description: "コメントやステータスを判定",
    },
  ] as ThresholdItem[],

  // アクセス権限の設定項目
  ACCESS_ITEMS: [
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
        { title: "等しい", value: "equal" },
        { title: "繰り返し", value: "loop" },
      ] as ComparisonItem[],
    },
    // 値のラベル定義
    value: {
      clock: { value1: "時刻", value2: "終了時刻" },
      elapsed: { value1: "経過時間", value2: "経過時間(終了)" },
      count: {
        value1: "コメント数",
        value2: "コメント数(終了)",
      },
      gift: { value1: "ポイント", value2: "ポイント(終了)" },
    } as Partial<Record<ConditionType, ValueLabel>>,
    // 単位の定義
    unit: {
      elapsed: [
        { title: "秒", value: "second" },
        { title: "分", value: "minute" },
        { title: "時間", value: "hour" },
        { title: "日", value: "day" },
      ],
      count: [
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
  // 発動条件が設定されているか // TODO 不要
  const isThreshold = (threshold: ThresholdType): boolean => {
    return true;
  };

  /**
   * 条件タイプに応じた比較演算子の一覧を取得
   * @param type 条件タイプ
   * @returns 利用可能な比較演算子の一覧
   */
  const getComparisonItems = (type: ConditionType): ComparisonItem[] => {
    const additionalItems =
      CONSTANTS.MAPPINGS.comparison.additional[type] || [];
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
    return labels
      ? isValue2
        ? labels.value2
        : labels.value1
      : isValue2
      ? "値(終了)"
      : "値";
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
      target: () => {
        return `前回と今回のコメントが同一人物の場合`;
      },
      cooldown: (cooldown:number) => {
        return `前回のおみくじから${cooldown}秒経過していない場合`;
      },
      syoken: ({ syoken }: { syoken: SyokenCondition }) =>
        `${CONSTANTS.MAPPINGS.syoken[syoken || SyokenCondition.SYOKEN]}の場合`,

      access: ({ access }: { access: AccessCondition }) =>
        CONSTANTS.MAPPINGS.access[access],

      count: ({ count }: { count?: CountCondition }) => {
        if (!count) return "";
        const unitMap = {
          draws: "おみくじの回数(個人)",
          totalDraws: "おみくじの回数(合計)",
          gameDraws: "おみくじの総回数(個人)",
          gameTotalDraws: "おみくじの総回数(合計)",
          gift: "ギフト金額",
          lc: "配信枠のコメント数",
          no: "個人コメント数",
          tc: "総個人コメント数",
          interval: "前回のコメントからの経過時間(ミリ秒)",
        };
        return `${unitMap[count.unit]}が${getComparisonText(count, "")}`;
      },
      match: ({ match }: { match?: string[] }) =>
        match?.length
          ? `「◯◯に${match.join("」「")}」を含む場合` // TODO ◯◯ に文字列
          : "キーワード未設定",



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
    condition: CountCondition,
    unit: string
  ): string => {
    const { comparison, value1, value2 } = condition;
    const comparisonMap = {
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


 // Thresholdの初期値を生成する関数
export function FunkThresholdInitial() {
  return {
      conditionType: "match",
      target: null,
      cooldown: 3,
      syoken: SyokenCondition.SYOKEN,
      access: AccessCondition.MEMBER,
      match: {
        target: "comment",
        case: "starts",
        value: ["おみくじ"],
      },
      count: {
        comparison: "max",
        unit: "gift",
        value1: 0,
        value2: 1,
      },
    } as ThresholdType
};