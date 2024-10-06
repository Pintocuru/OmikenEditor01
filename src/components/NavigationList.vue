<!-- src/components/NavigationList.vue -->
<template>
  <v-card>
    <v-card-title>ナビゲーション</v-card-title>
    <v-card-text>
      <v-list dense>
        <ListSection
          v-for="section in sections"
          :key="section.key"
          :title="section.title"
          :items="section.items"
          :item-key="section.key"
          :add-button-text="section.addButtonText"
          :selected-item="selectedItem"
          @select-item="handleSelectItem"
          @open-delete-dialog="openDeleteDialog"
          @add-item="addItem(section.key)"
        />
      </v-list>
    </v-card-text>

    <DeleteConfirmDialog
      v-model="deleteDialog"
      :item-to-delete="itemToDelete"
      @confirm="confirmDelete"
    />
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import ListSection from './Navi-ListSection.vue';
import DeleteConfirmDialog from './DeleteConfirmDialog.vue';
import type { DefaultState } from '../types';
import type {  SelectedItem, ItemType } from '../AppTypes';

const props = defineProps<{
  state: DefaultState;
  selectedItem: SelectedItem;
}>();

const emit = defineEmits<{
  (e: 'update:state', newState: DefaultState): void;
  (e: 'select-item', type: ItemType, index: number): void;
}>();

// 選んだアイテム
const handleSelectItem = (type: ItemType, index: number) => {
  emit('select-item', type, index);
};

// 説明とか
const sections = computed(() => [
  {
    key: 'rule' as const,
    title: 'ルール',
    items: props.state.rules,
    addButtonText: '新しいルールを追加',
  },
  {
    key: 'omikuji' as const,
    title: 'おみくじ',
    items: props.state.botMessage.omikuji,
    addButtonText: '新しいおみくじを追加',
  },
  {
    key: 'random' as const,
    title: 'ランダム',
    items: props.state.botMessage.random,
    addButtonText: '新しいランダムアイテムを追加',
  },
]);

// アイテム追加
const addItem = (type: ItemType) => {
  const newState = { ...props.state };
  if (type === 'rule') {
    newState.rules.push({ name: `新しいルール ${newState.rules.length + 1}`, modes: '', modeSelect: [], switch: 0 });
  } else if (type === 'omikuji') {
    newState.botMessage.omikuji.push({ weight: 1, threshold: { type: 'none', value: 0, loop: false, comparison: 0 } });
  } else if (type === 'random') {
    newState.botMessage.random.push({ tag: `新しいタグ ${newState.botMessage.random.length + 1}`, weight: 1, group: 0, content: '' });
  }
  emit('update:state', newState);
};


// 削除ダイアログ
const deleteDialog = ref(false);
const itemToDelete = ref<SelectedItem | null>(null);


// 削除対象
const openDeleteDialog = (type: ItemType, index: number) => {
  itemToDelete.value = { type, index };
  deleteDialog.value = true;
};

// 削除の実行
const confirmDelete = () => {
  if (itemToDelete.value) {
    const { type, index } = itemToDelete.value;
    const newState = { ...props.state };
    if (type === 'rule') {
      newState.rules.splice(index, 1);
    } else if (type === 'omikuji') {
      newState.botMessage.omikuji.splice(index, 1);
    } else if (type === 'random') {
      newState.botMessage.random.splice(index, 1);
    }
    emit('update:state', newState);
    deleteDialog.value = false;
    itemToDelete.value = null;
  }
};

</script>