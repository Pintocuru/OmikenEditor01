<!-- src/components/RuleEditor.vue -->
<template>
  <v-list>
    <v-list-item>
      <v-row>
        <v-col cols="12" sm="9">
          <v-text-field v-model="localRule.name" label="おみくじ名" @input="updateRule"></v-text-field>
        </v-col>
        <v-col cols="12" sm="3">
          <v-autocomplete v-model="localRule.modes" label="モード" :items="localRule.modeSelect"
            @input="updateRule"></v-autocomplete>
        </v-col>
        <v-col cols="12">
          <v-slider v-model="localRule.switch" :max="4" :ticks="{
            0: '無効', 1: '誰でも', 2: 'メンバー', 3: 'モデレーター', 4: '管理者',
          }" show-ticks="always" step="1" tick-size="4" @input="updateRule"></v-slider>
        </v-col>
        <v-col cols="12">
          <v-combobox v-model="localRule.matchExact" label="完全一致" clearable chips multiple
            @input="updateRule"></v-combobox>
        </v-col>
        <v-col cols="12">
          <v-combobox v-model="localRule.matchStartsWith" label="前方一致" clearable chips multiple
            @input="updateRule"></v-combobox>
        </v-col>
        <v-col cols="12">
          <v-combobox v-model="localRule.matchIncludes" label="部分一致" clearable chips multiple
            @input="updateRule"></v-combobox>
        </v-col>
      </v-row>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import { ref, watch, defineProps } from 'vue';
import type { omikujiRule } from '../types';
import { SelectedItem } from '@/AppTypes';

// propsの定義
const props = defineProps<{
  rule: omikujiRule;
  selectedItem: SelectedItem | null;
  state: { rules: omikujiRule[] };
}>();

// emitの定義
const emit = defineEmits<{
  (e: 'update:rule', value: omikujiRule): void;
}>();

// localRuleの初期化
const localRule = ref<omikujiRule>({ ...props.rule });

// 親コンポーネントからのrule変更を監視
watch(() => props.rule, (newValue) => {
  localRule.value = { ...newValue };
}, { deep: true });

// ルールの更新関数
const updateRule = () => {
  emit('update:rule', { ...localRule.value });
};
</script>