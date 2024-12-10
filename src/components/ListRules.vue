<!-- src/components/ListRules.vue -->
<template>
  <div class="pt-2">
    <div
      v-for="(ruleId, index) in Omiken.rulesOrder"
      :key="ruleId"
      class="mb-2"
    >
      <!-- ヘッダー部分 -->
      <v-card
      v-if="Omiken.rules[ruleId].ruleType === props.categoryActive.sub"
        elevation="0"
        class="w-100"
        @click="togglePanel(ruleId)"
        :class="{ 'cursor-pointer': true }"
      >
        <v-toolbar :color="Omiken.rules[ruleId]?.color">
          <PartsToolbarMove
            :index="index"
            :rulesOrder="Omiken.rulesOrder"
            @update:Omiken="updateOmiken"
          />
          <v-toolbar-title class="ml-2">
            {{ index + 1 }}. {{ Omiken.rules[ruleId]?.name }}
            <!-- enableIdsにあるアイテム数 -->
            <v-chip label class="ml-4">
              {{ Omiken.rules[ruleId]?.enableIds.length }} items
            </v-chip>
            <!-- 展開状態を示すアイコン -->
            <v-icon class="ml-2">
              {{
                expandedPanels.includes(ruleId)
                  ? "mdi-chevron-up"
                  : "mdi-chevron-down"
              }}
            </v-icon>
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
            density="compact"
            variant="outlined"
            color="yellow lighten-3"
            @click.stop="openEditorItem('rules', ruleId)"
          >
            🔐{{ getExampleText(Omiken.rules[ruleId].threshold) }}
          </v-chip>
        </v-card-text>
      </v-card>

      <!-- 展開部分 -->
      <v-expand-transition>
        <div v-show="expandedPanels.includes(ruleId)">
          <ListRulesOmikujiSetting
            :rulesEntry="Omiken.rules[ruleId]"
            :uiState="uiState"
            @update:Omiken="updateOmiken"
          />
          <v-card-text>
            <v-row>
              <ListRulesOmikujiView
                :rule="Omiken.rules[ruleId]"
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
import PartsToolbarMove from "./common/PartsToolbarMove.vue";
import type {
  OmikenEntry,
  ListCategory,
  ListEntry,
  OmikenEntryType,
  CategoryActive,
  AppEditerType,
} from "@/types/index";
import { FunkThreshold } from "@/composables/FunkThreshold";
import { FunkEmits } from "@/composables/FunkEmits";
import { inject, Ref, ref } from "vue";

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
  categoryActive: CategoryActive;
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenEntryType>): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

// inject
const AppEditer =
  inject<Ref<AppEditerType>>("AppEditerKey") ?? ref({} as AppEditerType);
const Omiken = AppEditer.value.Omiken;

const rules = Omiken.rules
const rulesOrder = Omiken.rulesOrder

// コンポーザブル:FunkEmits
const { updateOmiken, openEditor, openEditorItem } = FunkEmits(emit);
// コンポーザブル:funkThreshold
const {  getExampleText } = FunkThreshold();

// UIの各種ref
const uiState = ref({
  showEnabledIds: false,
  showWeightEditor: false,
});
</script>
