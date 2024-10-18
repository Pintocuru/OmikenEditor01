<!-- src/components/MainItemList.vue -->
<template>
  <v-card-text>
    <draggable
      :model-value="sortedItems"
      item-key="id"
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
                    {{ getItemCount(element) }} 項目
                  </v-chip>
                </div>
              </v-toolbar-title>
              <template v-slot:append>
                <v-btn height="30" width="30" icon @click.stop="openEditor">
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
import { computed } from "vue";
import draggable from "vuedraggable";
import type { ItemCategory, ItemContent, SelectItem } from "@/types";
import Swal from "sweetalert2";

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
  (e: "open-editor", selectItem: SelectItem): void;
}>();

// グループ編集かどうか
const isGrouped = computed(() => props.groupBy && props.groupBy !== "none");

// draggable用に配列にする
const sortedItems = computed(() => {
  return props.itemOrder.map((id) => ({
    ...props.items[id],
  }));
});

// 配列データxxxOrderの更新
function handleReorder(newOrder: ItemContent[]) {
  const newItemOrder = newOrder.map((item) => item.id);
  emit("update:STATE", {
    type: props.selectCategory,
    reorder: newItemOrder,
  });
}

// エディターを開く
function openEditor(element: ItemContent & { id: string }) {
  emit("open-editor", {
    type: props.selectCategory,
    items: { [element.id]: props.items[element.id] },
  });
}

function deleteItem(element: any) {
  // TODO 入っているものを確認して、下記を修正する
  console.log(element);
  if (!isGrouped.value) {
    Swal.fire({
      title: `${element.name} を消去する`,
      text: "この設定を消去しますか？",
      icon: "warning",
      // 1番目ボタン
      confirmButtonText: "OK",
      confirmButtonColor: "",
      // 2番目ボタン
      showDenyButton: true,
      denyButtonColor: "",
      denyButtonText: "キャンセル",
    }).then((result) => {
      if (result.isConfirmed) {

        return
        emit("update:STATE", {
          type: props.selectCategory,
          delKeys:[],
        });
      }
    });
  } else {
    console.warn("グループ化モードでの削除は未実装です");
  }
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