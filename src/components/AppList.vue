<!-- src/components/AppList.vue -->
<template>
  <v-card>
    <v-toolbar>
      <v-toolbar-title>
        {{ naviCategory }}
        <v-chip v-if="showItemCount" label class="ml-4">
          {{ itemsCount }} items
        </v-chip>
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
        :Omiken="Omiken"
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
  NaviCategory,
  OmikenCategory,
  ListEntry,
  PresetType,
} from "@/types/index";
import { FunkEmits } from "@/composables/FunkEmits";

// Props Emits
const props = defineProps<{
  Omiken: OmikenType;
  naviCategory: NaviCategory;
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
  (e: "update:OmikenPreset", preset: PresetType): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

// コンポーザブル:FunkEmits
const { updateOmiken,openEditor ,updateOmikenPreset} = FunkEmits(emit);

// 表示制御用の計算プロパティ
const showItemCount = computed(() => props.naviCategory !== 'presets');
const showAddButton = computed(() => props.naviCategory !== 'presets');


// 現在のカテゴリに応じたアイテム一覧を取得
const currentItems = computed(() => {
  const excludedCategories: NaviCategory[] = ['presets']; // 修正: 'preset' を除外
  if (excludedCategories.includes(props.naviCategory)) {
    return {};
  }
  // 型を明示的に指定
  return props.Omiken[props.naviCategory as keyof OmikenType];
});

// アイテムカウント
const itemsCount = computed(() => Object.keys(currentItems.value).length);

// これはなに？
const currentListComponent = computed(() => {
  const componentMap = {
    rules: ListRules,
    omikujis: ListOmikuji,
    places: ListPlace,
    presets: ListPreset,
  } as const;
  
  return componentMap[props.naviCategory];
});

// アイテムを追加
const addItem = () => {
  if (props.naviCategory !== "presets") {
    emit("update:Omiken", { type: props.naviCategory, addKeys: [{}] });
  }
};

</script>
