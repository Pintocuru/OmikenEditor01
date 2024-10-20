<!-- src/components/MainItemList.vue -->
<template>
  <v-card-text>
    <draggable
      :model-value="groupedItems"
      item-key="name"
      tag="div"
      class="d-flex flex-wrap w-100"
      @update:model-value="handleReorder"
    >
      <template #item="{ element }">
        <v-col v-bind="colProps">
          <v-card :height="cardHeight" @click.stop="openEditor(element)">
            <v-toolbar density="compact" color="transparent">
              <v-toolbar-title>
                <div class="text-h6">
                  {{ element.name }}
                  <v-chip v-if="isGrouped" class="ml-2" size="small">
                    {{ element.items.length }} 項目
                  </v-chip>
                </div>
              </v-toolbar-title>
              <template v-slot:append>
                <v-btn
                  height="30"
                  width="30"
                  icon
                  @click.stop="openEditor(element)"
                >
                  <v-icon>mdi-pencil</v-icon>
                  <v-tooltip activator="parent" location="bottom">
                    編集
                  </v-tooltip>
                </v-btn>
                <v-btn
                  height="30"
                  width="30"
                  icon
                  @click.stop="deleteItem(element)"
                >
                  <v-icon>mdi-close</v-icon>
                  <v-tooltip activator="parent" location="bottom">
                    削除
                  </v-tooltip>
                </v-btn>
              </template>
            </v-toolbar>
            <v-card-subtitle v-if="!isGrouped">
              {{ getItemSubtitle(element) }}
            </v-card-subtitle>
          </v-card>
        </v-col>
      </template>
    </draggable>
  </v-card-text>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import draggable from "vuedraggable";
import type { ItemCategory, ItemContent, SelectItem } from "@/types";
import Swal from "sweetalert2";
import _ from "lodash";

// Props Emits
const props = defineProps<{
  items: Record<string, ItemContent>;
  itemOrder: string[];
  selectCategory: ItemCategory;
  selectCols: number;
  groupBy?: "none" | "name" | "group";
}>();

const emit = defineEmits<{
  (e: "update:STATE", payload: SelectItem): void;
  (
    e: "open-editor",
    type: ItemCategory,
    item: Record<string, ItemContent>,
    mode: string | null
  ): void;
}>();

// グループ編集かどうか
const isGrouped = computed(() => props.groupBy && props.groupBy !== "none");

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
function openEditor(element: ItemContent | { name: string; items: ItemContent[] }) {
  if ('items' in element) {
    // グループの場合
    const groupItems = element.items.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {} as Record<string, ItemContent>);

    emit(
      "open-editor",
      props.selectCategory,
      groupItems,
      props.groupBy as string
    );
  } else {
    // 単独アイテムの場合
    const item = { [element.id]: element };
    emit(
      "open-editor",
      props.selectCategory,
      item,
      null
    );
  }
}

// 配列データxxxOrderの更新
function handleReorder(newOrder: { name: string; items: ItemContent[] }[]) {
  // 通常モード
  if (props.groupBy === "none") {
    const newItemOrder = _.flatMap(newOrder, (group) =>
      group.items.map((item) => item.id)
    );
    emit("update:STATE", {
      type: props.selectCategory,
      reorder: newItemOrder,
    });
  } else {
    // グループモード
    const newItemOrder = _.flatMap(newOrder, (group) =>
      group.items.map((item) => item.id)
    );
    emit("update:STATE", {
      type: props.selectCategory,
      reorder: newItemOrder,
    });
  }
}

/**
// エディターを開く
function openEditor(element: ItemContent & { id: string }) {
  const mode = props.groupBy !== "none" ? (props.groupBy as string) : null;
  const item = { [element.id]: props.items[element.id] };
  emit("open-editor", props.selectCategory, item, mode);
}
 */
function deleteItem(
  element: { name: string; items: ItemContent[] } | ItemContent
) {
  const isGroup = "items" in element;
  const itemsToDelete = isGroup ? element.items : [element];
  const itemNames = isGroup
    ? `${element.name} グループ`
    : (element as ItemContent).name;

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
      emit("update:STATE", {
        type: props.selectCategory,
        delKeys: itemsToDelete.map((item) => item.id),
      });
    }
  });
}

const colProps = computed(() => {
  switch (props.selectCols) {
    case 0:
      return { cols: 12, sm: 12, md: 12, lg: 6 };
    case 1:
      return { cols: 12, sm: 6, md: 4, lg: 3 };
    case 2:
      return { cols: 4, sm: 3, md: 2, lg: 1 };
    default:
      return { cols: 12, sm: 6, md: 4, lg: 3 };
  }
});

const cardHeight = computed(() => {
  return props.selectCols === 0 ? 50 : 100;
});

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

function getItemCount(
  element: ItemContent | { title: string; items: ItemContent[] }
): number {
  return "items" in element ? element.items.length : 1;
}

function getItemSubtitle(element: ItemContent): string {
  switch (props.selectCategory) {
    case "omikuji":
      return `重み: ${(element as any).weight}`;
    case "place":
      return `重み: ${(element as any).weight}, グループ: ${
        (element as any).group
      }`;
    default:
      return "";
  }
}
</script>
