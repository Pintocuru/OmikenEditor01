<!-- src/components/common/PartsToolbarAction.vue -->
<template>
  <v-btn
    v-for="(action, index) in actions"
    :key="index"
    :size="!isSmall ? 'small' : 'small'"
    :height="!isSmall ? '' : 30"
    :width="!isSmall ? '' : 30"
    icon
    @click.stop="action.handler"
  >
    <v-icon>{{ action.icon }}</v-icon>
    <v-tooltip activator="parent" location="top">
      {{ action.tooltip }}
    </v-tooltip>
  </v-btn>
</template>

<script setup lang="ts">
import { ListCategory, ListType, OmikenEntry,  } from "@type";
import Swal from "sweetalert2";

type ItemOrGroup = ListType | { name: string; items: ListType[] };

const props = defineProps<{
  selectCategory: ListCategory;
  ruleId?: string;
  item?: ItemOrGroup;
  isSmall?: boolean;
}>();

const emit = defineEmits<{
  (e: "edit"): void;
  (e: "update:Omiken", payload: OmikenEntry<ListCategory>): void;
}>();

//
type Action = { icon: string; tooltip: string; handler: () => void };
const actions = [
  {
    icon: "mdi-pencil",
    tooltip: "編集",
    handler: () => emit("edit"),
  },
  {
    icon: "mdi-content-copy",
    tooltip: "複製",
    handler: duplicateItem,
  },
  {
    icon: "mdi-close",
    tooltip: "削除",
    handler: deleteItem,
  },
];

// アイテムの複製
function duplicateItem() {
  if (!props.item) return;
  const item = props.item;
  const isGroup = "items" in item;
  const itemsToDuplicate = isGroup ? item.items : [item as ListType];

  const duplicatedItems = itemsToDuplicate.map((originalItem) => {
    const newItem = JSON.parse(JSON.stringify(originalItem));
    delete (newItem as any).id;
    newItem.name = `${newItem.name} のコピー`;
    return newItem;
  });

  if (props.selectCategory === "omikujis" && props.ruleId) {
    emit("update:Omiken", {
      type: "omikujis",
      addKeys: duplicatedItems.map((item) => ({
        ...item,
        rulesId: props.ruleId,
      })),
    });
  } else {
    // "omikuji"以外の場合は通常のemit
    emit("update:Omiken", {
      type: props.selectCategory,
      addKeys: duplicatedItems,
    });
  }
}

// アイテムの削除
function deleteItem() {
  if (!props.item) return;
  const item = props.item;
  const isGroup = "items" in item;
  const itemsToDelete = isGroup ? item.items : [item];
  const itemNames = isGroup ? `${item.name} グループ` : (item as ListType).name;

  Swal.fire({
    title: `${itemNames} を削除する`,
    text: isGroup
      ? "このグループ内のすべての項目を削除しますか？"
      : "この設定を削除しますか？",
    icon: "warning",
    confirmButtonText: "OK",
    confirmButtonColor: "",
    showDenyButton: true,
    denyButtonColor: "",
    denyButtonText: "キャンセル",
  }).then((result) => {
    if (result.isConfirmed) {
      const delKeys = itemsToDelete.map((item) => item.id);

      emit("update:Omiken", {
        type: props.selectCategory,
        delKeys: delKeys,
      });
    }
  });
}
</script>
