// DefaultStateインターフェース: 全体の設定を管理する
export interface DefaultState {
  defaultRules: omikujiRule[];  // プリセットルール
  rules: omikujiRule[];  // おみくじのルールを管理
  botMessage: {
    omikuji: OmikujiMessage[];  // おみくじ関連のメッセージ
    random: RandomItem[];  // 
  };
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
  weight: number;  // メッセージの重み付け
  threshold: {
    type: 'none' | 'tc' | 'lc' | 'price' | 'custom'; // 何の値を見るか
    value: number;  // 閾値の値
    loop: boolean;  // ループ処理するか
    comparison: -1 | 0 | 1;  // 比較方法（例: -1 は以下、1 は以上、0 は等しい）
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

// ランダムメッセージ項目の型定義
export interface RandomItem {
  tag: string; // タグ
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