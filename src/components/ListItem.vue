<!-- src/components/ListItem.vue -->
<template>
  <v-row dense>
    <draggable
      :model-value="groupedItems"
      item-key="name"
      tag="div"
      class="d-flex flex-wrap w-100"
      @update:model-value="handleReorder"
    >
      <template #item="{ element }">
        <component
          :is="getComponentForCategory"
          :STATE="STATE"
          :item="element"
          :naviCategory="naviCategory"
          :groupBy="groupBy"
          @update:STATE="updateSTATE"
          @open-editor="openEditor"
        />
      </template>
    </draggable>
  </v-row>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import draggable from "vuedraggable";
import ListItemRules from "./ListItemRules.vue";
import ListItemOmikuji from "./ListItemOmikuji.vue";
import ListItemPlace from "./ListItemPlace.vue";
import type {
  ListEntry,
  ListCategory,
  EditerType,
  STATEEntry,
  STATEType,
  STATECategory,
  NaviCategory,
} from "@/types";
import _ from "lodash";

// Props Emits
const props = defineProps<{
  STATE: STATEType;
  items: Record<string, EditerType>;
  itemOrder: string[];
  naviCategory: NaviCategory;
  groupBy?: "none" | "name" | "group";
}>();

const emit = defineEmits<{
  (e: "update:STATE", payload: STATEEntry<STATECategory>): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

// 各種子コンポーネント
const getComponentForCategory = computed(() => {
  switch (props.naviCategory) {
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
  return props.itemOrder.map((id) => ({
    ...props.items[id],
  }));
});

// グループモード用computed
const groupedItems = computed(() => {
  if (!props.groupBy || props.groupBy === "none") {
    return sortedItems.value;
  }

  const groups = _.groupBy(sortedItems.value, (item) =>
    props.groupBy === "name"
      ? item.name
      : (item as any).group?.toString() || "その他"
  );

  return _.map(groups, (items, name) => ({ name, items }));
});


// 配列データxxxOrderの更新
type draggableGroup = { name: string; items: EditerType[] };
function handleReorder(newOrder: EditerType[] | draggableGroup[]) {
  try {
    let newItemOrder: string[];

    // 通常モード
    if (!props.groupBy || props.groupBy === "none") {
      newItemOrder = (newOrder as EditerType[]).map((item) => item.id);
    } else {
      // グループモード
      newItemOrder = (newOrder as draggableGroup[]).flatMap((group) =>
        group.items.map((item) => item.id)
      );
    }
    emit("update:STATE", {
      type: props.naviCategory,
      reorder: newItemOrder,
    });
  } catch (error) {
    console.error("Error in handleReorder:", error);
  }
}

// 各種操作関数(エディターを開く/STATE更新)
const updateSTATE = (payload: STATEEntry<STATECategory>) => emit("update:STATE", payload);
const openEditor = (editorItem: ListEntry<ListCategory>) => emit("open-editor", editorItem);

// これはplaceコンポーネント
onMounted(() => {
  if (props.groupBy !== "none") {
    const sortedOrder = _.orderBy(props.itemOrder, [
      (id) => {
        const item = props.items[id];
        return props.groupBy === "name"
          ? item.name
          : (item as any).group?.toString() || "その他";
      },
    ]);

    emit("update:STATE", {
      type: props.naviCategory,
      reorder: sortedOrder,
    });
  }
});
</script>
