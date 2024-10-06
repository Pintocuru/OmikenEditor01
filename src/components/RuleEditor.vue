<!-- src/components/RuleEditor.vue -->
<template>
  <v-card v-if="rule">
    <v-card-title>ルールエディタ</v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" sm="9">
          <v-text-field v-model="rule.name" label="おみくじ名"></v-text-field>
        </v-col>
        <v-col cols="12" sm="3">
          <v-select v-model="rule.modes" label="モード" :items="rule.modeSelect"></v-select>
        </v-col>
        <v-col cols="12">
          <v-slider v-model="rule.switch" :max="4" :ticks="{ 0: '無効', 1: '誰でも', 2: 'メンバー', 3: 'モデレーター', 4: '管理者' }"
            show-ticks="always" step="1" tick-size="4"></v-slider>
        </v-col>
        <v-col cols="12">
          <v-combobox v-model="rule.matchExact" label="完全一致" clearable chips multiple></v-combobox>
        </v-col>
        <v-col cols="12">
          <v-combobox v-model="rule.matchStartsWith" label="前方一致" clearable chips multiple></v-combobox>
        </v-col>
        <v-col cols="12">
          <v-combobox v-model="rule.matchIncludes" label="部分一致" clearable chips multiple></v-combobox>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
  <v-alert v-else type="warning">ルールが選択されていません。</v-alert>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { omikujiRule } from '../types';

const props = defineProps<{
  selectedRule: omikujiRule | null;
}>();

const emit = defineEmits<{
  (e: 'update:rule', value: omikujiRule): void;
}>();

const rule = ref<omikujiRule | null>(null);

watch(() => props.selectedRule, (newValue) => {
  rule.value = newValue ? JSON.parse(JSON.stringify(newValue)) : null;
}, { immediate: true, deep: true });

watch(rule, (newValue) => {
  // 変更があった場合のみ emit を実行
  if (newValue && JSON.stringify(newValue) !== JSON.stringify(props.selectedRule)) {
    emit('update:rule', newValue);
  }
}, { deep: true });
</script>