<!-- src/components/Navi-ListSection.vue -->
<template>
  <v-list>
    <v-list-subheader class="white--text">
      {{ title }}
    </v-list-subheader>
    <v-list-item
      v-for="(item, index) in items"
      :key="`${itemKey}-${index}`"
      :active="isSelected(itemKey, index)"
      @click="$emit('select-item', itemKey, index)"
    >
      <v-list-item-title :class="`${color}--text`">
        {{ getItemTitle(item, index, itemKey) }}
      </v-list-item-title>
      <template v-slot:append>
        <v-btn
          icon
          variant="text"
          density="comfortable"
          size="small"
          @click.stop="$emit('open-delete-dialog', itemKey, index)"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-list-item>
    <v-list-item @click="$emit('add-item')" class="mt-2">
      <v-list-item-title class="d-flex justify-center">
        <v-btn :color="color" rounded="pill" elevation="2" class="px-4">
          <v-icon start>mdi-plus</v-icon>
          追加
        </v-btn>
      </v-list-item-title>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
// コンポーザブル
import { useNavigation } from "../composables/funkOmikenUI.js";
// 型指定
import type { ItemType, SelectedItem } from "../AppTypes";

const props = defineProps<{
  title: string;
  items: any[];
  itemKey: ItemType;
  selectedItem: SelectedItem | null;
  color: string;
}>();

const emit = defineEmits<{
  (e: "select-item", type: ItemType, index: number): void;
  (e: "open-delete-dialog", type: ItemType, index: number): void;
  (e: "add-item"): void;
}>();

const { isSelected, getItemTitle } = useNavigation(
  {} as any,
  props.selectedItem,
  emit
);
</script>
