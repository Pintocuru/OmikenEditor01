<!-- src/components/OmikujiEditor.vue -->
<template>
  <v-list>
    <v-list-item>
      <v-row>
        <v-col cols="12">
          <v-text-field v-model.number="omikuji.weight" label="出現比" type="number"></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-text-field v-model.number="omikuji.threshold.type" label="種類"></v-text-field>
        </v-col>
      </v-row>
      <v-row :v-show="omikuji.threshold.type !=='none'">
        <v-col cols="4">
          <v-text-field v-model.number="omikuji.threshold.value" label="閾値" type="number"></v-text-field>
        </v-col>
        <v-col cols="4">
          <v-select v-model="omikuji.threshold.comparison" :items="[
            { text: '以下', value: -1 },
            { text: '等しい', value: 0 },
            { text: '以上', value: 1 }
          ]" label="比較方法"></v-select>
        </v-col>
        <v-col cols="4">
          <v-switch v-model="omikuji.threshold.loop" label="ループ"></v-switch>
        </v-col>
      </v-row>

      <v-expansion-panels>
        <v-expansion-panel v-for="(type, index) in ['message', 'party', 'toast', 'speech']" :key="index">
          <template v-slot:title>{{ capitalize(type) }}メッセージ</template>
          <v-expansion-panel-text>
            <v-btn @click="addPost(type as MessageType)" color="primary" small class="mb-2">追加</v-btn>
            <v-list>
              <v-list-item v-for="(post, postIndex) in omikuji[type as MessageType]" :key="postIndex">
                <v-row>
                  <template v-if="type === 'message' || type === 'toast'">
                    <v-col cols="12" sm="6" md="3">
                      <v-text-field v-model.number="post.botKey" label="ボットキー" type="number"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="3">
                      <v-text-field v-model="post.iconKey" label="アイコンキー"></v-text-field>
                    </v-col>
                  </template>
                  <v-col cols="12" sm="6" md="3">
                    <v-text-field v-model.number="post.delaySeconds" label="遅延時間(秒)" type="number"></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-textarea v-model="post.content" label="内容"></v-textarea>
                  </v-col>
                  <v-col cols="12">
                    <v-btn @click="removePost(type as MessageType, postIndex)" color="error" small>削除</v-btn>
                  </v-col>
                </v-row>
              </v-list-item>
            </v-list>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import type {  OmikujiMessage, Post } from '../types';

// 追加：メッセージタイプの型を定義
type MessageType = 'message' | 'party' | 'toast' | 'speech';

// コンポーネントのプロパティ定義
const props = defineProps({
  omikuji: {
    type: Object as PropType<OmikujiMessage>,
    required: true
  }
});

// 新しい投稿を追加する関数
const addPost = (type: MessageType) => {
  if (!Array.isArray(props.omikuji[type])) {
    props.omikuji[type] = [];
  }
  (props.omikuji[type] as Post[]).push({
    botKey: 0,
    iconKey: '',
    delaySeconds: 0,
    content: ''
  });
};

// 指定された投稿を削除する関数
const removePost = (type: MessageType, index: number) => {
  (props.omikuji[type] as Post[])?.splice(index, 1);
};

// 文字列の先頭を大文字にする関数
const capitalize = (value: string): string => {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
};
</script>