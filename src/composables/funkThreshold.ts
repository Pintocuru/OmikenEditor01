// src/composables/FunkThreshold.ts

import {
  AccessCondition,
  ConditionType,
  CountCondition,
  MatchCondition,
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
  value: CountCondition["comparison"];
}

interface ValueLabel {
  value1: string;
  value2: string;
}

interface UnitItem {
  title: string;
  value: string;
}

// 設定項目一覧
const THRESHOLD_ITEMS: ThresholdItem[] = [
  {
    label: "多重投稿",
    value: "target",
    icon: "",
    description: "前回と今回のおみくじが同じ人かを判定",
  },
  {
    label: "クールダウン",
    value: "cooldown",
    icon: "",
    description: "一定の時間(秒)経過していなければ対象",
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
];

const ACCESS_ITEMS = [
  { title: "メンバー", value: AccessCondition.MEMBER },
  { title: "モデレーター", value: AccessCondition.MODERATOR },
  { title: "管理者", value: AccessCondition.ADMIN },
];

const SYOKEN_ITEMS = [
  { title: "初見さん", value: SyokenCondition.SYOKEN },
  { title: "枠初コメ", value: SyokenCondition.HI },
  { title: "久しぶり", value: SyokenCondition.AGAIN },
];

// 説明リスト
const EXAMPLES = {
  // 初見・コメント履歴の種別
  syoken: {
    [SyokenCondition.SYOKEN]: "初見さん",
    [SyokenCondition.HI]: "配信枠初コメント",
    [SyokenCondition.AGAIN]: "7日以上ぶり",
  },
  // ユーザーの役職
  access: {
    [AccessCondition.MEMBER]: "メンバー以上",
    [AccessCondition.MODERATOR]: "モデレーター以上",
    [AccessCondition.ADMIN]: "管理者のみ",
  },
  // count:数値を参照する
  unit: {
    draws: "おみくじの回数(個人)",
    totalDraws: "おみくじの回数(合計)",
    gameDraws: "おみくじの総回数(個人)",
    gameTotalDraws: "おみくじの総回数(合計)",
    gift: "ギフト金額",
    lc: "配信枠のコメント数",
    no: "個人コメント数",
    tc: "総個人コメント数",
    interval: "前回のコメントからの経過時間(ミリ秒)",
  },
  comparison: {
    min: "以下",
    max: "以上",
    range: "範囲",
    equal: "に等しい",
    loop: "ごと",
  },
  // match:文字列を参照する
  target: {
    status: "ステータス",
    comment: "コメント",
    name: "名前",
    displayName: "ニックネーム",
  },
  case: {
    exact: "で一致する",
    starts: "で始まる",
    include: "を含む",
  },
};

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
    unitLabel: {
      draws: "おみくじの回数(個人)",
      totalDraws: "おみくじの回数(合計)",
      gameDraws: "おみくじの総回数(個人)",
      gameTotalDraws: "おみくじの総回数(合計)",
      gift: "ギフト金額",
      lc: "配信枠のコメント数",
      no: "個人コメント数",
      tc: "総個人コメント数",
      interval: "前回のコメントからの経過時間(ミリ秒)",
    } as Record<string, string>,
    // 値のラベル定義
    value: {
      count: {
        value1: "コメント数",
        value2: "コメント数(終了)",
      },
    } as Partial<Record<ConditionType, ValueLabel>>,
    // 単位の定義
    unit: {
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
  // ???
  const getValueLabel = (type: ConditionType, isValue2 = false): string => {
    return isValue2 ? "値(終了)" : "値";
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
  const getExampleText = (thresholds?: ThresholdType[]): string => {
    if (!Array.isArray(thresholds) || thresholds.length === 0)
      return "制限なし";

    const handlers: Record<ConditionType, (threshold: any) => string> = {
      target: () => `前回と今回のコメントが同一人物の場合`,
      cooldown: (cooldown: number) =>
        `前回のおみくじから${cooldown}秒経過していない場合`,
      syoken: ({ syoken }: { syoken: SyokenCondition }) =>
        `${EXAMPLES.syoken[syoken || SyokenCondition.SYOKEN]}の場合`,
      access: ({ access }: { access: AccessCondition }) =>
        EXAMPLES.access[access],
      count: ({ count }: { count: CountCondition }) => getCountExample(count),
      match: ({ match }: { match: MatchCondition }) => getMatchExample(match),
    };

    return thresholds
      .map(
        (threshold) =>
          handlers[threshold.conditionType]?.(threshold) || "不明な制限"
      )
      .join("、");
  };

  // count 用説明文
  const getCountExample = (count: CountCondition): string => {
    const exampleUnit = EXAMPLES.unit[count.unit];
    const exampleComparison = EXAMPLES.comparison[count.comparison];

    return count.comparison === "range"
      ? `${exampleUnit}が${count.value1}と${count.value2}の間` // 範囲
      : `${exampleUnit}が${count.value1}${exampleComparison}`;
  };

  // match 用説明文
  const getMatchExample = (match: MatchCondition): string => {
    const exampleTarget = EXAMPLES.target[match.target];
    const exampleCase = EXAMPLES.case[match.case];

    return match.value.length
      ? `${exampleTarget}が「${match.value.join("」「")}」${exampleCase}場合`
      : "キーワード未設定";
  };

  return {
    items: {
      threshold: CONSTANTS.THRESHOLD_ITEMS,
      access: CONSTANTS.ACCESS_ITEMS,
      syoken: CONSTANTS.SYOKEN_ITEMS,
    },
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
  } as ThresholdType;
}
