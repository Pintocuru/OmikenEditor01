<!-- src/App.vue -->
<template>
  <v-app :theme="dark">
    <v-container fluid>
      <v-row>
        <v-col cols="3">
          <!-- 保存ボタン -->
          <v-card-actions>
            <v-btn color="primary" @click="saveData" class="mb-4">
              保存
              <v-tooltip activator="parent" location="bottom">編集後は必ず保存ボタンを押して下さい</v-tooltip>
            </v-btn>
          </v-card-actions>
          <!-- ナビゲーション -->
          <NavigationList :state="state" :selected-item="onSelect()" @selectItem="updateSelect" @update="updateState" />
        </v-col>
        <v-col cols="9">
          <!-- 条件 -->
          <RuleEditor v-if="currentType === 'rule'" :selectedRule="selectedRule" @update:rule="updateRule" />
          <!-- おみくじ -->
          <OmikujiEditor v-if="currentType === 'omikuji'" :selectedOmikuji="selectedOmikuji"
            @update:omikuji="updateOmikuji" />
          <!-- ランダム -->
          <RandomEditor v-if="currentType === 'random'" :selectedRandomItems="selectedRandomItems"
            @update:randomItems="updateRandomItems" />
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import NavigationList from "./components/NavigationList.vue";
import RuleEditor from "./components/RuleEditor.vue";
import OmikujiEditor from "./components/OmikujiEditor.vue";
import RandomEditor from "./components/RandomEditor.vue";
import { useAppState, useDataFetcher, useDataSaver } from "./composables/funkOmikenApp.js";
import type { SelectedItem, ItemType } from "./AppTypes";

// アプリケーションの状態管理
const { state } = useAppState();
const { fetchData } = useDataFetcher();
const { saveData } = useDataSaver();

// ダークモードの設定
const dark = ref('dark');

// 現在選択されているアイテムの状態管理
const currentType = ref<ItemType | null>(null);
const currentIndex = ref<number | null>(null);

// 選択されたアイテムの計算プロパティ
const selectedRule = computed(() =>
  currentType.value === "rule" && currentIndex.value !== null ? state.rules[currentIndex.value] || null : null
);

const selectedOmikuji = computed(() =>
  currentType.value === "omikuji" && currentIndex.value !== null ? state.botMessage.omikuji[currentIndex.value] || null : null
);

const selectedRandomItems = computed(() =>
  currentType.value === "random" ? state.botMessage.random || null : null
);

// アイテム選択時の処理
const onSelect = () => currentType.value && currentIndex.value !== null ? { type: currentType.value, index: currentIndex.value } as SelectedItem : null;

// 選択アイテムの更新
const updateSelect = (type: ItemType, index: number) => {
  currentType.value = type;
  currentIndex.value = index;
};

// 各種アイテムの更新処理
const updateRule = (newRule: (typeof state.rules)[0]) => updateState("rule", newRule);
const updateOmikuji = (newOmikuji: (typeof state.botMessage.omikuji)[0]) => updateState("omikuji", newOmikuji);
const updateRandomItems = (newRandomItems: typeof state.botMessage.random) => updateState("random", newRandomItems);

// 状態の更新
const updateState = (type: ItemType, newData: any) => {
  if (currentIndex.value !== null || type === "random") {
    switch (type) {
      case "rule": state.rules[currentIndex.value!] = newData; break;
      case "omikuji": state.botMessage.omikuji[currentIndex.value!] = newData; break;
      case "random": state.botMessage.random = newData; break;
    }
  }
  currentType.value = type;
  currentIndex.value = type === "random" ? null : currentIndex.value;
};

// 初期データの取得
fetchData(state);
</script>