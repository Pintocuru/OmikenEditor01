<!-- src/components/ListEntryPlace.vue -->
<template>
  <v-card-text>
    <v-toolbar density="compact">
      <v-toolbar-title class="ml-2">
        <v-icon>mdi-crystal-ball</v-icon>
        使用しているプレースホルダー
      </v-toolbar-title>
    </v-toolbar>
<div v-for="(placeholder, index) in placeholderObjects" :key="index">
  {{ placeholder.name }}
</div>
  </v-card-text>
</template>

<script setup lang="ts">
import { OmikenType, OmikujiPostType, PlaceType } from "@/types";
import { computed } from "vue";

const props = defineProps<{
  Omiken: OmikenType;
  enabledIds: string[];
}>();

const placeholderObjects = computed(() => {
  const results: PlaceType[] = [];
  for (const omikujiId of props.enabledIds) {
    const posts = props.Omiken.omikuji[omikujiId]?.post;
    if (posts) {
      posts.forEach((post: OmikujiPostType) => {
        if (post.content) {
          const placeholders = post.content.match(/<<([^>>]+)>>/g) || [];
          placeholders.forEach((p) => {
            const placeName = p.replace(/<<|>>/g, "");
            const place = Object.values(props.Omiken.place).find(
              (pl) => pl.name === placeName
            );
            if (place) {
              results.push(place); // プレースホルダーに対応するオブジェクトを追加
            }
          });
        }
      });
    }
  }
  return results;
});
</script>
