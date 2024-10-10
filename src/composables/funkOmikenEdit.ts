// src/composables/funkOmikenEdit.ts
import { reactive, ref, computed } from 'vue';
import type { DefaultState, OmikujiMessage, omikujiRule, Post, Placeholder } from '../types';
import type { SelectedItem, ItemType } from '../AppTypes';
/*

アイテムの編集機能を担当
useOmikujiEditor: おみくじアイテムの編集機能を提供
useRuleEditor: ルールの編集機能を提供（新規追加）#TODO
useRandomItemEditor: ランダムアイテムの編集機能を提供（新規追加）#TODO
*/

export function useOmikujiEditor(initialOmikuji: OmikujiMessage | null) {
 // おみくじデータを保持するref
 const omikuji = ref<OmikujiMessage | null>(initialOmikuji);

 // メッセージタイプの配列
 const messageTypes = ["message", "party", "toast", "speech"] as const;
 type MessageType = (typeof messageTypes)[number];

 // フィルタリング基準の選択肢
 const thresholdTypes = [
  { text: "なし", value: "none" },
  { text: "配信枠のコメント番号(lc)", value: "lc" },
  { text: "配信枠の個人コメント数(no)", value: "no" },
  { text: "総数の個人コメント数(tc)", value: "tc" },
  { text: "投稿してからの時間(interval*1000*60*60)", value: "hour" },
  { text: "ギフト金額(price)", value: "price" },
  { text: "その他(script参照)", value: "custom" },
 ];

 // 比較方法の選択肢
 const comparisonItems = [
  { text: "以下", value: -1 },
  { text: "等しい", value: 0 },
  { text: "以上", value: 1 },
  { text: "ループ", value: 2 },
 ];

 // 新しいメッセージを追加する関数
 const addPost = (type: MessageType) => {
  if (!omikuji.value) return;
  if (!Array.isArray(omikuji.value[type])) {
   omikuji.value[type] = [];
  }
  (omikuji.value[type] as Post[]).push({
   botKey: 0,
   iconKey: "",
   delaySeconds: 0,
   content: "",
  });
 };

 // メッセージを削除する関数
 const removePost = (type: MessageType, index: number) => {
  if (!omikuji.value) return;
  (omikuji.value[type] as Post[])?.splice(index, 1);
 };

 // おみくじを保存する関数
 const saveOmikuji = (updateState: (type: ItemType, newData: any) => void, closeDialog: () => void, state: any) => {
  updateState('omikuji', state);
  closeDialog();
 };

 return {
  omikuji,
  messageTypes,
  thresholdTypes,
  comparisonItems,
  addPost,
  removePost,
  saveOmikuji,
 };
}