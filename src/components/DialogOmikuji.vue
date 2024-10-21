<!-- src/components/DialogOmikuji.vue -->
<template>
  <v-card v-if="currentItem" style="max-height: 80vh; overflow-y: auto;">
    <v-card-text>
      <v-form @submit.prevent>
        <!-- 基本情報 -->
        <v-row dense>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="currentItem.name"
              label="結果名"
              density="compact"
              @input="updateOmikuji"
            >
              <v-tooltip activator="parent" location="bottom"
                >おみくじの結果の名称（ラベル）を入力してください。<br />
                例: 「大吉」「中吉」「小吉」など。</v-tooltip
              >
            </v-text-field>
          </v-col><v-col cols="3" sm="2">
            <v-text-field
              v-model.number="currentItem.weight"
              label="出現比"
              type="number"
              min="0"
              max="100"
              density="compact"
              @input="updateOmikuji"
            >
              <v-tooltip activator="parent" location="bottom">
                ランダムに偏りをつける
              </v-tooltip>
            </v-text-field>
          </v-col>
          <v-col cols="9" sm="6">
            <v-progress-linear
              :model-value="weightValues"
              buffer-value="10"
              color="primary"
              height="35"
              striped
            >
              出現割合：{{ weightValues }} %
            </v-progress-linear>
          </v-col>
        </v-row>

        <!-- フィルタリング設定 -->
        <DialogOmikujiFilter
          :currentItem="currentItem"
          :thresholdTypes="thresholdTypes"
          :comparisonItems="comparisonItems"
          @update="updateSTATE"
        />

        <!-- Post設定 -->
        <DialogOmikujiPost
          :currentItem="currentItem"
          @addPost="addPost"
          @removePost="removePost"
          @update="updateSTATE"
        />
      </v-form>
    </v-card-text>
  </v-card>
  <v-alert v-else type="warning">おみくじが選択されていません。</v-alert>
</template>

<script setup lang="ts">
import { computed, inject } from "vue";
import type { CHARAType, STATEType, omikujiType, SelectItem, placeType, rulesType, EditorItem } from "../types";
import { useEditOmikuji } from "../composables/funkOmikenEdit";
import DialogOmikujiFilter from "./DialogOmikujiFilter.vue";
import DialogOmikujiPost from "./DialogOmikujiPost.vue";
import _ from 'lodash';
// props/emits
const props = defineProps<{
  STATE: STATEType;
  selectItem: Record<string, omikujiType> | null;
}>();

const emit = defineEmits<{
  (e: "update:STATE", payload: SelectItem): void;
    (e: "open-editor", editorItem: EditorItem): void;
}>();

// キャラクターデータのインジェクト
const CHARA = inject<CHARAType>("charaKey");

// コンポーザブルの使用
const {
  addPost,
  thresholdTypes,
  comparisonItems,
  removePost,
} = useEditOmikuji(props.STATE, CHARA);

// propsからデータを解読
const currentItem = computed(() => {
  if (props.selectItem) {
    // オブジェクトの最初のキーの値を返す
    const firstKey = Object.keys(props.selectItem)[0];
    return props.selectItem[firstKey];
  }
  return null;
});

// 全体の出現割合から％を取る
// TODO 全体の出現割合の数値も取って表示させたい
const weightValues = computed(() => {
  if (!currentItem.value) return 0;
  const totalWeight = Object.values(props.STATE.omikuji).reduce(
    (sum, obj) => sum + obj.weight,
    0
  );
  if (totalWeight <= 0) return 0;
  return Math.round((currentItem.value.weight / totalWeight) * 100);
});

// 更新アップデート
const updateOmikuji = () => {
  if (currentItem.value) {
    emit("update:STATE", {
      type: "omikuji",
      update: { [currentItem.value.id]: currentItem.value },
    });
  }
};
// 子コンポーネントのSTATE更新
const updateSTATE = (payload: SelectItem) => emit("update:STATE", payload);

</script>