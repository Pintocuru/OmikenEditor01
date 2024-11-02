// src/types.ts:型定義

// エディター用型定義

// AppState
export interface AppStateType {
  Omiken: OmikenEditType;
  CHARA: Record<string, CHARAEditType>;
  Preset: Record<string, PresetOmikenEditType>; // プリセットデータ
}

// Omiken:おみくじエディター用型定義
export interface OmikenEditType extends OmikenType {
  rulesOrder: string[]; // ルールの順序
  omikujiOrder: string[]; // おみくじの順序
  placeOrder: string[]; // プレースホルダーの順序
}

// xxxOrder用の型
export type OrderKey<T extends ListCategory> = `${T}Order`;

// ナビゲーション用カテゴリー
export type NaviCategory = ListCategory | "preset" | "preferences";

// リスト用カテゴリー
export type ListCategory = "rules" | "omikuji" | "place";
export type ListType = RulesType | OmikujiType | PlaceType;
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
  update?: T extends ListCategory ? EditerEntryTypeMap[T] : never; // 更新アイテム
  addKeys?: T extends ListCategory ? Partial<EditerTypeMap[T]>[] : never; // 新規追加アイテム(部分入力可)
  delKeys?: string[]; // 削除するアイテムのキー名
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
  item: Omit<OmikenEditType, "preferences">; // キャラデータ(preferences抜き)
  mode: "overwrite" | "append"; // 追加豊富(上書き/追加)
}

// ---------------------------------------------------

// Omibot:おみくじボット用型定義
export interface OmikenType {
  rules: Record<string, EditerTypeMap["rules"]>; // おみくじのルールを管理
  omikuji: Record<string, EditerTypeMap["omikuji"]>; // おみくじ関連のメッセージ
  place: Record<string, EditerTypeMap["place"]>; // プレースホルダー
  preferences: PreferencesType;
}

// コンテンツの型マッピング
export type EditerTypeMap = {
  rules: RulesType;
  omikuji: OmikujiType;
  place: PlaceType;
};
export type EditerEntryTypeMap = {
  rules: Record<string, RulesType>;
  omikuji: Record<string, OmikujiType>;
  place: Record<string, PlaceType>;
};

// 基本となる項目のインターフェース
interface BaseType {
  id: string; // キー名
  name: string; // ルール名
  description: string; // 説明文
}

// rules:おみくじルールの型定義
export interface RulesType extends BaseType {
  enabledIds: string[]; // omikujiの適用するIDリスト
  matchStartsWith: string[]; // 特定のフレーズで始まるキーワード（省略可）
  threshold: ThresholdType; // 発動条件
}

// おみくじメッセージの型定義
export interface OmikujiType extends BaseType {
  weight: number; // 出現割合
  threshold: ThresholdType; // 発動条件
  post: OmikujiPostType[];
}

// 発動条件を設定する型定義
export interface ThresholdType {
  conditionType: ConditionType; // condition選択用
  access?: AccessLevel; // ユーザーの役職
  syoken?: SyokenType; // 初見・久しぶり
  match?: string[]; // 追加キーワード
  time?: TimeCondition;
  elapsed?: ElapsedCondition;
  count?: CountCondition;
  gift?: GiftCondition;
}

// condition選択用
export enum ConditionType {
  NONE = "none", // 制限なし
  ACCESS = 'access', // 
  SYOKEN = 'syoken',
  MATCH = 'match',
  TIME = "time",
  ELAPSED = "elapsed",
  COUNT = "count",
  GIFT = "gift",
}

// 初見・コメント履歴の種別
export enum SyokenType {
  SYOKEN = "syoken", // 初見
  HI = "hi", // その配信枠で1回目のコメント
  AGAIN = "again", // 前回のコメントから7日以上経過
}

// ルールの有効/無効 0:OFF/1:だれでも/2:メンバー/3:モデレーター/4:管理者
export enum AccessLevel {
  OFF = 0,
  ANYONE = 1,
  MEMBER = 2,
  MODERATOR = 3,
  ADMIN = 4,
}

// 共通の定義
export type ComparisonType = "min" | "max" | "range" | "equal" | "loop";
export interface BaseCondition {
  isEnabled: boolean;
  value1: number;
  value2?: number;
}

// time:時間指定(0-23時)
export interface TimeCondition extends BaseCondition {
  type: ConditionType.TIME;
  comparison: Extract<ComparisonType, "range">;
}

// second: 投稿してからの時間(interval:ミリ秒)
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

// ギフト金額
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
