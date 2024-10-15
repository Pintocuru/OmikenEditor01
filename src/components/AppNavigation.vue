<!-- src/components/AppNavigation.vue -->
<template>
  <v-navigation-drawer permanent>
    <v-list>
      <v-list-item v-for="(section, index) in sections" :key="index">
        <v-card @click="openList(section.type)" class="mb-2">
          <v-card-title class="d-flex justify-space-between align-center">
            {{ section.title }}
            <v-badge :content="section.items.length" color="primary"></v-badge>
          </v-card-title>
        </v-card>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ItemType } from "../AppTypes";
import { DefaultState } from "@/types";

// Props定義
const props = defineProps<{
  STATE: DefaultState;
  selectCategory: ItemType;
}>();

// Emit定義
const emit = defineEmits<{
  (e: 'update:category', value: ItemType): void;
}>();

// セクション情報の計算
const sections = computed(() => [
  { title: "Rules", type: "rules", items: props.STATE.rules || [] },
  { title: "Omikuji", type: "omikuji", items: props.STATE.omikuji || [] },
  { title: "Placeholder", type: "placeholder", items: props.STATE.placeholder || [] },
]);

// リスト開閉関数
const openList = (type: ItemType) => emit('update:category', type);
</script>