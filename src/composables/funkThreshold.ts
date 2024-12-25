// src/composables/FunkThreshold.ts

import {
  AccessCondition,
  ConditionType,
  CountCondition,
  MatchCondition,
  SyokenCondition,
  ThresholdType,
  TypesType,
} from "@/type";

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
    value: "coolDown",
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
const EXAMPLES: ExampleStructure = {
  comment: {
    // 初見・コメント履歴の種別
    syoken: {
      [SyokenCondition.SYOKEN]: "初見さん",
      [SyokenCondition.AGAIN]: "7日以上経過した配信枠初コメント",
      [SyokenCondition.HI]: "7日以内の配信枠初コメント",
      [SyokenCondition.ALL]: "すべての配信枠初コメント",
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
  },
  meta: {},
  timer: {},
  waitingList: {},
  setList: {},
  reactions: {},
  unused: {},
};

// v-select用itemsの生成 {title,value}
type ExampleValue = Record<string | number, string>;
type ExampleStructure = Record<TypesType, Record<string, ExampleValue>>;
;
const createSelectItems = <T extends ExampleStructure>(
  examples: T
): {
  [K in keyof T]: {
    [SubK in keyof T[K]]: Array<{ title: string; value: string | number }>;
  };
} => {
  return Object.keys(examples).reduce((acc, type) => {
    const typedType = type as keyof T;
    const examplesOfType = examples[typedType] as Record<string, ExampleValue>;

    acc[typedType] = Object.keys(examplesOfType).reduce((subAcc, category) => {
      const exampleCategory = examplesOfType[category];
      subAcc[category] = Object.entries(exampleCategory).map(
        ([value, title]) => ({ title, value })
      );
      return subAcc;
    }, {} as Record<string, Array<{ title: string; value: string | number }>>);

    return acc;
  }, {} as any);
};
const SELECT_ITEMS = createSelectItems(EXAMPLES);

/**
 * しきい値の設定に関する機能を提供する関数
 * @returns しきい値関連の各種ユーティリティ関数
 */
export function FunkThreshold() {
  // しきい値の説明文を生成
  // TODO ThresholdType[] だけではなく、ThresholdTypeに対応したものが欲しい
  const getExampleText = (thresholds: ThresholdType[]): string => {
    if (!Array.isArray(thresholds) || thresholds.length === 0)
      return "制限なし";

    // TODO 現在はtype=commentだけだが、将来拡張予定
    const type = 'comment'

    const handlers: Record<ConditionType, (threshold: any) => string> = {
      target: () => `前回と今回のコメントが同一人物の場合`,
      coolDown: (coolDown: number) =>
        `前回のおみくじから${coolDown}秒経過していない場合`,
      syoken: ({ syoken }: { syoken: SyokenCondition }) =>
        `${EXAMPLES[type].syoken[syoken || SyokenCondition.SYOKEN]}の場合`,
      access: ({ access }: { access: AccessCondition }) =>
        EXAMPLES[type].access[access],
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
    // TODO 現在はtype=commentだけだが、将来拡張予定
    const type = "comment";

    const exampleUnit = EXAMPLES[type].unit[count.unit];
    const exampleComparison = EXAMPLES[type].comparison[count.comparison];

    return count.comparison === "range"
      ? `${exampleUnit}が${count.value1}と${count.value2}の間` // 範囲
      : `${exampleUnit}が${count.value1}${exampleComparison}`;
  };

  // match 用説明文
  const getMatchExample = (match: MatchCondition): string => {
    // TODO 現在はtype=commentだけだが、将来拡張予定
    const type = "comment";

    const exampleTarget = EXAMPLES[type].target[match.target];
    const exampleCase = EXAMPLES[type].case[match.case];

    return match.value.length
      ? `${exampleTarget}が「${match.value.join("」「")}」${exampleCase}場合`
      : "キーワード未設定";
  };

  return {
    EXAMPLES,
    THRESHOLD_ITEMS,
    SELECT_ITEMS,
    getExampleText,
  };
}

// Thresholdの初期値を生成する関数
export function FunkThresholdInitial(condition: ConditionType = "match") {
  return {
    conditionType: condition,
    target: null,
    coolDown: 3,
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
