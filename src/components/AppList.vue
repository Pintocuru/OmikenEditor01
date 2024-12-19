<!-- src/components/AppList.vue -->
<template>
  <v-card>
    <v-toolbar>
      <v-toolbar-title>
        {{ categoryActive }}
      </v-toolbar-title>
      <template #append>
        <v-btn
          v-if="showAddButton"
          variant="outlined"
          @click="addItem"
          icon="mdi-plus"
        ></v-btn>
      </template>
    </v-toolbar>

    <!-- 各種リストコンポーネントの条件付きレンダリング -->
    <v-sheet>
      <component
        :is="currentListComponent"
        :categoryActive="categoryActive"
        :Omiken="AppEditer.Omiken"
        :Presets="AppEditer.Presets"
        @update:Omiken="updateOmiken"
        @update:OmikenPreset="updateOmikenPreset"
        @open-editor="openEditor"
      />
    </v-sheet>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ListTypes from "./ListTypes.vue";
import ListRules from "./ListRules.vue";
import ListOmikuji from "./ListOmikuji.vue";
import ListPlace from "./ListPlace.vue";
import ListPreset from "./ListPreset.vue";
import type {
  ListCategory,
  OmikenEntry,
  OmikenEntryType,
  ListEntry,
  PresetType,
  CategoryActive,
  AppEditerType,
} from "@/types";
import { FunkEmits } from "@/composables/FunkEmits";

// Props Emits
const props = defineProps<{
  AppEditer: AppEditerType;
  categoryActive: CategoryActive;
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenEntryType>): void;
  (e: "update:OmikenPreset", preset: PresetType): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

// コンポーザブル:FunkEmits
const { updateOmiken, openEditor, updateOmikenPreset } = FunkEmits(emit);

// 表示制御用の計算プロパティ
const showAddButton = computed(() => props.categoryActive.main !== "presets");

// 子コンポーネントの指定
const currentListComponent = computed(() => {
  const componentMap = {
    types: ListTypes,
    rules: ListRules,
    omikujis: ListOmikuji,
    places: ListPlace,
    presets: ListPreset,
  } as const;

  return componentMap[props.categoryActive.main];
});

// アイテムを追加
const addItem = () => {
  if (props.categoryActive.main !== "presets") {
    emit("update:Omiken", { type: props.categoryActive.main, addKeys: [{}] });
  }
};
</script>
