<!-- src/components/NavigationList.vue -->
<template>
  <v-card>
    <v-card-title>ナビゲーション</v-card-title>
    <v-card-text>
      <v-list dense>
        <ListSection title="ルール" :items="state.rules" itemKey="rule" addButtonText="新しいルールを追加"
          :selectedItem="selectedItem" @select-item="selectItem" @open-delete-dialog="openDeleteDialog"
          @add-item="$emit('add-rule')" />


        <v-divider></v-divider>

        <ListSection title="おみくじ" :items="state.botMessage.omikuji" itemKey="omikuji" addButtonText="新しいおみくじを追加"
          :selectedItem="selectedItem" @select-item="selectItem" @open-delete-dialog="openDeleteDialog"
          @add-item="$emit('add-omikuji')" />

        <v-divider></v-divider>

        <ListSection title="ランダム" :items="state.botMessage.random" itemKey="random" addButtonText="新しいランダムアイテムを追加"
          :selectedItem="selectedItem" @select-item="selectItem" @open-delete-dialog="openDeleteDialog"
          @add-item="$emit('add-random')" />
      </v-list>
    </v-card-text>

    <v-dialog v-model="deleteDialog" max-width="300">
      <v-card>
        <v-card-title>削除の確認</v-card-title>
        <v-card-text>本当に削除しますか？</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" @click="closeDeleteDialog">キャンセル</v-btn>
          <v-btn color="red darken-1" @click="confirmDelete">削除</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, inject, ref, Ref, computed, PropType } from 'vue';
import ListSection from './Navi-ListSection.vue';
import { DefaultState,omikujiRule, OmikujiMessage, RandomItem } from '../types';
import type { SelectedItem, ItemType } from '../AppTypes.ts';

export default defineComponent({
  name: 'NavigationList',
  components: {
    ListSection
  },
  props: {
    state: {
      type: Object as () => DefaultState,
      required: true,
    },
    selectedItem: {
      type: Object as PropType<SelectedItem | null>,
      default: null,
    },
  },
  emits: ['update:selectedItem', 'delete-item', 'add-omikuji', 'add-random', 'add-rule'],
  setup(props, { emit }) {
 

    // 削除確認ダイアログの表示制御
    const deleteDialog = ref(false);
    const deleteTarget = ref<SelectedItem>({
      type: 'rule',
      index: -1,
    });

    // タグごとにランダムアイテムを分類し、その数をカウント
    const groupedRandomItems = computed(() => {
      const randomItems = props.state.botMessage.random || [];
      const grouped = randomItems.reduce((acc, item) => {
        if (!acc[item.tag]) {
          acc[item.tag] = [];
        }
        acc[item.tag].push(item);
        return acc;
      }, {} as Record<string, RandomItem[]>);

      return Object.entries(grouped).map(([tag, items]) => ({
        tag,
        items,
        count: items.length
      }));
    });

    // selectItemの修正
    const selectItem = (type: ItemType, index: number) => {
      emit('update:selectedItem', { type, index });
    };

    // 削除確認ダイアログを開く
    const openDeleteDialog = (type: ItemType, index: number) => {
      deleteTarget.value = { type, index };
      deleteDialog.value = true;
    };

    //削除確認ダイアログを閉じる
    const closeDeleteDialog = () => {
      deleteDialog.value = false;
    };

    //項目の削除を確定し、削除後にダイアログを閉じる
    const confirmDelete = () => {
      emit('delete-item', deleteTarget.value.type, deleteTarget.value.index);
      closeDeleteDialog();
    };

    return {
      groupedRandomItems,
      deleteDialog,
      selectItem,
      openDeleteDialog,
      closeDeleteDialog,
      confirmDelete,
    };
  }
});
</script>