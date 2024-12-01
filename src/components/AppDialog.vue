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
        <v-tooltip
          v-if="getSiblingItems(key as ListCategory, entry.key as string).length > 1"
          :text="getSiblingName(key as ListCategory, entry.key as string, 'prev')"
          location="top"
        >
          <template v-slot:activator="{ props }">
            <v-btn
              color="grey"
              v-bind="props"
              @click="
                navigateToItem(key as ListCategory, entry.key as string, 'prev')
              "
            >
              <v-icon start>mdi-chevron-left</v-icon>
              前へ
            </v-btn>
          </template>
        </v-tooltip>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" @click="() => closeDialog(key)"
          >閉じる</v-btn
        >
        <v-spacer></v-spacer>
        <v-tooltip
          v-if="getSiblingItems(key as ListCategory, entry.key as string).length > 1"
          :text="getSiblingName(key as ListCategory, entry.key as string, 'next')"
          location="top"
        >
          <template v-slot:activator="{ props }">
            <v-btn
              color="grey"
              v-bind="props"
              @click="
                navigateToItem(key as ListCategory, entry.key as string, 'next')
              "
            >
              次へ
              <v-icon start>mdi-chevron-right</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
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
  ListEntryCollect,
  OmikenType,
} from "@/types/index";
import { FunkEmits } from "@/composables/FunkEmits";

// Props / emit
const props = defineProps<{
  listEntry: ListEntryCollect;
  Omiken: OmikenType;
}>();

const emit = defineEmits<{
  (e: "update:listEntry", newEntry: ListEntryCollect): void;
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

// コンポーザブル:FunkEmits
const { updateOmiken, openEditor } = FunkEmits(emit);

// エディターコンポーネントを取得する関数
const getEditComponent = (type: ListCategory, mode?: string | null) => {
  const editorMap: Record<ListCategory, any> = {
    rules: DialogRules,
    omikujis: DialogOmikuji,
    places: DialogPlace,
  };
  return editorMap[type] || null;
};

// 同じ種類のアイテムリストを取得
const getSiblingItems = (category: ListCategory, currentKey: string) => {
  if (category === "rules") {
    return props.Omiken.rulesOrder;
  } else {
    const items = Object.keys(props.Omiken[category]).sort((a, b) =>
      props.Omiken[category][a].name.localeCompare(
        props.Omiken[category][b].name
      )
    );
    return items;
  }
};

// 前または次のアイテムのキーを取得（循環）
const getSiblingKey = (
  category: ListCategory,
  currentKey: string,
  direction: "prev" | "next"
) => {
  const items = getSiblingItems(category, currentKey);
  if (items.length <= 1) return null;

  const currentIndex = items.indexOf(currentKey);
  if (direction === "prev") {
    return currentIndex > 0 ? items[currentIndex - 1] : items[items.length - 1];
  } else {
    return currentIndex < items.length - 1 ? items[currentIndex + 1] : items[0];
  }
};

// アイテムの名前を取得
const getSiblingName = (
  category: ListCategory,
  currentKey: string,
  direction: "prev" | "next"
) => {
  const nextKey = getSiblingKey(category, currentKey, direction);
  if (!nextKey) return "";

  const items = props.Omiken[category];
  return items[nextKey]?.name || nextKey;
};

// アイテム間移動（修正版）
const navigateToItem = (
  category: ListCategory,
  currentKey: string,
  direction: "prev" | "next"
) => {
  const nextKey = getSiblingKey(category, currentKey, direction);
  if (nextKey) {
    closeDialog(category);
    openEditor({
      isOpen: true,
      type: category,
      key: nextKey,
      mode: props.listEntry[category].mode,
    });
  }
};

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
  document.addEventListener("mousedown", closeClickOutside);
});
</script>
