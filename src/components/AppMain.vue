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
            <v-btn icon="mdi-plus" @click="addNewItem">＋追加</v-btn>
          </template>
        </v-app-bar>

        <MainFilter
          :select-category="selectCategory"
          :filter-options="filterOptions"
          @update-filter="updateFilter"
        />

        <MainItemList
          :items="filteredItems"
          :select-category="selectCategory"
          :col-props="colProps"
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
import { useFunkOmikenEdit } from "@/composables/funkOmikenEdit";
import type { ItemContent, ItemType } from "../AppTypes";
import type { DefaultState, omikujiRule, OmikujiMessage, Placeholder, OmikujiThresholdType } from "@/types";

const props = defineProps<{
  STATE: DefaultState;
  selectCategory: ItemType;
  selectgridcols: number;
}>();

const emit = defineEmits<{
  (e: 'update:STATE', state: DefaultState): void;
  (e: 'open-editor', type: ItemType,index: number): void;
}>();

const { addItem } = useFunkOmikenEdit(ref(props.STATE));

type OmikujiSortOption = 'weightDesc' | 'weightAsc';
type PlaceholderSortOption = 'name' | 'weightDesc' | 'weightAsc' | 'group';
const filteredItems = ref<ItemContent[]>([]);
const filterOptions = ref({
  showAllRules: true,
  omikujiSort: 'weightDesc' as OmikujiSortOption,
  omikujiFilter: 'all' as 'all' | OmikujiThresholdType,
  placeholderSort: 'name' as PlaceholderSortOption,
});

// フィルタリングとソートのロジックを分離
const filterAndSortItems = () => {
  switch (props.selectCategory) {
    case 'rules':
      return filterRules();
    case 'omikuji':
      return filterAndSortOmikuji();
    case 'placeholder':
      return sortPlaceholders();
    default:
      return props.STATE[props.selectCategory];
  }
};

// ルールのフィルタリング
const filterRules = (): omikujiRule[] => {
  const rules = props.STATE.rules as omikujiRule[];
  return filterOptions.value.showAllRules ? rules : rules.filter(rule => rule.switch !== 0);
};

// おみくじのフィルタリングとソート
const filterAndSortOmikuji = (): OmikujiMessage[] => {
  let omikujiItems = props.STATE.omikuji as OmikujiMessage[];
  if (filterOptions.value.omikujiFilter !== 'all') {
    omikujiItems = omikujiItems.filter(item => item.threshold.type === filterOptions.value.omikujiFilter);
  }
  return omikujiItems.sort((a, b) => 
    filterOptions.value.omikujiSort === 'weightDesc' ? b.weight - a.weight : a.weight - b.weight
  );
};

// プレースホルダーのソート
const sortPlaceholders = (): Placeholder[] => {
  const placeholderItems = props.STATE.placeholder as Placeholder[];
  return placeholderItems.sort((a, b) => {
    switch (filterOptions.value.placeholderSort) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'weightDesc':
        return b.weight - a.weight;
      case 'weightAsc':
        return a.weight - b.weight;
      case 'group':
        return a.group - b.group;
      default:
        return 0;
    }
  });
};

// フィルタリングとソートを適用して結果を更新
const updateFilteredItems = (): void => {
  filteredItems.value = filterAndSortItems() as ItemContent[];
};

// 新しいアイテムを追加する関数
const addNewItem = (): void => {
  const newItem = addItem(props.selectCategory);
  const updatedState = { ...props.STATE };
  (updatedState[props.selectCategory] as ItemContent[]).push(newItem);
  emit("update:STATE", updatedState);
  updateFilteredItems();
};

const openEditor = (type: ItemType, index: number) => {
  emit("open-editor", type, index);
};

const colProps = computed(() => {
  const cols = 12 / (props.selectgridcols + 1);
  return {
    cols: 12,
    sm: cols * 2,
    md: cols,
    lg: cols,
  };
});

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
watch(() => props.STATE[props.selectCategory], updateFilteredItems, { deep: true });
watch(() => props.selectCategory, updateFilteredItems);

// 初期化時にフィルタリングを適用
updateFilteredItems();
</script>