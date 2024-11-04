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
      <template v-if="showRules">
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

              <!-- Omikuji View -->


              <ListEntryOmikuji
                v-if="showOmikuji"
                :Omiken="Omiken"
                :ruleId="ruleId"
                :enabledIds="Omiken.rules[ruleId].enabledIds"
                @update:enabledIds="
                  (newEnabledIds) => updateEnabledIds(newEnabledIds, ruleId)
                "
                @open-editor="openEditor"
                @update:Omiken="updateOmiken"
              />

              <!-- Place View -->
              <ListEntryPlace
                v-if="showPlace"
                :Omiken="Omiken"
                :enabledIds="Omiken.rules[ruleId].enabledIds"
                @open-editor="openEditor"
                @update:Omiken="updateOmiken"
              />
            </v-card>
          </template>
        </draggable>
      </template>

      <!-- Flat View (Rules非表示時) -->
      <v-card-text v-else>
        <!-- Omikuji View -->
        <div v-if="showOmikuji" class="flat-view">
          <ListEntryOmikuji
            :Omiken="Omiken"
            :enabled-ids="Object.keys(Omiken.omikuji)"
            @update:enabled-ids="updateFlatEnabledIds"
            @open-editor="openEditor"
            @update:Omiken="updateOmiken"
          />
        </div>

        <!-- Place View -->
        <div v-if="showPlace" class="flat-view">
          <ListEntryPlace
            :Omiken="Omiken"
            @open-editor="openEditor"
            @update:Omiken="updateOmiken"
          />
        </div>
      </v-card-text>
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

const updateFlatEnabledIds = (newEnabledIds: string[]) => {
  // フラットビューでの並び順の更新
  Object.keys(props.Omiken.rules).forEach((ruleId) => {
    updateEnabledIds(newEnabledIds, ruleId);
  });
};

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

const updateEnabledIds = (enabledIds: string[], ruleId: string) => {
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
