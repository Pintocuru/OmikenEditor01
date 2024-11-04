<!-- src/components/ListEntryPlace.vue -->
<template>
  <v-card-text>
    <v-toolbar density="compact">
      <v-toolbar-title class="ml-2">
        <v-icon icon="mdi-tag"></v-icon>
        プレースホルダーリスト
      </v-toolbar-title>
      <template #append>
        <v-icon icon="mdi-tag"
          ></v-icon
        ><v-tooltip activator="parent" location="top">
            プレースホルダーを作成するには、
          </v-tooltip>
      </template>
    </v-toolbar>
    <v-row>
      <v-col
        v-for="place in displayPlaces"
        :key="place.id"
        cols="12"
        sm="6"
        lg="4"
      >
        <v-card class="mb-2">
          <v-card-title class="text-body-1">
            {{ place.name }}
          </v-card-title>
          <v-card-text>
            <v-chip-group>
              <v-chip
                v-for="(value, index) in place.values.slice(0, 3)"
                :key="index"
                small
              >
                {{ value.value }}
              </v-chip>
              <v-chip v-if="place.values.length > 3" small> ... </v-chip>
            </v-chip-group>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-card-text>
</template>

<script setup lang="ts">
import { OmikenType, OmikujiPostType, PlaceType } from "@/types";
import { computed } from "vue";

const props = defineProps<{
  Omiken: OmikenType;
  enabledIds?: string[];
}>();

//
const displayPlaces = computed(() => {
  if (!props.enabledIds) return Object.values(props.Omiken.place);
  const usedPlaceNames = props.enabledIds
    .flatMap((id) => props.Omiken.omikuji[id]?.post ?? [])
    .flatMap((post) => {
      const matches = post.content?.match(/<<([^>>]+)>>/g) ?? [];
      return matches.map((m) => m.replace(/<<|>>/g, ""));
    });
  return Object.values(props.Omiken.place).filter((place) =>
    usedPlaceNames.includes(place.name)
  );
});
</script>
