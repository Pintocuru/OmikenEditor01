<!-- src/components/ListItemOmikuji.vue -->
<template>
  <v-col cols="6">
    <v-card height="150" @click="openEditor">
      <v-toolbar  density="compact">
        <v-toolbar-title>{{ item.name }}</v-toolbar-title>
        <template v-slot:append>
          <ListItemPartsAction
            :selectCategory="naviCategory"
            :item="item"
            @edit="openEditor"
            @update:Omiken="updateOmiken"
          />
        </template>
      </v-toolbar>
      <!-- リストに載せる内容(v-col:6の縦長) -->
      <v-card-text> ssss</v-card-text>
    </v-card>
  </v-col>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ListItemPartsAction from "./common/PartsToolbarAction.vue";
import {
  ListEntry,
  ListCategory,
  OmikujiType,
  OmikenEntry,
  OmikenType,
  OmikenCategory,
} from "@/types/index";
import _ from "lodash";
const props = defineProps<{
  Omiken: OmikenType;
  item: OmikujiType;
  naviCategory: ListCategory;
}>();
const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();




// エディターを開く
function openEditor() {
  const key = props.item.id;
  emit("open-editor", {
    isOpen: true,
    type: props.naviCategory,
    mode:null,
    key,
  });
}

// Omikenの更新をemit
const updateOmiken = (payload: OmikenEntry<OmikenCategory>) =>
  emit("update:Omiken", payload);
</script>
