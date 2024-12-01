<!-- src/components/DialogThresholdInput.vue -->
<template>
  <v-sheet class="d-flex align-center ga-2">
    <v-sheet v-if="currentItem && 'comparison' in currentItem">
      <v-select
        v-model="currentItem.comparison"
        :items="getComparisonItems(conditionType)"
        label="比較方法"
        @update:modelValue="$emit('update:modelValue', currentItem)"
      />
    </v-sheet>

    <v-sheet
      v-if="isElapsedCondition(currentItem) || isCountCondition(currentItem)"
    >
      <v-select
        v-if="currentItem?.unit"
        v-model="currentItem.unit"
        :items="getUnitItems(conditionType)"
        label="単位"
        @update:modelValue="$emit('update:modelValue', currentItem)"
      />
    </v-sheet>

    <v-sheet v-if="currentItem">
      <v-text-field
        v-model.number="currentItem.value1"
        type="number"
        min="0"
        max="100000"
        :label="getValue1Label(conditionType)"
        @update:modelValue="$emit('update:modelValue', currentItem)"
      />
    </v-sheet>

    <v-sheet
      v-if="
        currentItem &&
        (!('comparison' in currentItem) || currentItem.comparison === 'range')
      "
    >
      <v-text-field
        v-model.number="currentItem.value2"
        type="number"
        min="0"
        max="100000"
        :label="getValue2Label(conditionType)"
        @update:modelValue="$emit('update:modelValue', currentItem)"
      />
    </v-sheet>
  </v-sheet>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { FunkThreshold } from "../composables/FunkThreshold";
import {
  CountCondition,
  ConditionType,
} from "@/types/index";

type ModelValueType =
  | CountCondition
  | undefined;

const props = defineProps<{
  modelValue: ModelValueType;
  conditionType: ConditionType;
}>();

const emit = defineEmits<{
  "update:modelValue": [ModelValueType];
}>();

// 型ガード関数 // TODO Thresholdの修正
const isElapsedCondition = (value: ModelValueType): value is ElapsedCondition =>
  value?.type === 'elapsed';
const isCountCondition = (value: ModelValueType): value is CountCondition =>
  value?.type === 'count';
const isGiftCondition = (value: ModelValueType): value is GiftCondition =>
  value?.type === 'gift';

// computedプロパティで型安全な値を提供
const currentItem = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const { getComparisonItems, getValueLabel, getUnitItems } = FunkThreshold();

const getValue1Label = (type: ConditionType) => getValueLabel(type);
const getValue2Label = (type: ConditionType) => getValueLabel(type, true);
</script>
