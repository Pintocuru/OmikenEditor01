<!-- src/components/OmikujiEditor.vue -->
<template>
  <v-card v-if="currentItem">
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
        <OmikujiEditorFiltering
          :currentOmikuji="currentItem"
          :thresholdTypes="thresholdTypes"
          :comparisonItems="comparisonItems"
          @update="updateOmikuji"
        />

        <!-- メッセージ設定 -->
        <OmikujiEditorMessage
          :currentOmikuji="currentItem"
          @addPost="addPost"
          @removePost="removePost"
          @update="updateOmikuji"
        />
      </v-form>
    </v-card-text>
  </v-card>
  <v-alert v-else type="warning">おみくじが選択されていません。</v-alert>
</template>

<script setup lang="ts">
import { computed, inject } from "vue";
import type { CHARAType, STATEType, omikujiType, SelectItem } from "../types";
import { useEditOmikuji } from "../composables/funkOmikenEdit";
import OmikujiEditorFiltering from "./OmikujiEditorFiltering.vue";
import OmikujiEditorMessage from "./OmikujiEditorMessage.vue";

const props = defineProps<{
  STATE: STATEType;
  selectItem: SelectItem;
}>();

const emit = defineEmits<{
  (e: "update:STATE", payload: SelectItem): void;
}>();

// キャラクターデータのインジェクト
const CHARA = inject<CHARAType>("charaKey");

// コンポーザブルの使用
const {
  addPost,
  thresholdTypes,
  comparisonItems,
  removePost,
  sanitizeThresholdSettings,
} = useEditOmikuji(props.STATE, CHARA);

// propsからデータを解読
const currentItem = computed(() => {
  if (props.selectItem && props.selectItem.items) {
    const firstKey = Object.keys(props.selectItem.items)[0];
    return props.selectItem.items[firstKey] as omikujiType;
  }
  return null;
});

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
  if (props.selectItem && currentItem.value) {
    sanitizeThresholdSettings(currentItem.value);
    emit("update:STATE", {
      type: "omikuji",
      items: { [currentItem.value.id]: currentItem.value },
      operation: "update",
    });
  }
};
</script>