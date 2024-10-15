<!-- src/components/AppMain.vue -->
<template>
  <v-card>
    <v-layout>
      <v-main>
        <v-app-bar color="primary" density="compact">
          <v-app-bar-title>
            {{ selectCategory }}
            <v-chip label> {{ filteredItems.length }} items </v-chip>
          </v-app-bar-title>
          <template v-slot:append>
            <v-btn elevation="2" variant='outlined' @click="addNewItem" prepend-icon="mdi-plus">
              追加
            </v-btn>
          </template>
        </v-app-bar>

        <MainFilter
          :select-category="selectCategory"
          :filter-options="filterOptions"
          @update-filter="updateFilter"
        />

        <MainItemList
          v-if="selectCategory !== 'placeholder'"
          :items="filteredItems"
          :select-category="selectCategory"
          :selectCols="selectCols"
          @update-items="updateItems"
          @open-editor="openEditor"
        />
        <MainPlaceholderList
          v-else
          :items="filteredItems"
          :group-by="filterOptions.placeholderSort"
          :selectCols="selectCols"
          @update-items="updateItems"
          @open-editor="openEditor"
        />
      </v-main>
    </v-layout>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import MainFilter from "./MainFilter.vue";
import MainItemList from "./MainItemList.vue";
import MainPlaceholderList from "./MainPlaceholderList.vue";
import { useFunkOmikenEdit } from "@/composables/funkOmikenEdit";
import type { ItemContent, ItemType } from "../AppTypes";
import type {
  DefaultState,
  omikujiRule,
  OmikujiMessage,
  Placeholder,
  OmikujiThresholdType,
} from "@/types";

const props = defineProps<{
  STATE: DefaultState;
  selectCategory: ItemType;
  selectCols: number;
}>();

const emit = defineEmits<{
  (e: "update:STATE", state: DefaultState): void;
  (e: "open-editor", type: ItemType, index: number): void;
}>();

const { addItem } = useFunkOmikenEdit(ref(props.STATE));

type OmikujiSortOption = "weightDesc" | "weightAsc";
type PlaceholderSortOption = "none" | "name" | "group";
const filteredItems = ref<ItemContent[]>([]);
const filterOptions = ref({
  showAllRules: true,
  omikujiSort: "weightDesc" as OmikujiSortOption,
  omikujiFilter: "all" as "all" | OmikujiThresholdType,
  placeholderSort: "name" as PlaceholderSortOption,
});

// フィルタリングとソートのロジックを分離
const filterAndSortItems = (): ItemContent[] => {
  const items = props.STATE[props.selectCategory] as ItemContent[];
  switch (props.selectCategory) {
    case "rules":
      return filterOptions.value.showAllRules
        ? items
        : (items as omikujiRule[]).filter((rule) => rule.switch !== 0);
    case "omikuji":
      return (items as OmikujiMessage[])
        .filter(
          (item) =>
            filterOptions.value.omikujiFilter === "all" ||
            item.threshold.type === filterOptions.value.omikujiFilter
        )
        .sort((a, b) =>
          filterOptions.value.omikujiSort === "weightDesc"
            ? b.weight - a.weight
            : a.weight - b.weight
        );
    case "placeholder":
      if (filterOptions.value.placeholderSort === "none") {
        return items;
      }
      return (items as Placeholder[]).sort((a, b) => {
        switch (filterOptions.value.placeholderSort) {
          case "name":
            return a.name.localeCompare(b.name);
          case "group":
            return a.group - b.group;
          default:
            return 0;
        }
      });
    default:
      return items;
  }
};

// フィルタリングとソートを適用して結果を更新
const updateFilteredItems = (): void => {
  filteredItems.value = filterAndSortItems() as ItemContent[];
};

// 新しいアイテムを追加する関数（簡略化）
const addNewItem = (): void => {
  addItem(props.selectCategory);
  updateFilteredItems(); // フィルタ結果を再描画
};

const openEditor = (type: ItemType, index: number) => {
  emit("open-editor", type, index);
};

// フィルターオプションを更新する関数
const updateFilter = (options: Partial<typeof filterOptions.value>): void => {
  filterOptions.value = { ...filterOptions.value, ...options };
  updateFilteredItems();
};

// アイテムリストを更新する関数
const updateItems = (newItems: ItemContent[]): void => {
  filteredItems.value = newItems;
  const updatedState = { ...props.STATE, [props.selectCategory]: newItems };
  emit("update:STATE", updatedState);
};

// ウォッチャーを設定
watch(() => props.STATE[props.selectCategory], updateFilteredItems, {
  deep: true,
});
watch(() => props.selectCategory, updateFilteredItems);

// 初期化時にフィルタリングを適用
updateFilteredItems();
</script>
