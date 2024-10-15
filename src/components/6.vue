<!-- src/components/MainPlaceholderList.vue -->
<template>
  <v-card-text>
    <v-row>
      <draggable
        v-model="localItems"
        :item-key="(item: any, index: any) => index"
        tag="div"
        class="d-flex flex-wrap w-100"
        @change="updateItems"
      >
        <template #item="{ element, index }">
          <v-col v-bind="colProps">
            <v-card :height="cardHeight">
              <v-toolbar density="compact" color="transparent">
                <v-toolbar-title>
                  <div class="text-h6">
                    {{ element.title }}
                    <v-chip class="ml-2" size="small">
                      {{ element.items ? element.items.length : 1 }} 項目
                    </v-chip>
                  </div>
                </v-toolbar-title>
                <template v-slot:append>
                  <v-btn
                    height="30"
                    width="30"
                    icon
                    @click.stop="openEditor(element, index)"
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

              <v-card-subtitle v-if="!element.items">
                重み: {{ element.weight }}, グループ: {{ element.group }}
              </v-card-subtitle>
            </v-card>
          </v-col>
        </template>
      </draggable>
    </v-row>
  </v-card-text>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import draggable from "vuedraggable";
import type { Placeholder } from "@/types";
import { ItemContent, SelectItem } from "@/AppTypes";

const props = defineProps<{
  items: ItemContent[];
  groupBy: "none" | "name" | "group";
  selectCols: number;
}>();

const emit = defineEmits<{
  (e: "open-editor", selectItem: SelectItem): void;
  (e: "update-items", items: Placeholder[]): void;
}>();

const localItems = ref<
  (ItemContent | { title: string; items: ItemContent[] })[]
>([]);

watch(() => props.items, updateLocalItems, { immediate: true });
watch(() => props.groupBy, updateLocalItems);

function updateLocalItems() {
  if (props.groupBy === "none") {
    localItems.value = props.items.map((item) => ({
      ...item,
      title: "name" in item ? item.name : "Unknown",
    }));
  } else {
    const grouped = props.items.reduce((acc, item) => {
      if ("name" in item && "group" in item) {
        const key =
          props.groupBy === "name" ? item.name : `グループ ${item.group}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
      }
      return acc;
    }, {} as Record<string, ItemContent[]>);

    localItems.value = Object.entries(grouped).map(([title, items]) => ({
      title,
      items,
    }));
  }
}

function openEditor(
  element: ItemContent | { title: string; items: ItemContent[] },
  index: number
) {
  if ("items" in element) {
    // グループの場合
    emit("open-editor", {
      type: "placeholder",
      index: -1, // グループ全体を示す特別な値
      name: element.title,
      items: { items: element.items } as unknown as ItemContent, // グループ情報を含む
    });
  } else {
    // 単一アイテムの場合
    emit("open-editor", { type: "placeholder", index });
  }
}

function updateItems() {
  if (props.groupBy === "none") {
    emit("update-items", localItems.value as Placeholder[]);
  }
}

function deleteItem(index: number) {
  if (props.groupBy === "none") {
    localItems.value.splice(index, 1);
    updateItems();
  } else {
    // グループ化されている場合は、削除機能を無効にするか、
    // グループ全体を削除するロジックを実装する必要があります
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
</script>
