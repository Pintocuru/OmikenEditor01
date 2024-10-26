<!-- src/components/ListFilter.vue -->
<template>

    <!-- ルール用フィルター -->
    <v-row v-if="selectCategory === 'rules'" dense>
      <v-col>
        <v-select
          v-model="filterRef.rulesSortName"
          :items="[
            { title: '上順', value: 'highFreq' },
            { title: '下順', value: 'lowFreq' },
          ]"
          item-title="title"
          item-value="value"
          label="名前順のソート"
          @change="updateSTATE"
        />
      </v-col>
      <v-col>
        <v-select
          v-model="filterRef.rulesFilterSwitch"
          :items="[
            { title: '無効', value: 0 },
            { title: 'だれでも', value: 1 },
            { title: 'メンバー', value: 2 },
            { title: 'モデレーター', value: 3 },
            { title: '管理者', value: 4 },
          ]"
          item-title="title"
          item-value="value"
          label="ON/OFFでのフィルタリング"
          multiple
          @change="updateFilter"
        />
      </v-col>
    </v-row>

    <!-- おみくじ用フィルター -->
    <v-row v-if="selectCategory === 'omikuji'" dense>
      <v-col>
        <v-select
          v-model="filterRef.omikujiSortWeight"
          :items="[
            { title: '出現割合（高い順）', value: 'highFreq' },
            { title: '出現割合（低い順）', value: 'lowFreq' },
          ]"
          item-title="title"
          item-value="value"
          label="出現割合でのソート"
          @change="updateSTATE"
        />
      </v-col>
      <v-col>
        <v-select
          v-model="filterRef.omikujiFilterThreshold"
          :items="thresholdItems"
          item-title="title"
          item-value="value"
          label="条件のフィルタリング"
          multiple
          @change="updateFilter"
        />
      </v-col>
    </v-row>

    <!-- プレースホルダー用フィルター -->
    <v-row v-if="selectCategory === 'place'" dense>
      <v-col>
        <v-select
          v-model="filterRef.placeSortName"
          :items="[
            { title: 'なし', value: 'none' },
            { title: 'プレースホルダー名', value: 'name' },
            { title: 'グループ', value: 'group' },
          ]"
          item-title="title"
          item-value="value"
          label="グループ化"
          @change="updateFilter"
        />
      </v-col>
    </v-row>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ListCategory, STATECategory, STATEEntry, STATEType, thresholdType } from "@/types";
import _ from 'lodash';

const props = defineProps<{
  filterRef: {
    rulesSortName: "none" | "highFreq" | "lowFreq";
    rulesFilterSwitch: string[];
    omikujiSortName: "none" | "highFreq" | "lowFreq";
    omikujiFilterThreshold: thresholdType[];
    omikujiSortWeight: "none" | "highFreq" | "lowFreq";
    placeSortName: "none" | "name" | "group";
    placeSortWeight: "none" | "highFreq" | "lowFreq";
  };
  STATE: STATEType;
  selectCategory: ListCategory;
}>();

const emit = defineEmits<{
  (e: "update:filterRef", value: typeof props.filterRef): void;
  (e: "update:STATE", payload: STATEEntry<STATECategory>): void;
}>();

// thresholdTypeに基づいたセレクトボックスの項目
const thresholdItems = computed(() => [
  { title: "時間指定(0-23時)", value: "time" as unknown as thresholdType },
  { title: "配信枠のコメント番号", value: "lc" as unknown as thresholdType },
  { title: "配信枠の個人コメント数", value: "no" as unknown as thresholdType },
  { title: "総数の個人コメント数", value: "tc" as unknown as thresholdType },
  { title: "投稿後の秒数", value: "second" as unknown as thresholdType },
  { title: "投稿後の分", value: "minute" as unknown as thresholdType },
  { title: "投稿後の時間", value: "hour" as unknown as thresholdType },
  { title: "投稿後の日数", value: "day" as unknown as thresholdType },
  { title: "ギフト", value: "price" },
]);

// フィルターの更新を親コンポーネントに通知
const updateFilter = () => {
  emit("update:filterRef", props.filterRef);
};

// アイテムの並び順を更新
const updateSTATE = (): void => {
  let newOrder: string[] = [];

  switch (props.selectCategory) {
    case "omikuji":
    case "place":
      newOrder = sortItems(
        props.STATE[`${props.selectCategory}Order`],
        props.selectCategory
      );
      break;
    // rulesはソートがないため、case 'rules'は省略
  }

  if (newOrder.length > 0) {
    emit("update:STATE", {
      type: props.selectCategory,
      reorder: newOrder,
    });
  }
};

// アイテムのソート関数
const sortItems = (
  items: string[],
  category: "omikuji" | "place"
): string[] => {
  const sortWeight =
    category === "omikuji"
      ? props.filterRef.omikujiSortWeight
      : props.filterRef.placeSortWeight;

  if (sortWeight === "none") return items;

  return [...items].sort((a, b) => {
    const weightA = props.STATE[category][a]?.weight || 0;
    const weightB = props.STATE[category][b]?.weight || 0;
    return sortWeight === "highFreq" ? weightB - weightA : weightA - weightB;
  });
};
</script>
