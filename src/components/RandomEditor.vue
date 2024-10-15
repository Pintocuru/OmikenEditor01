<!-- src/components/RandomEditor.vue -->
<template>
  <v-card v-if="editingItem">
    <v-card-title>ランダムメッセージエディタ</v-card-title>
    <v-card-text>

      <v-btn icon @click="addRandomItem" color="primary" class="mb-2">
        <v-icon>mdi-plus</v-icon>
      </v-btn>

      <v-list>
        <v-list-item v-for="(item, index) in editingItem" :key="index">
          <v-row>
            <v-col cols="12" sm="6" md="4">
      <v-text-field v-model="editingItem.name" label="タグ" density="compact" />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field v-model.number="item.weight" label="重み" type="number" density="compact" />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field v-model.number="item.group" label="グループ" type="number" density="compact" />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="item.content" label="内容" density="compact" />
            </v-col>
            <v-col cols="12">
              <v-btn icon @click="removeRandomItem(index)" color="error">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
  <v-alert v-else type="warning">ランダムアイテムが選択されていません。</v-alert>
</template>

<script setup lang="ts">
import { useItemEditor } from "@/composables/funkOmikenEdit";
import type { DefaultState, Placeholder } from "../types";
import { ItemType, SelectedItem } from "@/AppTypes";

const props = defineProps<{
  STATE: DefaultState;
  selectedItem: SelectedItem;
}>();

const emit = defineEmits<{
  (e: "update:item", value: Placeholder): void;
}>();

const { editingItem } = useItemEditor(props, emit);

const addRandomItem = () => {
  if (editingItem.value) {
    editingItem.value.items.push({
      weight: 1,
      group: 1,
      content: "",
    });
  }
};

const removeRandomItem = (index: number) => {
  if (editingItem.value) {
    editingItem.value.items.splice(index, 1);
  }
};
</script>