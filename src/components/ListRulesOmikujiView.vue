<!-- src/components/ListRulesOmikujiView.vue -->
<template>
  <draggable
    v-model="currentItem.enableIds"
    item-key="id"
    class="d-flex flex-wrap"
    @end="() => updateRulesEnableIds(currentItem.enableIds, currentItem.id)"
  >
    <template #item="{ element: omikujiId }">
      <v-col cols="12" sm="6" md="4" lg="3" class="pa-1">
        <v-card
          variant="tonal"
          :color="weightColor(omikujiId, currentItem.enableIds)"
        >
          <!-- タイトルバーと操作ボタン -->
          <v-toolbar
            density="compact"
            :color="getPostTypeColor(omikujis[omikujiId].post, true)"
          >
            <v-toolbar-title @click="openEditorItem('omikujis', omikujiId)">
              <v-tooltip bottom>
                <template #activator="{ props }">
                  <span v-bind="props" class="truncate">{{
                    omikujis[omikujiId]?.name
                  }}</span>
                </template>
                <span>{{ omikujis[omikujiId]?.name }}</span>
              </v-tooltip>
            </v-toolbar-title>
            <template #append>
              <PartsArrayAction
                category="omikujis"
                :rulesEntry="currentItem"
                :omikujiEntry="omikujis[omikujiId]"
                @edit="openEditorItem('omikujis', omikujiId)"
                @update:Omiken="updateOmiken"
              />
            </template>
          </v-toolbar>

          <!-- おみくじ内容 -->
          <v-card-text class="py-4">
            <!-- onecommeのcontent表示 -->
            <v-sheet class="pb-3" v-if="omikujis[omikujiId]?.post">
              {{ getOnecommeContent(omikujis[omikujiId].post) }}
            </v-sheet>

            <v-sheet class="list-group d-flex flex-wrap">
              <!-- 発動条件の表示 -->
              <v-chip
                v-if="isThreshold(omikujis[omikujiId]?.threshold)"
                density="compact"
                variant="outlined"
                color="yellow lighten-3"
              >
                🔐 {{ getExampleText(omikujis[omikujiId].threshold) }}
              </v-chip>
              <!-- 既存の出現割合表示 -->
              <v-chip density="compact" variant="text">
                🎯 {{ omikujis[omikujiId]?.weight }}/{{
                  weightTotal(currentItem.enableIds)
                }}
                <span class="ml-2"
                  >({{
                    weightPercentage(omikujiId, currentItem.enableIds)
                  }}%)</span
                >
              </v-chip>
            </v-sheet>
            <!-- 出現割合表示の編集 -->
            <v-sheet v-if="uiState.showWeightEditor">
              <v-text-field
                class="pt-2"
                v-model.number="omikujis[omikujis[omikujiId].id].weight"
                label="出現割合"
                min="0"
                type="number"
                @update:modelValue="updateOmikujiWeight(omikujis[omikujiId])"
              />
              <v-progress-linear
                :model-value="
                  weightPercentage(
                    omikujis[omikujiId].id,
                    currentItem.enableIds
                  )
                "
                buffer-value="10"
                absolute
                prop
                :color="
                  weightColor(omikujis[omikujiId].id, currentItem.enableIds)
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
  OmikenTypeMap,
  OmikenCategory,
  OmikenEntry,
  OmikujiType,
  RulesType,
} from "@/types/index";
import { FunkEmits } from "@/composables/FunkEmits";

const props = defineProps<{
  rule: RulesType;
  omikujis: Record<string, OmikenTypeMap["omikujis"]>;
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
  get: () => props.rule,
  set: (value) =>
    props.rule &&
    updateOmiken({
      type: "rules",
      update: { [props.rule.id]: { ...value } },
    }),
});

// rules.enableIds の更新
const updateRulesEnableIds = (enableIds: string[], ruleId: string) => {
  const updatedRule: Record<string, RulesType> = {
    [ruleId]: {
      ...props.rule,
      enableIds,
    },
  };
  updateOmikenEntry("rules", updatedRule);
};
// omikuji.weight の更新
const updateOmikujiWeight = (omikujiData: OmikujiType) => {
  updateOmikenEntry("omikujis", { [omikujiData.id]: omikujiData });
};
</script>
