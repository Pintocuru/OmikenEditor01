<!-- src/components/AppHeader.vue -->
<template>
  <v-app-bar app>
    <v-app-bar-title>Funk Omiken App</v-app-bar-title>
    <v-btn @click="toggleTheme">
      {{ dark === "dark" ? "Light Mode" : "Dark Mode" }}
    </v-btn>
    <v-radio-group
      inline
      v-model="localSelectCols"
      @change="updateSelectCols"
    >
      <v-radio
        v-for="(col, index) in gridcols"
        :key="index"
        :value="index"
        hide-details
        class="ma-4"
      >
        <v-icon>{{ col.icon }}</v-icon>
      </v-radio>
    </v-radio-group>
  </v-app-bar>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { defineProps, defineEmits } from "vue";

const props = defineProps<{
  dark: string;
  selectcols: number;
}>();
const emit = defineEmits<{
  (e: "update:dark", value: string): void;
  (e: "update:selectcols", value: number): void;
}>();

const toggleTheme = () => {
  const newTheme = props.dark === "dark" ? "light" : "dark";
  emit("update:dark", newTheme);
};

const localSelectCols = ref(props.selectcols);
const gridcols = [
  { icon: "mdi-view-list" },
  { icon: "mdi-view-grid" },
  { icon: "mdi-view-module" },
];
const updateSelectCols = (event: { target: { value: number } }) => {
  const value = Number(event.target.value);
  localSelectCols.value = value;
  emit("update:selectcols", value);
};
</script>
