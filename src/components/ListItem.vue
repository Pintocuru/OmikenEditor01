<!-- src/components/ListItem.vue -->
<template>
  <v-row>
    <draggable
      :model-value="groupedItems"
      item-key="name"
      tag="div"
      class="d-flex flex-wrap w-100"
      @update:model-value="handleReorder"
    >
      <template #item="{ element }">
        <v-col cols="12">
          <component
            :is="getComponentForCategory"
            :STATE="STATE"
            :item="element"
            :selectCategory="selectCategory"
            :groupBy="groupBy"
            @update:STATE="updateSTATE"
            @open-editor="openEditor"
          />
        </v-col>
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
import ListItemPartsAction from "./common/ListItemPartsAction.vue";
import type { EditorItem, ItemCategory, ItemContent, SelectItem, STATEType } from "@/types";
import _ from "lodash";

// Props Emits
const props = defineProps<{
  STATE: STATEType;
  items: Record<string, ItemContent>;
  itemOrder: string[];
  selectCategory: ItemCategory;
  groupBy?: "none" | "name" | "group";
}>();

const emit = defineEmits<{
  (e: "update:STATE", payload: SelectItem): void;
  (e: "open-editor", editorItem: EditorItem): void;
}>();

// 各種子コンポーネント
const getComponentForCategory = computed(() => {
  switch (props.selectCategory) {
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

// エディターを開く
const openEditor = (editorItem: EditorItem) => emit("open-editor", editorItem);

// 配列データxxxOrderの更新
type draggableGroup = { name: string; items: ItemContent[] };
function handleReorder(newOrder: ItemContent[] | draggableGroup[]) {
  console.log(newOrder);
  try {
    let newItemOrder: string[];

    // 通常モード
    if (!props.groupBy || props.groupBy === "none") {
      newItemOrder = (newOrder as ItemContent[]).map((item) => item.id);
    } else {
      // グループモード
      newItemOrder = (newOrder as draggableGroup[]).flatMap((group) =>
        group.items.map((item) => item.id)
      );
    }
    emit("update:STATE", {
      type: props.selectCategory,
      reorder: newItemOrder,
    });
  } catch (error) {
    console.error("Error in handleReorder:", error);
  }
}
// STATEの更新をemit
const updateSTATE = (payload: SelectItem) => emit("update:STATE", payload);


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
      type: props.selectCategory,
      reorder: sortedOrder,
    });
  }
});
</script>
