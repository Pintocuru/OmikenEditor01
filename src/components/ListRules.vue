<!-- src/components/ListRules.vue -->
<template>
  <div class="pt-2">
    <div v-for="(rule, index) in rules" :key="rule.id" class="mb-2">
      <!-- ヘッダー部分 -->
      <v-card
        elevation="0"
        class="w-100"
        @click="togglePanel(rule.id)"
        :class="{ 'cursor-pointer': true }"
      >
        <v-toolbar :color="rule?.color">
          <v-toolbar-title class="ml-2">
            <!-- TODO typesによるアイコンを付与したい -->
            {{ rule?.name }}
            <!-- enableIdsにあるアイテム数 -->
            <v-chip label class="ml-4">
              {{ rule?.enableIds.length }} items
            </v-chip>
            <!-- 展開状態を示すアイコン -->
            <v-icon class="ml-2">
              {{
                expandedPanels.includes(rule.id)
                  ? "mdi-chevron-up"
                  : "mdi-chevron-down"
              }}
            </v-icon>
          </v-toolbar-title>
          <template #append>
            <PartsToolbarAction
              selectCategory="rules"
              :item="rule"
              @edit="openEditorItem('rules', rule.id)"
              @update:Omiken="updateOmiken"
            />
          </template>
        </v-toolbar>
        <v-card-text class="list-group d-flex flex-wrap">
          <v-chip
            density="compact"
            variant="outlined"
            color="yellow lighten-3"
            @click.stop="openEditorItem('rules', rule.id)"
          >
            🔐{{ getExampleText(rule.threshold) }}
          </v-chip>
        </v-card-text>
      </v-card>

      <!-- 展開部分 -->
      <v-expand-transition>
        <div v-show="expandedPanels.includes(rule.id)">
          <ListRulesOmikujiSetting
            :rulesEntry="rule"
            :uiState="uiState"
            @update:Omiken="updateOmiken"
          />
          <v-card-text>
            <v-row>
              <ListRulesOmikujiView
                :rule="rule"
                :omikujis="Omiken.omikujis"
                :uiState="uiState"
                @open-editor="openEditor"
                @update:Omiken="updateOmiken"
              />
            </v-row>
          </v-card-text>
        </div>
      </v-expand-transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import ListRulesOmikujiSetting from "./ListRulesOmikujiSetting.vue";
import ListRulesOmikujiView from "./ListRulesOmikujiView.vue";
import PartsToolbarAction from "./common/PartsToolbarAction.vue";
import type {
  OmikenEntry,
  ListCategory,
  ListEntry,
  OmikenEntryType,
  CategoryActive,
  AppEditorType,
  OmikenType,
  RulesType,
} from "@/types/index";
import { FunkThreshold } from "@/composables/FunkThreshold";
import { FunkEmits } from "@/composables/FunkEmits";
import { computed, inject, Ref, ref } from "vue";

// 展開状態を管理する配列
const expandedPanels = ref<string[]>([]);

// パネルの開閉を切り替える関数
const togglePanel = (ruleId: string) => {
  const index = expandedPanels.value.indexOf(ruleId);
  if (index === -1) {
    expandedPanels.value.push(ruleId);
  } else {
    expandedPanels.value.splice(index, 1);
  }
};

const props = defineProps<{
  Omiken: OmikenType;
  categoryActive: CategoryActive;
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenEntryType>): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

const rules = computed(() => props.Omiken.rules);

// コンポーザブル:FunkEmits
const { updateOmiken, openEditor, openEditorItem } = FunkEmits(emit);
// コンポーザブル:funkThreshold
const { getExampleText } = FunkThreshold();

// UIの各種ref
const uiState = ref({
  showEnabledIds: false,
  showWeightEditor: false,
});
</script>
