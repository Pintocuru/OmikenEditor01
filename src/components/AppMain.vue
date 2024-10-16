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
            <v-btn elevation="2" variant="outlined" @click="addNewItem" prepend-icon="mdi-plus">
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
          :items="filteredItems"
          :select-category="selectCategory"
          :selectCols="selectCols"
          :group-by="selectCategory === 'placeholder' ? filterOptions.placeholderSort : undefined"
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
import type { ItemContent, ItemType, SelectItem } from "../AppTypes";
import type { DefaultState, omikujiRule, OmikujiMessage, Placeholder, OmikujiThresholdType } from "@/types";
import { validateOmikuji, validateRandomItems, validateRules } from "@/composables/funkOmikenJSON";

const props = defineProps<{
  STATE: DefaultState;
  selectCategory: ItemType;
  selectCols: number;
}>();

const emit = defineEmits<{
  (e: "update:STATE", state: DefaultState): void;
  (e: "open-editor", selectItem: SelectItem): void;
}>();

// アイテム追加のための設定
type StateKey = keyof Pick<DefaultState, 'rules' | 'omikuji' | 'placeholder'>;

const typeConfig: Record<ItemType, { 
  validator: (item: any) => any[], 
  stateKey: StateKey, 
  nameGen: (count: number) => string 
}> = {
  rules: { 
    validator: validateRules, 
    stateKey: "rules", 
    nameGen: (count: number) => `新しいルール ${count + 1}` 
  },
  omikuji: { 
    validator: validateOmikuji, 
    stateKey: "omikuji", 
    nameGen: () => getRandomFortune() 
  },
  placeholder: { 
    validator: validateRandomItems, 
    stateKey: "placeholder", 
    nameGen: (count: number) => `<<random${count + 1}>>` 
  },
};

// ランダムな運勢を取得
const getRandomFortune = () => ["大吉", "中吉", "小吉", "末吉", "吉", "凶", "福沢諭吉"][Math.floor(Math.random() * 7)];

// アイテムを追加
const addItem = (type: ItemType): void => {
  const { validator, stateKey, nameGen } = typeConfig[type];
  const name = nameGen(props.STATE[stateKey].length);
  const newItem = validator({ name })[0];
  (props.STATE[stateKey] as any[]).push(newItem);
  emit('update:STATE', { ...props.STATE });
};

// フィルターオプションの初期設定
const filterOptions = ref({
  showAllRules: true,
  omikujiSort: "weightDesc" as "weightDesc" | "weightAsc",
  omikujiFilter: "all" as "all" | OmikujiThresholdType,
  placeholderSort: "name" as "none" | "name" | "group",
});

const filteredItems = ref<ItemContent[]>([]);

// フィルタリングとソートのロジック
const filterAndSortItems = (): ItemContent[] => {
  const items = props.STATE[props.selectCategory] as ItemContent[];
  switch (props.selectCategory) {
    case "rules":
      return filterOptions.value.showAllRules ? items : (items as omikujiRule[]).filter(rule => rule.switch !== 0);
    case "omikuji":
      return (items as OmikujiMessage[])
        .filter(item => filterOptions.value.omikujiFilter === "all" || item.threshold.type === filterOptions.value.omikujiFilter)
        .sort((a, b) => filterOptions.value.omikujiSort === "weightDesc" ? b.weight - a.weight : a.weight - b.weight);
    case "placeholder":
      return filterOptions.value.placeholderSort === "none" ? items :
        (items as Placeholder[]).sort((a, b) => 
          filterOptions.value.placeholderSort === "name" ? a.name.localeCompare(b.name) : a.group - b.group
        );
    default:
      return items;
  }
};

// フィルタリングとソートを適用して結果を更新
const updateFilteredItems = (): void => {
  filteredItems.value = filterAndSortItems();
};

// 新しいアイテムを追加
const addNewItem = (): void => {
  addItem(props.selectCategory);
  updateFilteredItems();
};

// エディターを開く
const openEditor = (selectItem: SelectItem) => emit("open-editor", selectItem);

// フィルターオプションを更新
const updateFilter = (options: Partial<typeof filterOptions.value>): void => {
  Object.assign(filterOptions.value, options);
  updateFilteredItems();
};

// アイテムリストを更新
const updateItems = (newItems: ItemContent[]): void => {
  filteredItems.value = newItems;
  emit("update:STATE", { ...props.STATE, [props.selectCategory]: newItems });
};

// ウォッチャーを設定
watch(() => props.STATE[props.selectCategory], updateFilteredItems, { deep: true });
watch(() => props.selectCategory, updateFilteredItems);

// 初期化時にフィルタリングを適用
updateFilteredItems();
</script>