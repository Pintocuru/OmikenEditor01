<!-- src/components/Navi-ListSection.vue -->
<template>
  <div>
    <!-- タイトル -->
    <v-list-item-title>{{ title }}</v-list-item-title>
    <!-- アイテムリスト -->
    <v-list-item v-for="(item, index) in items" :key="itemKey + '-' + index"
      :class="{ 'v-list-item--active': isSelected(itemKey, index) }" @click="$emit('select-item', itemKey, index)">
      <!-- 各アイテムのタイトル -->
      <v-list-item-title>{{ getItemTitle(item, index) }}</v-list-item-title>
      <v-list-item-action>
        <!-- 削除ボタン -->
        <v-btn icon @click.stop="$emit('open-delete-dialog', itemKey, index)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item-action>
    </v-list-item>
    <!-- 追加ボタン -->
    <v-list-item @click="$emit('add-item')">
      <v-list-item-title>
        <v-icon>mdi-plus</v-icon> {{ addButtonText }}
      </v-list-item-title>
    </v-list-item>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import type { SelectedItem, ItemType } from '../AppTypes.js';

export default defineComponent({
  name: 'ListSection',
  props: {
    title: {
      type: String,
      required: true
    },
    items: {
      type: Array,
      required: true
    },
    itemKey: {
      type: String as PropType<ItemType>,
      required: true
    },
    addButtonText: {
      type: String,
      required: true
    },
    selectedItem: {
      type: Object as PropType<SelectedItem | null>,
      default: null
    }
  },
  setup(props, { emit }) {
    // 選択されているアイテムかどうかを確認
    const isSelected = (type: ItemType, index: number): boolean => {
      return props.selectedItem?.type === type &&
        props.selectedItem.index === index;
    };

    // アイテムのタイトルを取得
    const getItemTitle = (item: any, index: number): string => {
      if (props.itemKey === 'random') {
        return `${item.tag} (${item.count} items)`;
      } else if (props.itemKey === 'rule') {
        return item.name || `ルール ${index + 1}`;
      } else if (props.itemKey === 'omikuji') {
        return `おみくじ ${index + 1}`;
      } else {
        return item.name || `アイテム ${index + 1}`;
      }
    };

    return {
      isSelected,
      getItemTitle
    };
  }
});
</script>
