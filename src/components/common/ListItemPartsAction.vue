<!-- src/components/common/ListItemPartsAction.vue -->
<template>
  <v-btn
    v-for="(action, index) in actions"
    :key="index"
    height="30"
    width="30"
    icon
    @click.stop="action.handler"
  >
    <v-icon>{{ action.icon }}</v-icon>
    <v-tooltip activator="parent" location="bottom">
      {{ action.tooltip }}
    </v-tooltip>
  </v-btn>
</template>

<script setup lang="ts">
import { ListCategory, EditerType, STATEEntry, STATECategory } from '@/types';
import { cloneDeep } from 'lodash';
import Swal from 'sweetalert2';

type ItemOrGroup = EditerType | { name: string; items: EditerType[] };

const props = defineProps<{
  selectCategory: ListCategory;
  item: ItemOrGroup;
}>();

const emit = defineEmits<{
  (e: "edit"): void;
  (e: "update:STATE", payload: STATEEntry<STATECategory>): void;
}>();

// 
type Action = {  icon: string;  tooltip: string;  handler: () => void;};
const actions = [
  {
    icon: 'mdi-pencil',
    tooltip: '編集',
    handler: () => emit('edit')
  },
  {
    icon: 'mdi-content-copy',
    tooltip: '複製',
    handler: duplicateItem
  },
  {
    icon: 'mdi-close',
    tooltip: '削除',
    handler: deleteItem
  }
];


// アイテムの複製
function duplicateItem() {
  const item = props.item;
  const isGroup = "items" in item;
  const itemsToDuplicate = isGroup ? item.items : [item as EditerType];

  const duplicatedItems = itemsToDuplicate.map(originalItem => {
    const newItem = cloneDeep(originalItem);
    delete (newItem as any).id;
    newItem.name = `${newItem.name} のコピー`;
    return newItem;
  });

  emit("update:STATE", {
    type: props.selectCategory,
    addKeys: duplicatedItems,
  });
}

// アイテムの削除
function deleteItem() {
  console.log(props.item);
  const item = props.item;
  const isGroup = "items" in item;
  const itemsToDelete = isGroup ? item.items : [item];
  const itemNames = isGroup
    ? `${item.name} グループ`
    : (item as EditerType).name;

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