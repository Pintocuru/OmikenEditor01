// types.ts:型指定

// DefaultStateインターフェース: 全体の設定を管理する
export interface DefaultState {
  defaultRules: omikujiRule[];  // プリセットルール
  rules: omikujiRule[];  // おみくじのルールを管理
  omikuji: OmikujiMessage[];  // おみくじ関連のメッセージ
  placeholder: Placeholder[];  // プレースホルダー
}

// おみくじルールの型定義
export interface omikujiRule {
  name: string;  // ルール名（例: "おみくじ"）
  modes: string;  // モード
  modeSelect: string[]; // モードセレクト
  switch: 0 | 1 | 2 | 3 |4;  // ルールの有効/無効 0:OFF/1:だれでも/2:メンバー以上/3:モデレーター/4:管理者
  matchExact?: string[];  // 完全一致するキーワードの配列（省略可）
  matchStartsWith?: string[];  // 特定のフレーズで始まるキーワード（省略可）
  matchIncludes?: string[];  // 部分一致するキーワード（省略可）
}

// おみくじメッセージの型定義
export interface OmikujiMessage {
  name: string;  // 結果名
  weight: number;  // メッセージの重み付け
  threshold: { // フィルタリング基準
    // none:基準なし time:時間指定(0-23時) lc:配信枠のコメント番号 no:配信枠の個人コメント数
    // tc:総数の個人コメント数 hour:投稿してからの時間(interval*1000*60*60)
    // minute: 投稿してからの分(interval*1000*60) second: 投稿してからの秒(interval*1000)
    // day: 投稿してからの日数(interval*1000*60*60*24) price:ギフト金額 custom:その他(script参照)
    type:
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
    value: number;  // 基準となる値（必須）
    valueMax: number;  // 基準となる最大値（オプション）
    comparison: // 比較方法
    | 'min' // min:以下
    | 'equal' // equal:等しい
    | 'max' // max:以上
    | 'loop' // loop:ループ
    | 'range'; // range:範囲
  };
  message?: Post[];  // 通常メッセージ（省略可）
  party?: Post[];  // パーティーメッセージ（省略可）
  toast?: Post[];  // トースト通知メッセージ（省略可）
  speech?: Post[];  // スピーチ用メッセージ（省略可）
}

// メッセージの投稿情報を管理する型
export interface Post {
  botKey?: number;  // ボットキー（省略可）
  iconKey?: string;  // アイコンキー（省略可）
  delaySeconds: number;  // メッセージを送信するまでの遅延時間
  content: string;  // メッセージ内容
}

// プレースホルダー項目の型定義
export interface Placeholder {
  name: string; // プレースホルダー名
  weight: number;  // ランダム選択時の重み付け
  group: number;  // グループ番号
  content: string;  // メッセージ内容
}

// ---------------------------------------------------

// キャラクターJSONの型定義
export interface CharaStyles {
  character: {
    [key: string]: {
      id: string; // ?キー名(必要だろうか?)
      name: string; // キャラクターの名前
      frameId?: string; // わんコメの枠を指定
      "--lcv-name-color": string; // 名前の色
      "--lcv-text-color": string; // コメントの色
      "--lcv-background-color": string; // 背景色
    };
  }
  characterImage: {
    [key: string]: {
      Default: string; // defaultは必須
      [key: string]: string; // 追加のキーに対応
    };
  }
}