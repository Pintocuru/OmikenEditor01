<!-- src/components/AppList.vue -->
<template>
  <v-card>
    <v-toolbar>
      <v-toolbar-title>
        {{ selectCategory }}
        <v-chip v-if="selectCategory !== 'preferences'" label class="ml-4">
          {{ filterItemsCount }} items
        </v-chip>
      </v-toolbar-title>
      <template #append>
        <v-btn 
          v-if="selectCategory !== 'preferences'"
          variant="outlined" 
          @click="addItem" 
          prepend-icon="mdi-plus"
        >
          追加
        </v-btn>
      </template>
    </v-toolbar>

    <template v-if="selectCategory === 'preferences'">
      <ListPreferences
        :STATE="STATE"
        @update:STATE="updateSTATE"
      />
    </template>
    <template v-else>
      <ListFilter
        v-model:filterRef="filterRef"
        :STATE="STATE"
        :selectCategory="selectCategory"
        @update:STATE="updateSTATE"
      />

      <ListItem
        :STATE="STATE"
        :items="filterItems"
        :itemOrder="STATE[`${selectCategory}Order`]"
        :select-category="selectCategory"
        :group-by="selectCategory === 'place' ? filterRef.placeSortName : undefined"
        @update:STATE="updateSTATE"
        @open-editor="openEditor"
      />
    </template>
  </v-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import ListFilter from "./ListFilter.vue";
import ListItem from "./ListItem.vue";
import ListPreferences from "./ListPreferences.vue"; // 追加
import { z } from "zod";
import _ from "lodash";
import type {
  STATEType,
  ItemCategory,
  SelectItem,
  omikujiType,
  placeType,
  rulesType,
  EditorItem,
  thresholdType,
} from "@/types";

// Props Emits
const props = defineProps<{
  STATE: STATEType;
  selectCategory: ItemCategory;
}>();

const emit = defineEmits<{
  (e: "update:STATE", payload: SelectItem): void;
  (e: "open-editor", editorItem: EditorItem): void;
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

// アイテムカウント
const filterItemsCount = computed(() => Object.keys(filterItems.value).length);


// フィルターオプションに合わせて表示を変更
const filterItems = computed(() => {
  if (props.selectCategory === 'preferences') return {};

  const items = props.STATE[props.selectCategory];
  const filters = {
    rules: () => _.pickBy(items as Record<string, rulesType>, item => 
      filterRef.value.rulesFilterSwitch.length === 0 || 
      filterRef.value.rulesFilterSwitch.includes(item.switch.toString())),
    omikuji: () => _.pickBy(items as Record<string, omikujiType>, item => 
      filterRef.value.omikujiFilterThreshold.length === 0 || 
      filterRef.value.omikujiFilterThreshold.includes(item.threshold.type)),
    place: () => filterRef.value.placeSortName === "none" ? items : 
      _.fromPairs(_.sortBy(Object.entries(items as Record<string, placeType>), 
        ([, item]) => filterRef.value.placeSortName === "name" ? item.name : item.group)),
    default: () => items,
  };

  return (filters[props.selectCategory as keyof typeof filters] || filters.default)();
});

// アイテムを追加
const addItem = () => {
  if (props.selectCategory !== 'preferences') {
    emit("update:STATE", { type: props.selectCategory, addKeys: [{}] });
  }
};

// 各種操作関数(エディターを開く/STATE更新)
const openEditor = (editorItem: EditorItem) => emit("open-editor", editorItem);
const updateSTATE = (payload: SelectItem) => emit("update:STATE", payload);

// 初期化時、omikuji.postをdelaySecondsが小さい順にソート
// TODO タイミングはlistではなく、ダイアログを開く時に表示させよう
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
