<!-- src/components/EditorDialog.vue -->
<template>
  <v-dialog
    v-for="(isVisible, key) in show"
    :key="key"
    :model-value="isVisible"
    @update:model-value="(value) => updateShow(key, value)"
    max-width="800px"
  >
    <v-card>
      <component
        :is="getEditorComponent(key)"
        :STATE="STATE"
        :selectItem="selectItem[key]"
        :selectMode="selectMode"
        @update:STATE="updateSTATE"
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
import RuleEditor from "./RuleEditor.vue";
import OmikujiEditor from "./OmikujiEditor.vue";
import PlaceEditor from "./PlaceEditor.vue";
import { ItemCategory, ItemContent, STATEType, SelectItem } from "@/types";

// Props / emit
const props = defineProps<{
  show: Record<ItemCategory, boolean>;
  STATE: STATEType;
  selectItem: Record<ItemCategory, Record<string, ItemContent> | null>;
  selectMode:string | null;
}>();

const emit = defineEmits<{
  (e: "update:show", newShow: Record<ItemCategory, boolean>): void;
  (e: "update:STATE", payload: SelectItem): void;
  (    e: "open-editor",
    type: ItemCategory,
    item: Record<string, ItemContent>,
    mode: string | null
  ): void;
}>();

// エディターコンポーネントを取得する関数
const getEditorComponent = (type: ItemCategory) => {
  console.log(props.selectItem);
  const editorMap: Record<ItemCategory, any> = {
    rules: RuleEditor,
    omikuji: OmikujiEditor,
    place: PlaceEditor,
  };
  return editorMap[type] || null;
};

// showの更新をemitする関数
const updateShow = (key: ItemCategory, value: boolean) => {
  emit("update:show", { ...props.show, [key]: value });
};

// selectItemをAppに送り、エディターを開く
const openEditor = (
  type: ItemCategory,
  item: Record<string, ItemContent>,
  mode: string | null = null
) => {
  emit("open-editor", type, item, mode);
};

// STATEの更新をemit
const updateSTATE = (payload: SelectItem) => emit("update:STATE", payload);

// ダイアログを閉じる
const closeDialog = (key: ItemCategory) => {
  emit("update:show", { ...props.show, [key]: false });
};

// ダイアログの外部クリックで閉じる
const closeClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;
  const dialogElement = event.currentTarget as HTMLElement;

  if (!dialogElement.contains(target)) {
    const keys: ItemCategory[] = ["place", "omikuji", "rules"];
    for (const key of keys) {
      if (props.show[key]) {
        closeDialog(key);
        break;
      }
    }
  }
};
// クリック時に起動
onMounted(() => document.addEventListener("mousedown", closeClickOutside));
</script>
