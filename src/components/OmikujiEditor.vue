<!-- src/components/OmikujiEditor.vue -->
<template>
  <v-container v-if="editingItem">
    <v-card-text>
      <v-form @submit.prevent="editingItem">
        <!-- おみくじの基本情報 -->
        <v-row>
          <v-col cols="12">
            <v-text-field v-model="editingItem.name" label="結果名">
              <v-tooltip activator="parent" location="bottom">おみくじの結果の名称（ラベル）を入力してください。<br />
                例: 「大吉」「中吉」「小吉」など。</v-tooltip>
            </v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="3" sm="2">
            <v-text-field v-model.number="editingItem.weight" label="出現比" type="number" min="0" max="100">
              <v-tooltip activator="parent" location="bottom">ランダムに偏りをつける</v-tooltip>
            </v-text-field>
          </v-col>
          <v-col align-self="center">
            <v-progress-linear :model-value="sumWeightValues(editingItem.weight)" buffer-value="10" color="primary"
              height="35" striped>出現割合：{{
                sumWeightValues(editingItem.weight)
              }}
              %</v-progress-linear>
          </v-col>
        </v-row>

        <!-- フィルタリング基準の設定 -->
        <v-card>
          <v-toolbar color="primary" density="compact">
            <v-toolbar-title>フィルタリング設定</v-toolbar-title>
          </v-toolbar>
          <v-tooltip location="bottom">
            <template v-slot:activator="{ props }">
              <v-select v-bind="props" v-model="editingItem.threshold.type" :items="thresholdTypes" item-title="text"
                item-value="value" label="フィルタリング基準"></v-select>
            </template>
            <span>適用外の場合は抽選の対象にならない基準を設定します。</span>
          </v-tooltip>

          <v-row v-if="editingItem.threshold.type !== 'none'" class="auto">
            <v-col cols="12" sm="4">
              <v-select v-model="editingItem.threshold.comparison" :items="comparisonItems" item-title="text"
                item-value="value" label="比較方法"></v-select>
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field v-model.number="editingItem.threshold.value" label="基準値" type="number"
                min="0"></v-text-field>
            </v-col>
            <v-col cols="12" sm="4" v-if="editingItem.threshold.comparison === 'range'">
              <v-text-field v-model.number="editingItem.threshold.valueMax" label="基準値(最大)"
                type="number"></v-text-field>
            </v-col>
          </v-row>
        </v-card>

        <!-- メッセージタイプごとの設定 -->
        <v-card>
          <v-toolbar color="primary" density="compact">
            <v-toolbar-title>メッセージ設定</v-toolbar-title>
          </v-toolbar>
          <v-tabs v-model="activeTab">
            <v-tab v-for="type in messageTypes" :key="type" :value="type">
              {{ type }}メッセージ
            </v-tab>
          </v-tabs>
          <v-card-text>
            <v-window v-model="activeTab">
              <v-window-item v-for="type in messageTypes" :key="type" :value="type">
                <v-btn @click="addPost(editingItem, type)" color="primary" small class="mb-2">追加</v-btn>
                <v-list>
                  <v-list-item v-for="(post, index) in sortedPosts(type)" :key="index">
                    <v-row>
                      <v-col cols="6" sm="2" v-if="['message', 'toast'].includes(type)">
                        <v-text-field v-model.number="post.botKey" label="ボットキー" type="number"></v-text-field>
                      </v-col>
                      <v-col cols="6" sm="2" v-if="['message', 'toast'].includes(type)">
                        <v-text-field v-model="post.iconKey" label="アイコンキー"></v-text-field>
                      </v-col>
                      <v-col cols="2" sm="2">
                        <v-text-field v-model.number="post.delaySeconds" label="遅延時間(秒)" type="number"></v-text-field>
                      </v-col>
                      <v-col cols="10" sm="6">
                        <v-text-field v-model="post.content" label="内容" rows="3"></v-text-field>
                      </v-col>
                      <v-col cols="12">
                        <v-btn @click="removePost(editingItem, type, index)" color="error" small>削除</v-btn>
                      </v-col>
                    </v-row>
                  </v-list-item>
                </v-list>
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </v-form>
    </v-card-text>
  </v-container>
  <v-alert v-else type="warning">おみくじが選択されていません。</v-alert>
</template>

<script setup lang="ts">
import { inject, Ref, ref, watch } from "vue";
import type { DefaultState, OmikujiMessage } from "../types";
import { ItemType, SelectedItem } from "@/AppTypes";
import {
  useEditOmikuji,
  useFunkOmikenEdit,
  useItemEditor,
} from "../composables/funkOmikenEdit.js";

// props/emits
const props = defineProps<{
  STATE: DefaultState;
  selectedItem: SelectedItem;
}>();

const emit = defineEmits<{
  (e: "update:item", value: OmikujiMessage): void;
}>();
// 更新のコンポーザブル
const { editingItem } = useItemEditor(props, emit);

// useOmikujiEditorコンポーザブルの使用
const {
  addPost,
  messageTypes,
  thresholdTypes,
  comparisonItems,
  removePost,
  sanitizeThresholdSettings,
  sumWeightValues,
} = useEditOmikuji(props.STATE);

// フィルタリング設定が変更されたときに自動的にバリデーションを実行
watch(
  () => editingItem.value?.threshold,
  () => {
    if (editingItem.value && editingItem.value.threshold) {
      const wasModified = sanitizeThresholdSettings(editingItem);
      if (wasModified) {
        // ここでユーザーに通知を表示するなどの処理を行う
        console.log("Threshold settings were automatically adjusted");
      }
    }
  },
  { deep: true }
);

const activeTab = ref("message");
const sortedPosts = (type: string) => {
  console.log(editingItem.value[type]);
  if (!editingItem || !editingItem.value[type]) {
    return [];
  }

  const items = Array.isArray(editingItem.value[type])
    ? editingItem.value[type]
    : [editingItem.value[type]];

  return items.sort((a, b) => a.delaySeconds - b.delaySeconds);
};
</script>
