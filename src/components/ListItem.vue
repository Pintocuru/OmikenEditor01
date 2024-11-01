<!-- src/components/ListItem.vue -->
<template>
  <v-row dense>
    <draggable
      :model-value="sortedItems"
      item-key="name"
      tag="div"
      class="d-flex flex-wrap w-100"
      @update:model-value="handleReorder"
    >
      <template #item="{ element }">
        <component
          :is="getComponentForCategory"
          :Omiken="Omiken"
          :item="element"
          :naviCategory="listCategory"
          @update:Omiken="updateOmiken"
          @open-editor="openEditor"
        />
      </template>
    </draggable>
  </v-row>
</template>

<script setup lang="ts">
import { computed } from "vue";
import draggable from "vuedraggable";
import ListItemRules from "./ListItemRules.vue";
import ListItemOmikuji from "./ListItemOmikuji.vue";
import ListItemPlace from "./ListItemPlace.vue";
import type {
  ListEntry,
  ListCategory,
  EditerType,
  OmikenEntry,
  OmikenEditType,
  OmikenCategory,
} from "@/types";

// Props Emits
const props = defineProps<{
  Omiken: OmikenEditType;
  items: Record<string, EditerType>;
  itemOrder: string[];
  listCategory: ListCategory;
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

// 各種子コンポーネント
const getComponentForCategory = computed(() => {
  switch (props.listCategory) {
    case "rules":
      return ListItemRules;
    case "omikuji":
      return ListItemOmikuji;
    case "place":
      return ListItemPlace;
    default:
      return null;
  }
});

// draggable用に配列にする
const sortedItems = computed(() => {
  console.log(props.itemOrder);
  return props.itemOrder.map((id) => ({
    ...props.items[id],
  }));
});

// 配列データxxxOrderの更新
function handleReorder(newOrder: EditerType[]) {
  try {
    const newItemOrder = newOrder.map((item) => item.id);
    emit("update:Omiken", {
      type: props.listCategory,
      reorder: newItemOrder,
    });
  } catch (error) {
    console.error("Error in handleReorder:", error);
  }
}

// 各種操作関数(エディターを開く/Omiken更新)
const updateOmiken = (payload: OmikenEntry<OmikenCategory>) => emit("update:Omiken", payload);
const openEditor = (editorItem: ListEntry<ListCategory>) => emit("open-editor", editorItem);
</script>