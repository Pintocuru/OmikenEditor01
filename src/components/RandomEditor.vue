<template>
  <v-card>
    <v-card-title>ランダムメッセージエディタ</v-card-title>
    <v-card-text>
      <v-select v-model="selectedKey" :items="Object.keys(random)" label="ランダムメッセージキー" @change="onKeyChange"></v-select>

      <v-btn @click="addRandomItem" color="primary" small class="mb-2">新しい項目を追加</v-btn>

      <v-list>
        <v-list-item v-for="(item, index) in currentItems" :key="index">
          <v-row>
            <v-col cols="12" sm="6" md="4">
              <v-text-field v-model.number="item.weight" label="重み" type="number"></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field v-model.number="item.group" label="グループ" type="number"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="item.content" label="内容"></v-textarea>
            </v-col>
            <v-col cols="12">
              <v-btn @click="removeRandomItem(index)" color="error" small>削除</v-btn>
            </v-col>
          </v-row>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed } from 'vue';
import { RandomItem } from '../types';

export default defineComponent({
  name: 'RandomEditor',
  props: {
    // randomはRandomItemの配列であるべき
    random: {
      type: Array as PropType<RandomItem[]>, // 配列で型指定
      required: true
    }
  },
  setup(props) {
    // 最初のキーを取得
    const selectedKey = ref<string>(props.random.length > 0 ? props.random[0].tag : '');

    // 現在選択されているアイテムを取得
    const currentItems = computed(() => {
      // selectedKeyに基づいてcurrentItemsを取得するロジックを追加
      return props.random.filter(item => item.tag === selectedKey.value);
    });

    // 新しいキーが選択されたときの処理
    const onKeyChange = (newKey: string) => {
      // selectedKeyを更新
      selectedKey.value = newKey;
    };

    // ランダムアイテムを追加する関数
    const addRandomItem = () => {
      // 新しいRandomItemを追加
      props.random.push({
        weight: 1,
        group: 1,
        content: '',
        tag: selectedKey.value // tagも新しいアイテムに追加
      });
    };

    // ランダムアイテムを削除する関数
    const removeRandomItem = (index: number) => {
      props.random.splice(index, 1); // 指定されたインデックスのアイテムを削除
    };

    return {
      selectedKey,
      currentItems,
      onKeyChange,
      addRandomItem,
      removeRandomItem
    };
  }
});
</script>
