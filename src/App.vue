<!-- src/App.vue -->
<template>
  <v-app :theme="uiDark">
    <!-- ローディング中の表示 -->
    <template v-if="isAppEditorLoading">
      <v-container class="text-center">
        <v-progress-circular indeterminate color="primary" />
        <p>データを読み込んでいます...<br>
        わんコメを起動し、プラグインから<br>
        「おみくじBOTプラグイン」を有効にしてください<br>
      <br>
    困ったら、こちらのページを見てね。<br>
    こちらからダウンロード</p>
      </v-container>
    </template>
    <template v-else>
      <AppHeader v-model:uiDark="uiDark" @update:uiDark="uiDark = $event" />
      <AppNavigation
        v-model:naviCategory="naviCategory"
        :Omiken="AppEditor.Omiken"
        @update:category="naviCategory = $event"
      />
      <v-main>
        <v-container>
          <AppList
            :AppEditor="AppEditor"
            :categoryActive="naviCategory"
            @update:Omiken="updateOmiken"
            @update:OmikenPreset="updateOmikenPreset"
            @open-editor="openEditor"
          />
        </v-container>
      </v-main>
      <AppDialog
        v-model:listEntry="listEntry"
        :Omiken="AppEditor.Omiken"
        @update:Omiken="updateOmiken"
        @open-editor="openEditor"
      />
    </template>
  </v-app>
</template>

<script setup lang="ts">
import AppHeader from "./components/AppHeader.vue";
import AppNavigation from "./components/AppNavigation.vue";
import AppList from "./components/AppList.vue";
import AppDialog from "./components/AppDialog.vue";
import { FunkOmiken } from "./composables/FunkOmiken";
import { FunkUI } from "./composables/FunkUI";
import { onMounted } from "vue";

const { uiDark, naviCategory, listEntry, openEditor } = FunkUI();

// AppEditorのコンポーザブル
const {
  AppEditor,
  AppEditorInitialize,
  isAppEditorLoading,
  updateOmiken,
  updateOmikenPreset,
} = FunkOmiken();

// APIから取得
onMounted(async () => await AppEditorInitialize());
</script>
