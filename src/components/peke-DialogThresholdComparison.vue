<!-- DialogThresholdComparison.vue -->
<template>
  <v-col cols="12" md="4">
    <v-select
      :v-model="modelValue"
      :items="comparisonItems"
      label="比較方法"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </v-col>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ConditionType } from "../types";

const props = defineProps<{
  modelValue: string;
  conditionType: ConditionType;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const comparisonItems = computed(() => {
  const base = [
    { title: "以上", value: "min" },
    { title: "以下", value: "max" },
    { title: "範囲", value: "range" },
  ];
  
  if (props.conditionType === "count") {
    return [...base, { title: "一致", value: "equal" }, { title: "周期", value: "loop" }];
  }
  if (props.conditionType === "gift") {
    return [...base, { title: "一致", value: "equal" }];
  }
  return base;
});
</script>