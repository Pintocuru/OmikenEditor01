<!-- src/components/ListRulesWeight.vue -->

<template>
  <v-dialog v-model="editorDialog.isOpen" max-width="600px">
    <v-list density="compact">
      <draggable
        :model-value="currentItem"
        item-key="id"
        handle=".handle"
         @end="(newItem) => updateItem(newItem)"
      >
        <template #item="{ element, index }">
          <v-list-item>
            <v-row align="center" no-gutters>
              <v-col cols="auto" class="me-1">
                <v-icon class="handle" color="grey">mdi-drag</v-icon>
              </v-col>

              <v-col cols="2" class="me-2">
                <!-- 配列を移動できるツマミ -->
                <v-sheet
                  class="font-medium"
                  @click="openEditorOmikuji(element)"
                >
                  {{ element.name }}
                </v-sheet>
              </v-col>
              <v-col>
                <!-- v-text-field で数値を操作する -->
<v-text-field
  v-model.number="Omiken.omikuji[element.id].weight"
  label="出現割合"
  min="0"
  type="number"
/>
              </v-col>
              <v-col cols="12" sm="6">
                <!-- 出現割合を表示 -->
                <v-progress-linear
                  :model-value="weightPercentage(element.id, enabledIds)"
                  buffer-value="10"
                  :color="weightColor(element.id,enabledIds,)"
                  height="35"
                  striped
                  >出現割合：{{
                    weightPercentage(element.id, enabledIds)
                  }}
                  %</v-progress-linear
                >
              </v-col>
            </v-row>
          </v-list-item>
        </template>
      </draggable>
    </v-list>
  </v-dialog>
  <div class="flex justify-end mt-4">
    <v-btn color="primary" @click="openEditor()">
      <v-icon>mdi-sort</v-icon>
      ダイアログを表示
    </v-btn>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import {
  ListCategory,
  ListEntry,
  OmikenCategory,
  OmikenEntry,
  OmikenType,
  OmikujiType,
} from "@/types";
import draggable from "vuedraggable";
import { FunkRules } from "@/composables/FunkRules";

const props = defineProps<{
  Omiken: OmikenType;
  ruleId?: string;
  enabledIds: string[];
}>();

const emit = defineEmits<{
  (e: "update:enabledIds", newEnabledIds: string[]): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
}>();

const { enabledOmikujiLists, weightColor, weightPercentage } = FunkRules();

const currentItem = computed(() => {
  return props.ruleId ? enabledOmikujiLists(props.enabledIds) : [];
});

const editorDialog = ref({
  isOpen: false,
  item: null as OmikujiType | null,
});

const openEditor = (omikujiId?: string) => {
  editorDialog.value = {
    isOpen: true,
    item: omikujiId ? { ...props.Omiken.omikuji[omikujiId] } : null,
  };
};

// weightだけを更新する
const updateOmikujiWeight = (index: number, value: number) => {
  const omikuji = props.Omiken.omikuji[props.enabledIds[index]];
  if (omikuji) {
    omikuji.weight = value;
    emit("update:Omiken", {
      type: "omikuji",
      update: { [omikuji.id]: omikuji },
    });
  }
};

// 更新アップデート
const updateItem = (updatedEnabledIds: string[]) => {
  emit("update:enabledIds", updatedEnabledIds);
};

const openEditorOmikuji = (omikuji: OmikujiType) => {
  emit("open-editor", {
    isOpen: true,
    type: "omikuji",
    mode: null,
    key: omikuji.id,
  });
};
</script>
