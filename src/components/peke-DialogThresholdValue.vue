<!-- DialogThresholdValue.vue -->
<template>
  <v-col cols="12" md="4">
    <v-text-field
      :v-model.number="localValue1"
      type="number"
      label="値1"
      @update:model-value="updateValue"
    />
  </v-col>
  <v-col v-if="showValue2" cols="12" md="4">
    <v-text-field
      v-model.number="localValue2"
      type="number"
      label="値2"
      @update:model-value="updateValue"
    />
  </v-col>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ConditionType } from "../types";

const props = defineProps<{
  modelValue: {
    value1: number;
    value2?: number;
    comparison: string;
    type: string;
    isEnabled: boolean;
  };
  conditionType: ConditionType;
}>();

const emit = defineEmits<{
  (e: 'input', value: typeof props.modelValue): void;
}>();

const localValue1 = ref(props.modelValue.value1);
const localValue2 = ref(props.modelValue.value2);

const showValue2 = computed(() => props.modelValue.comparison === "range");

const updateValue = () => {
  emit('input', {
    ...props.modelValue,
    value1: localValue1.value,
    value2: showValue2.value ? localValue2.value : undefined
  });
};

watch(() => props.modelValue, (newValue) => {
  localValue1.value = newValue.value1;
  localValue2.value = newValue.value2;
}, { deep: true });
</script>