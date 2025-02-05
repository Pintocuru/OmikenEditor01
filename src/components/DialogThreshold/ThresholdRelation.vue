<!-- src/components/DialogThreshold/ThresholdRelation.vue -->
<template>
 <v-row>
  <v-col cols="12" sm="6">
   <v-switch
    :model-value="threshold.isNot"
    label="条件を反転する (NOT)"
    color="error"
    hide-details
    density="comfortable"
    class="custom-switch"
    @update:model-value="(value) => updateValue('isNot', value)"
   >
    <template #label>
     <span class="text-subtitle-1 font-weight-medium"> 条件を反転する (NOT) </span>
    </template>
   </v-switch>
  </v-col>

  <v-col cols="12" sm="6">
   <v-radio-group
    :model-value="threshold.isAnd"
    row
    @update:model-value="(value) => updateValue('isAnd', value)"
    class="custom-radio-group"
   >
    <template #label>
     <span class="text-subtitle-1 font-weight-medium mb-2 d-block"> 次の条件との関係 </span>
    </template>
    <v-radio v-for="(opt, i) in options" :key="i" :value="opt.value" :color="opt.color" class="custom-radio">
     <template #label>
      <v-chip :color="opt.color" size="large" class="px-6 custom-chip" variant="elevated">
       {{ opt.label }}
      </v-chip>
     </template>
    </v-radio>
   </v-radio-group>
  </v-col>
 </v-row>
</template>

<script setup lang="ts">
import { ThresholdType } from '@/types/Omiken';

const props = defineProps<{
 threshold: ThresholdType;
}>();

const emit = defineEmits<{
 (e: 'update:threshold', threshold: ThresholdType): void;
}>();

const options = [
 { value: true, label: 'AND', color: 'primary' },
 { value: false, label: 'OR', color: 'warning' }
];

const updateValue = (key: 'isNot' | 'isAnd', value: boolean | null) => {
 if (value === null) return;
 emit('update:threshold', { ...props.threshold, [key]: value });
};
</script>

<style scoped>
.custom-switch {
 transform: scale(1.1);
 margin-left: 8px;
}

.custom-radio-group {
 margin-top: 4px;
}

.custom-radio {
 margin-right: 16px;
}

.custom-chip {
 font-weight: 500;
 font-size: 1rem;
 transition: all 0.2s ease;
}

.custom-chip:hover {
 transform: scale(1.05);
 box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* ラジオボタンのサイズ調整 */
:deep(.v-radio) {
 transform: scale(1.1);
}
</style>
