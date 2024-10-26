<!-- src/components/DialogOmikuji.vue -->
<template>
  <v-card v-if="currentItem" style="max-height: 80vh; overflow-y: auto">
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
            </v-text-field> </v-col
          ><v-col cols="3" sm="2">
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

        <v-tabs v-model="tab" class="w-100">
          <v-tab value="post" class="d-flex align-center w-50">
            メッセージ
            <v-badge
              v-if="postCount ? postCount > 0 : 0"
              :content="postCount"
              color="primary"
              class="ms-2"
            >
              <v-icon size="small">mdi-message-text</v-icon>
            </v-badge>
          </v-tab>
          <v-tab
            value="filter"
            class="d-flex align-center w-50"
            :class="{ 'bg-primary': activeFilters && activeFilters.length > 0 }"
          >
            フィルタリング
            <v-chip
              v-for="filter in activeFilters"
              :key="filter.type"
              size="x-small"
              class="ms-1"
            >
              <v-icon size="small">{{ filter.icon }}</v-icon>
            </v-chip>
          </v-tab>
        </v-tabs>

        <v-window v-model="tab">
          <v-window-item value="post">
            <DialogOmikujiPost
              :currentItem="currentItem"
              @addPost="addPost"
              @removePost="removePost"
              @update="updateSTATE"
            />
          </v-window-item>
          <v-window-item value="filter">
            <DialogOmikujiFilter
              :currentItem="currentItem"
              :thresholdTypes="thresholdTypes"
              :comparisonItems="comparisonItems"
              @update="updateSTATE"
            />
          </v-window-item>
        </v-window>
      </v-form>
    </v-card-text>
  </v-card>
  <v-alert v-else type="warning">おみくじが選択されていません。</v-alert>
</template>

<script setup lang="ts">
import { computed, inject, Ref, ref } from "vue";
import type {
  STATEType,
  OmikujiType,
  STATEEntry,
  ListEntry,
  AppStateType,
  STATECategory,
  ListCategory,
} from "../types";
import { useEditOmikuji } from "../composables/funkOmikenEdit";
import DialogOmikujiFilter from "./DialogOmikujiFilter.vue";
import DialogOmikujiPost from "./DialogOmikujiPost.vue";
import _ from "lodash";
// props/emits
const props = defineProps<{
  entry: ListEntry<'omikuji'> | null
}>();

const emit = defineEmits<{
  (e: "update:STATE", payload: STATEEntry<STATECategory>): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

// キャラクターデータのインジェクト
const AppState = inject<Ref<AppStateType>>("AppStateKey");
const omikuji = AppState?.value.STATE.omikuji;
const CHARA = AppState?.value.CHARA;

// コンポーザブルの使用
const { addPost, thresholdTypes, comparisonItems, removePost } =
  useEditOmikuji(CHARA);

// タブの状態管理
const tab = ref("post");

// propsからデータを解読
const currentItem = computed(() => {
  const item = props.entry?.item;
  console.log('props.entry?.item:', item ? Object.values(item)[0] : null);
  return item ? Object.values(item)[0] : null;
});

// 投稿数のcomputed property
const postCount = computed(() => {
  if (!currentItem.value) return;
  return currentItem.value.post.length;
});

// アクティブなフィルターのcomputed property
const activeFilters = computed(() => {
  if (!currentItem.value) return;
  const threshold = currentItem.value.threshold;
  const filters = [];

  if (threshold.isSyoken) {
    filters.push({
      type: "syoken",
      icon: "mdi-account-star",
      color: "primary",
    });
    // isSyoken=trueならこれだけ返せばOK
    return filters;
  }
  if (threshold.time.isEnabled) {
    filters.push({
      type: "time",
      icon: "mdi-clock-outline",
      color: "success",
    });
  }
  if (threshold.elapsed.isEnabled) {
    filters.push({
      type: "elapsed",
      icon: "mdi-timer-outline",
      color: "info",
    });
  }
  if (threshold.count.isEnabled) {
    filters.push({
      type: "count",
      icon: "mdi-counter",
      color: "warning",
    });
  }
  if (threshold.gift.isEnabled) {
    filters.push({
      type: "gift",
      icon: "mdi-gift-outline",
      color: "error",
    });
  }

  return filters;
});

// 全体の出現割合から％を取る
// TODO rulesからこのおみくじが適用されている者を見つけ出し、それをリスト表示させる。
// そして選択しているリストの全体の分母から、パーセンテージを取る。
// どのrulesからも選択されてないなら、0を返す
const weightValues = computed(() => {
return 0;
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
const updateSTATE = (payload: STATEEntry<STATECategory>) =>
  emit("update:STATE", payload);
</script>
