<!-- src/components/RandomEditor.vue -->
<template>
  <v-card v-if="currentItem">
    <v-card-title>ランダムメッセージエディタ</v-card-title>
    <v-card-text>
      <!-- グループ編集時のみ表示 -->
      <div v-if="isGroupEdit" class="mb-4">
        <v-text-field
          v-model="groupKey"
          :label="groupKeyLabel"
          density="compact"
          @input="updateGroupKey"
        />
      </div>

      <!-- アイテムリスト -->
      <v-list>
        <v-list-item v-for="(item, key) in editingItems" :key="key">
          <v-row align="center">
            <template v-if="!isGroupEdit || selectItem.type === 'place'">
              <v-col cols="3">
                <v-text-field v-model="item.name" label="タグ" density="compact" @input="updateItem(key, item)" />
              </v-col>
            </template>
            <template v-if="!isGroupEdit || selectItem.type === 'omikuji'">
              <v-col cols="3">
                <v-text-field v-model.number="item.group" label="グループ" type="number" density="compact" @input="updateItem(key, item)" />
              </v-col>
            </template>
            <v-col :cols="isGroupEdit ? 3 : 2">
              <v-text-field v-model.number="item.weight" label="重み" type="number" density="compact" @input="updateItem(key, item)" />
            </v-col>
            <v-col :cols="isGroupEdit ? 5 : 4">
              <v-text-field v-model="item.content" label="内容" density="compact" @input="updateItem(key, item)" />
            </v-col>
            <v-col cols="1" v-if="isGroupEdit">
              <v-btn icon @click="removeRandomItem(key)" color="error" density="compact">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-list-item>
      </v-list>

      <!-- グループ編集時のみ表示 -->
      <v-btn v-if="isGroupEdit" @click="addRandomItem" color="primary" class="mt-2">
        <v-icon left>mdi-plus</v-icon>
        アイテムを追加
      </v-btn>
    </v-card-text>
  </v-card>
  <v-alert v-else type="warning">ランダムアイテムが選択されていません。</v-alert>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { STATEType, placeType, omikujiType, SelectItem } from "../types";

// Props / emit
const props = defineProps<{
  STATE: STATEType;
  selectItem: SelectItem;
}>();

const emit = defineEmits<{
  (e: "update:STATE", payload: SelectItem): void;
}>();

// propsからデータを解読
const currentItem = computed(() => {
  if (props.selectItem && props.selectItem.items) {
    return Object.values(props.selectItem.items)[0];
  }
  return null;
});

const editingItems = computed(() => {
  if (currentItem.value) {
    return props.selectItem?.items || {};
  }
  return {};
});

const isGroupEdit = computed(() => Object.keys(editingItems.value).length > 1);

const groupKey = ref('');
const groupKeyLabel = computed(() => props.selectItem?.type === 'omikuji' ? 'タグ' : 'グループ');

const updateGroupKey = () => {
  if (isGroupEdit.value) {
    Object.entries(editingItems.value).forEach(([key, item]) => {
      if (props.selectItem?.type === 'omikuji') {
        (item as omikujiType).name = groupKey.value;
      } else {
        (item as placeType).group = parseInt(groupKey.value) || 0;
      }
      updateItem(key, item);
    });
  }
};

const updateItem = (key: string, item: placeType | omikujiType) => {
  if (props.selectItem) {
    emit("update:STATE", {
      type: props.selectItem.type,
      items: { [key]: item },
      operation: "update"
    });
  }
};

const addRandomItem = () => {
  if (Object.keys(editingItems.value).length > 0) {
    const newKey = Date.now().toString();
    const firstItem = Object.values(editingItems.value)[0];
    const newItem: placeType | omikujiType = {
      id: newKey,
      name: firstItem.name,
      weight: 1,
      group: (firstItem as placeType).group || 0,
      content: "",
    };
    emit("update:STATE", {
      type: props.selectItem!.type,
      items: { [newKey]: newItem },
      operation: "add"
    });
  }
};

const removeRandomItem = (key: string) => {
  if (Object.keys(editingItems.value).length > 1) {
    emit("update:STATE", {
      type: props.selectItem!.type,
      items: { [key]: {} },
      operation: "delete"
    });
  }
};

// 初期化時にgroupKeyを設定
if (isGroupEdit.value && Object.keys(editingItems.value).length > 0) {
  const firstItem = Object.values(editingItems.value)[0];
  groupKey.value = props.selectItem?.type === 'omikuji' ? firstItem.name : (firstItem as placeType).group.toString();
}
</script>