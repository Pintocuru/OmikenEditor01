<!-- src/App.vue -->
<template>
  <v-app :theme="dark">
    <AppHeader v-model:dark="dark" @update:dark="dark = $event" />
    <AppNavigation
      v-model:selectCategory="selectCategory"
      :STATE="STATE"
      @update:category="selectCategory = $event"
    />
    <v-main>
      <v-container>
        <AppMain
          :STATE="STATE"
          :selectCategory="selectCategory"
          @update:STATE="updateSTATE"
          @open-editor="openEditor"
        />
      </v-container>
    </v-main>

    <EditorDialog
      v-model:show="dialogs"
      :selectItem="selectItem"
      :selectMode="selectMode"
      :STATE="STATE"
      @update:STATE="updateSTATE"
      @open-editor="openEditor"
    />
  </v-app>
</template>

<script setup lang="ts">
import { onMounted, provide, ref } from "vue";
import AppHeader from "./components/AppHeader.vue";
import AppNavigation from "./components/AppNavigation.vue";
import AppMain from "./components/AppMain.vue";
import EditorDialog from "./components/EditorDialog.vue";
import { funkSTATE } from "./composables/funkOmikenSTATE";
import { funkUI } from "./composables/funkOmikenUI";

// キャラクターデータ
const CHARA = {
  reimu: {
    name: "ゆっくり霊夢",
    frameId: "",
    color: {
      "--lcv-name-color": "#FFC107",
      "--lcv-text-color": "#ECEFF1",
      "--lcv-background-color": "#FF4081",
    },
    image: {
      Default: "reimu/Default.png", // 存在しない場合のフォロー
      fun01: "reimu/fun01.png", // 通常
      fun02: "reimu/fun02.png", // 通常:身振り付き
      fun03: "reimu/fun03.png", // 通常:ワンポイント
      joy01: "reimu/joy01.png", // 嬉しい:にっこり
      joy02: "reimu/joy02.png", // 嬉しい:わぁ
      joy03: "reimu/joy03.png", // 嬉しい:目がキラキラ
      joy04: "reimu/joy04.png", // 嬉しい:喜び爆発
      relax01: "reimu/relax01.png", // 落ち着き:目がなごみ
      relax02: "reimu/relax02.png", // 落ち着き:顔が緩む
      relax03: "reimu/relax03.png", // 落ち着き:キョトン
      love01: "reimu/love01.png", // 好き:目がハート
      love02: "reimu/love02.png", // 好き:あなたに惚気
      love03: "reimu/love03.png", // 好き:目がお金
      shy01: "reimu/shy01.png", // 恥ずかしい:照れ笑い
      shy02: "reimu/shy02.png", // 恥ずかしい:赤面
      surprise01: "reimu/surprise01.png", // 驚き:すごい
      surprise02: "reimu/surprise02.png", // 驚き:目が点
      surprise03: "reimu/surprise03.png", // 驚き:悲鳴
      panic01: "reimu/panic01.png", // 怖い:焦り
      panic02: "reimu/panic02.png", // 怖い:ガクブル
      panic03: "reimu/panic03.png", // 怖い:目を回す
      anger01: "reimu/anger01.png", // 怒り:叱る
      anger02: "reimu/anger02.png", // 怒り:喧嘩腰
      anger03: "reimu/anger03.png", // 怒り:嫉妬
      contempt01: "reimu/contempt01.png", // 呆れ:頭が頭痛
      contempt02: "reimu/contempt02.png", // 呆れ:ジト目
      sad01: "reimu/sad01.png", // 悲しい:残念
      sad02: "reimu/sad02.png", // 悲しい:(泣)
      sorry01: "reimu/sorry01.png", // 謝罪:失礼しました
      sorry02: "reimu/sorry02.png", // 謝罪:ごめーん!
    },
  },
};
// コンポーザブルの使用
const { STATE, isInitialized, canUpdateJSON, initializeSTATE, updateSTATE } =
  funkSTATE();

provide("charaKey", CHARA); // provideで孫コンポーネントに渡す
const placeholderKey = ref(STATE.value.place);
provide("placeholderKey", placeholderKey); // provideで孫コンポーネントに渡す

const { dark, selectCategory, selectItem, selectMode, dialogs, openEditor } =
  funkUI();

// コンポーネントのマウント時にデータを取得
onMounted(async () => {
  await initializeSTATE();
  placeholderKey.value = STATE.value.place;
});
</script>
