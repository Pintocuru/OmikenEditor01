<!-- src/components/AppNavigation.vue -->
<template>
  <v-navigation-drawer permanent rail rail-width="100" expand-on-hover>
    <v-list>
      <v-list-item v-for="(section, index) in sections" :key="index">
        <!-- メインセクション -->
        <v-card @click="openList(section.category)" class="py-4">
          <v-card-title class="d-flex align-center">
            <v-badge
              class="mr-4"
              v-if="section.itemCount > 0"
              :content="section.itemCount"
              color="primary"
              :model-value="true"
              location="bottom end"
            >
              <v-icon :icon="section.icon" size="large"></v-icon>
            </v-badge>
            {{ section.title }}
          </v-card-title>
        </v-card>

        <!-- サブセクション -->
        <v-list v-if="section.subSections" class="pl-4">
          <v-list-item
            v-for="(subSection, subIndex) in section.subSections"
            :key="subIndex"
          >
            <v-card @click="openList(subSection.category)" class="py-2">
              <v-card-title class="d-flex align-center">
                <v-icon icon="mdi-chevron-right" size="small" class="mr-2" />
                {{ subSection.title }}
              </v-card-title>
            </v-card>
          </v-list-item>
        </v-list>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { CategoryActive, OmikenType } from "@type";

// Props / Emit
const props = defineProps<{
  Omiken: OmikenType;
  naviCategory: CategoryActive;
}>();

const emit = defineEmits<{
  (e: "update:category", value: CategoryActive): void;
}>();

interface Section {
  title: string;
  icon: string;
  itemCount: number;
  category: CategoryActive;
  subSections?: {
    title: string;
    itemCount: number;
    category: CategoryActive;
  }[];
}

// セクション情報の計算
const sections = computed<Section[]>(() => [
  {
    title: "モード",
    icon: "",
    itemCount: 0,
    category: { main: "types" },
  },
  {
    title: "ルール",
    icon: "mdi-book-open-variant",
    itemCount:  Object.keys(props.Omiken.rules || {}).length,
    category: { main: "rules" },
  },
  {
    title: "おみくじ",
    icon: "mdi-crystal-ball",
    itemCount: Object.keys(props.Omiken.omikujis || {}).length,
    category: { main: "omikujis" },
  },
  {
    title: "プレースホルダー",
    icon: "mdi-tag",
    itemCount: Object.keys(props.Omiken.places || {}).length,
    category: { main: "places" },
  },
  {
    title: "プリセット",
    icon: "mdi-file",
    itemCount: 0,
    category: { main: "presets", sub: "Omiken" },
    subSections: [
      {
        title: "おみくじデータ",
        itemCount: 10,
        category: { main: "presets", sub: "Omiken" },
      },
      {
        title: "キャラクター",
        itemCount: 10,
        category: { main: "presets", sub: "Chara" },
      },
      {
        title: "スクリプト",
        itemCount: 8,
        category: { main: "presets", sub: "Script" },
      },
    ],
  },
]);

// リスト開閉関数
const openList = (category: CategoryActive) =>
  emit("update:category", category);
</script>
