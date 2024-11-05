<!-- src/components/ListEntry.vue -->
<template>
  <v-card>
    <v-toolbar dense>
      <v-toolbar-title>Entry View</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-checkbox v-model="showRules" label="Rules" class="mr-2"></v-checkbox>
      <v-checkbox
        v-model="showOmikuji"
        label="Omikuji"
        class="mr-2"
      ></v-checkbox>
      <v-checkbox v-model="showPlace" label="Place" class="mr-2"></v-checkbox>
    </v-toolbar>
    <v-card-text>
      <!-- Rules View -->
      <draggable
        v-model="localRulesOrder"
        item-key="id"
        class="list-group"
        @end="updateRulesOrder"
      >
        <template #item="{ element: ruleId }">
          <v-card class="mb-2">
            <v-toolbar :color="Omiken.rules[ruleId]?.color">
              <v-icon class="mx-2">mdi-drag-horizontal-variant</v-icon>
              <v-toolbar-title
                class="ml-2"
                @click="openEditorItem('rules', ruleId)"
              >
                {{ Omiken.rules[ruleId]?.name }}
              </v-toolbar-title>
              <template #append>
                <ListItemPartsAction
                  selectCategory="omikuji"
                  :item="Omiken.rules[ruleId]"
                  @edit="openEditorItem('rules', ruleId)"
                  @update:Omiken="updateOmiken"
                />
              </template>
            </v-toolbar>
            <v-sheet class="mt-2">
              <span
                v-if="
                  Omiken.rules[ruleId]?.matchStartsWith &&
                  Omiken.rules[ruleId]?.matchStartsWith.length > 0
                "
                class="mr-4"
              >
                <v-icon color="primary">mdi-arrow-right-bold-box</v-icon>
                {{ Omiken.rules[ruleId]?.matchStartsWith.join(", ") }}
              </span>
              <span v-else class="mr-4">
                <v-icon color="primary">mdi-arrow-right-bold-box</v-icon>
                (すべてのコメントが対象)
              </span>
            </v-sheet>

            <!-- Omikuji View -->
            <v-expansion-panels multiple class="pt-2">
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <span class="text-h6">
                    <v-icon icon="mdi-crystal-ball"></v-icon>
                    該当するおみくじ🥠
                  </span>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <ListEntryOmikuji
                    v-if="showOmikuji"
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
                <v-expansion-panel-title>
                  <span class="text-h6">
                    <v-icon icon="mdi-crystal-ball"></v-icon>
                    該当するプレースホルダー🏷️
                  </span>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <!-- Place View -->
                  <ListEntryPlace
                    v-if="showPlace"
                    :Omiken="Omiken"
                    :enabledIds="Omiken.rules[ruleId].enabledIds"
                    @open-editor="openEditor"
                    @update:Omiken="updateOmiken"
                  />
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card>
        </template>
      </draggable>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, Ref, inject } from "vue";
import ListEntryOmikuji from "./ListEntryOmikuji.vue";
import ListEntryPlace from "./ListEntryPlace.vue";
import ListItemPartsAction from "./common/ListItemPartsAction.vue";
import draggable from "vuedraggable";
import type {
  OmikenType,
  OmikenEntry,
  ListCategory,
  ListEntry,
  OmikenCategory,
} from "@/types";

const props = defineProps<{
  Omiken: OmikenType;
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

// 表示制御
const showRules = ref(true);
const showOmikuji = ref(true);
const showPlace = ref(true);


// ドラッグ&ドロップ用のローカルデータ
const localRulesOrder = computed({
  get: () => [...props.Omiken.rulesOrder],
  set: (value) => {
    emit("update:Omiken", {
      type: "rules",
      reorder: value,
    });
  },
});

// 各種更新関数
const updateRulesOrder = () => {
  emit("update:Omiken", {
    type: "rules",
    reorder: localRulesOrder.value,
  });
};

const updateRulesEnabledIds = (enabledIds: string[], ruleId: string) => {
  const updatedRule = {
    ...props.Omiken.rules[ruleId],
    enabledIds, // 直接受け取ったenabledIdsを使用
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
