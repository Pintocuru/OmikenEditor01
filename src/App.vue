<!-- src/App.vue -->
<template>
  <v-app :theme="uiDark">
    <AppHeader v-model:uiDark="uiDark" @update:uidark="uiDark = $event" />
    <AppNavigation
      v-model:naviCategory="naviCategory"
      :Omiken="AppState.Omiken"
      @update:category="naviCategory = $event"
    />
    <v-main>
      <v-container>
        <AppList
          :Omiken="AppState.Omiken"
          :naviCategory="naviCategory"
          @update:Omiken="updateOmiken"
            @update:OmikenPreset="updateOmikenPreset"
          @open-editor="openEditor"
        />
      </v-container>
    </v-main>

    <AppDialog
      v-model:listEntry="listEntry"
        :Omiken="AppState.Omiken"
      @update:Omiken="updateOmiken"
      @open-editor="openEditor"
    />
  </v-app>
</template>

<script setup lang="ts">
import AppHeader from "./components/AppHeader.vue";
import AppNavigation from "./components/AppNavigation.vue";
import AppList from "./components/AppList.vue";
import AppDialog from "./components/AppDialog.vue";
import { funkOmiken as funkOmiken } from "./composables/funkOmiken";
import { funkUI } from "./composables/funkUI";

const { uiDark, naviCategory, listEntry, openEditor } = funkUI();

// コンポーザブルの使用
const { AppState, updateOmiken, updateOmikenPreset } = funkOmiken(listEntry);
</script>
