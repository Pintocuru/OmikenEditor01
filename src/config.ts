// src/config.ts

// 設定
export const configs: ConfigProps = {
 // プラグイン名
 PLUGIN_UID: import.meta?.env?.VITE_PLUGIN_UID || window.APP_CONFIG?.PLUGIN_UID || 'OmikenPlugin01',
 // BotのuserId
 BOT_USER_ID: import.meta?.env?.VITE_BOT_USER_ID || window.APP_CONFIG?.BOT_USER_ID || 'FirstCounter'
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
  APP_CONFIG?: ConfigProps;
 }
}
