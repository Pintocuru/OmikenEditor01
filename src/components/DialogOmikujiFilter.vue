<!-- src/components/DialogOmikujiFilter.vue -->
<template>
  <v-card>
    <v-toolbar color="primary">
      <v-toolbar-title>フィルタリング設定</v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <v-expansion-panels v-model="expandedPanels" multiple>
        <!-- 初見パネル -->
        <v-expansion-panel readonly value="syoken">
          <v-expansion-panel-title
            hide-actions
            :color="currentItem.threshold.isSyoken ? 'red' : ''"
          >
            <v-toolbar color="transparent">
              <v-icon class="mr-2" size="large">mdi-account-plus</v-icon>
              <v-toolbar-title>初見さん限定</v-toolbar-title>
              <v-switch
                v-model="currentItem.threshold.isSyoken"
                @click.stop
                @change="updateOmikuji"
              ></v-switch>
            </v-toolbar>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-sheet class="text-grey">個人コメントが5回以内 & コメント投稿後12時間以内のコメントが対象です</v-sheet></v-expansion-panel-text>
        </v-expansion-panel>

        <v-sheet v-if="!currentItem.threshold.isSyoken" class="w-100">
          <!-- 時間指定パネル -->
          <v-expansion-panel readonly value="time">
            <v-expansion-panel-title
              hide-actions
              :color="currentItem.threshold.time.isEnabled ? 'red' : ''"
            >
              <v-toolbar color="transparent">
                <v-icon class="mr-2" size="large">mdi-clock-outline</v-icon>
                <v-toolbar-title>時間指定</v-toolbar-title>
                <v-switch
                  v-model="currentItem.threshold.time.isEnabled"
                  @click.stop
                  @change="updateOmikuji"
                ></v-switch>
              </v-toolbar>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row>
                <v-col cols="6" sm="4">
                  <v-text-field
                    v-model.number="currentItem.threshold.time.value1"
                    label="開始時刻 (0-23)"
                    type="number"
                    :rules="[timeRules]"
                    min="0"
                    max="23"
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
                    @input="updateOmikuji"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-sheet class="text-grey">
                例:
                {{
                  getTimeExample(
                    currentItem.threshold.time.value1,
                    currentItem.threshold.time.value2
                  )
                }}
              </v-sheet>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- 経過時間パネル -->
          <v-expansion-panel readonly value="elapsed">
            <v-expansion-panel-title
              hide-actions
              :color="currentItem.threshold.elapsed.isEnabled ? 'red' : ''"
            >
              <v-toolbar color="transparent">
                <v-icon class="mr-2" size="large">mdi-timer-sand</v-icon>
                <v-toolbar-title>経過時間</v-toolbar-title>
                <v-switch
                  v-model="currentItem.threshold.elapsed.isEnabled"
                  @click.stop
                  @change="updateOmikuji"
                ></v-switch>
              </v-toolbar>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row dense>
                <v-col cols="12" sm="3">
                  <v-select
                    v-model="currentItem.threshold.elapsed.unit"
                    :items="elapsedUnits"
                    item-title="text"
                    item-value="value"
                    label="単位"
                    @change="updateOmikuji"
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="3">
                  <v-select
                    v-model="currentItem.threshold.elapsed.comparison"
                    :items="elapsedComparisonItems"
                    item-title="text"
                    item-value="value"
                    label="比較方法"
                    @change="updateOmikuji"
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="3">
                  <v-text-field
                    v-model.number="currentItem.threshold.elapsed.value1"
                    label="値"
                    type="number"  min="0"
                    @input="updateOmikuji"
                  ></v-text-field>
                </v-col>
                <v-col
                  cols="12"
                  sm="3"
                  v-if="currentItem.threshold.elapsed.comparison === 'range'"
                >
                  <v-text-field
                    v-model.number="currentItem.threshold.elapsed.value2"
                    label="値 (最大)"
                    type="number"  min="0"
                    @input="updateOmikuji"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-sheet class="text-grey">
                例: {{ getElapsedExample() }}
              </v-sheet>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- カウントパネル -->
          <v-expansion-panel readonly value="count">
            <v-expansion-panel-title
              hide-actions
              :color="currentItem.threshold.count.isEnabled ? 'red' : ''"
            >
              <v-toolbar color="transparent">
                <v-icon class="mr-2" size="large">mdi-counter</v-icon>
                <v-toolbar-title>コメント数</v-toolbar-title>
                <v-switch
                  v-model="currentItem.threshold.count.isEnabled"
                  @click.stop
                  @change="updateOmikuji"
                ></v-switch>
              </v-toolbar>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row dense>
                <v-col cols="12" sm="3">
                  <v-select
                    v-model="currentItem.threshold.count.unit"
                    :items="countUnits"
                    item-title="text"
                    item-value="value"
                    label="カウント種別"
                    @change="updateOmikuji"
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="3">
                  <v-select
                    v-model="currentItem.threshold.count.comparison"
                    :items="countComparisonItems"
                    item-title="text"
                    item-value="value"
                    label="比較方法"
                    @change="updateOmikuji"
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="3">
                  <v-text-field
                    v-model.number="currentItem.threshold.count.value1"
                    label="値"
                    type="number" min="0"
                    @input="updateOmikuji"
                  ></v-text-field>
                </v-col>
                <v-col
                  cols="12"
                  sm="3"
                  v-if="currentItem.threshold.count.comparison === 'range'"
                >
                  <v-text-field
                    v-model.number="currentItem.threshold.count.value2"
                    label="値 (最大)"
                    type="number" min="0"
                    @input="updateOmikuji"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-sheet class="text-grey"> 例: {{ getCountExample() }} </v-sheet>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- ギフトパネル -->
          <v-expansion-panel readonly value="gift">
            <v-expansion-panel-title
              hide-actions
              :color="currentItem.threshold.gift.isEnabled ? 'red' : ''"
            >
              <v-toolbar color="transparent">
                <v-icon class="mr-2" size="large">mdi-gift-outline</v-icon>
                <v-toolbar-title>ギフト</v-toolbar-title>
                <v-switch
                  v-model="currentItem.threshold.gift.isEnabled"
                  @click.stop
                  @change="updateOmikuji"
                ></v-switch>
              </v-toolbar>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row dense>
                <v-col cols="12" sm="3">
                  <v-select
                    v-model="currentItem.threshold.gift.comparison"
                    :items="countComparisonItems"
                    item-title="text"
                    item-value="value"
                    label="比較方法"
                    @change="updateOmikuji"
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="3">
                  <v-text-field
                    v-model.number="currentItem.threshold.gift.value1"
                    label="値"
                    type="number" min="0"
                    @input="updateOmikuji"
                  ></v-text-field>
                </v-col>
                <v-col
                  cols="12"
                  sm="3"
                  v-if="currentItem.threshold.gift.comparison === 'range'"
                >
                  <v-text-field
                    v-model.number="currentItem.threshold.gift.value2"
                    label="値 (最大)"
                    type="number" min="0"
                    @input="updateOmikuji"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-sheet class="text-grey"> 例: {{ getGiftExample() }} </v-sheet>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-sheet>
      </v-expansion-panels>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { omikujiType, SelectItem } from "../types";
import _ from "lodash";

const props = defineProps<{
  currentItem: omikujiType;
}>();

const emit = defineEmits<{
  (e: "update:STATE", payload: SelectItem): void;
}>();

// 配列の型定義
type PanelType = "syoken" | "time" | "elapsed" | "count" | "gift";
const expandedPanels = ref<PanelType[]>([]);

// 5つのパネルの状態を監視
watch(
  () => props.currentItem.threshold.isSyoken,
  (newValue) => {
    if (newValue) {
      expandedPanels.value.push("syoken");
    } else {
      const index = expandedPanels.value.indexOf("syoken");
      if (index > -1) expandedPanels.value.splice(index, 1);
    }
  }
);

watch(
  () => props.currentItem.threshold.time.isEnabled,
  (newValue) => {
    if (newValue) {
      expandedPanels.value.push("time");
    } else {
      const index = expandedPanels.value.indexOf("time");
      if (index > -1) expandedPanels.value.splice(index, 1);
    }
  }
);

watch(
  () => props.currentItem.threshold.elapsed.isEnabled,
  (newValue) => {
    if (newValue) {
      expandedPanels.value.push("elapsed");
    } else {
      const index = expandedPanels.value.indexOf("elapsed");
      if (index > -1) expandedPanels.value.splice(index, 1);
    }
  }
);

watch(
  () => props.currentItem.threshold.count.isEnabled,
  (newValue) => {
    if (newValue) {
      expandedPanels.value.push("count");
    } else {
      const index = expandedPanels.value.indexOf("count");
      if (index > -1) expandedPanels.value.splice(index, 1);
    }
  }
);

watch(
  () => props.currentItem.threshold.gift.isEnabled,
  (newValue) => {
    if (newValue) {
      expandedPanels.value.push("gift");
    } else {
      const index = expandedPanels.value.indexOf("gift");
      if (index > -1) expandedPanels.value.splice(index, 1);
    }
  }
);

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
const getGiftExample = () => {
  const { comparison, value1, value2 } = props.currentItem.threshold.gift;

  switch (comparison) {
    case "range":
      return `ギフト金額またはポイントが${value1}～${value2}の間が対象`;
    case "equal":
      return `ギフト金額またはポイントが${value1}に等しい場合が対象`;
    default:
      return `ギフト金額またはポイントが${value1}${
        comparison === "min" ? "以下" : "以上"
      }が対象`;
  }
};
</script>
