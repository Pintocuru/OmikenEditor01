// src/composables/FunkTypes.ts

import { computed, inject, Ref } from 'vue';
import { AppEditorType, OmikenType, TypesType } from '@type';

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
 // inject
 const AppEditor = inject<Ref<AppEditorType>>('AppEditorKey');
 const omikuji = computed(() => AppEditor?.value.Omiken.omikujis ?? {});


 return {
  TYPE_DESCRIPTIONS
 };
}
