<!-- src/components/ListRules.vue -->
<template>
  <!-- Rules View -->
  <v-card v-for="(ruleId, index) in Omiken.rulesOrder" :key="ruleId" class="mb-2">
    <v-toolbar :color="Omiken.rules[ruleId]?.color">
      <PartsToolbarMove
        :index="index"
        :rulesOrder="Omiken.rulesOrder"
        @update:Omiken="updateOmiken"
      />
      <v-toolbar-title class="ml-2" @click="openEditorItem('rules', ruleId)">
        <span v-if="isThreshold(Omiken.rules[ruleId]?.threshold)">🔐</span>
        {{ index + 1 }}. {{ Omiken.rules[ruleId]?.name }}
      </v-toolbar-title>
      <template #append>
        <PartsToolbarAction
          selectCategory="rules"
          :item="Omiken.rules[ruleId]"
          @edit="openEditorItem('rules', ruleId)"
          @update:Omiken="updateOmiken"
        />
      </template>
    </v-toolbar>
    <v-card-text class="list-group d-flex flex-wrap">
      <v-chip
        v-if="
          Omiken.rules[ruleId]?.matchStartsWith &&
          Omiken.rules[ruleId]?.matchStartsWith.length > 0
        "
        variant="text"
        density="compact"
      >
        <v-icon color="primary">mdi-arrow-right-bold-box</v-icon>
        {{ Omiken.rules[ruleId]?.matchStartsWith.join(", ") }}
      </v-chip>
      <v-chip v-else variant="text" density="compact">
        <v-icon color="primary">mdi-arrow-right-bold-box</v-icon>
        (すべてのコメントが対象)
      </v-chip>
      <!-- 発動条件の表示 -->
      <v-chip
        v-if="isThreshold(Omiken.rules[ruleId]?.threshold)"
        density="compact"
        variant="outlined"
        color="yellow lighten-3"
      >
        🔐{{ getExampleText(Omiken.rules[ruleId].threshold) }}
      </v-chip>

      <!-- Omikuji View -->
      <v-expansion-panels multiple class="pt-2">
        <v-expansion-panel>
          <v-expansion-panel-title color="primary">
            <span class="text-h6">
              <v-icon icon="mdi-crystal-ball"></v-icon>
              該当するおみくじ
            </span>
            <v-chip label class="ml-4">
              {{ Omiken.rules[ruleId]?.enabledIds.length }} items
            </v-chip>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <ListRulesOmikuji
              :Omiken="Omiken"
              :ruleId="ruleId"
              :enabledIds="Omiken.rules[ruleId].enabledIds"
              @update:enabledIds="
                (newEnabledIds) => updateRulesEnabledIds(newEnabledIds, ruleId)
              "
              @open-editor="openEditor"
              @update:Omiken="updateOmiken"
            />
          </v-expansion-panel-text>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-title color="secondary">
            <span class="text-h6">
              <v-icon icon="mdi-tag"></v-icon>
              該当するプレースホルダー
            </span>
            <v-chip label class="ml-4">
              {{
                rulesOfPlaces(Omiken, Omiken.rules[ruleId]?.enabledIds)
                  .displayPlaces.value.length
              }}
              items
            </v-chip>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <!-- Place View -->
            <ListRulesPlace
              ref="childRef"
              :Omiken="Omiken"
              :enabledIds="Omiken.rules[ruleId].enabledIds"
              @open-editor="openEditor"
              @update:Omiken="updateOmiken"
            />
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import ListRulesOmikuji from "./ListRulesOmikuji.vue";
import ListRulesPlace from "./ListRulesPlace.vue";
import PartsToolbarAction from "./common/PartsToolbarAction.vue";
import PartsToolbarMove from "./common/PartsToolbarMove.vue";
import type {
  OmikenType,
  OmikenEntry,
  ListCategory,
  ListEntry,
  OmikenCategory,
} from "@/types";
import { rulesOfPlaces } from "@/composables/FunkRules";
import { FunkThreshold } from "@/composables/FunkThreshold";

const props = defineProps<{
  Omiken: OmikenType;
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

// コンポーザブル:funkThreshold
const { isThreshold, getExampleText } = FunkThreshold();

// rules.enabledIds の更新
const updateRulesEnabledIds = (enabledIds: string[], ruleId: string) => {
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

// omikujiのエディターを開く
const openEditorItem = (type: ListCategory, id: string) => {
  emit("open-editor", {
    isOpen: true,
    type,
    mode: null,
    key: id,
  });
};

// ダイアログを開く
const openEditor = (editorItem: ListEntry<ListCategory>) =>
  emit("open-editor", editorItem);
const updateOmiken = (payload: OmikenEntry<OmikenCategory>) =>
  emit("update:Omiken", payload);
</script>
