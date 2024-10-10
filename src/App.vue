<!-- src/App.vue -->
<template>
  <v-app :theme="dark">
    <AppHeader
      v-model:dark="dark"
      v-model:selectgridcols="selectgridcols"
      @toggle-theme="toggleTheme"
    />
    <v-main>
      <v-container>
        <v-row>
          <v-col cols="3">
            <AppNavigation
              :state="state"
              :selected-item="selectedItem"
              @select-item="handleSelectItem"
              @select-section="handleSelectSection"
              @update:state="updateState($event)"
              @save-data="handleSaveData"
              @open-list="hogedaiSelect"
              @open-editor="openEditorDialog"
            />
          </v-col>
          <v-col cols="9">
            <AppMain
              v-model:state="state"
              :dai="hogeselectedItem"
              :type="selectedItem?.type ?? null"
              :selectgridcols="selectgridcols"
              @open-editor="openEditorDialog"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <EditorDialog
      v-if="showEditorDialog"
      :show="showEditorDialog"
      :type="selectedItem?.type ?? null"
      :selected-item="selectedItem?.item ?? null"
      @update="updateItem"
      @update:show="showEditorDialog = $event"
    />
  </v-app>
</template>

<script setup lang="ts">
import { ref } from "vue";
import AppHeader from "./components/AppHeader.vue";
import AppNavigation from "./components/AppNavigation.vue";
import AppMain from "./components/AppMain.vue";
import EditorDialog from "./components/EditorDialog.vue";
import { useAppCore } from "./composables/funkOmikenCore.js";
import { useDataFetcher, useDataSaver } from "./composables/funkOmikenJSON.js";
import type { ItemContent, ItemType } from "./AppTypes";
import type { DefaultState } from "./types";

const { fetchData } = useDataFetcher();
const { saveData } = useDataSaver();
const { state, selectedItem, selectItem, addItem, updateItem, deleteItem } =
  useAppCore();

const props = defineProps<{
  type: ItemType;
  selectgridcols: number;
}>();

// gridcolsとselectgridcolsの定義
const dark = ref("dark");
const selectgridcols = ref<number>(1);

const toggleTheme = () => {
  dark.value = dark.value === "dark" ? "light" : "dark";
};

const hogeselectedItem = ref<ItemType>("rules");
const hogedaiSelect = (type: ItemType) => {
  hogeselectedItem.value = type;
};

const showEditorDialog = ref(false);

const handleSelectItem = (type: ItemType, item: ItemContent) => {
  selectItem(type, item);
};

const openEditorDialog = (type: ItemType, item: ItemContent) => {
  selectedItem.value = { type, item };
  showEditorDialog.value = true;
};

const handleSaveData = () => {
  saveData(state.value);
};

const updateState = (newState: DefaultState) => {
  state.value = newState;
};

const handleSelectSection = (type: ItemType) => {
  const items = state.value[type];
  selectedItem.value = { type, item: items[0] };
};

fetchData(state.value);
</script>
