<!-- src/components/OmikujiEditor.vue -->
<template>
  <v-list>
    <v-list-item>
      <v-row>
        <v-col cols="12">
          <v-text-field v-model.number="localOmikuji.weight" label="出現比" type="number"></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-select v-model="localOmikuji.threshold.type" :items="thresholdTypes" label="種類"></v-select>
        </v-col>
      </v-row>
      <v-row v-show="localOmikuji.threshold.type !== 'none'">
        <v-col cols="4">
          <v-text-field v-model.number="localOmikuji.threshold.value" label="閾値" type="number"></v-text-field>
        </v-col>
        <v-col cols="4">
          <v-select v-model="localOmikuji.threshold.comparison" :items="comparisonItems" label="比較方法"></v-select>
        </v-col>
        <v-col cols="4">
          <v-switch v-model="localOmikuji.threshold.loop" label="ループ"></v-switch>
        </v-col>
      </v-row>

      <v-expansion-panels>
        <v-expansion-panel v-for="(type, index) in messageTypes" :key="index">
          <v-expansion-panel-title>{{ capitalize(type) }}メッセージ</v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-btn @click="addPost(type)" color="primary" small class="mb-2">追加</v-btn>
            <v-list>
              <v-list-item v-for="(post, postIndex) in localOmikuji[type]" :key="postIndex">
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
                    <v-btn @click="removePost(type, postIndex)" color="error" small>削除</v-btn>
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
import { PropType, ref, watch } from 'vue';
import type {  OmikujiMessage, Post } from '../types';

// 追加：メッセージタイプの型を定義
type MessageType = 'message' | 'party' | 'toast' | 'speech';
const messageTypes: MessageType[] = ['message', 'party', 'toast', 'speech'];


// コンポーネントのプロパティ定義
const props = defineProps<{
  omikuji: OmikujiMessage
}>();

const emit = defineEmits<{
  (e: 'update:omikuji', value: OmikujiMessage): void
}>();

const localOmikuji = ref<OmikujiMessage>({ ...props.omikuji });

const thresholdTypes = ['none', 'tc', 'lc', 'price', 'custom'];
const comparisonItems = [
  { text: '以下', value: -1 },
  { text: '等しい', value: 0 },
  { text: '以上', value: 1 }
];

//
watch(localOmikuji, (newValue) => {
  emit('update:omikuji', newValue);
}, { deep: true });

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
  (localOmikuji.value[type] as Post[])?.splice(index, 1);
};

// 文字列の先頭を大文字にする関数
const capitalize = (value: string): string => {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
};
</script>