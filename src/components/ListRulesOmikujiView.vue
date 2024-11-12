<!-- src/components/ListRulesOmikujiView.vue -->
<template>
  <draggable
    v-model="currentItem.enabledIds"
    item-key="id"
    class="d-flex flex-wrap"
    @end="() => updateRulesEnabledIds(currentItem.enabledIds, currentItem.id)"
  >
    <template #item="{ element: omikujiId }">
      <v-col cols="12" sm="6" md="4" lg="3" class="pa-1">
        <v-card
          variant="tonal"
          :color="weightColor(omikujiId, currentItem.enabledIds)"
        >
          <!-- タイトルバーと操作ボタン -->
          <v-toolbar
            density="compact"
            :color="getPostTypeColor(omikuji[omikujiId].post, true)"
          >
            <v-toolbar-title @click="openEditorItem('omikuji', omikujiId)">
              <v-tooltip bottom>
                <template #activator="{ props }">
                  <span v-bind="props" class="truncate">{{
                    omikuji[omikujiId]?.name
                  }}</span>
                </template>
                <span>{{ omikuji[omikujiId]?.name }}</span>
              </v-tooltip>
            </v-toolbar-title>
            <template #append>
              <PartsArrayAction
              category="omikuji"
                :rulesEntry="currentItem"
                :omikujiEntry="omikuji[omikujiId]"
                @edit="openEditorItem('omikuji', omikujiId)"
                @update:Omiken="updateOmiken"
              />
            </template>
          </v-toolbar>

          <!-- おみくじ内容 -->
          <v-card-text class="py-4">
            <!-- onecommeのcontent表示 -->
            <v-sheet class="pb-3" v-if="omikuji[omikujiId]?.post">
              {{ getOnecommeContent(omikuji[omikujiId].post) }}
            </v-sheet>

            <v-sheet class="list-group d-flex flex-wrap">
              <!-- 発動条件の表示 -->
              <v-chip
                v-if="isThreshold(omikuji[omikujiId]?.threshold)"
                density="compact"
                variant="outlined"
                color="yellow lighten-3"
              >
                🔐 {{ getExampleText(omikuji[omikujiId].threshold) }}
              </v-chip>
              <!-- 既存の出現割合表示 -->
              <v-chip density="compact" variant="text">
                🎯 {{ omikuji[omikujiId]?.weight }}/{{
                  weightTotal(currentItem.enabledIds)
                }}
                <span class="ml-2"
                  >({{
                    weightPercentage(omikujiId, currentItem.enabledIds)
                  }}%)</span
                >
              </v-chip>
            </v-sheet>
            <!-- 出現割合表示の編集 -->
            <v-sheet v-if="uiState.showWeightEditor">
              <v-text-field
                class="pt-2"
                v-model.number="omikuji[omikuji[omikujiId].id].weight"
                label="出現割合"
                min="0"
                type="number"
                @update:modelValue="updateOmikujiWeight(omikuji[omikujiId])"
              />
              <v-progress-linear
                :model-value="
                  weightPercentage(
                    omikuji[omikujiId].id,
                    currentItem.enabledIds
                  )
                "
                buffer-value="10"
                absolute
                prop
                :color="
                  weightColor(omikuji[omikujiId].id, currentItem.enabledIds)
                "
              />
            </v-sheet>
            <!-- 出現割合を表示 -->
          </v-card-text>
        </v-card>
      </v-col>
    </template>
  </draggable>
</template>

<script setup lang="ts">
import { computed } from "vue";
import PartsArrayAction from "./common/PartsArrayAction.vue";
import { FunkRules } from "../composables/FunkRules";
import { FunkOmikuji } from "../composables/FunkOmikuji";
import { FunkThreshold } from "../composables/FunkThreshold";
import draggable from "vuedraggable";
import type {
  ListCategory,
  ListEntry,
  ListTypeMap,
  OmikenCategory,
  OmikenEntry,
  OmikujiType,
  RulesType,
} from "@/types";
import { FunkEmits } from "@/composables/FunkEmits";

const props = defineProps<{
  rulesEntry: RulesType;
  omikuji: Record<string, ListTypeMap["omikuji"]>;
  uiState: { showEnabledIds: boolean; showWeightEditor: boolean };
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

// コンポーザブル:FunkEmits
const { updateOmiken, updateOmikenEntry, openEditorItem } = FunkEmits(emit);
// コンポーザブル:funkRules
const { weightTotal, weightPercentage, weightColor } = FunkRules();
// コンポーザブル:FunkOmikuji
const { getOnecommeContent, getPostTypeColor } = FunkOmikuji();
// コンポーザブル:funkThreshold
const { isThreshold, getExampleText } = FunkThreshold();

// ドラッグ&ドロップでの更新も同様に
const currentItem = computed({
  get: () => props.rulesEntry,
  set: (value) =>
    props.rulesEntry &&
    updateOmiken({
      type: "rules",
      update: { [props.rulesEntry.id]: { ...value } },
    }),
});

// rules.enabledIds の更新
const updateRulesEnabledIds = (enabledIds: string[], ruleId: string) => {
  if (!ruleId) return;
  const updatedRule = {
    [ruleId]: {
      ...props.rulesEntry,
      enabledIds,
    },
  };
  updateOmikenEntry("rules", updatedRule);
};
// omikuji.weight の更新
const updateOmikujiWeight = (omikujiData: OmikujiType) => {
  updateOmikenEntry("omikuji", { [omikujiData.id]: omikujiData });
};
</script>
