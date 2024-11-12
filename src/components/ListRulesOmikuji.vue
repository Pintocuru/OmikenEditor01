<!-- src/components/ListRulesOmikuji.vue -->
<!-- !分割したため、使用しない。 -->
<template>
  <!-- Omikuji Setting -->
  <v-sheet class="d-flex ga-2 justify-end">
    <v-expand-transition>
      <v-select v-if="uiState.showEnabledIds" v-model="currentItem" :items="omikujiLists" label="有効にするおみくじ" chips
        multiple item-title="name" item-value="id"
        @update:modelValue="(value) => updateRulesEnabledIds(value, ruleId)" />
    </v-expand-transition>

    <!-- 有効リスト -->
    <v-tooltip text="有効リストを表示" location="top">
      <template v-slot:activator="{ props }">
        <v-btn icon :color="uiState.showEnabledIds ? 'primary' : ''" v-bind="props"
          @click="uiState.showEnabledIds = !uiState.showEnabledIds">
          <v-icon>mdi-format-list-checks</v-icon>
        </v-btn>
      </template>
    </v-tooltip>
    <!-- 出現割合を編集 -->
    <v-tooltip text="出現割合を編集する" location="top">
      <template v-slot:activator="{ props }">
        <v-btn icon :color="uiState.showWeightEditor ? 'primary' : ''" v-bind="props"
          @click="uiState.showWeightEditor = !uiState.showWeightEditor">
          <v-icon>mdi-percent</v-icon>
        </v-btn>
      </template>
    </v-tooltip>
    <!-- アイテムを追加 -->
    <v-tooltip text="アイテムを追加する" location="top">
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props" @click="addItemOmikuji" color="primary" variant="flat" class="mr-2">
          <v-icon left>mdi-plus</v-icon>
        </v-btn>
      </template>
    </v-tooltip>
  </v-sheet>

  <!-- Omikuji View -->
  <v-card-text>
    <v-row>
      <draggable v-model="currentItem" item-key="id" class="d-flex flex-wrap"
        @end="() => updateRulesEnabledIds(currentItem, ruleId)">
        <template #item="{ element: omikujiId }">
          <v-col cols="12" sm="6" md="4" lg="3" class="pa-1">
            <v-card variant="tonal" :color="weightColor(omikujiId, enabledIds)">
              <!-- タイトルバーと操作ボタン -->
              <v-toolbar density="compact" :color="getPostTypeColor(Omiken.omikuji[omikujiId].post, true)">
                <v-toolbar-title @click="openEditorItem('omikuji', omikujiId)">
                  <!-- TODO 幅が狭いと下記は殆ど見えない。解決方法は? -->
                  {{ Omiken.omikuji[omikujiId]?.name }}
                </v-toolbar-title>
                <template #append>
                  <PartsToolbarAction selectCategory="omikuji" :rule-id="ruleId" :item="Omiken.omikuji[omikujiId]"
                    :isSmall="true" @edit="openEditorItem('omikuji', omikujiId)" @update:Omiken="updateOmiken" />
                </template>
              </v-toolbar>

              <!-- おみくじ内容 -->
              <v-card-text class="py-4">
                <!-- onecommeのcontent表示 -->
                <v-sheet class="pb-3" v-if="Omiken.omikuji[omikujiId]?.post">
                  {{ getOnecommeContent(Omiken.omikuji[omikujiId].post) }}
                </v-sheet>

                <v-sheet class="list-group d-flex flex-wrap">
                  <!-- 発動条件の表示 -->
                  <v-chip v-if="isThreshold(Omiken.omikuji[omikujiId]?.threshold)" density="compact" variant="outlined"
                    color="yellow lighten-3">
                    🔐 {{ getExampleText(Omiken.omikuji[omikujiId].threshold) }}
                  </v-chip>
                  <!-- 既存の出現割合表示 -->
                  <v-chip density="compact" variant="text">
                    🎯 {{ Omiken.omikuji[omikujiId]?.weight }}/{{
                      weightTotal(enabledIds)
                    }}
                    <span class="ml-2">({{ weightPercentage(omikujiId, enabledIds) }}%)</span>
                  </v-chip>
                </v-sheet>
                <!-- 出現割合表示の編集 -->
                <v-sheet v-if="uiState.showWeightEditor">
                  <v-text-field class="pt-2" v-model.number="Omiken.omikuji[Omiken.omikuji[omikujiId].id].weight
                    " label="出現割合" min="0" type="number" @update:modelValue="
                      updateOmikujiWeight(Omiken.omikuji[omikujiId])
                      " />
                  <v-progress-linear :model-value="weightPercentage(Omiken.omikuji[omikujiId].id, enabledIds)
                    " buffer-value="10" absolute prop :color="weightColor(Omiken.omikuji[omikujiId].id, enabledIds)
                      " />
                </v-sheet>
                <!-- 出現割合を表示 -->
              </v-card-text>
            </v-card>
          </v-col>
        </template>
      </draggable>
    </v-row>
  </v-card-text>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import PartsToolbarAction from "./common/PartsToolbarAction.vue";
import { FunkRules } from "../composables/FunkRules";
import { FunkOmikuji } from "../composables/FunkOmikuji";
import { FunkThreshold } from "../composables/FunkThreshold";
import draggable from "vuedraggable";
import type {
  ListCategory,
  ListEntry,
  OmikenCategory,
  OmikenEntry,
  OmikenType,
  OmikujiType,
} from "@/types";
import { FunkEmits } from "@/composables/FunkEmits";

const props = defineProps<{
  Omiken: OmikenType;
  ruleId: string;
  enabledIds: string[];
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

// コンポーザブル:FunkEmits
const { updateOmiken, openEditorItem } = FunkEmits(emit);
// コンポーザブル:funkRules
const { weightTotal, weightPercentage, omikujiLists, weightColor } =
  FunkRules();
// コンポーザブル:FunkOmikuji
const { getOnecommeContent, getPostTypeColor } = FunkOmikuji();
// コンポーザブル:funkThreshold
const { isThreshold, getExampleText } = FunkThreshold();

// ドラッグ&ドロップでの更新も同様に
const currentItem = computed({
  get: () => props.enabledIds,
  set: (value) => {
    if (props.ruleId) {
      updateRulesEnabledIds(value, props.ruleId);
    }
  },
});

// 各種ref
const uiState = ref({
  showEnabledIds: false,
  showWeightEditor: false,
});

// アイテムを追加
const addItemOmikuji = () => {
  if (props.ruleId) {
    emit("update:Omiken", {
      type: "omikuji",
      addKeys: [{ rulesId: props.ruleId }],
    });
  }
};

// rules.enabledIds の更新
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
// omikuji.weight の更新
const updateOmikujiWeight = (omikujiData: OmikujiType) => {
  emit("update:Omiken", {
    type: "omikuji",
    update: {
      [omikujiData.id]: omikujiData,
    },
  });
};
</script>
