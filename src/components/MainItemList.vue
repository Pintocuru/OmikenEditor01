<!-- src/components/MainItemList.vue -->
<template>
  <v-card-text>
    <draggable
      v-model="localItems"
      :item-key="(item: any, index: any) => index"
      tag="div"
      class="d-flex flex-wrap w-100"
      @change="updateItems"
    >
      <template #item="{ element, index }">
        <v-col v-bind="colProps">
          <v-card :height="cardHeight" @click.stop="openEditor(element, index,groupBy)">
            <v-toolbar density="compact" color="transparent">
              <v-toolbar-title>
                <div class="text-h6">
                  {{ getItemTitle(element) }}
                  <v-chip v-if="isGrouped" class="ml-2" size="small">
                    {{ getItemCount(element) }} 項目
                  </v-chip>
                </div>
              </v-toolbar-title>
              <template v-slot:append>
                <v-btn
                  height="30"
                  width="30"
                  icon
                  @click.stop="openEditor(element, index,groupBy)"
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
                  @click.stop="deleteItem(index)"
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
import { computed, ref, watch } from "vue";
import draggable from "vuedraggable";
import type { ItemContent, ItemType, SelectItem } from "@/AppTypes";
import Swal from "sweetalert2";

const props = defineProps<{
  items: ItemContent[];
  selectCategory: ItemType;
  selectCols: number;
  groupBy?: "none" | "name" | "group";
}>();

const emit = defineEmits<{
  (e: "open-editor", selectItem: SelectItem): void;
  (e: "update-items", items: ItemContent[]): void;
}>();

const localItems = ref<
  (ItemContent | { title: string; items: ItemContent[] })[]
>([]);

const isGrouped = computed(() => props.groupBy && props.groupBy !== "none");

watch(() => props.items, updateLocalItems, { immediate: true });
watch(() => props.groupBy, updateLocalItems);

function updateLocalItems() {
  if (!isGrouped.value) {
    localItems.value = props.items;
  } else {
    const grouped = props.items.reduce((acc, item) => {
      const key =
        props.groupBy === "name"
          ? item.name
          : `グループ ${(item as any).group}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as Record<string, ItemContent[]>);

    localItems.value = Object.entries(grouped).map(([title, items]) => ({
      title,
      items,
    }));
  }
}

function updateItems() {
  if (!isGrouped.value) {
    emit("update-items", localItems.value as ItemContent[]);
  }
}

function openEditor(
  element: ItemContent | { title: string; items: ItemContent[] },
  index: number,
  groupBy : "none" | "name" | "group"|undefined,
) {
  if ("items" in element && groupBy === "name") {
    emit("open-editor", {
      type: props.selectCategory,
      name:element.title,
      index: -1,
      items: element.items,
    });
  } else if ("items" in element && groupBy === "group") {
    emit("open-editor", {
      type: props.selectCategory,
      name:element.title,
      index: -2,
      items: element.items,
    });

  } else {
    emit("open-editor", {
      type: props.selectCategory,
      index,
    });
  }
}

function deleteItem(index: number) {
  if (!isGrouped.value) {
    Swal.fire({
      title: `${props.items[index].name} を消去する`,
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
        localItems.value.splice(index, 1);
        updateItems();
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

const getRuleColor = (switchValue: number) => {
  switch (switchValue) {
    case 0:
      return "grey darken-3";
    case 1:
      return "lime-darken-2";
    case 2:
      return "green";
    case 3:
      return "blue";
    case 4:
      return "red";
    default:
      return "grey";
  }
};

const getRuleText = (switchValue: number) => {
  switch (switchValue) {
    case 0:
      return "OFF";
    case 1:
      return "だれでも";
    case 2:
      return "メンバー以上";
    case 3:
      return "モデレーター";
    case 4:
      return "管理者";
    default:
      return "不明";
  }
};

function getItemTitle(
  element: ItemContent | { title: string; items: ItemContent[] }
): string {
  return "items" in element ? element.title : element.name;
}

function getItemCount(
  element: ItemContent | { title: string; items: ItemContent[] }
): number {
  return "items" in element ? element.items.length : 1;
}

function getItemSubtitle(element: ItemContent): string {
  switch (props.selectCategory) {
    case "omikuji":
      return `重み: ${(element as any).weight}`;
    case "placeholder":
      return `重み: ${(element as any).weight}, グループ: ${
        (element as any).group
      }`;
    default:
      return "";
  }
}
</script>
