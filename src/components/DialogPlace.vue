<!-- src/components/DialogPlace.vue -->
<template>
  <v-card v-if="currentItem"  style="max-height: 80vh; overflow-y: auto;">
    <v-card-title>ランダムメッセージエディタ</v-card-title>
    <v-card-text>
      <!-- グループ編集時のみ表示 -->
      <div v-if="isGroupEdit" class="mb-4">
        <v-text-field
          v-model="groupName"
          :label="groupName || ''"
          density="compact"
          @input="updateGroupName"
        />
      </div>

      <!-- アイテムリスト -->
      <v-list>
        <v-list-item v-for="(item, key) in entry" :key="key">
          <v-row align="center">
            <v-col cols="8" sm="2">
              <v-text-field
                v-model="item.name"
                label="タグ"
                density="compact"
                @input="updateItem(key, { name: item.name })"
              />
            </v-col>
            <v-col cols="4" sm="2">
              <v-text-field
                v-model.number="item.weight"
                label="出現割合"
                type="number"
                density="compact"
                @input="updateItem(key, { weight: item.weight })"
              />
            </v-col>
            <v-col cols="3" sm="2">
              <v-text-field
                v-model.number="item.group"
                label="グループ"
                type="number"
                density="compact"
                @input="updateItem(key, { group: item.group })"
              />
            </v-col>
            <v-col cols="8" sm="5">
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
import type { STATEType, PlaceType, STATEEntry, STATECategory, ListEntry } from "../types";
import _ from 'lodash';
import Swal from "sweetalert2";
// props/emits
const props = defineProps<{
  entry: ListEntry<'place'> | null
  selectMode: string | null;
}>();

const emit = defineEmits<{
  (e: "update:STATE", payload: STATEEntry<STATECategory>): void;
}>();

// 2つ以上あるならグループ
const isGroupEdit = computed(() => props.selectMode !== null);

// propsからデータを解読
const currentItem = computed(() => {
  if (props.entry) {
    const firstKey = Object.keys(props.entry)[0];
    return props.entry[firstKey];
  }
  return null;
});

// グループモード名
const groupName = ref(props.selectMode);

// 更新アップデート
const updateItem = (key: string, item: Partial<PlaceType>) => {
  if (props.entry) {
    emit("update:STATE", {
      type: "place",
      update: { [key]: { ...props.entry[key], ...item } },
    });
  }
};

// グループ名の更新は無効になりました
const updateGroupName = () => {
};

// グループ編集時の内容追加
// TODO Q.追加時、すぐに表示させたいが、どうすればいい?
const addRandomItem = () => {
  if (props.entry) {
    const firstItem = Object.values(props.entry)[0];
    let newItem: Partial<PlaceType> = {};

    if (props.selectMode === "name") {
      newItem = { name: firstItem.name };
    } else if (props.selectMode === "group") {
      newItem = { group: firstItem.group };
    }

    emit("update:STATE", {
      type: "place",
      addKeys: [newItem],
    });
  }
};

// グループ編集時の内容削除
// TODO sweetalert2 を使って削除していいか聞く
const removeRandomItem = async (key: string) => {
  console.log(key);
  const result = await Swal.fire({
    title: '削除の確認',
    text: "このアイテムを削除してもよろしいですか？",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: '削除する'
  });

  if (result.isConfirmed && props.entry) {
    emit("update:STATE", {
      type: "place",
      delKeys: [key],
    });
  }
};
</script>
