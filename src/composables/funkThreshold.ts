// src/composables/FunkThreshold.ts

import { thresholdSchema } from '@/types/OmikenSchemas';
import {
 AccessCondition,
 ConditionType,
 CountCondition,
 GiftCondition,
 MatchCondition,
 SyokenCondition,
 ThresholdType,
 TypesType
} from '@type';

// 設定項目一覧
const THRESHOLD_ITEMS = {
 target: {
  label: '多重投稿',
  value: 'target',
  icon: 'mdi-account-multiple-check',
  description: '同じユーザーの多重投稿を判定'
 },
 coolDown: {
  label: 'クールダウン',
  value: 'coolDown',
  icon: 'mdi-timer-sand',
  description: '一定の時間(秒)経過しているか判定'
 },
 syoken: {
  label: '初見・久しぶり',
  value: 'syoken',
  icon: 'mdi-account-clock',
  description: '初見判定ちゃん。配信枠の最初のコメントを判定'
 },
 access: {
  label: 'メンバー',
  value: 'access',
  icon: 'mdi-account-check',
  description: 'メンバーシップやモデレーター権限を判定'
 },
 gift: {
  label: 'ギフト',
  value: 'gift',
  icon: 'mdi-gift-outline',
  description: 'ギフトやメンバー加入に関する判定'
 },
 count: {
  label: 'カウント',
  value: 'count',
  icon: 'mdi-comment-multiple',
  description: 'おみくじ回数など、数に関する判定'
 },
 match: {
  label: 'キーワード',
  value: 'match',
  icon: 'mdi-text-search',
  description: 'コメントやステータスを判定'
 }
};

// 説明リスト
const EXAMPLES: ExampleStructure = {
 comment: {
  // 初見・コメント履歴の種別
  syoken: {
   [SyokenCondition.SYOKEN]: '初見さん',
   [SyokenCondition.AGAIN]: '久しぶり(7日以上)',
   [SyokenCondition.HI]: '7日以内',
   [SyokenCondition.ALL]: '配信枠の1コメ'
  },
  // ユーザーの役職
  access: {
   [AccessCondition.MEMBER]: 'メンバー以上',
   [AccessCondition.MODERATOR]: 'モデレーター以上',
   [AccessCondition.ADMIN]: '管理者のみ'
  },
  // gift
  gift: {
   [GiftCondition.All]: '全てのギフト（メンバー加入含む）', // すべてのギフト（メンバー加入含む）
   [GiftCondition.Blue]: '1円以上', // 200円未満のギフト
   [GiftCondition.LightBlue]: '200円以上', // 200円〜499円のギフト
   [GiftCondition.Green]: '500円以上', // 500円〜999円のギフト
   [GiftCondition.Yellow]: '1,000円以上', // 1,000円〜1,999円のギフト
   [GiftCondition.Orange]: '2,000円以上', // 2,000円〜4,999円のギフト
   [GiftCondition.Pink]: '5,000円以上', // 5,000円〜9,999円のギフト
   [GiftCondition.Red]: '10,000円以上', // 10,000円以上のギフト
   [GiftCondition.Purple]: '20,000円以上' // 20,000円以上のギフト
  },
  // count:数値を参照する
  unit: {
   draws: '個人:配信内のおみくじ回数',
   totalDraws: '個人:過去すべてのおみくじ回数',
   gameDraws: '総数:配信内のおみくじ回数',
   gameTotalDraws: '総数:過去すべてのおみくじ回数',
   lc: '配信枠のコメント数',
   tc: '個人の総コメント数',
   interval: '前回のコメントからの経過時間(秒)'
  },
  comparison: {
   min: '以下',
   max: '以上',
   range: '範囲',
   equal: 'に等しい',
   loop: 'ごと'
  },
  // match:文字列を参照する
  target: {
   status: 'ステータス',
   comment: 'コメント',
   name: '名前',
   displayName: 'ニックネーム'
  },
  case: {
   exact: 'で一致する',
   starts: 'で始まる',
   include: 'を含む'
  }
 },
 timer: {},
 meta: {},
 waitingList: {},
 setList: {},
 reactions: {},
 unused: {}
};

// v-select用itemsの生成 {title,value}
type ExampleValue = Record<string | number, string>;
type ExampleStructure = Record<TypesType, Record<string, ExampleValue>>;
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

  acc[typedType] = Object.keys(examplesOfType).reduce(
   (subAcc, category) => {
    const exampleCategory = examplesOfType[category];
    subAcc[category] = Object.entries(exampleCategory).map(([value, title]) => ({ title, value }));
    return subAcc;
   },
   {} as Record<string, Array<{ title: string; value: string | number }>>
  );

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
  if (!Array.isArray(thresholds) || thresholds.length === 0) return '制限なし';

  // TODO 現在はtype=commentだけだが、将来拡張予定
  const type = 'comment';

  const handlers: Record<ConditionType, (threshold: ThresholdType) => string> = {
   target: () => `同一アカウントが連投した場合`,
   coolDown: ({ coolDown }) => `前回のおみくじ系コメントから${coolDown}秒経過していない場合`,
   syoken: ({ syoken }: { syoken: SyokenCondition }) => `${EXAMPLES[type].syoken[syoken || SyokenCondition.SYOKEN]}`,
   access: ({ access }: { access: AccessCondition }) => EXAMPLES[type].access[access],
   gift: ({ gift }: { gift: GiftCondition }) => getGiftExample(gift),
   count: ({ count }: { count: CountCondition }) => getCountExample(count),
   match: ({ match }: { match: MatchCondition }) => getMatchExample(match)
  };

  return thresholds.map((threshold) => handlers[threshold.conditionType]?.(threshold) || '不明な制限').join('、');
 };

 // gift 用説明文
 const getGiftExample = (gift: GiftCondition): string => {
  const giftExamples: Record<GiftCondition, string> = {
   [GiftCondition.All]: '全てのギフト（メンバー加入含む）',
   [GiftCondition.Blue]: '1円以上のギフト',
   [GiftCondition.LightBlue]: '200円以上のギフト',
   [GiftCondition.Green]: '500円以上のギフト',
   [GiftCondition.Yellow]: '1,000円以上のギフト',
   [GiftCondition.Orange]: '2,000円以上のギフト',
   [GiftCondition.Pink]: '5,000円以上のギフト',
   [GiftCondition.Red]: '10,000円以上のギフト',
   [GiftCondition.Purple]: '20,000円以上のギフト'
  };

  return giftExamples[gift] || '不明なギフト';
 };

 // count 用説明文
 const getCountExample = (count: CountCondition): string => {
  // TODO 現在はtype=commentだけだが、将来拡張予定
  const type = 'comment';

  const exampleUnit = EXAMPLES[type].unit[count.unit];
  const exampleComparison = EXAMPLES[type].comparison[count.comparison];

  return count.comparison === 'range'
   ? `${exampleUnit}が${count.value1}と${count.value2}の間` // 範囲
   : `${exampleUnit}が${count.value1}${exampleComparison}`;
 };

 // match 用説明文
 const getMatchExample = (match: MatchCondition): string => {
  // TODO 現在はtype=commentだけだが、将来拡張予定
  const type = 'comment';

  const exampleTarget = EXAMPLES[type].target[match.target];
  const exampleCase = EXAMPLES[type].case[match.case];

  return match.value.length
   ? `${exampleTarget}が「${match.value.join('」「')}」${exampleCase}場合`
   : 'キーワード未設定';
 };

 return {
  EXAMPLES,
  THRESHOLD_ITEMS,
  SELECT_ITEMS,
  getExampleText
 };
}

// Thresholdの初期値を生成する関数
export function FunkThresholdInitial(condition: ConditionType = 'match') {
 return thresholdSchema.parse({});
}
