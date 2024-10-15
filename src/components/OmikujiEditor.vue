<!-- src/components/OmikujiEditor.vue -->
<template>
  <v-container v-if="editingItem">
    <v-card-text>
      <v-form @submit.prevent="editingItem">
        <!-- 基本情報 -->
        <v-row dense>
          <v-col cols="12" sm="4">
            <v-text-field v-model="editingItem.name" label="結果名" density="compact">
              <v-tooltip activator="parent" location="bottom">おみくじの結果の名称（ラベル）を入力してください。<br />
                例: 「大吉」「中吉」「小吉」など。</v-tooltip>
            </v-text-field>
          </v-col>
          <v-col cols="3" sm="2">
            <v-text-field v-model.number="editingItem.weight" label="出現比" type="number" min="0" max="100"
              density="compact">
              <v-tooltip activator="parent" location="bottom">ランダムに偏りをつける</v-tooltip>
            </v-text-field>
          </v-col>
          <v-col cols="9" sm="6">
            <v-progress-linear :model-value="sumWeightValues(editingItem.weight)" buffer-value="10" color="primary"
              height="35" striped>出現割合：{{
                sumWeightValues(editingItem.weight)
              }}
              %</v-progress-linear>
          </v-col>
        </v-row>

        <!-- フィルタリング設定 -->
        <OmikujiEditorFiltering
          :editingItem="editingItem"
          :thresholdTypes="thresholdTypes"
          :comparisonItems="comparisonItems"
        />

        <!-- メッセージ設定 -->
        <OmikujiEditorMessage
          :editingItem="editingItem"
          @addPost="addPost"
          @removePost="removePost"
        />
      </v-form>
    </v-card-text>
  </v-container>
  <v-alert v-else type="warning">おみくじが選択されていません。</v-alert>
</template>

<script setup lang="ts">
import { inject, watch } from 'vue';
import type { CharaStyles, DefaultState, OmikujiMessage } from '../types';
import type { SelectItem } from '@/AppTypes';
import { useEditOmikuji, useItemEditor } from '../composables/funkOmikenEdit';
import OmikujiEditorFiltering from './OmikujiEditorFiltering.vue';
import OmikujiEditorMessage from './OmikujiEditorMessage.vue';

const props = defineProps<{
  STATE: DefaultState;
  selectItem: SelectItem;
}>();

const emit = defineEmits<{
  (e: "update:item", value: OmikujiMessage): void;
}>();

// キャラクターデータのインジェクト
const CHARA = inject<CharaStyles>("charaKey");

// コンポーザブルの使用
const { editingItem } = useItemEditor(props, emit);
const {
  addPost,
  thresholdTypes,
  comparisonItems,
  removePost,
  sanitizeThresholdSettings,
  sumWeightValues,
} = useEditOmikuji(props.STATE, CHARA);

// フィルタリング設定の変更を監視
watch(
  () => editingItem.value?.threshold,
  () => {
    if (editingItem.value && editingItem.value.threshold) {
      const wasModified = sanitizeThresholdSettings(editingItem);
      if (wasModified) {
        console.log("フィルタリング設定が自動調整されました");
      }
    }
  },
  { deep: true }
);
</script>