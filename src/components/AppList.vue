<!-- src/components/AppList.vue -->
<template>
  <v-card>
    <v-toolbar>
      <v-toolbar-title>
        {{ naviCategory }}
        <v-chip v-if="naviCategory !== 'preferences'" label class="ml-4">
          {{ itemsCount }} items
        </v-chip>
      </v-toolbar-title>
      <template #append>
        <v-btn
          v-if="naviCategory !== 'preferences'"
          variant="outlined"
          @click="addItem"
          icon="mdi-plus"
        ></v-btn>
      </template>
    </v-toolbar>

    <v-sheet v-if="naviCategory === 'preset'">
      <ListPreset
        @update:Omiken="updateOmiken"
        @update:OmikenPreset="updateOmikenPreset"
      />
    </v-sheet>
    <v-sheet v-else-if="naviCategory === 'preferences'">
      <ListPreferences :Omiken="Omiken" @update:Omiken="updateOmiken" />
    </v-sheet>
    <v-sheet v-else>
  <ListEntrys
      :Omiken="Omiken"
      @update:Omiken="updateOmiken"
         @open-editor="openEditor"
    />
    </v-sheet>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ListItem from "./ListItem.vue";
import ListEntrys from "./ListEntry.vue";
import ListPreset from "./ListPreset.vue"; 
import ListPreferences from "./ListPreferences.vue"; 
import type {
  OmikenType,
  ListCategory,
  OmikenEntry,
  NaviCategory,
  OmikenCategory,
  ListEntry,
  PresetOmikenEditType,
} from "@/types";

// Props Emits
const props = defineProps<{
  Omiken: OmikenType;
  naviCategory: NaviCategory;
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
  (e: "update:OmikenPreset", preset: PresetOmikenEditType): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

// アイテムカウント
const itemsCount = computed(() => Object.keys(currentItems.value).length);

// フィルターオプションに合わせて表示を変更
const currentItems = computed(() => {
  if (props.naviCategory === "preset") return {};
  if (props.naviCategory === "preferences") return {};
  return props.Omiken[props.naviCategory];
});

// アイテムを追加
const addItem = () => {
  if (props.naviCategory !== "preferences") {
    emit("update:Omiken", { type: props.naviCategory, addKeys: [{}] });
  }
};

// 各種操作関数(エディターを開く/Omiken更新)
const updateOmiken = (payload: OmikenEntry<OmikenCategory>) =>
  emit("update:Omiken", payload);
// TODO updateOmikenPresetを作る
const updateOmikenPreset = (preset: PresetOmikenEditType) =>
  emit("update:OmikenPreset", preset);
const openEditor = (editorItem: ListEntry<ListCategory>) =>
  emit("open-editor", editorItem);
</script>
