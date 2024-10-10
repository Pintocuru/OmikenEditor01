<!-- src/components/AppMain.vue -->
<template>
  <AppList
    :state="state"
    :key="dai"
    :type="dai"
    :dai="dai"
    :selectgridcols="selectgridcols"
    @item-click="openEditor(dai, $event)"
    @open-editor="openEditor"
  />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import AppList from "./AppList.vue";
import type { ItemContent, ItemType, SelectedItem } from "../AppTypes";
import { DefaultState } from "@/types";

const props = defineProps<{
  state: DefaultState;
  type: ItemType | null;
  selectgridcols: number;
  dai:ItemType;
  
}>();

const emit = defineEmits<{
  (e: "update:state", state: DefaultState): void;
  (e: "open-editor", type: ItemType, item: ItemContent): void;
}>();

const currentType = ref<ItemType | null>(props.type);
const listTypes: ItemType[] = ["rules", "omikuji", "placeholder"];

const openEditor = (type: ItemType, item: ItemContent) => {
  emit("open-editor", type, item);
};
</script>
