// src/types.ts:型指定

// STATE:おみくじBOTのJSONの型定義
export interface STATEType {
  rules: Record<string, rulesType>;      // おみくじのルールを管理
  omikuji: Record<string, omikujiType>;  // おみくじ関連のメッセージ
  place: Record<string, placeType>;       // プレースホルダー
  rulesOrder: string[];                   // ルールの順序
  omikujiOrder: string[];                 // おみくじの順序
  placeOrder: string[];                   // プレースホルダーの順序
}

// おみくじルールの型定義
export interface rulesType {
  id: string; // キー名
  name: string;  // ルール名（例: "おみくじ"）
  switch: 0 | 1 | 2 | 3 | 4;  // ルールの有効/無効 0:OFF/1:だれでも/2:メンバー/3:モデレーター/4:管理者
  disabledIds?: string[]; // omikujiの適用しないIDリスト
  matchExact?: string[];  // 完全一致するキーワードの配列（省略可）
  matchStartsWith?: string[];  // 特定のフレーズで始まるキーワード（省略可）
  matchIncludes?: string[];  // 部分一致するキーワード（省略可）
}

// おみくじメッセージの型定義
export interface omikujiType {
  id: string; // キー名
  name: string;  // 結果名
  weight: number;  // メッセージの重み付け
  threshold: {
    type: thresholdType; // フィルタリング基準
    value: number;  // 基準となる値（必須）
    valueMax: number;  // 基準となる最大値（オプション）
    comparison: // 比較方法
    | 'min' // min:以下
    | 'equal' // equal:等しい
    | 'max' // max:以上
    | 'loop' // loop:ループ
    | 'range'; // range:範囲
  };
  post: postType[]; // 
}
export type thresholdType =
  | 'none' // none:基準なし
  | 'time' // time:時間指定(0-23時)
  | 'lc' // lc:配信枠のコメント番号
  | 'no' // no:配信枠の個人コメント数
  | 'tc' // tc:総数の個人コメント数
  | 'second' // second: 投稿してからの秒(interval*1000)
  | 'minute' // minute: 投稿してからの分(interval*1000*60)
  | 'hour' // hour:投稿してからの時間(interval*1000*60*60)
  | 'day' // day: 投稿してからの日数(interval*1000*60*60*24)
  | 'price' // price:ギフト金額
  | 'custom'; // custom:その他(script参照)


// メッセージの投稿情報を管理する型
export interface postType {
  type:
  | 'onecomme' // わんコメへの投稿
  | 'party' // WordPartyの投稿
  | 'toast' // トースト投稿
  | 'speech'; // わんコメのスピーチ機能
  botKey?: string;  // ボットキー（省略可）
  iconKey?: string;  // アイコンキー（省略可）
  delaySeconds: number;  // メッセージを送信するまでの遅延時間
  content: string;  // メッセージ内容
}

// プレースホルダー項目の型定義
export interface placeType {
  id: string; // キー名
  name: string; // プレースホルダー名
  weight: number;  // ランダム選択時の重み付け
  group: number;  // グループ番号
  content: string;  // メッセージ内容
}

// ---------------------------------------------------

// CHARA:キャラクターJSONの型定義
export interface CHARAType {
  [key: string]: {
    name: string; // キャラクターの名前
    frameId?: string; // わんコメの枠を指定
    color: {
      "--lcv-name-color": string; // 名前の色
      "--lcv-text-color": string; // コメントの色
      "--lcv-background-color": string; // 背景色
    },
    image: {
      Default: string; // defaultは必須
      [key: string]: string; // 追加のキーに対応
    }
  };
}

// キャラクターJSON（編集時）
export interface CharaStyleEdit {
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

// ファイル操作用型指定
export type SelectItem = {
  type: ItemCategory;
  items?: Record<string, ItemContent>; // ダイアログを開く際のアイテム
  update?: Record<string, ItemContent>; // 更新用アイテム
  addKeys?: Object[]; // 新規追加用アイテム
  delKeys?: string[]; // 削除するアイテムのキー名
  reorder?: string[]; // 再配置するアイテムのキー名
} | null;

export type ItemCategory = 'rules' | 'omikuji' | 'place';
export type ItemContent = rulesType | omikujiType | placeType;

export type EditorItem = {
  type: ItemCategory;
  item: Record<string, ItemContent>;
  mode?: string | null;
};
