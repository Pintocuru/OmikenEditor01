<!-- src/components/common/PartsToolbarMove.vue -->
<template>
  <div class="d-flex">
    <v-tooltip text="上に移動" location="top">
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          icon="mdi-arrow-up"
          density="compact"
          :disabled="isFirstItem"
          @click.stop="moveItem('up')"
        />
      </template>
    </v-tooltip>
    <v-tooltip text="下に移動" location="top">
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          icon="mdi-arrow-down"
          density="compact"
          :disabled="isLastItem"
          @click.stop="moveItem('down')"
        />
      </template>
    </v-tooltip>
  </div>
</template>

<script setup lang="ts">
import type { OmikenEntry, OmikenEntryType } from "@/types";
import { computed } from "vue";

const props = defineProps<{
  index: number;
  rulesOrder?: string[];
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenEntryType>): void;
}>();

const isFirstItem = computed(() => props.index === 0);
const isLastItem = computed(() => {
  return props.rulesOrder && props.index === props.rulesOrder.length - 1;
});

function moveItem(direction: "up" | "down") {
  if (!props.rulesOrder) return;

  const newIndex = direction === "up" ? props.index - 1 : props.index + 1;
  if (newIndex >= 0 && newIndex < props.rulesOrder.length) {
    // 新しい配列を作成して順序を変更
    const newOrder = [...props.rulesOrder];
    const element = newOrder[props.index];
    newOrder.splice(props.index, 1);
    newOrder.splice(newIndex, 0, element);

    emit("update:Omiken", {
      type: "rules",
      reorder: newOrder,
    });
  }
}
</script>
