<!-- src/components/AppNavigation.vue -->
<template>
  <v-navigation-drawer permanent>
    <v-list>
      <v-list-item v-for="(section, index) in sections" :key="index">
        <v-card @click="openList(section.type as ItemCategory)" class="mb-2">
          <v-card-title class="d-flex justify-space-between align-center">
            {{ section.title }}
            <v-badge :content="Object.keys(section.items).length" color="primary"></v-badge>
          </v-card-title>
        </v-card>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { STATEType, ItemCategory } from "@/types";

// Props定義
const props = defineProps<{
  STATE: STATEType;
  selectCategory: ItemCategory;
}>();

// Emit定義
const emit = defineEmits<{
  (e: "update:category", value: ItemCategory): void;
}>();

// セクション情報の計算
const sections = computed(() => [
  { title: "Rules", type: "rules" as const, items: props.STATE.rules || {} },
  { title: "Omikuji", type: "omikuji" as const, items: props.STATE.omikuji || {} },
  { title: "Placeholder", type: "place" as const, items: props.STATE.place || {} },
]);

// リスト開閉関数
const openList = (type: ItemCategory) => emit("update:category", type);
</script>