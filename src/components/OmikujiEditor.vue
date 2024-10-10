<!-- src/components/OmikujiEditor.vue -->
<template>
  <v-card v-if="omikuji">
    <v-card-title>おみくじエディタ</v-card-title>
    <v-card-text>
      <v-form @submit.prevent="handleSaveOmikuji">
        <!-- おみくじの基本情報 -->
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field v-model="omikuji.name" label="結果名"></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model.number="omikuji.weight" label="出現比" type="number"></v-text-field>
          </v-col>
        </v-row>

        <!-- フィルタリング基準の設定 -->
        <v-row>
          <v-col cols="12" sm="6">
            <v-select v-model="omikuji.threshold.type" :items="thresholdTypes" item-title="text" item-value="value"
              label="フィルタリング基準"></v-select>
          </v-col>
        </v-row>

        <v-row v-if="omikuji.threshold.type !== 'none'">
          <v-col cols="12" sm="4">
            <v-text-field v-model.number="omikuji.threshold.value" label="基準値" type="number"></v-text-field>
          </v-col>
          <v-col cols="12" sm="4">
            <v-select v-model="omikuji.threshold.comparison" :items="comparisonItems" item-title="text" item-value="value"
              label="比較方法"></v-select>
          </v-col>
        </v-row>

        <!-- メッセージタイプごとの設定 -->
        <v-expansion-panels>
          <v-expansion-panel v-for="type in messageTypes" :key="type">
            <v-expansion-panel-title>{{ type }}メッセージ</v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-btn @click="addPost(type)" color="primary" small class="mb-2">追加</v-btn>
              <v-list>
                <v-list-item v-for="(post, index) in omikuji[type]" :key="index">
                  <v-row>
                    <v-col v-if="['message', 'toast'].includes(type)" cols="6" sm="4">
                      <v-text-field v-model.number="post.botKey" label="ボットキー" type="number"></v-text-field>
                    </v-col>
                    <v-col v-if="['message', 'toast'].includes(type)" cols="6" sm="4">
                      <v-text-field v-model="post.iconKey" label="アイコンキー"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="4">
                      <v-text-field v-model.number="post.delaySeconds" label="遅延時間(秒)" type="number"></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-text-field v-model="post.content" label="内容"></v-text-field>
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
      </v-form>
    </v-card-text>
  </v-card>
  <v-alert v-else type="warning">おみくじが選択されていません。</v-alert>
</template>

<script setup lang="ts">
import { inject, Ref, ref, watch } from "vue";
import type { DefaultState, OmikujiMessage } from "../types";
import { ItemType } from "@/AppTypes";
import { useOmikujiEditor } from "../composables/funkOmikenEdit.js";

// omikujiStateの型定義
interface OmikujiState {
  state: DefaultState;
  omikujiList: Ref<OmikujiMessage[]>;
  updateState: (type: ItemType, newData: any) => void;
  openOmikujiDialog: (omikuji: OmikujiMessage) => void;
  closeOmikujiDialog: () => void;
}

// omikujiStateをinjectで取得
const omikujiState = inject('omikujiState') as OmikujiState | undefined;

if (!omikujiState) {
  throw new Error('omikujiState not provided');
}

const { state, updateState, closeOmikujiDialog } = omikujiState;

// コンポーネントのprops定義
const props = defineProps<{
  selectedOmikuji: OmikujiMessage | null;
}>();

// 親コンポーネントへのイベント発信
const emit = defineEmits<{
  (e: "update:omikuji", value: OmikujiMessage): void;
}>();

// useOmikujiEditorコンポーザブルの使用
const {
  omikuji,
  messageTypes,
  thresholdTypes,
  comparisonItems,
  addPost,
  removePost,
  saveOmikuji,
} = useOmikujiEditor(props.selectedOmikuji);

// selectedOmikujiの変更を監視
watch(
  () => props.selectedOmikuji,
  (newValue) => {
    omikuji.value = newValue ? JSON.parse(JSON.stringify(newValue)) : null;
  },
  { immediate: true, deep: true }
);

// omikujiの変更を監視し、親コンポーネントに通知
watch(
  omikuji,
  (newValue) => {
    if (
      newValue &&
      JSON.stringify(newValue) !== JSON.stringify(props.selectedOmikuji)
    ) {
      emit("update:omikuji", newValue);
    }
  },
  { deep: true }
);

// おみくじを保存するハンドラー関数
const handleSaveOmikuji = () => {
  saveOmikuji(updateState, closeOmikujiDialog, state);
};
</script>