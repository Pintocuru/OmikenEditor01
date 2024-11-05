<!-- src/components/DialogThresholdInput.vue -->
<template>
  <v-row dense>
    <v-col 
      cols="12" 
      sm="4" 
      v-if="safeModelValue && 'comparison' in safeModelValue"
    >
      <v-select
        v-model="safeModelValue.comparison"
        :items="getComparisonItems(conditionType)"
        label="比較方法"
        @update:modelValue="$emit('update:modelValue', safeModelValue)"
      />
    </v-col>

    <v-col
      v-if="isElapsedCondition(safeModelValue) || isCountCondition(safeModelValue)"
      cols="12"
      sm="4"
    >
      <v-select
        v-if="safeModelValue?.unit"
        v-model="safeModelValue.unit"
        :items="getUnitItems(conditionType)"
        label="単位"
        @update:modelValue="$emit('update:modelValue', safeModelValue)"
      />
    </v-col>

    <v-col v-if="safeModelValue" cols="6" sm="4">
      <v-text-field
        v-model.number="safeModelValue.value1"
        type="number"
        :label="getValue1Label(conditionType)"
        @update:modelValue="$emit('update:modelValue', safeModelValue)"
      />
    </v-col>

    <v-col
      v-if="safeModelValue && (!('comparison' in safeModelValue) || safeModelValue.comparison === 'range')"
      cols="6"
      sm="4"
    >
      <v-text-field
        v-model.number="safeModelValue.value2"
        type="number"
        :label="getValue2Label(conditionType)"
        @update:modelValue="$emit('update:modelValue', safeModelValue)"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { funkThreshold  } from "@/composables/funkThreshold";
import {
  TimeCondition,
  ElapsedCondition,
  CountCondition,
  GiftCondition,
  ConditionType} from "@/types";

type ModelValueType = TimeCondition | ElapsedCondition | CountCondition | GiftCondition | undefined;

const props = defineProps<{
  modelValue: ModelValueType;
  conditionType: ConditionType;
}>();

const emit = defineEmits<{
  'update:modelValue': [ModelValueType]
}>();

// 型ガード関数
const isTimeCondition = (value: ModelValueType): value is TimeCondition => 
  value?.type === ConditionType.TIME;
const isElapsedCondition = (value: ModelValueType): value is ElapsedCondition => 
  value?.type === ConditionType.ELAPSED;
const isCountCondition = (value: ModelValueType): value is CountCondition => 
  value?.type === ConditionType.COUNT;
const isGiftCondition = (value: ModelValueType): value is GiftCondition => 
  value?.type === ConditionType.GIFT;

// デフォルト値の生成
const getDefaultValue = (type: ConditionType): ModelValueType => {
  const base = { isEnabled: true, value1: 0 };
  switch (type) {
    case ConditionType.TIME:
      return { ...base, type, comparison: 'range' as const, value2: 23 };
    case ConditionType.ELAPSED:
      return { ...base, type, comparison: 'min' as const, unit: 'minute' };
    case ConditionType.COUNT:
      return { ...base, type, comparison: 'min' as const, unit: 'lc' };
    case ConditionType.GIFT:
      return { ...base, type, comparison: 'min' as const };
    default:
      return undefined;
  }
};

// computedプロパティで型安全な値を提供
const safeModelValue = computed({
  get: () => props.modelValue || getDefaultValue(props.conditionType),
  set: (value) => emit('update:modelValue', value)
});

const { getComparisonItems, getValueLabel, getUnitItems } = funkThreshold();

const getValue1Label = (type: ConditionType) => getValueLabel(type);
const getValue2Label = (type: ConditionType) => getValueLabel(type, true);
</script>