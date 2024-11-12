<!-- src/components/ListRulesOmikujiSetting.vue -->
<template>
  <v-sheet class="d-flex ga-2 justify-end">
    <v-expand-transition>
      <v-select v-if="uiState.showEnabledIds" 
        v-model="currentItem" 
        :items="omikujiLists" 
        label="有効にするおみくじ" 
        chips
        multiple 
        item-title="name" 
        item-value="id"
        @update:modelValue="(value) => updateRulesEnabledIds(value, ruleId)" 
      />
    </v-expand-transition>
    <v-tooltip text="有効リストを表示" location="top">
      <template v-slot:activator="{ props }">
        <v-btn icon :color="uiState.showEnabledIds ? 'primary' : ''" v-bind="props"
          @click="uiState.showEnabledIds = !uiState.showEnabledIds">
          <v-icon>mdi-format-list-checks</v-icon>
        </v-btn>
      </template>
    </v-tooltip>
    <v-tooltip text="出現割合を編集する" location="top">
      <template v-slot:activator="{ props }">
        <v-btn icon :color="uiState.showWeightEditor ? 'primary' : ''" v-bind="props"
          @click="uiState.showWeightEditor = !uiState.showWeightEditor">
          <v-icon>mdi-percent</v-icon>
        </v-btn>
      </template>
    </v-tooltip>
    <v-tooltip text="アイテムを追加する" location="top">
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props" @click="addItemOmikuji" color="primary" variant="flat" class="mr-2">
          <v-icon left>mdi-plus</v-icon>
        </v-btn>
      </template>
    </v-tooltip>
  </v-sheet>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { FunkRules } from "../composables/FunkRules";
import type { OmikenType, OmikenCategory, OmikenEntry } from "@/types";

const props = defineProps<{
  Omiken: OmikenType;
  ruleId: string;
  enabledIds: string[];
  uiState: { showEnabledIds: boolean; showWeightEditor: boolean; };
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
}>();

const { omikujiLists } = FunkRules();

const currentItem = computed({
  get: () => props.enabledIds,
  set: (value) => {
    if (props.ruleId) {
      updateRulesEnabledIds(value, props.ruleId);
    }
  },
});

const addItemOmikuji = () => {
  if (props.ruleId) {
    emit("update:Omiken", {
      type: "omikuji",
      addKeys: [{ rulesId: props.ruleId }],
    });
  }
};

const updateRulesEnabledIds = (enabledIds: string[], ruleId: string) => {
  if (!ruleId) return;
  const updatedRule = {
    ...props.Omiken.rules[ruleId],
    enabledIds,
  };

  emit("update:Omiken", {
    type: "rules",
    update: {
      [ruleId]: updatedRule,
    },
  });
};
</script>