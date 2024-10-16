<!-- src/components/RandomEditor.vue -->
<template>
  <v-card v-if="editingItem">
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
        <v-list-item v-for="(item, index) in editingItems" :key="index">
          <v-row align="center">
            <template v-if="!isGroupEdit || props.selectItem?.index === -2">
              <v-col cols="3">
                <v-text-field v-model="item.name" label="タグ" density="compact" />
              </v-col>
            </template>
            <template v-if="!isGroupEdit || props.selectItem?.index === -1">
              <v-col cols="3">
                <v-text-field v-model.number="item.group" label="グループ" type="number" density="compact" />
              </v-col>
            </template>
            <v-col :cols="isGroupEdit ? 3 : 2">
              <v-text-field v-model.number="item.weight" label="重み" type="number" density="compact" />
            </v-col>
            <v-col :cols="isGroupEdit ? 5 : 4">
              <v-text-field v-model="item.content" label="内容" density="compact" />
            </v-col>
            <v-col cols="1" v-if="isGroupEdit">
              <v-btn icon @click="removeRandomItem(index)" color="error" density="compact">
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
import { useItemEditor } from "@/composables/funkOmikenEdit";
import type { DefaultState, Placeholder } from "../types";
import { SelectItem } from "@/AppTypes";

const props = defineProps<{
  STATE: DefaultState;
  selectItem: SelectItem;
}>();

const emit = defineEmits<{
  (e: "update:item", value: any): void;
}>();

const { editingItem } = useItemEditor(props, emit);

const editingItems = computed(() => {
  return Array.isArray(editingItem.value) ? editingItem.value : [editingItem.value];
});

const isGroupEdit = computed(() => Array.isArray(editingItem.value));

const groupKey = ref('');
const groupKeyLabel = computed(() => props.selectItem?.index === -1 ? 'タグ' : 'グループ');

const updateGroupKey = () => {
  if (isGroupEdit.value) {
    editingItems.value.forEach(item => {
      if (props.selectItem?.index === -1) {
        item.name = groupKey.value;
      } else {
        item.group = parseInt(groupKey.value) || 0;
      }
    });
  }
};

// TODO 新規追加で更新されず、追加が反映されない
const addRandomItem = () => {
  if (editingItems.value.length > 0) {
    const newItem: Placeholder = {
      id: editingItems.value.length+2,
      name: editingItems.value[0].name,
      weight: 1,
      group: editingItems.value[0].group,
      content: "",
    };
    editingItem.value = [...editingItems.value, newItem];
  }
};

const removeRandomItem = (index: number) => {
  if (editingItems.value.length > 1) {
    const newItems = [...editingItems.value];
    newItems.splice(index, 1);
    editingItem.value = newItems;
  }
};

// 初期化時にgroupKeyを設定
if (isGroupEdit.value && editingItems.value.length > 0) {
  groupKey.value = props.selectItem?.index === -1 ? editingItems.value[0].name : editingItems.value[0].group.toString();
}
</script>