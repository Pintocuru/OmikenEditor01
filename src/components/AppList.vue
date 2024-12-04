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
        @update:Omiken="updateOmiken"
        @update:OmikenPreset="updateOmikenPreset"
        @open-editor="openEditor"
      />
    </v-sheet>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ListRules from "./ListRules.vue";
import ListOmikuji from "./ListOmikuji.vue";
import ListPlace from "./ListPlace.vue";
import ListPreset from "./ListPreset.vue";
import type {
  OmikenType,
  ListCategory,
  OmikenEntry,
  OmikenCategory,
  ListEntry,
  PresetType,
  CategoryActive,
} from "@/types/index";
import { FunkEmits } from "@/composables/FunkEmits";

// Props Emits
const props = defineProps<{
  categoryActive: CategoryActive;
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
  (e: "update:OmikenPreset", preset: PresetType): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

// コンポーザブル:FunkEmits
const { updateOmiken,openEditor ,updateOmikenPreset} = FunkEmits(emit);

// 表示制御用の計算プロパティ
const showAddButton = computed(() => props.categoryActive.main !== 'presets');

// 子コンポーネントの指定
const currentListComponent = computed(() => {
  const componentMap = {
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
