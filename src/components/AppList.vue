<!-- src/components/AppList.vue -->
<template>
  <v-card>
    <v-toolbar>
      <v-toolbar-title>
        {{ naviCategory }}
        <v-chip v-if="naviCategory !== 'preferences'" label class="ml-4">
          {{ filterItemsCount }} items
        </v-chip>
      </v-toolbar-title>
      <template #append>
        <v-btn 
          v-if="naviCategory !== 'preferences'"
          variant="outlined" 
          @click="addItem" 
          prepend-icon="mdi-plus"
        >
          追加
        </v-btn>
      </template>
    </v-toolbar>

    <template v-if="naviCategory === 'preset'">
      <ListPreset
        :Omiken="Omiken"
        @update:Omiken="updateOmiken"
      />
    </template>
    <template v-else-if="naviCategory === 'preferences'">
      <ListPreferences
        :Omiken="Omiken"
        @update:Omiken="updateOmiken"
      />
    </template>
    <template v-else>
      <ListFilter
        v-model:filterRef="filterRef"
        :Omiken="Omiken"
        :listCategory="naviCategory"
        @update:Omiken="updateOmiken"
      />

      <ListItem
        :Omiken="Omiken"
        :items="filterItems"
        :itemOrder="Omiken[`${naviCategory}Order`]"
        :listCategory="naviCategory"
        @update:Omiken="updateOmiken"
        @open-editor="openEditor"
      />
    </template>
  </v-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import ListFilter from "./ListFilter.vue";
import ListItem from "./ListItem.vue";
import ListPreset from "./ListPreset.vue"; // 追加
import ListPreferences from "./ListPreferences.vue"; // 追加
import { z } from "zod";
import _ from "lodash";
import type {
  OmiEditType,
  ListCategory,
  OmikenEntry,
  OmikujiType,
  PlaceType,
  RulesType,
  thresholdType,
  NaviCategory,
  OmikenCategory,
  ListEntry,
} from "@/types";

// Props Emits
const props = defineProps<{
  Omiken: OmiEditType;
  naviCategory: NaviCategory;
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
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
  if (props.naviCategory === 'preset') return {};
    if (props.naviCategory === 'preferences') return {};

  const items = props.Omiken[props.naviCategory];
  const filters = {
    rules: () => _.pickBy(items as Record<string, RulesType>, item => 
      filterRef.value.rulesFilterSwitch.length === 0 || 
      filterRef.value.rulesFilterSwitch.includes(item.switch.toString())),
    omikuji: () => _.pickBy(items as Record<string, OmikujiType>, item => 
      filterRef.value.omikujiFilterThreshold.length === 0 || 
      filterRef.value.omikujiFilterThreshold.includes(item.threshold.type)),
    place: () => filterRef.value.placeSortName === "none" ? items : 
      _.fromPairs(_.sortBy(Object.entries(items as Record<string, PlaceType>), 
        ([, item]) => filterRef.value.placeSortName === "name" ? item.name : item.group)),
    default: () => items,
  };

  return (filters[props.naviCategory as keyof typeof filters] || filters.default)();
});

// アイテムを追加
const addItem = () => {
  if (props.naviCategory !== 'preferences') {
    emit("update:Omiken", { type: props.naviCategory, addKeys: [{}] });
  }
};

// 各種操作関数(エディターを開く/Omiken更新)
const updateOmiken = (payload: OmikenEntry<OmikenCategory>) => emit("update:Omiken", payload);
const openEditor = (editorItem: ListEntry<ListCategory>) => emit("open-editor", editorItem);

</script>
