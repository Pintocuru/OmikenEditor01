<!-- src/components/ListRulesWeight.vue -->
<!-- !おそらく使用しない -->
<template>
  <v-dialog v-model="dialogWeight.isOpen" max-width="600px">
    <v-card density="compact" style="max-height: 80vh; overflow-y: auto">
      <v-toolbar color="red" density="compact" class="mb-2">
        <v-toolbar-title>
          出現割合の一斉編集
          <v-chip label class="ml-4">
            {{ weightTotal(enabledIds) }}
          </v-chip>
        </v-toolbar-title>
      </v-toolbar>
      <v-list>
        <draggable
          v-model="currentItem"
          item-key="id"
          @end="updateEnabledIds"
        >
          <template #item="{ element: omikujiId }">
            <v-list-item>
              <v-row align="center" no-gutters>
                  <!-- 配列を移動できるツマミ -->
                <v-col cols="auto" class="me-1">
                  <v-icon class="handle" color="grey">mdi-drag</v-icon>
                </v-col>
                  <!-- 名前 -->
                <v-col cols="2" class="me-2">
                  <v-sheet
                    class="font-medium"
                    @click="openEditorOmikuji(Omiken.omikuji[omikujiId])"
                  >
                    {{ Omiken.omikuji[omikujiId].name }}
                  </v-sheet>
                </v-col>
                <v-col>
                  <!-- v-text-field で数値を操作する -->
                  <v-text-field
                    v-model.number="
                      Omiken.omikuji[Omiken.omikuji[omikujiId].id].weight
                    "
                    label="出現割合"
                    min="0"
                    type="number"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <!-- 出現割合を表示 -->
                  <v-progress-linear
                    :model-value="
                      weightPercentage(Omiken.omikuji[omikujiId].id, enabledIds)
                    "
                    buffer-value="10"
                    :color="
                      weightColor(Omiken.omikuji[omikujiId].id, enabledIds)
                    "
                    height="35"
                    striped
                    >出現割合：{{
                      weightPercentage(Omiken.omikuji[omikujiId].id, enabledIds)
                    }}
                    %</v-progress-linear
                  >
                </v-col>
              </v-row>
            </v-list-item>
          </template>
        </draggable>
      </v-list>
    </v-card>
  </v-dialog>
  <v-sheet>
    <v-btn
      block
      @click="openDialogWeight()"
      color="primary"
      variant="flat"
      class="mb-6"
    >
      <v-icon left>mdi-sort</v-icon>
      出現割合の一斉編集
    </v-btn>
  </v-sheet>
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


// コンポーザブル:FunkRules
const { weightTotal, weightColor, weightPercentage } =
  FunkRules();

const currentItem = computed({
  get: () => [...props.enabledIds],
  set: (value) => {
    emit("update:enabledIds", value);
  },
});

const dialogWeight = ref({
  isOpen: false,
  item: null as OmikujiType | null,
});

const openDialogWeight = (omikujiId?: string) => {
  dialogWeight.value = {
    isOpen: true,
    item: omikujiId ? { ...props.Omiken.omikuji[omikujiId] } : null,
  };
};

// 更新アップデート
const updateEnabledIds = () => {
  emit("update:enabledIds", currentItem.value);
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
