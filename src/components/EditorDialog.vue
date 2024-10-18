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
        :is="editorComponent"
        :STATE="STATE"
        :selectItem="selectItem"
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
import { computed, onMounted } from "vue";
import RuleEditor from "./RuleEditor.vue";
import OmikujiEditor from "./OmikujiEditor.vue";
import RandomEditor from "./RandomEditor.vue";
import { STATEType, SelectItem } from "@/types";

// Props / emit
const props = defineProps<{
  show: {
    rules: boolean;
    omikuji: boolean;
    place: boolean;
  };
  STATE: STATEType;
  selectItem: SelectItem;
}>();

const emit = defineEmits<{
  (
    e: "update:show",
    newShow: {
      rules: boolean;
      omikuji: boolean;
      place: boolean;
    }
  ): void;
  (e: "update:STATE", payload: SelectItem): void;
    (e: "open-editor", selectItem: SelectItem): void;
}>();

// 編集用コンポーネントを取得する計算プロパティ
// TODO このエラーハンドリングを消す
const editorComponent = computed(() => {
  try {
    const type = props.selectItem?.type;
    const editorMap = {
      rules: RuleEditor,
      omikuji: OmikujiEditor,
      place: RandomEditor,
    };
    // 該当するコンポーネントを返す
    const component = editorMap[type as keyof typeof editorMap];
    if (!component) {
      throw new Error(`コンポーネントが見つかりません: ${type}`);
    }
    return component;
  } catch (error) {
    console.error("エラーが発生しました:", error);
    return null; // コンポーネントが見つからない場合はnullを返す
  }
});

// showの更新をemitする関数
const updateShow = (key: keyof typeof props.show, value: boolean) => {
  emit("update:show", {
    ...props.show,
    [key]: value,
  });
};

// selectItemをAppに送り、エディターを開く
const openEditor = (selectItem: SelectItem) => {
  try {
    emit("open-editor", selectItem);
  } catch (error) {
    console.error('エディターオープン中にエラーが発生しました:', error);
  }
};

// STATEの更新をemit
const updateSTATE = (payload: SelectItem) => emit("update:STATE", payload);

// ダイアログを閉じる
const closeDialog = (key: keyof typeof props.show) => {
  emit("update:show", { ...props.show, [key]: false });
};

// ダイアログの外部クリックで閉じる
const closeClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;
  const dialogElement = event.currentTarget as HTMLElement;

  // place > omikuji > rules の順で1つずつ閉じる
  if (!dialogElement.contains(target)) {
    if (props.show.place) {
      closeDialog("place");
    } else if (props.show.omikuji) {
      closeDialog("omikuji");
    } else if (props.show.rules) {
      closeDialog("rules");
    }
  }
};
// クリック時に起動
onMounted(() => document.addEventListener("mousedown", closeClickOutside));
</script>
