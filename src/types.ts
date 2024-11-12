// src/types.ts:型定義

// エディター用型定義

// AppState
export interface AppStateType {
  Omiken: OmikenType;
  CHARA: Record<string, CHARAEditType>;
  Preset: Record<string, PresetOmikenEditType>; // プリセットデータ
}

// xxxOrder用の型
export type OrderKey = "rulesOrder";

// ナビゲーション用カテゴリー
export type NaviCategory = ListCategory | "preset" | "preferences";

// リスト用カテゴリー
export type ListCategory = "rules" | "omikuji" | "place";
export type ListType = ListTypeMap[ListCategory];
export type ListEntry<T extends ListCategory> = {
  isOpen: boolean; // ダイアログの開閉状態
  type: T;
  mode: string | null; // 表示モード
  key: string | string[] | null;
};
// listEntry全体の型
export type ListEntryCollect = {
  [K in ListCategory]: ListEntry<K>;
};

// ファイル操作用
export type OmikenCategory = ListCategory | "preset" | "preferences";
export type OmikenEntry<T extends OmikenCategory> = {
  type: T;
  update?: T extends ListCategory ? ListItemTypeMap[T] : never; // 更新アイテム
  addKeys?: // 新規追加アイテム(部分入力可)
  T extends "omikuji"
  ? (Partial<ListTypeMap[T]> & { rulesId?: string }) | (Partial<ListTypeMap[T]> & { rulesId?: string })[]
  : T extends ListCategory
  ? Partial<ListTypeMap[T]> | Partial<ListTypeMap[T]>[]
  : never;
  delKeys?: string | string[]; // 削除するアイテムのキー名
  reorder?: T extends ListCategory ? string[] : never; // 順番の指定
  preset?: T extends "preset" ? Record<string, PresetOmikenEditType> : never; // プリセット用
  preferences?: T extends "preferences" ? PreferencesType : never; // 設定用
} | null;


// JSON読み込み用
export interface fetchJSONType {
  id: string;
  name: string;
  description: string;
  type: "Omiken" | "CHARA";
  path: string;
  banner: string;
}

// Edit用キャラデータ
export interface CHARAEditType extends fetchJSONType {
  item: CHARAType; // キャラデータ
}
export interface PresetOmikenEditType extends fetchJSONType {
  item: Omit<OmikenType, "preferences">; // キャラデータ(preferences抜き)
  mode: "overwrite" | "append"; // 追加豊富(上書き/追加)
}

// ---------------------------------------------------

// Omibot:おみくじボット用型定義
export interface OmikenType {
  rules: Record<string, ListTypeMap["rules"]>; // おみくじのルールを管理
  rulesOrder: string[]; // ルールの順序
  omikuji: Record<string, ListTypeMap["omikuji"]>; // おみくじ関連のメッセージ
  place: Record<string, ListTypeMap["place"]>; // プレースホルダー
  preferences: PreferencesType;
}

// コンテンツの型マッピング
export type ListTypeMap = {
  rules: RulesType;
  omikuji: OmikujiType;
  place: PlaceType;
};
export type ListItemTypeMap = {
  [K in keyof ListTypeMap]: Record<string, ListTypeMap[K]>;
};

// 基本となる項目のインターフェース
interface BaseType {
  id: string; // キー名
  name: string; // ルール名
  description: string; // 説明文
}

// rules:おみくじルールの型定義
export interface RulesType extends BaseType {
  color: string; // edit時、識別する際に付ける色
  threshold: RuleThresholdType; // 発動条件
  enabledIds: string[]; // omikujiの適用するIDリスト
}

// おみくじメッセージの型定義
export interface OmikujiType extends BaseType {
  weight: number; // 出現割合
  threshold: OmikujiThresholdType; // 発動条件
  post: OmikujiPostType[];
}

// 共通の条件型
export interface ThresholdTypeCommon {
  conditionType: ConditionType; // condition選択
  match?: string[]; // キーワード
  access?: AccessCondition; // ユーザーの役職
  count?: CountCondition; // コメント数
  gift?: GiftCondition; // ギフト
}

// ルール用の条件型
export interface RuleThresholdType extends ThresholdTypeCommon {
  syoken?: SyokenCondition; // 初見・久しぶり
  timer?: TimerCondition; // タイマー(number,時報ありか
}

// おみくじ用の条件型
export interface OmikujiThresholdType extends ThresholdTypeCommon {
  clock?: ClockCondition; // 時刻
  elapsed?: ElapsedCondition; // 経過時間
}

// ThresholdType
export type ThresholdType = RuleThresholdType | OmikujiThresholdType;

// condition選択用
export enum ConditionType {
  NONE = "none",
  ACCESS = "access",
  SYOKEN = "syoken",
  MATCH = "match",
  CLOCK = "clock",
  TIMER = "timer",
  ELAPSED = "elapsed",
  COUNT = "count",
  GIFT = "gift",
}

// 初見・コメント履歴の種別
export enum SyokenCondition {
  SYOKEN = "syoken", // 初見
  HI = "hi", // その配信枠で1回目のコメント
  AGAIN = "again", // 前回のコメントから7日以上経過
}

// ルールの有効/無効 0:OFF/1:だれでも/2:メンバー/3:モデレーター/4:管理者
export enum AccessCondition {
  OFF = 0,
  ANYONE = 1,
  MEMBER = 2,
  MODERATOR = 3,
  ADMIN = 4,
}

// タイマー
export interface TimerCondition {
  type: ConditionType.TIMER;
  minutes: number;
  isBaseZero: boolean;
}

// clock:時間指定(0-23時)
export interface ClockCondition {
  type: ConditionType.CLOCK;
  startHour: number;
  durationHours: number;
}

// 共通の定義
export type ComparisonType = "min" | "max" | "range" | "equal" | "loop";
export interface BaseCondition {
  value1: number;
  value2?: number;
}

// Elapsed: 投稿してからの時間(interval:ミリ秒)
export interface ElapsedCondition extends BaseCondition {
  type: ConditionType.ELAPSED;
  comparison: Extract<ComparisonType, "min" | "max" | "range">;
  unit: "second" | "minute" | "hour" | "day";
}

// lc:配信枠の全体コメ数 / no:配信枠の個人コメ数 / tc:総数の個人コメ数
export interface CountCondition extends BaseCondition {
  type: ConditionType.COUNT;
  comparison: ComparisonType;
  unit: "lc" | "no" | "tc";
}

// Gift:ギフト金額
export interface GiftCondition extends BaseCondition {
  type: ConditionType.GIFT;
  comparison: Extract<ComparisonType, "min" | "max" | "range" | "equal">;
}

// メッセージの投稿情報を管理する型
export interface OmikujiPostType {
  type:
  | "onecomme" // わんコメへの投稿
  | "party" // WordPartyの投稿
  | "toast" // トースト投稿
  | "speech"; // わんコメのスピーチ機能
  botKey: string; // ボットキー
  iconKey: string; // アイコンキー
  delaySeconds: number; // メッセージを送信するまでの遅延時間
  content: string; // メッセージ内容
}

// プレースホルダー項目の型定義
export interface PlaceType extends BaseType {
  isWeight: boolean; // モード
  values: PlaceValueType[]; // 値の配列
}

// プレースホルダーの値
export type PlaceValueType = {
  weight: number; // 出現割合
  value: string; // 値（他のプレースホルダーへの参照可能: <<place_name>>）
};

// 設定の型定義
export interface PreferencesType {
  basicDelay: number; // コメントしてからBotが反応するまでの遅延(秒)
  omikujiCooldown: number; // おみくじ機能のクールダウン時間（秒)
  commentDuration: number; // コメントしてからおみくじを有効とする時間(秒)
  BotUserIDname: string; // このスクリプトBOTのcomment.data.userId
}

// ---------------------------------------------------

// CHARA:キャラクターJSONの型定義
export interface CHARAType {
  id: string; // キー名
  name: string; // キャラクターの名前
  frameId?: string; // わんコメの枠
  color: {
    "--lcv-name-color": string; // 名前の色
    "--lcv-text-color": string; // コメントの色
    "--lcv-background-color": string; // 背景色
  };
  image: {
    Default: string; // defaultは必須
    [key: string]: string; // 追加のキーに対応
  };
}
// ---------------------------------------------------
