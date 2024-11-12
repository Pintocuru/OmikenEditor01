<!-- src/components/ListRulesOmikujiSetting.vue -->
<template>
  <v-sheet class="d-flex ga-2 justify-end">
    <v-expand-transition>
      <v-select v-if="uiState.showEnabledIds" 
        v-model="currentItem.enabledIds" 
        :items="omikujiLists" 
        label="有効にするおみくじ" 
        chips
        multiple 
        item-title="name" 
        item-value="id"
        @update:modelValue="(value) => updateRulesEnabledIds(value, currentItem.id)" 
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
import type { OmikenCategory, OmikenEntry, RulesType } from "@/types";

const props = defineProps<{
  rulesEntry: RulesType;
  uiState: { showEnabledIds: boolean; showWeightEditor: boolean; };
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
}>();

const { omikujiLists } = FunkRules();

const currentItem = computed({
  get: () => props.rulesEntry,
  set: (value) => {
    if (props.rulesEntry) {
      updateRulesEnabledIds(value.enabledIds, props.rulesEntry.id);
    }
  },
});

const addItemOmikuji = () => {
  if (props.rulesEntry.id) {
    emit("update:Omiken", {
      type: "omikuji",
      addKeys: [{ rulesId: props.rulesEntry.id }],
    });
  }
};

// rules.enabledIds の更新
const updateRulesEnabledIds = (enabledIds: string[], ruleId: string) => {
  if (!ruleId) return;
  const updatedRule = {
    ...props.rulesEntry,
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