<!-- src/components/DialogThreshold/ThresholdSelect.vue -->
<template>
  <v-row justify="space-around">
    <v-col v-for="item in conditions" :key="item.value" cols="auto">
      <v-tooltip location="top">
        <template v-slot:activator="{ props }">
          <v-btn
            icon
            :variant="threshold.conditionType === item.value ? 'elevated' : 'flat'"
            :color="threshold.conditionType === item.value ? themeColor : ''"
            v-bind="props"
            @click="$emit('update:condition', item.value)"
          >
            <v-icon>{{ item.icon }}</v-icon>
          </v-btn>
        </template>
        <span>{{ item.label }}: {{ item.description }}</span>
      </v-tooltip>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { FunkThreshold } from '@/composables/FunkThreshold'
import { ConditionType, ThresholdType } from '@/types';

const props = defineProps<{
  threshold: ThresholdType
}>()

const emit = defineEmits<{
  (e: 'update:condition', condition: ConditionType): void
}>()

const { THRESHOLD_ITEMS } = FunkThreshold()
const conditions = THRESHOLD_ITEMS
</script>