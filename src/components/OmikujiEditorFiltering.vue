<!-- src/components/OmikujiEditorFiltering.vue -->
<template>
  <v-card>
    <v-toolbar color="primary" density="compact">
      <v-toolbar-title>フィルタリング設定</v-toolbar-title>
    </v-toolbar>
    <v-tooltip location="bottom">
      <template v-slot:activator="{ props }">
        <v-select v-bind="props" v-model="currentOmikuji.threshold.type" :items="thresholdTypes" item-title="text"
          item-value="value" label="フィルタリング基準" density="compact" @change="updateOmikuji"></v-select>
      </template>
      <span>適用外の場合は抽選の対象にならない基準を設定します。</span>
    </v-tooltip>

    <v-row v-if="currentOmikuji.threshold.type !== 'none'" class="auto" dense>
      <v-col cols="12" sm="4">
        <v-select v-model="currentOmikuji.threshold.comparison" :items="comparisonItems" item-title="text"
          item-value="value" label="比較方法" density="compact" @change="updateOmikuji"></v-select>
      </v-col>
      <v-col cols="12" sm="4">
        <v-text-field v-model.number="currentOmikuji.threshold.value" label="基準値" type="number" min="0"
          density="compact" @input="updateOmikuji"></v-text-field>
      </v-col>
      <v-col cols="12" sm="4" v-if="currentOmikuji.threshold.comparison === 'range'">
        <v-text-field v-model.number="currentOmikuji.threshold.valueMax" label="基準値(最大)" type="number"
          density="compact" @input="updateOmikuji"></v-text-field>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import type { omikujiType } from '../types';

const props = defineProps<{
  currentOmikuji: omikujiType;
  thresholdTypes: Array<{ text: string; value: string }>;
  comparisonItems: Array<{ text: string; value: string }>;
}>();

const emit = defineEmits<{
  (e: "update", omikuji: omikujiType): void;
}>();

const updateOmikuji = () => {
  emit("update", props.currentOmikuji);
};
</script>