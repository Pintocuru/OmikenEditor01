<!-- src/components/NavigationList.vue -->
<template>
  <v-card>
    <v-card-title>ナビゲーション</v-card-title>
    <v-card-text>
      <v-list dense>
        <ListSection title="ルール" :items="rules" itemKey="rule" addButtonText="新しいルールを追加" :selectedItem="selectedItem"
          @select-item="$emit('select-item', $event)" @open-delete-dialog="openDeleteDialog"
          @add-item="$emit('add-rule')" />

        <v-divider></v-divider>

        <ListSection title="おみくじ" :items="omikujiMessages" itemKey="omikuji" addButtonText="新しいおみくじを追加"
          :selectedItem="selectedItem" @select-item="$emit('select-item', $event)"
          @open-delete-dialog="openDeleteDialog" @add-item="$emit('add-omikuji')" />

        <v-divider></v-divider>

        <ListSection title="ランダム" :items="groupedRandomItems" itemKey="random" addButtonText="新しいランダムアイテムを追加"
          :selectedItem="selectedItem" @select-item="$emit('select-item', $event)"
          @open-delete-dialog="openDeleteDialog" @add-item="$emit('add-random')" />
      </v-list>
    </v-card-text>

    <!-- ... 削除確認ダイアログ ... -->
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
import { defineComponent, PropType, computed, ref, defineModel } from 'vue';
import ListSection from './Navi-ListSection.vue';
import { omikujiRule, OmikujiMessage, RandomItem } from '../types';
import type { SelectedItem, ItemType } from '../AppTypes.ts';

export default defineComponent({
  name: 'NavigationList',
  components: {
    ListSection
  },
  props: {
    rules: {
      type: Array as PropType<omikujiRule[]>,
      required: true
    },
    omikujiMessages: {
      type: Array as PropType<OmikujiMessage[]>,
      required: true
    },
    randomItems: {
      type: Array as PropType<RandomItem[]>,
      required: true,
      default: () => []
    },
    selectedItem: {
      type: Object as PropType<SelectedItem | null>, 
      default: null
    },
  },
  setup(props, { emit }) {
    // 削除確認ダイアログの表示制御
    const deleteDialog = ref(false);

    const tab = defineModel('tab');

    // 削除対象の管理
    const deleteTarget = ref<SelectedItem>({
      type: 'rule', // デフォルトで 'rule' や 'omikuji' など有効なタイプを設定
      index: -1     // 無効なインデックスを示すために -1 を使用
    });

    /**
     * ランダムアイテムをタグでグループ化
     * タグごとにランダムアイテムを分類し、その数をカウント
     */
    const groupedRandomItems = computed(() => {
      // props.randomItems が存在しない場合は空配列を使用
      const randomItems = props.randomItems || [];

      const grouped = randomItems.reduce((acc, item) => {
        if (!acc[item.tag]) {
          acc[item.tag] = [];
        }
        acc[item.tag].push(item);
        return acc;
      }, {} as Record<string, RandomItem[]>);

      // グループ化した結果をタグとアイテムのリスト形式で返す
      return Object.entries(grouped).map(([tag, items]) => ({
        tag,
        items,
        count: items.length
      }));
    });

    /**
     * 項目が選択されているかどうかを確認する関数
     * 
     * @param type - 項目の種類
     * @param index - 項目のインデックス
     * @param key - 任意のキー
     * @returns 選択状態なら true、それ以外は false
     */
    const isSelected = (selectedItem: SelectedItem): boolean => {
      console.log(selectedItem);
      return props.selectedItem?.type === selectedItem.type &&
        props.selectedItem.index === selectedItem.index;
    };

    // selectItemメソッドを変更
    const selectItem = (type: ItemType, index: number) => {
      selectedItem.value = { type, index }; // selectedItemを更新
      emit('select-item', selectedItem.value);
    };

    /**
     * 削除確認ダイアログを開く
     * 
     * @param type - 削除対象の種類
     * @param index - 削除対象のインデックス
     * @param key - 削除対象のキー（省略可）
     */
    const openDeleteDialog = (selectedItem: SelectedItem) => {
      deleteTarget.value = selectedItem;
      deleteDialog.value = true;
    };

    /**
     * 削除確認ダイアログを閉じる
     */
    const closeDeleteDialog = () => {
      deleteDialog.value = false;
    };

    /**
     * 項目の削除を確定し、削除後にダイアログを閉じる
     */
    const confirmDelete = () => {
      emit('delete-item', deleteTarget.value.type, deleteTarget.value.index,);
      closeDeleteDialog();
    };

    // setup 関数が返すオブジェクト。テンプレートで使用されるデータや関数を含む
    return {
      tab,
      groupedRandomItems,
      deleteDialog,
      isSelected,
      openDeleteDialog,
      closeDeleteDialog,
      confirmDelete,
    };
  }
});
</script>