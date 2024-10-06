<!-- src/components/NavigationList.vue -->
<template>
  <v-card>
    <v-card-text>
      <v-list dense>
        <ListSection v-for="(section, index) in sections" :key="section.key" :title="section.title"
          :items="section.items" :item-key="section.key" :selected-item="selectedItem" :color="section.color"
          @select-item="handleSelectItem" @open-delete-dialog="openDeleteDialog" @add-item="handleAddItem(section.key)"
          class="mb-4" />
      </v-list>
    </v-card-text>

    <DeleteConfirmDialog v-model="deleteDialog" :item-to-delete="itemToDelete" @confirm="confirmDelete" />
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ListSection from './Navi-ListSection.vue';
import DeleteConfirmDialog from './DeleteConfirmDialog.vue';
import { funkOmikenNavi } from '../composables/funkOmikenNavi.js';
import type { DefaultState } from '../types';
import type { SelectedItem, ItemType } from '../AppTypes';

const props = defineProps<{
  state: DefaultState;
  selectedItem: SelectedItem;
}>();

const emit = defineEmits<{
  (e: 'update:state', newState: DefaultState): void;
  (e: 'select-item', type: ItemType, index: number): void;
}>();

const { sections, addItem, deleteItem } = funkOmikenNavi(props.state, props.selectedItem);

const handleSelectItem = (type: ItemType, index: number) => {
  emit('select-item', type, index);
};

const handleAddItem = (type: ItemType) => {
  const newState = addItem(type, props.state);
  emit('update:state', newState);
};

const deleteDialog = ref(false);
const itemToDelete = ref<SelectedItem | null>(null);

const openDeleteDialog = (type: ItemType, index: number) => {
  itemToDelete.value = { type, index };
  deleteDialog.value = true;
};

const confirmDelete = () => {
  if (itemToDelete.value) {
    const { type, index } = itemToDelete.value;
    const newState = deleteItem(type, index, props.state);
    emit('update:state', newState);
    deleteDialog.value = false;
    itemToDelete.value = null;
  }
};
</script>