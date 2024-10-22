<!-- src/components/AppNavigation.vue -->
<template>
  <v-navigation-drawer permanent rail rail-width="100" expand-on-hover>
    <v-list>
      <v-list-item v-for="(section, index) in sections" :key="index">
        <v-card @click="openList(section.type as ItemCategory)">
          <v-card-title class="d-flex align-center">
            <v-badge  class="mr-4"
              :content="Object.keys(section.items).length"
              color="primary"
              :model-value="true"
              location="bottom end"
            >
              <v-icon :icon="section.icon" size="large"></v-icon>
            </v-badge> {{ section.title }}
          </v-card-title>
          <v-card-text>
           
          </v-card-text>
        </v-card>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { STATEType, ItemCategory } from "@/types";

// Props / Emit
const props = defineProps<{
  STATE: STATEType;
  selectCategory: ItemCategory;
}>();

const emit = defineEmits<{
  (e: "update:category", value: ItemCategory): void;
}>();

// セクション情報の計算
const sections = computed(() => [
  { 
    title: "ルール", 
    type: "rules" as const, 
    items: props.STATE.rules || {},
    icon: "mdi-book-open-variant"
  },
  { 
    title: "おみくじ", 
    type: "omikuji" as const, 
    items: props.STATE.omikuji || {},
    icon: "mdi-crystal-ball"
  },
  { 
    title: "プレースホルダー", 
    type: "place" as const, 
    items: props.STATE.place || {},
    icon: "mdi-tag"
  },
]);

// リスト開閉関数
const openList = (type: ItemCategory) => emit("update:category", type);
</script>
