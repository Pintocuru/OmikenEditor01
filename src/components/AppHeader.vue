<!-- src/components/AppHeader.vue -->
<template>
  <v-app-bar app>
    <v-app-bar-title>おみくじメーカー</v-app-bar-title>
    <template v-slot:append>
      <!-- ダークモード切り替えボタン -->
      <v-btn @click="toggleTheme">
        {{ uiDark === "dark" ? "Light Mode" : "Dark Mode" }}
      </v-btn>
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">

const props = defineProps<{
  uiDark: string;
}>();

const emit = defineEmits<{
  (e: "update:uidark", value: string): void;
}>();

// テーマ切り替え関数
const toggleTheme = () =>
  emit("update:uidark", props.uiDark === "dark" ? "light" : "dark");

/*
    <template v-slot:prepend>
       <v-app-bar-nav-icon />
    </template>
*/

</script>