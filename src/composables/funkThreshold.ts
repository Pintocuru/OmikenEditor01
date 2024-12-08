// src/composables/FunkThreshold.ts

import {
  AccessCondition,
  ConditionType,
  CountCondition,
  MatchCondition,
  SyokenCondition,
  ThresholdType,
} from "@/types/index";

// 設定項目一覧
const THRESHOLD_ITEMS = [
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

// v-select用itemsの生成 {title,value}
const createSelectItems = <T extends Record<string, string>>(
  examples: Record<string, T>
): Record<keyof typeof examples, Array<{ title: string; value: keyof T }>> => {
  return Object.fromEntries(
    Object.entries(examples).map(([key, values]) => [
      key,
      Object.entries(values).map(([value, title]) => ({ title, value })),
    ])
  );
};
const SELECT_ITEMS = createSelectItems(EXAMPLES);

/**
 * しきい値の設定に関する機能を提供する関数
 * @returns しきい値関連の各種ユーティリティ関数
 */
export function FunkThreshold() {
  // しきい値の説明文を生成
  const getExampleText = (thresholds: ThresholdType[]): string => {
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
    THRESHOLD_ITEMS,
    SELECT_ITEMS,
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
