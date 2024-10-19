<!-- src/components/PlaceEditor.vue -->
<template>
  <v-card v-if="currentItem">
    <v-card-title>ランダムメッセージエディタ</v-card-title>
    <v-card-text>
      <!-- グループ編集時のみ表示 -->
      <div v-if="isGroupEdit" class="mb-4">
        <v-text-field
          v-model="groupName"
          :label="groupName"
          density="compact"
          @input="updateGroupName"
        />
      </div>

      <!-- アイテムリスト -->
      <v-list>
        <v-list-item v-for="(item, key) in selectItem" :key="key">
          <v-row align="center">
            <v-col cols="3">
              <v-text-field
                v-model="item.name"
                label="タグ"
                density="compact"
                @input="updateItem(key, { name: item.name })"
              />
            </v-col>
            <v-col cols="3">
              <v-text-field
                v-model.number="item.group"
                label="グループ"
                type="number"
                density="compact"
                @input="updateItem(key, { group: item.group })"
              />
            </v-col>
            <v-col cols="2">
              <v-text-field
                v-model.number="item.weight"
                label="出現割合"
                type="number"
                density="compact"
                @input="updateItem(key, { weight: item.weight })"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                v-model="item.content"
                label="内容"
                density="compact"
                @input="updateItem(key, { content: item.content })"
              />
            </v-col>
            <v-col cols="1" v-if="isGroupEdit">
              <v-btn
                icon
                @click="removeRandomItem(key)"
                color="error"
                density="compact"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-list-item>
      </v-list>

      <!-- グループ編集時のみ表示 -->
      <v-btn
        v-if="isGroupEdit"
        @click="addRandomItem"
        color="primary"
        class="mt-2"
      >
        <v-icon left>mdi-plus</v-icon>
        アイテムを追加
      </v-btn>
    </v-card-text>
  </v-card>
  <v-alert v-else type="warning"
    >ランダムアイテムが選択されていません。</v-alert
  >
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { STATEType, placeType, omikujiType, SelectItem } from "../types";

// props/emits
const props = defineProps<{
  STATE: STATEType;
  selectItem: Record<string, placeType> | null;
  selectMode: string | null;
}>();

const emit = defineEmits<{
  (e: "update:STATE", payload: SelectItem): void;
}>();

// 2つ以上あるならグループ
const isGroupEdit = computed(() => props.selectMode !== null);

// propsからデータを解読
const currentItem = computed(() => {
  if (props.selectItem) {
    // TODO 複数ある場合の対処をする
    const firstKey = Object.keys(props.selectItem)[0];
    return props.selectItem[firstKey];
  }
  return null;
});

// グループモード名
const groupName = ref(props.selectMode);

// 更新アップデート
const updateItem = (key: string, item: Partial<placeType>) => {
  if (props.selectItem) {
    emit("update:STATE", {
      type: "place",
      update: { [key]: { ...props.selectItem[key], ...item } },
    });
  }
};

// グループ名の更新
const updateGroupName = () => {
  // グループ名の更新処理を実装
};

// グループ編集時の内容追加
const addRandomItem = () => {
  if (props.selectItem) {
    const firstItem = Object.values(props.selectItem)[0];
    let newItem: Partial<placeType> = {};

    if (props.selectMode === "place") {
      newItem = { name: firstItem.name };
    } else if (props.selectMode === "omikuji") {
      newItem = { group: firstItem.group };
    }

    emit("update:STATE", {
      type: "place",
      addKeys: [newItem],
    });
  }
};

// グループ編集時の内容削除
const removeRandomItem = (key: string) => {
  if (props.selectItem) {
    emit("update:STATE", {
      type: "place",
      delKeys: [key],
    });
  }
};
</script>
