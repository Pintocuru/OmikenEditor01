// src/composables/funkOmikenJSON.ts
import { reactive, ref, computed } from 'vue';
import type { DefaultState, OmikujiMessage, omikujiRule, Post, Placeholder } from '../types';
import type { SelectedItem, ItemType } from '../AppTypes';
/*
JSONデータの操作を担当
useDataFetcher: JSONデータの読み込み機能を提供
useDataSaver: JSONデータの保存機能を提供
*/


// データ読み込み
export function useDataFetcher() {
 const loading = ref(false);
 const DEFAULT_RULES: omikujiRule[] = [
  {
   name: "デフォルトおみくじ",
   modes: "default",
   modeSelect: ["0"],
   switch: 1,
   matchExact: ["おみくじ"],
   matchStartsWith: [],
   matchIncludes: []
  }
 ];

 const fetchData = async (STATE: DefaultState) => {
  try {
   loading.value = true;
   const response = await fetch('/src/state.json');
   if (!response.ok) {
    throw new Error('Network response was not ok: ' + response.statusText);
   }
   const data = await response.json();

   // データの検証と正規化
   const validatedData: DefaultState = {
    defaultRules: data.defaultRules || DEFAULT_RULES,
    rules: Array.isArray(data.rules) ? validateRules(data.rules) : [],
     omikuji: Array.isArray(data.omikuji) ? validateOmikujiMessages(data.omikuji) : [],
    placeholder: Array.isArray(data.placeholder) ? validateRandomItems(data.placeholder) : []
   };

   Object.assign(STATE, validatedData);
  } catch (error) {
   console.error('Error fetching data:', error);
  } finally {
   loading.value = false;
  }
 };

 return {
  loading,
  fetchData
 };
}


// 各データ型の検証関数
function validateRules(rules: any[]): omikujiRule[] {
 // ルールの検証ロジックを実装
 return rules.map(rule => ({
  // おみくじルール名
  name: typeof rule.name === 'string' ? rule.name : 'おみくじ',
  // モード(引数で渡す値)
  modes: typeof rule.modes === 'string' ? rule.modes : 'none',
  // モードのリスト
  modeSelect: Array.isArray(rule.modeSelect) ? rule.modeSelect.filter((item: any) => typeof item === 'string') : ['none'],
  // ルールの有効/無効 0:OFF/1:だれでも/2:メンバー以上/3:モデレーター/4:管理者
  switch: [0, 1, 2, 3, 4].includes(rule.switch) ? rule.switch : 0,
  // 完全一致するキーワードの配列（省略可）
  matchExact: Array.isArray(rule.matchExact) ? rule.matchExact.filter((item: any) => typeof item === 'string') : undefined,
  // 特定のフレーズで始まるキーワード（省略可）
  matchStartsWith: Array.isArray(rule.matchStartsWith) ? rule.matchStartsWith.filter((item: any) => typeof item === 'string') : undefined,
  // 部分一致するキーワード（省略可）
  matchIncludes: Array.isArray(rule.matchIncludes) ? rule.matchIncludes.filter((item: any) => typeof item === 'string') : undefined,
 }));
}

function validateOmikujiMessages(messages: any[]): OmikujiMessage[] {
 // おみくじメッセージの検証ロジックを実装
 return messages.map(msg => ({
  // おみくじの結果名(「大吉」など)
  name: typeof msg.name === 'string' ? msg.name : '大吉',
  // メッセージの重み付け
  weight: typeof msg.weight === 'number' || typeof msg.weight === 'string'
   ? Math.abs(parseInt(msg.weight)) || 1
   : 1,
  // フィルタリング基準
  threshold: {
   // タイプ
   type: ['none', 'time', 'lc', 'no', 'tc', 'second', 'minute', 'hour', 'day', 'price', 'custom'].includes(msg.threshold?.type) ? msg.threshold.type : 'none',
   // 基準となる数値
   value: typeof msg.threshold?.value === 'number' ? Math.abs(msg.threshold.value) : 0,
   valueMax: typeof msg.threshold?.valueMax === 'number' ? Math.abs(msg.threshold.valueMax) : 0,
   // 比較方法
   comparison: ['min', 'equal', 'max', 'loop', 'range'].includes(msg.threshold?.comparison) ? msg.threshold.comparison : 'equal',
  },
  // メッセージの投稿情報 message:わんコメ party:WordParty toast:トースト speech:わんコメspeech
  message: Array.isArray(msg.message) ? validatePosts(msg.message) : undefined,
  party: Array.isArray(msg.party) ? validatePosts(msg.party) : undefined,
  toast: Array.isArray(msg.toast) ? validatePosts(msg.toast) : undefined,
  speech: Array.isArray(msg.speech) ? validatePosts(msg.speech) : undefined,
 }));
}
function validatePosts(posts: any[]): Post[] {
 return posts.map(post => ({
  // キャラクターのキー名
  botKey: typeof post.botKey === 'number' ? post.botKey : undefined,
  // キャラクターのアイコン名
  iconKey: typeof post.iconKey === 'string' ? post.iconKey : undefined,
  // メッセージを送信するまでの遅延時間
  delaySeconds: typeof post.delaySeconds === 'number' ? post.delaySeconds : 0,
  // メッセージ内容
  content: typeof post.content === 'string' ? post.content : '',
 }));
}

function validateRandomItems(items: any[]): Placeholder[] {
 // ランダムアイテムの検証ロジックを実装
 return items.map(item => ({
  // プレースホルダー名
  name: typeof item.name === 'string' ? item.name : '<<random>>',
  // ランダム選択時の重み付け
  weight: typeof item.weight === 'number' ? Math.abs(item.weight) : 1,
  // グループ番号
  group: typeof item.group === 'number' ? item.group : 0,
  // メッセージ内容
  content: typeof item.content === 'string' ? item.content : '',
 }));
}



// データ保存
export function useDataSaver() {
 const saveStatus = ref('');
 const showSnackbar = ref(false);

 const saveData = async (STATE: DefaultState) => {
  try {
   saveStatus.value = 'Saving...';
   const response = await fetch('/src/state.json', {
    method: 'POST',
    headers: {
     'Content-Type': 'application/json',
    },
    body: JSON.stringify(STATE)
   });
   if (!response.ok) {
    throw new Error('Network response was not ok');
   }
   saveStatus.value = 'Saved successfully!';
   showSnackbar.value = true;
  } catch (error) {
   console.error('Error saving data:', error);
   saveStatus.value = 'Error saving data';
   showSnackbar.value = true;
  }
 };

 return {
  saveData,
  saveStatus,
  showSnackbar
 };
}