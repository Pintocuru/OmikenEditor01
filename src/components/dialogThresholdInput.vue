<!-- src/components/DialogThresholdInput.vue -->
<template>
  <v-row dense>
    <!-- 比較方法 -->
    <v-col cols="12" sm="4" v-if="modelValue && 'comparison' in modelValue">
      <v-select
        
        v-model="modelValue.comparison"
        :items="getComparisonItems(conditionType)"
        label="比較方法"
        @update:modelValue="$emit('update:modelValue', modelValue)"
      />
    </v-col>
    <!-- 単位選択 -->
    <v-col
      v-if="
        modelValue &&
        [ConditionType.ELAPSED, ConditionType.COUNT].includes(conditionType)
      "
      cols="12"
      sm="4"
    >
      <v-select
        v-if="modelValue && 'unit' in modelValue"
        v-model="modelValue.unit"
        :items="getUnitItems(conditionType)"
        label="単位"
        @update:modelValue="$emit('update:modelValue', modelValue)"
      />
    </v-col>

    <!-- 値の入力 -->
    <v-col v-if="modelValue" cols="6" sm="4">
      <v-text-field
        v-model.number="modelValue.value1"
        type="number"
        :label="getValue1Label(conditionType)"
        @update:modelValue="$emit('update:modelValue', modelValue)"
      />
    </v-col>

<v-col
  v-if="modelValue && (!('comparison' in modelValue) || modelValue.comparison === 'range')"
  cols="6"
  sm="4"
>
      <v-text-field
        v-model.number="modelValue.value2"
        type="number"
        :label="getValue2Label(conditionType)"
        @update:modelValue="$emit('update:modelValue', modelValue)"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import {
  TimeCondition,
  ElapsedCondition,
  CountCondition,
  GiftCondition,
  ConditionType,
} from "@/types";

const props = defineProps<{
  modelValue:
    | TimeCondition
    | ElapsedCondition
    | CountCondition
    | GiftCondition
    | undefined;
  conditionType: ConditionType;
}>();

const getComparisonItems = (type: ConditionType) => {
  const baseItems = [
    { title: "以下", value: "min" },
    { title: "以上", value: "max" },
    { title: "範囲", value: "range" },
  ];

  switch (type) {
    case ConditionType.COUNT:
      return [
        ...baseItems,
        { title: "等しい", value: "equal" },
        { title: "繰り返し", value: "loop" },
      ];
    case ConditionType.GIFT:
      return [...baseItems, { title: "等しい", value: "equal" }];
    default:
      return baseItems;
  }
};

const getValue1Label = (type: ConditionType) => {
  switch (type) {
    case ConditionType.TIME:
      return "時刻";
    case ConditionType.ELAPSED:
      return "経過時間";
    case ConditionType.COUNT:
      return "コメント数";
    case ConditionType.GIFT:
      return "ポイント";
    default:
      return "値";
  }
};

const getValue2Label = (type: ConditionType) => {
  switch (type) {
    case ConditionType.TIME:
      return "終了時刻";
    case ConditionType.ELAPSED:
      return "経過時間(終了)";
    case ConditionType.COUNT:
      return "コメント数(終了)";
    case ConditionType.GIFT:
      return "ポイント(終了)";
    default:
      return "値(終了)";
  }
};

const getUnitItems = (type: ConditionType) => {
  switch (type) {
    case ConditionType.ELAPSED:
      return [
        { title: "秒", value: "second" },
        { title: "分", value: "minute" },
        { title: "時間", value: "hour" },
        { title: "日", value: "day" },
      ];
    case ConditionType.COUNT:
      return [
        { title: "配信枠のコメント番号", value: "lc" },
        { title: "個人コメント数", value: "no" },
        { title: "総個人コメント数", value: "tc" },
      ];
    default:
      return [];
  }
};
</script>
