<!-- src/components/AppHeader.vue -->
<template>
  <v-app-bar app>
    <v-app-bar-title>Funk Omiken App</v-app-bar-title>
    <!-- ダークモード切り替えボタン -->
    <v-btn @click="toggleTheme">
      {{ dark === "dark" ? "Light Mode" : "Dark Mode" }}
    </v-btn>
  </v-app-bar>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
   dark: string;  
  }>();
const emit = defineEmits<{
  (e: "update:dark", value: string): void;
}>();

// テーマ切り替え関数
const toggleTheme = () => emit("update:dark", props.dark === "dark" ? "light" : "dark");


</script>