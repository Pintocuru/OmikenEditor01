<!-- src/components/AppNavigation.vue -->
<template>
  <v-navigation-drawer permanent rail rail-width="100" expand-on-hover>
    <v-list>
      <v-list-item v-for="(section, index) in sections" :key="index">
        <v-card @click="openList(section.type as ListCategory)" class="py-4">
          <v-card-title class="d-flex align-center">
            <v-badge
              class="mr-4"
              :content="Object.keys(section.items).length"
              color="primary"
              :model-value="true"
              location="bottom end"
            >
              <v-icon :icon="section.icon" size="large"></v-icon>
            </v-badge>
            {{ section.title }}
          </v-card-title>
        </v-card>
      </v-list-item>
      <v-divider  class="my-4" />

            <!-- preset  -->
      <v-list-item>
        <v-card @click="openList('preset')" class="py-4">
          <v-card-title class="d-flex align-center">
            <v-icon icon="mdi-file" size="large" class="mr-4"></v-icon>
            プリセット
          </v-card-title>
        </v-card>
      </v-list-item>
      <!-- preferences  -->
      <v-list-item>
        <v-card @click="openList('preferences')" class="py-4">
          <v-card-title class="d-flex align-center">
            <v-icon icon="mdi-cog" size="large" class="mr-4"></v-icon>
            設定画面
          </v-card-title>
        </v-card>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { STATEType, ListCategory, NaviCategory } from "@/types";

// Props / Emit
const props = defineProps<{
  STATE: STATEType;
  naviCategory: NaviCategory;
}>();

const emit = defineEmits<{
  (e: "update:category", value: NaviCategory): void;
}>();

// セクション情報の計算
const sections = computed(() => [
  {
    title: "ルール",
    type: "rules" as const,
    items: props.STATE.rules || {},
    icon: "mdi-book-open-variant",
  },
  {
    title: "おみくじ",
    type: "omikuji" as const,
    items: props.STATE.omikuji || {},
    icon: "mdi-crystal-ball",
  },
  {
    title: "プレースホルダー",
    type: "place" as const,
    items: props.STATE.place || {},
    icon: "mdi-tag",
  },
]);

// リスト開閉関数
const openList = (type: NaviCategory) => emit("update:category", type);
</script>
