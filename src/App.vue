<!-- src/App.vue -->
<template>
  <v-app :theme="uiDark">
    <AppHeader v-model:uiDark="uiDark" @update:uidark="uiDark = $event" />
    <AppNavigation
      v-model:naviCategory="naviCategory"
      :Omiken="AppEditer.Omiken"
      @update:category="naviCategory = $event"
    />
    <v-main>
      <v-container>
        <AppList
          :Omiken="AppEditer.Omiken"
          :naviCategory="naviCategory"
          @update:Omiken="updateOmiken"
          @update:OmikenPreset="updateOmikenPreset"
          @open-editor="openEditor"
        />
      </v-container>
    </v-main>

    <AppDialog
      v-model:listEntry="listEntry"
      :Omiken="AppEditer.Omiken"
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
import { FunkOmiken } from "./composables/FunkOmiken";
import { FunkUI } from "./composables/FunkUI";

const { uiDark, naviCategory, listEntry, openEditor } = FunkUI();

// コンポーザブルの使用
const { AppEditer, updateOmiken, updateOmikenPreset } = FunkOmiken(listEntry);
</script>
