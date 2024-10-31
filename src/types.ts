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

// 基本となるカテゴリー
type BaseCategory = 'rules' | 'omikuji' | 'place';
export type EditerType = RulesType | OmikujiType | PlaceType;

// xxxOrder用の型
export type OrderKey<T extends BaseCategory> = `${T}Order`;

// ナビゲーション用カテゴリー
export type NaviCategory = BaseCategory | 'preset' | 'preferences';

// リスト用カテゴリー
export type ListCategory = BaseCategory;
export type ListEntry<T extends ListCategory> = {
  isOpen: boolean; // ダイアログの開閉状態
  type: T;
  item: Record<string, EditerTypeMap[T]> | null; // 表示するアイテム(単独または複数)
  mode?: string | null; // 複数の際の表示モード(omikujiで出現割合を複数調整する時に使う)
};
// listEntry全体の型 
export type ListEntries = {
  [K in ListCategory]: ListEntry<K>;
};

// ファイル操作用
export type OmikenCategory = BaseCategory | 'preset' | 'preferences';
export type OmikenEntry<T extends OmikenCategory> = {
  type: T;
  update?: T extends BaseCategory ? Record<string, EditerTypeMap[T]> : never; // 更新アイテム
  addKeys?: T extends BaseCategory ? Partial<EditerTypeMap[T]>[] : never // 新規追加アイテム(部分入力可)
  delKeys?: string[]; // 削除するアイテムのキー名
  reorder?: T extends BaseCategory ? string[] : never; // 順番の指定
  preset?: T extends 'preset' ? Record<string, PresetOmikenEditType> : never; // プリセット用
  preferences?: T extends 'preferences' ? PreferencesType : never; // 設定用
} | null;

// JSON読み込み用
export interface fetchJSONType {
  id: string;
  name: string;
  description: string;
  type: 'Omiken' | 'CHARA';
  path: string;
  banner: string;
}

// Edit用キャラデータ
export interface CHARAEditType extends fetchJSONType {
  item: CHARAType; // キャラデータ
}
export interface PresetOmikenEditType extends fetchJSONType {
  item: Omit<OmikenEditType, 'preferences'>; // キャラデータ(preferences抜き)
}


// ---------------------------------------------------


// Omibot:おみくじボット用型定義
export interface OmikenType {
  rules: Record<string, EditerTypeMap['rules']>; // おみくじのルールを管理
  omikuji: Record<string, EditerTypeMap['omikuji']>; // おみくじ関連のメッセージ
  place: Record<string, EditerTypeMap['place']>; // プレースホルダー
  preferences: PreferencesType;
}

// コンテンツの型マッピング
export type EditerTypeMap = {
  rules: RulesType;
  omikuji: OmikujiType;
  place: PlaceType;
}

// 基本となる項目のインターフェース
interface BaseType {
  id: string; // キー名
  name: string; // ルール名
  description: string; // 説明文
}

// rules:おみくじルールの型定義
export interface RulesType extends BaseType {
  switch: AccessLevel; // ルールの有効/無効レベル
  enabledIds: string[]; // omikujiの適用するIDリスト
  matchExact: string[]; // 完全一致するキーワードの配列（省略可）
  matchStartsWith: string[]; // 特定のフレーズで始まるキーワード（省略可）
  matchIncludes: string[]; // 部分一致するキーワード（省略可）
}

// ルールの有効/無効 0:OFF/1:だれでも/2:メンバー/3:モデレーター/4:管理者
export enum AccessLevel {
  OFF = 0,
  ANYONE = 1,
  MEMBER = 2,
  MODERATOR = 3,
  ADMIN = 4,
}

// おみくじメッセージの型定義
export interface OmikujiType extends BaseType {
  weight: number; // 出現割合
  threshold: thresholdType;
  post: OmikujiPostType[];
}

export interface thresholdType {
  isSyoken: boolean; // isSyoken:初見かどうか。これがONなら、下記は設定不可
  time: { // time:時間指定(0-23時)
    isEnabled: boolean;
    value1: number;
    value2: number;
  }
  elapsed: {
    isEnabled: boolean;
    unit:
    | 'second' // second: 投稿してからの秒(interval*1000)
    | 'minute' // minute: 投稿してからの分(interval*1000*60)
    | 'hour' // hour:投稿してからの時間(interval*1000*60*60)
    | 'day' // day: 投稿してからの日数(interval*1000*60*60*24)
    value1: number;
    value2: number;
    comparison: // 比較方法
    | 'min' // min:以下
    | 'max' // max:以上
    | 'range'; // range:範囲
  }
  count: {
    isEnabled: boolean;
    unit:
    | 'lc' // lc:配信枠のコメント番号
    | 'no' // no:配信枠の個人コメント数
    | 'tc' // tc:総数の個人コメント数
    value1: number;
    value2: number;
    comparison: // 比較方法
    | 'min' // min:以下
    | 'equal' // equal:等しい
    | 'max' // max:以上
    | 'loop' // loop:ループ
    | 'range'; // range:範囲
  }
  gift: {
    isEnabled: boolean;
    value1: number;
    value2: number;
    comparison: // 比較方法
    | 'min' // min:以下
    | 'equal' // equal:等しい
    | 'max' // max:以上
    | 'range'; // range:範囲
  }
}

// メッセージの投稿情報を管理する型
export interface OmikujiPostType {
  type:
  | 'onecomme' // わんコメへの投稿
  | 'party' // WordPartyの投稿
  | 'toast' // トースト投稿
  | 'speech'; // わんコメのスピーチ機能
  botKey: string; // ボットキー
  iconKey: string; // アイコンキー
  delaySeconds: number; // メッセージを送信するまでの遅延時間
  content: string; // メッセージ内容
}

// プレースホルダー項目の型定義
export interface PlaceType extends BaseType {
  isWeight: boolean; // モード
  values: PlaceValueType[];  // 値の配列
}

// プレースホルダーの値
export type PlaceValueType = {
  weight: number; // 出現割合
  value: string; // 値（他のプレースホルダーへの参照可能: <<place_name>>）
}

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
  },
  image: {
    Default: string; // defaultは必須
    [key: string]: string; // 追加のキーに対応
  }
}

// キャラクターJSON（編集時）
export interface CharaStyleType {
  id: string; // キー名（編集時に変更可能）
  name: string; // キャラクターの名前
  frameId?: string; // わんコメの枠を指定
  color: {
    "--lcv-name-color": string; // 名前の色
    "--lcv-text-color": string; // コメントの色
    "--lcv-background-color": string; // 背景色
  },
  images: Array<{ // 画像は配列で管理
    key: string; // 画像のキー名
    path: string; // 画像のパス
  }>;
}

// ---------------------------------------------------
