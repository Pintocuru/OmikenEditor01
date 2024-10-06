<!-- src/components/OmikujiEditor.vue -->
<template>
  <v-card v-if="omikuji">
    <v-card-title>おみくじエディタ</v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" sm="6">
          <v-text-field v-model.number="omikuji.weight" label="出現比" type="number"></v-text-field>
        </v-col>
        <v-col cols="12" sm="6">
          <v-select v-model="omikuji.threshold.type" :items="thresholdTypes" label="閾値種類"></v-select>
        </v-col>
      </v-row>

      <v-row v-if="omikuji.threshold.type !== 'none'">
        <v-col cols="12" sm="4">
          <v-text-field v-model.number="omikuji.threshold.value" label="閾値" type="number"></v-text-field>
        </v-col>
        <v-col cols="12" sm="4">
          <v-select v-model="omikuji.threshold.comparison" :items="comparisonItems" label="比較方法"></v-select>
        </v-col>
        <v-col cols="12" sm="4">
          <v-switch v-model="omikuji.threshold.loop" label="ループ"></v-switch>
        </v-col>
      </v-row>

      <v-expansion-panels>
        <v-expansion-panel v-for="type in messageTypes" :key="type">
          <v-expansion-panel-title>{{ type }}メッセージ</v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-btn @click="addPost(type)" color="primary" small class="mb-2">追加</v-btn>
            <v-list>
              <v-list-item v-for="(post, index) in omikuji[type]" :key="index">
                <v-row>
                  <v-col v-if="['message', 'toast'].includes(type)" cols="12" sm="6">
                    <v-text-field v-model.number="post.botKey" label="ボットキー" type="number"></v-text-field>
                  </v-col>
                  <v-col v-if="['message', 'toast'].includes(type)" cols="12" sm="6">
                    <v-text-field v-model="post.iconKey" label="アイコンキー"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field v-model.number="post.delaySeconds" label="遅延時間(秒)" type="number"></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-textarea v-model="post.content" label="内容"></v-textarea>
                  </v-col>
                  <v-col cols="12">
                    <v-btn @click="removePost(type, index)" color="error" small>削除</v-btn>
                  </v-col>
                </v-row>
              </v-list-item>
            </v-list>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>
  </v-card>
  <v-alert v-else type="warning">おみくじが選択されていません。</v-alert>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { OmikujiMessage, Post } from '../types';

const props = defineProps<{
  selectedOmikuji: OmikujiMessage | null;
}>();

const emit = defineEmits<{
  (e: 'update:omikuji', value: OmikujiMessage): void;
}>();

const omikuji = ref<OmikujiMessage | null>(null);

watch(() => props.selectedOmikuji, (newValue) => {
  omikuji.value = newValue ? JSON.parse(JSON.stringify(newValue)) : null;
}, { immediate: true, deep: true });

watch(omikuji, (newValue) => {
  // 変更があった場合のみ emit を実行
  if (newValue && JSON.stringify(newValue) !== JSON.stringify(props.selectedOmikuji)) {
    emit('update:omikuji', newValue);
  }
}, { deep: true });

const messageTypes = ['message', 'party', 'toast', 'speech'] as const;
type MessageType = typeof messageTypes[number];

const thresholdTypes = [
  { text: 'なし', value: 'none' },
  { text: 'TC', value: 'tc' },
  { text: 'LC', value: 'lc' },
  { text: '価格', value: 'price' },
  { text: 'カスタム', value: 'custom' }
];

const comparisonItems = [
  { text: '以下', value: -1 },
  { text: '等しい', value: 0 },
  { text: '以上', value: 1 }
];

const addPost = (type: MessageType) => {
  if (!omikuji.value) return;
  if (!Array.isArray(omikuji.value[type])) {
    omikuji.value[type] = [];
  }
  (omikuji.value[type] as Post[]).push({
    botKey: 0,
    iconKey: '',
    delaySeconds: 0,
    content: ''
  });
};

const removePost = (type: MessageType, index: number) => {
  if (!omikuji.value) return;
  (omikuji.value[type] as Post[])?.splice(index, 1);
};
</script>