<!-- src/App.vue -->
<template>
  <v-app>
    <v-container fluid>
      <v-row>
        <v-col cols="3">
          <NavigationList
            :state="state"
            :selected-item="onSelect"
            @selectItem="updateSelect"
            @update="updateState"
          />
        </v-col>
        <v-col cols="9">
          <v-card>
            <v-card-title>{{ currentTitle }}</v-card-title>
            <v-card-text>
              <RuleEditor v-if="currentType === 'rule'" :selectedRule="selectedRule" @update:rule="updateRule" />
              <OmikujiEditor v-if="currentType === 'omikuji'" :selectedOmikuji="selectedOmikuji"
                @update:omikuji="updateOmikuji" />
              <RandomEditor v-if="currentType === 'random'" :selectedRandomItems="selectedRandomItems"
                @update:randomItems="updateRandomItems" />
            </v-card-text>
            <v-card-actions>
              <v-btn color="success" @click="saveData">保存</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import NavigationList from './components/NavigationList.vue';
import RuleEditor from './components/RuleEditor.vue';
import OmikujiEditor from './components/OmikujiEditor.vue';
import RandomEditor from './components/RandomEditor.vue';
import { useAppState, useDataFetcher, useDataSaver } from "./composables/funkOmikenEdit.js";
import type { SelectedItem,ItemType } from './AppTypes';

const { state } = useAppState();
const { fetchData } = useDataFetcher();
const { saveData } = useDataSaver();

// 現在選択されているアイテムのタイプと索引
const currentType = ref<ItemType | null>(null);
const currentIndex = ref<number | null>(null);

// 現在のタイトルを計算
const currentTitle = computed(() => {
  switch (currentType.value) {
    case 'rule': return 'ルールエディタ';
    case 'omikuji': return 'おみくじエディタ';
    case 'random': return 'ランダムメッセージエディタ';
    default: return '';
  }
});

// 選択されたアイテムの計算
const selectedRule = computed(() => currentType.value === 'rule' && currentIndex.value !== null ? state.rules[currentIndex.value] : null);
const selectedOmikuji = computed(() => currentType.value === 'omikuji' && currentIndex.value !== null ? state.botMessage.omikuji[currentIndex.value] : null);
const selectedRandomItems = computed(() => currentType.value === 'random' ? state.botMessage.random : null);

// アイテムが選択された時の処理
const onSelect = () => {
  return { type: currentType.value, index: currentIndex.value } as SelectedItem
};
// 選ばれたアイテムの更新
const updateSelect = (type: ItemType, index: number) => {
  currentType.value = type;
  currentIndex.value = index;
};


// TODO 将来 updateState にまとめたい
const updateRule = (newRule: typeof state.rules[0]) => {
  updateState('rule', newRule);
};

const updateOmikuji = (newOmikuji: typeof state.botMessage.omikuji[0]) => {
  updateState('omikuji', newOmikuji);
};

const updateRandomItems = (newRandomItems: typeof state.botMessage.random) => {
  updateState('random', newRandomItems);
};

const updateState = (type: ItemType, newData: any) => {
  if (currentIndex.value !== null || type === 'random') {
    switch (type) {
      case 'rule':
        state.rules[currentIndex.value!] = newData;
        break;
      case 'omikuji':
        state.botMessage.omikuji[currentIndex.value!] = newData;
        break;
      case 'random':
        state.botMessage.random = newData;
        break;
    }
  }
  currentType.value = type;
  currentIndex.value = type === 'random' ? null : currentIndex.value;
};

// 初期データの取得
fetchData(state);
</script>