<!-- src/components/DialogOmikujiFilter.vue -->
<template>
  <v-card>
    <v-toolbar color="primary" density="compact">
      <v-toolbar-title>フィルタリング設定</v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <!-- isSyoken設定 -->
      <v-sheet
        :class="{ 'bg-red lighten-3': currentItem.threshold.isSyoken }"
        class="d-flex align-center"
      >
        <v-switch
          v-model="currentItem.threshold.isSyoken"
          label="初見さん対象"
          density="compact"
          @change="updateOmikuji"
        ></v-switch>
      </v-sheet>

      <div v-if="!currentItem.threshold.isSyoken">
        <!-- 時間フィルター -->
        <v-sheet
          :class="{ 'bg-red lighten-3': currentItem.threshold.time.isEnabled }"
        >
          <div class="d-flex align-center">
            <v-switch
              v-model="currentItem.threshold.time.isEnabled"
              label="時間指定"
              density="compact"
              @change="updateOmikuji"
            ></v-switch>

            <span
              v-if="currentItem.threshold.time.isEnabled"
              class="text-grey ml-6 mb-5"
            >
              例:
              {{
                getTimeExample(
                  currentItem.threshold.time.value1,
                  currentItem.threshold.time.value2
                )
              }}
            </span>
          </div>
          <v-row v-if="currentItem.threshold.time.isEnabled" dense>
            <v-col cols="6" sm="4">
              <v-text-field
                v-model.number="currentItem.threshold.time.value1"
                label="開始時刻 (0-23)"
                type="number"
                :rules="[timeRules]"
                min="0"
                max="23"
                density="compact"
                @input="updateOmikuji"
              ></v-text-field>
            </v-col>
            <v-col cols="6" sm="4">
              <v-text-field
                v-model.number="currentItem.threshold.time.value2"
                label="終了時刻 (1-24)"
                type="number"
                :rules="[timeRules]"
                min="1"
                max="24"
                density="compact"
                @input="updateOmikuji"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-sheet>

        <!-- 経過時間フィルター -->
        <div class="d-flex align-center">
          <v-switch
            v-model="currentItem.threshold.elapsed.isEnabled"
            label="経過時間"
            density="compact"
            @change="updateOmikuji"
          ></v-switch>
          <span
            v-if="currentItem.threshold.elapsed.isEnabled"
            class="text-grey ml-6 mb-5"
          >
            例: {{ getElapsedExample() }}
          </span>
        </div>
        <v-row
          v-if="currentItem.threshold.elapsed.isEnabled"
          class="auto"
          dense
        >
          <v-col cols="12" sm="4">
            <v-select
              v-model="currentItem.threshold.elapsed.unit"
              :items="elapsedUnits"
              item-title="text"
              item-value="value"
              label="単位"
              density="compact"
              @change="updateOmikuji"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="4">
            <v-select
              v-model="currentItem.threshold.elapsed.comparison"
              :items="elapsedComparisonItems"
              item-title="text"
              item-value="value"
              label="比較方法"
              density="compact"
              @change="updateOmikuji"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model.number="currentItem.threshold.elapsed.value1"
              label="値"
              type="number"
              density="compact"
              @input="updateOmikuji"
            ></v-text-field>
          </v-col>
          <v-col
            cols="12"
            sm="4"
            v-if="currentItem.threshold.elapsed.comparison === 'range'"
          >
            <v-text-field
              v-model.number="currentItem.threshold.elapsed.value2"
              label="値 (最大)"
              type="number"
              density="compact"
              @input="updateOmikuji"
            ></v-text-field>
          </v-col>
        </v-row>

        <!-- カウントフィルター -->
        <div class="d-flex align-center">
          <v-switch
            v-model="currentItem.threshold.count.isEnabled"
            label="カウント条件"
            density="compact"
            @change="updateOmikuji"
          ></v-switch>
          <span
            v-if="currentItem.threshold.count.isEnabled"
            class="text-grey ml-6 mb-5"
          >
            例: {{ getCountExample() }}
          </span>
        </div>
        <v-row v-if="currentItem.threshold.count.isEnabled" class="auto" dense>
          <v-col cols="12" sm="4">
            <v-select
              v-model="currentItem.threshold.count.unit"
              :items="countUnits"
              item-title="text"
              item-value="value"
              label="カウント種別"
              density="compact"
              @change="updateOmikuji"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="4">
            <v-select
              v-model="currentItem.threshold.count.comparison"
              :items="countComparisonItems"
              item-title="text"
              item-value="value"
              label="比較方法"
              density="compact"
              @change="updateOmikuji"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model.number="currentItem.threshold.count.value1"
              label="値"
              type="number"
              density="compact"
              @input="updateOmikuji"
            ></v-text-field>
          </v-col>
          <v-col
            cols="12"
            sm="4"
            v-if="currentItem.threshold.count.comparison === 'range'"
          >
            <v-text-field
              v-model.number="currentItem.threshold.count.value2"
              label="値 (最大)"
              type="number"
              density="compact"
              @input="updateOmikuji"
            ></v-text-field>
          </v-col>
        </v-row>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { omikujiType, SelectItem } from "../types";
import _ from "lodash";

const props = defineProps<{
  currentItem: omikujiType;
}>();

const emit = defineEmits<{
  (e: "update:STATE", payload: SelectItem): void;
}>();

const elapsedUnits = [
  { text: "秒", value: "second" },
  { text: "分", value: "minute" },
  { text: "時間", value: "hour" },
  { text: "日", value: "day" },
];

const elapsedComparisonItems = [
  { text: "以下", value: "min" },
  { text: "以上", value: "max" },
  { text: "範囲", value: "range" },
];

const countUnits = [
  { text: "配信枠のコメント番号", value: "lc" },
  { text: "配信枠の個人コメント数", value: "no" },
  { text: "総数の個人コメント数", value: "tc" },
];

const countComparisonItems = [
  { text: "以下", value: "min" },
  { text: "等しい", value: "equal" },
  { text: "以上", value: "max" },
  { text: "ループ", value: "loop" },
  { text: "範囲", value: "range" },
];

// 時間のバリデーション
const timeRules = (value: number) => {
  return (
    value >= 0 &&
    value <= 24 &&
    props.currentItem.threshold.time.value1 !==
      props.currentItem.threshold.time.value2
  );
};

const timeError = (value: number) => {
  return !timeRules(value) ? "入力は0～23の間です" : "";
};

// 更新処理
const updateOmikuji = () => {
  if (props.currentItem) {
    emit("update:STATE", {
      type: "omikuji",
      update: { [props.currentItem.id]: props.currentItem },
    });
  }
};

// 例文生成関数
const getTimeExample = (value1: number, value2: number) => {
  return `${value1}時～${value2}時の間`;
};

const getElapsedExample = () => {
  const { unit, comparison, value1, value2 } =
    props.currentItem.threshold.elapsed;
  const unitText = {
    second: "秒",
    minute: "分",
    hour: "時間",
    day: "日",
  }[unit];

  if (comparison === "range" && value2) {
    return `投稿から${value1}${unitText}～${value2}${unitText}の間が対象`;
  }
  return `投稿から${value1}${unitText}${
    comparison === "min" ? "以前" : "以降"
  }の投稿が対象`;
};

const getCountExample = () => {
  const { unit, comparison, value1, value2 } =
    props.currentItem.threshold.count;
  const unitText = {
    lc: "配信枠のコメント番号",
    no: "配信枠の個人コメント数",
    tc: "総数の個人コメント数",
  }[unit];

  switch (comparison) {
    case "loop":
      return `${unitText}が${value1}の倍数が対象`;
    case "range":
      return `${unitText}が${value1}～${value2}の間が対象`;
    case "equal":
      return `${unitText}が${value1}に等しい場合が対象`;
    default:
      return `${unitText}が${value1}${
        comparison === "min" ? "以下" : "以上"
      }が対象`;
  }
};
</script>
