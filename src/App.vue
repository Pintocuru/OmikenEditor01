<!-- src/App.vue -->
<template>
  <v-app :theme="uiDark">
    <AppHeader
      v-model:uiDark="uiDark"
      @update:uidark="uiDark = $event"
    />
    <AppNavigation
      v-model:selectCategory="selectCategory"
      :STATE="AppState.STATE"
      @update:category="selectCategory = $event"
    />
    <v-main>
      <v-container>
        <AppList
          :STATE="AppState.STATE"
          :selectCategory="selectCategory"
          @update:STATE="updateSTATE"
          @open-editor="openEditor"
        />
      </v-container>
    </v-main>

    <AppDialog
      v-model:show="dialogs"
      :selectItem="selectItem"
      :selectMode="selectMode"
      :STATE="AppState.STATE"
      @update:STATE="updateSTATE"
      @open-editor="openEditor"
    />
  </v-app>
</template>

<script setup lang="ts">
import { onMounted, provide, ref } from "vue";
import AppHeader from "./components/AppHeader.vue";
import AppNavigation from "./components/AppNavigation.vue";
import AppList from "./components/AppList.vue";
import AppDialog from "./components/AppDialog.vue";
import { funkSTATE } from "./composables/funkOmikenSTATE";
import { funkUI } from "./composables/funkOmikenUI";

// コンポーザブルの使用
const { AppState,  initializeAppState, updateSTATE } = funkSTATE();

const {
  uiDark,
  uiDrawer,
  selectCategory,
  selectItem,
  selectMode,
  dialogs,
  openEditor,
} = funkUI();

// コンポーネントのマウント時にデータを取得
onMounted(async () => {
  await initializeAppState();
});
</script>
