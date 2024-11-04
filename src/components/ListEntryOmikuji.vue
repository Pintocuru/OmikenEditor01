<!-- src/components/ListEntryOmikuji.vue -->
<template>
  <v-card-text>
    <v-toolbar density="compact">
      <v-toolbar-title class="ml-2">
        <v-icon>mdi-crystal-ball</v-icon>
        Omikuji
      </v-toolbar-title>
    </v-toolbar>
    <v-row no-gutters>
      <draggable
        v-model="localEnabledIds"
        item-key="id"
        class="list-group d-flex flex-wrap" 
        @end="updateEnabledIds"
      >
        <template #item="{ element: omikujiId }">
          <v-col cols="12" sm="6" md="4" lg="3" class="pa-1">
            <v-card
              class="d-flex justify-space-between align-center pa-2 py-5"
              variant="outlined"
              :color="weightColor(Omiken.omikuji[omikujiId].id)"
              @click.stop="openEditorOmikuji(Omiken.omikuji[omikujiId])"
            >
              <span class="font-weight-bold">{{
                Omiken.omikuji[omikujiId]?.name
              }}</span>
              <span>
                {{ Omiken.omikuji[omikujiId]?.weight }}/{{
                  totalWeight2(enabledIds)
                }}
                <span class="ml-2"
                  >({{
                    totalWeightPercentage(Omiken.omikuji[omikujiId]?.id)
                  }}%)</span
                >
              </span>
            </v-card>
          </v-col>
        </template>
      </draggable>
    </v-row>
  </v-card-text>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { funkRules } from "@/composables/funkRules";
import draggable from "vuedraggable";
import type { ListEntry, OmikenEntry, OmikenType, OmikujiType } from "@/types";

const props = defineProps<{
  Omiken: OmikenType;
  ruleId: string;
  enabledIds: string[];
}>();

const emit = defineEmits<{
  (e: "update:enabledIds", ids: string[]): void;
  (e: "open-editor", item: ListEntry<"omikuji">): void;
}>();

// コンポーザブルの初期化（enabledIdsを渡す）
const {
  totalWeight,
  totalWeightPercentage,
  weightColor,
} = funkRules(props.Omiken.omikuji);

// TODO props.omikujiからhogeのキーを探し、それぞれのweightの合計を返す
const totalWeight2 = (enabledIds: string[]): number => {
  return enabledIds.reduce(
    (sum, id) => sum + (props.Omiken.omikuji[id]?.weight || 0),
    0
  );
};


// omikujiのエディターを開く
const openEditorOmikuji = (omikuji: OmikujiType) => {
  emit("open-editor", {
    isOpen: true,
    type: "omikuji",
    mode: null,
    key: omikuji.id,
  });
};

// ドラッグ&ドロップでの更新も同様に
const localEnabledIds = computed({
  get: () => [...props.enabledIds],
  set: (value) => {
    emit("update:enabledIds", value); // 新しい enabledIds を emit
  },
});


// update:enabledIdsのみを発火
const updateEnabledIds = () => {
  emit("update:enabledIds", localEnabledIds.value);
};
</script>
