<!-- src/components/AppMain.vue -->
<template>
  <v-card>
    <v-layout>
      <v-main>
        <v-app-bar color="primary" density="compact">
          <v-app-bar-title>
            {{ selectCategory }}
            <v-chip label> {{ filterItems.length }} items </v-chip>
          </v-app-bar-title>
          <template #append>
            <v-btn
              elevation="2"
              variant="outlined"
              @click="addItem"
              prepend-icon="mdi-plus"
            >
              追加
            </v-btn>
          </template>
        </v-app-bar>

        <MainFilter
          v-model:filterRef="filterRef"
          :STATE="STATE"
          :selectCategory="selectCategory"
          @update:STATE="updateSTATE"
        />

        <MainItemList
          :items="filterItems"
          :itemOrder="STATE[`${selectCategory}Order`]"
          :select-category="selectCategory"
          :group-by="
            selectCategory === 'place' ? filterRef.placeSortName : undefined
          "
          @update:STATE="updateSTATE"
          @open-editor="openEditor"
        />
      </v-main>
    </v-layout>
  </v-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import MainFilter from "./MainFilter.vue";
import MainItemList from "./MainItemList.vue";
import { z } from "zod";
import _ from "lodash";
import type {
  STATEType,
  ItemCategory,
  SelectItem,
  thresholdType,
  omikujiType,
  placeType,
  rulesType,
  ItemContent,
} from "@/types";

// Props Emits
const props = defineProps<{
  STATE: STATEType;
  selectCategory: ItemCategory;
}>();

const emit = defineEmits<{
  (e: "update:STATE", payload: SelectItem): void;
  (    e: "open-editor",
    type: ItemCategory,
    item: Record<string, ItemContent>,
    mode: string | null
  ): void;
}>();

// フィルタリングを管理するref
const FilterRefSchema = z.object({
  rulesSortName: z.enum(["none", "highFreq", "lowFreq"]),
  rulesFilterSwitch: z.array(z.string()),
  omikujiSortName: z.enum(["none", "highFreq", "lowFreq"]),
  omikujiFilterThreshold: z.array(z.custom<thresholdType>()),
  omikujiSortWeight: z.enum(["none", "highFreq", "lowFreq"]),
  placeSortName: z.enum(["none", "name", "group"]),
  placeSortWeight: z.enum(["none", "highFreq", "lowFreq"]),
});

const filterRef = ref(
  FilterRefSchema.parse({
    rulesSortName: "highFreq",
    rulesFilterSwitch: [],
    omikujiSortName: "highFreq",
    omikujiFilterThreshold: [],
    omikujiSortWeight: "highFreq",
    placeSortName: "name",
    placeSortWeight: "highFreq",
  })
);

// フィルターオプションに合わせて表示を変更
const filterItems = computed(() => {
  const items = props.STATE[props.selectCategory];
  const filters = {
    rules: () =>
      _.pickBy(
        items as Record<string, rulesType>,
        (item) =>
          filterRef.value.rulesFilterSwitch.length === 0 ||
          filterRef.value.rulesFilterSwitch.includes(item.switch.toString())
      ),
    omikuji: () =>
      _.pickBy(
        items as Record<string, omikujiType>,
        (item) =>
          filterRef.value.omikujiFilterThreshold.length === 0 ||
          filterRef.value.omikujiFilterThreshold.includes(item.threshold.type)
      ),
    place: () => {
      if (filterRef.value.placeSortName === "none") return items;
      return _.fromPairs(
        _.sortBy(
          Object.entries(items as Record<string, placeType>),
          ([, item]) =>
            filterRef.value.placeSortName === "name" ? item.name : item.group
        )
      );
    },
    default: () => items,
  };

  const filter =
    filters[props.selectCategory as keyof typeof filters] || filters.default;
  return filter();
});

// アイテムを追加
const addItem = () => {
  emit("update:STATE", { type: props.selectCategory, addKeys: [{}] });
};

// selectItemをAppに送り、エディターを開く
const openEditor = (
  type: ItemCategory,
  item: Record<string, ItemContent>,
  mode: string | null = null
) => {
  emit("open-editor", type, item, mode);
};

// STATEの更新をemit
const updateSTATE = (payload: SelectItem) => emit("update:STATE", payload);

// 初期化時、omikuji.postをdelaySecondsが小さい順にソート
onMounted(() => {
  if (props.selectCategory === "omikuji") {
    const sortedItems = _.sortBy(
      Object.entries(props.STATE.omikuji),
      ([, item]) => _.get(item, "post[0].delaySeconds", Infinity)
    );
    const newOrder = sortedItems.map(([id]) => id);
    updateSTATE({
      type: "omikuji",
      items: _.fromPairs(sortedItems),
      reorder: newOrder,
    });
  }
});
</script>
