<!-- src/components/AppHeader.vue -->
<template>
  <v-app-bar app>
    <v-app-bar-title>Funk Omiken App</v-app-bar-title>
    <v-btn @click="$emit('toggle-theme')">
      {{ dark === "dark" ? "Light Mode" : "Dark Mode" }}
    </v-btn>
    <v-radio-group inline v-model="localSelectGridCols">
      <template v-for="pattern in Object.keys(gridcols)" :key="pattern">
        <v-radio :value="Number(pattern)" hide-details>
          <v-icon>{{ gridcols[Number(pattern)].icon }}</v-icon>
        </v-radio>
        <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
      </template>
    </v-radio-group>
  </v-app-bar>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  dark: string;
  selectgridcols: number;
}>();
const emit = defineEmits<{
  (e: "toggle-theme"): void;
  (e: "update:selectgridcols", value: number): void; // 更新イベント
}>();

type GridCol = {
  cols: number;
  sm: number;
  md: number;
  lg: number;
  height: number;
  icon: string;
};
const gridcols: Record<number, GridCol> = {
  0: { cols: 12, sm: 12, md: 12, lg: 6, height: 50, icon: "mdi-view-list" },
  1: { cols: 12, sm: 6, md: 4, lg: 3, height: 100, icon: "mdi-view-grid" },
  2: { cols: 4, sm: 3, md: 2, lg: 1, height: 100, icon: "mdi-view-module" },
};

// 親からの変更を監視
const localSelectGridCols = ref(props.selectgridcols);
watch(
  () => props.selectgridcols,
  (newValue: any) => {
    localSelectGridCols.value = newValue;
  }
);

// localSelectGridColsが変更されたときにemit
watch(localSelectGridCols, (newValue: any) => {
  emit("update:selectgridcols", newValue);
});
</script>
