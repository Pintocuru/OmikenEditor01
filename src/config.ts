// src/config.ts

// 現在のURLからルートディレクトリ名を取得
const url = new URL(window.location.href);
const pathParts = url.pathname.split('/');
const rootDirName = pathParts[pathParts.length - 2];
// 設定
export const configs: ConfigProps = {
 // プラグイン名
 PLUGIN_UID: import.meta?.env?.VITE_PLUGIN_UID || rootDirName || 'OmikenPlugin01',
 // BotのuserId
 BOT_USER_ID: import.meta?.env?.VITE_BOT_USER_ID || 'FirstCounter'
};

// --------------------------------------------------

// 共通型: 設定プロパティ
export interface ConfigProps {
 PLUGIN_UID: string;
 BOT_USER_ID: string;
}

// グローバル変数の型定義 (window.APP_CONFIG用)
declare global {
 interface Window {
  CONFIG?: ConfigProps;
 }
}
