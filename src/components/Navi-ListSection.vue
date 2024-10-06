<!-- src/components/Navi-ListSection.vue -->
<template>
  <div>
    <v-list-subheader>{{ title }}</v-list-subheader>
    <v-list-item v-for="(item, index) in items" :key="`${itemKey}-${index}`"
      :class="{ 'v-list-item--active': isSelected(itemKey, index) }" @click="$emit('select-item', itemKey, index)">
      <v-list-item-title>{{ getItemTitle(item, index) }}</v-list-item-title>
      <template #append>
        <v-btn icon @click.stop="$emit('open-delete-dialog', itemKey, index)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-list-item>
    <v-list-item @click="$emit('add-item')">
      <v-list-item-title>
        <v-icon start>mdi-plus</v-icon>
        {{ addButtonText }}
      </v-list-item-title>
    </v-list-item>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ItemType, SelectedItem } from '../AppTypes';

const props = defineProps<{
  title: string;
  items: any[];
  itemKey: ItemType;
  addButtonText: string;
  selectedItem: SelectedItem | null;
}>();

const emit = defineEmits<{
  (e: 'select-item', type: ItemType, index: number): void;
  (e: 'open-delete-dialog', type: ItemType, index: number): void;
  (e: 'add-item'): void;
}>();

const isSelected = computed(() => (type: ItemType, index: number): boolean => {
  return props.selectedItem?.type === type && props.selectedItem.index === index;
});

const getItemTitle = (item: any, index: number): string => {
  switch (props.itemKey) {
    case 'random':
      return `${item.tag} (${item.content.split('\n').length} items)`;
    case 'rule':
      return item.name || `ルール ${index + 1}`;
    case 'omikuji':
      return `おみくじ ${index + 1}`;
    default:
      return item.name || `アイテム ${index + 1}`;
  }
};
</script>