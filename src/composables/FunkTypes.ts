// src/composables/FunkTypes.ts

import { computed, inject, Ref } from 'vue';
import { AppEditorType, ListCategory, OmikenType, OmikenTypeMap, OmikujiType, PlaceType, RulesType, TypesType } from '@type';

// タイプの説明マップ
type TypeDescription = {
  [K in TypesType]: {
   icon: string;
    title: string;
    description: string;
  };
};
const TYPE_DESCRIPTIONS: TypeDescription = {
  comment: {
    icon: 'mdi-comment-outline',
    title: 'Comment',
    description: 'コメントによって反応します',
  },
  timer: {
    icon: 'mdi-timer-outline',
    title: 'Timer',
    description: '時間毎に反応します',
  },
  meta: {
    icon: 'mdi-information-outline',
    title: 'Meta',
    description: '高評価や、視聴数によって反応します',
  },
  waitingList: {
    icon: 'mdi-format-list-bulleted',
    title: 'Waiting List',
    description: '参加希望リストが変化すると反応します',
  },
  setList: {
    icon: 'mdi-checkbox-multiple-marked-outline',
    title: 'Set List',
    description: 'セットリストが変化すると反応します',
  },
  reactions: {
    icon: 'mdi-emoticon-outline',
    title: 'Reactions',
    description: 'WordPartyが起動すると反応します',
  },
  unused: {
    icon: 'mdi-cancel',
    title: 'Unused',
    description: 'このリストのルールは使用されません',
  },
};

export function FunkTypes() {
  
 // 型ガード関数
 function isListType<K extends ListCategory>(
  obj: unknown,
  category: K
 ): obj is OmikenTypeMap[K] | Record<string, OmikenTypeMap[K]> {
  if (!obj || typeof obj !== 'object') return false;

  if (category === 'rules') {
   const isRule = (v: unknown): v is RulesType =>
    typeof v === 'object' && v !== null && 'name' in v && 'enableIds' in v && 'threshold' in v;
   return isRule(obj) || Object.values(obj).every(isRule);
  }

  if (category === 'omikujis') {
   const isOmikuji = (v: unknown): v is OmikujiType =>
    typeof v === 'object' && v !== null && 'rank' in v && 'weight' in v && 'post' in v;
   return isOmikuji(obj) || Object.values(obj).every(isOmikuji);
  }

  if (category === 'places') {
   const isPlace = (v: unknown): v is PlaceType =>
    typeof v === 'object' && v !== null && 'values' in v && Array.isArray((v as PlaceType).values);
   return isPlace(obj) || Object.values(obj).every(isPlace);
  }
  return false;
 }

 return {
  TYPE_DESCRIPTIONS,
  isListType,
 };
}

