<!-- src/components/AppHeader.vue -->
<template>
 <v-app-bar app>
  <v-app-bar-title>おみくじBOTメーカー</v-app-bar-title>
  <template v-slot:append>
   <v-btn @click="saveOmiken(props.Omiken);">ボタン</v-btn>
  </template>
 </v-app-bar>
</template>

<script setup lang="ts">
import { saveOmiken } from '@/composables/FunkJSON';
import { OmikenType } from '@/types/Omiken';

const props = defineProps<{ Omiken: OmikenType }>();

const emit = defineEmits<{
 (e: 'update:uiDark', value: string): void;
}>();
</script>
