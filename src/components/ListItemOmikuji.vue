<!-- src/components/ListItemOmikuji.vue -->
<template>
  <v-col cols="6">
    <v-card height="150" @click="openEditor">
      <v-toolbar :color="toolbarColor" density="compact">
        <v-toolbar-title>{{ item.name }}</v-toolbar-title>
        <template v-slot:append>
          <ListItemPartsAction
            :selectCategory="naviCategory"
            :item="item"
              @edit="openEditor"
            @update:STATE="updateSTATE"
          />
        </template>
      </v-toolbar>
      <!-- リストに載せる内容(v-col:6の縦長) -->
      <v-card-text>
     
      </v-card-text>
    </v-card>
  </v-col>
</template>

<script setup lang="ts">
import {
  ListEntry,
  ListCategory,
  OmikujiType,
  STATEEntry,
  STATEType,
  STATECategory,
} from "@/types";
import { computed } from "vue";
import _ from "lodash";
const props = defineProps<{
  STATE: STATEType;
  item: OmikujiType;
  naviCategory: ListCategory;
}>();
const emit = defineEmits<{
  (e: "update:STATE", payload: STATEEntry<STATECategory>): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

const toolbarColor = computed(() => {
  return getWeightColor(props.item.weight);
});

const getWeightColor = (weight: number) => {
  if (weight > 80) return "error";
  if (weight > 50) return "warning";
  if (weight > 20) return "success";
  return "info";
};


const getComparisonLabel = (comparison: string) => {
  const labels: Record<string, string> = {
    min: "以下",
    equal: "等しい",
    max: "以上",
    loop: "ループ",
    range: "範囲",
  };
  return labels[comparison] || "Unknown";
};

// エディターを開く
function openEditor() {
  const item = { [props.item.id]: props.item };
  emit("open-editor", {
    type: props.naviCategory,
    item: item,
  });
}

// STATEの更新をemit
const updateSTATE = (payload: STATEEntry<STATECategory>) => emit("update:STATE", payload);
</script>
