<!-- src/components/DialogThreshold/ThresholdSelect.vue -->
<template>
 <v-row justify="space-around">
  <v-col v-for="item in THRESHOLD_ITEMS" :key="item.value" cols="auto">
   <v-tooltip location="top">
    <template v-slot:activator="{ props }">
     <v-btn
      icon
      :variant="threshold.conditionType === item.value ? 'elevated' : 'flat'"
      :color="threshold.conditionType === item.value ? 'primary' : ''"
      v-bind="props"
      @click="$emit('update:condition', item.value as ConditionType)"
     >
      <v-icon>{{ item.icon }}</v-icon>
     </v-btn>
    </template>
    <span>{{ item.label }}: {{ item.description }}</span>
   </v-tooltip>
  </v-col>
 </v-row>

   <v-tabs v-model="tab" align-tabs="center" stacked>
   <v-tab v-for="tabItem in THRESHOLD_ITEMS" :key="tabItem.value" :value="tabItem.value">
    <v-icon :icon="tabItem.icon"></v-icon>
    {{ tabItem.label }}
   </v-tab>
  </v-tabs>
</template>

<script setup lang="ts">
import { FunkThreshold } from '@/composables/FunkThreshold';
import { ConditionType, ThresholdType } from '@/type';
import { ref } from 'vue';

const props = defineProps<{
 threshold: ThresholdType;
}>();

const emit = defineEmits<{
 (e: 'update:condition', condition: ConditionType): void;
}>();

const tab = ref<'post' | 'threshold' | 'status' | 'places' | 'scripts'>('post'); // タブの状態管理

// コンポーザブル:FunkThreshold
const { THRESHOLD_ITEMS } = FunkThreshold();
</script>
