<!-- src/components/common/ListItemPartsAction.vue -->
<template>
  <v-btn height="30" width="30" icon @click.stop="$emit('edit')">
    <v-icon>mdi-pencil</v-icon>
    <v-tooltip activator="parent" location="bottom">
      編集
    </v-tooltip>
  </v-btn>
  <v-btn height="30" width="30" icon @click.stop="deleteItem">
    <v-icon>mdi-close</v-icon>
    <v-tooltip activator="parent" location="bottom">
      削除
    </v-tooltip>
  </v-btn>
</template>

<script setup lang="ts">
import { ItemCategory, ItemContent, SelectItem } from '@/types';
import Swal from 'sweetalert2';

type ItemOrGroup = ItemContent | { name: string; items: ItemContent[] };

const props = defineProps<{
  selectCategory: ItemCategory;
  item: ItemOrGroup;
}>();

const emit = defineEmits<{
  (e: "edit"): void;
  (e: "update:STATE", payload: SelectItem): void;
}>();

// アイテムの削除
function deleteItem() {
  const item = props.item;
  const isGroup = "items" in item;
  const itemsToDelete = isGroup ? item.items : [item];
  const itemNames = isGroup
    ? `${item.name} グループ`
    : (item as ItemContent).name;

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

      emit("update:STATE", {
        type: props.selectCategory,
        delKeys: delKeys,
      });
    }
  });
}
</script>