<!-- src/components/AppDialog.vue -->
<template>
  <v-dialog
    v-for="(entry, key) in listEntry"
    :key="key"
    :model-value="entry.isOpen"
    @update:model-value="(value) => updateDialog(key, value)"
    max-width="800px"
  >
    <v-card>
      <component
        :is="getEditComponent(key, entry.mode)"
        :entry="entry"
        @update:Omiken="updateOmiken"
        @open-editor="openEditor"
      />
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" @click="() => closeDialog(key)"
          >閉じる</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import DialogRules from "./DialogRules.vue";
import DialogOmikuji from "./DialogOmikuji.vue";
import DialogPlace from "./DialogPlace.vue";
import {
  ListEntry,
  ListCategory,
  OmikenEntry,
  OmikenCategory,
  ListEntries,
} from "@/types";
import { validateData } from "@/composables/funkJSON";

// Props / emit
const props = defineProps<{
  listEntry: ListEntries;
}>();

const emit = defineEmits<{
  (e: "update:listEntry", newEntry: ListEntries): void;
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

// エディターコンポーネントを取得する関数
const getEditComponent = (type: ListCategory, mode: string | null) => {
  const editorMap: Record<ListCategory, any> = {
    rules: DialogRules,
    omikuji: mode === 'special'
     ? DialogOmikujiWeight // 仮DialogOmikujiWeight
      : DialogOmikuji,
    place: DialogPlace,
  };
  return editorMap[type] || null;
};

// 各種操作関数(エディターを開く/Omiken更新)
const updateOmiken = (payload: OmikenEntry<OmikenCategory>) =>
  emit("update:Omiken", payload);
const openEditor = (editorItem: ListEntry<ListCategory>) =>
  emit("open-editor", editorItem);

// ダイアログの状態更新
const updateDialog = (key: ListCategory, isOpen: boolean) => {
  emit("update:listEntry", {
    ...props.listEntry,
    [key]: { ...props.listEntry[key], isOpen },
  });
};

// ダイアログを閉じる
const closeDialog = (key: ListCategory) => {
  updateDialog(key, false);
};

// ダイアログの外部クリックで閉じる
const closeClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;
  const dialogElement = event.currentTarget as HTMLElement;
  if (!dialogElement.contains(target)) {
    Object.entries(props.listEntry).forEach(([key, entry]) => {
      if (entry.isOpen) {
        closeDialog(key as ListCategory);
      }
    });
  }
};

onMounted(() => {
  // 外部クリック時に起動
  document.addEventListener("mousedown", closeClickOutside)
});
</script>
