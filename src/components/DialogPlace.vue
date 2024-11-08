<!-- src/components/DialogPlace.vue -->
<template>
  <v-card v-if="currentItem" style="max-height: 80vh; overflow-y: auto">
    <v-card-text>
      <v-row>
        <v-col cols="12" sm="4">
          <v-text-field
            v-model="currentItem.name"
            label="プレースホルダー名"
            @update:model-value="updateItem('name', $event)"
          />
        </v-col>
      </v-row>

      <!-- プレースホルダー -->
      <v-card>
        <v-toolbar color="primary" density="compact">
          <v-toolbar-title>プレースホルダー</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn-toggle
            v-model="currentItem.isWeight"
            density="compact"
            color="primary"
            mandatory
            class="me-2"
          >
            <v-btn :value="false">
              <v-icon>mdi-format-list-bulleted</v-icon>
            </v-btn>
            <v-btn :value="true">
              <v-icon>mdi-scale-balance</v-icon>
              <v-tooltip activator="parent" location="bottom"
                >重み付けモード</v-tooltip
              >
            </v-btn>
          </v-btn-toggle>
          <!-- テキストエディター -->
          <v-btn variant="outlined" class="me-2" @click="showTextEditor = true">
            <v-icon>mdi-text</v-icon>
            <v-tooltip activator="parent" location="bottom"
              >テキストエディター</v-tooltip
            >
          </v-btn>
          <v-btn variant="outlined" @click="addValue">＋追加</v-btn>
        </v-toolbar>
        <!-- 複製・削除ボタン -->
        <DialogPlaceEditor
          :entry="entry"
          :currentItem="currentItem"
          :is-weight-mode="isWeightMode"
          @update:Omiken="updateOmiken"
        />
      </v-card>
    </v-card-text>
  </v-card>
  <v-alert v-else type="warning"
    >プレースホルダーが選択されていません。</v-alert
  >

  <!-- テキストエディターダイアログを追加 -->
  <DialogPlaceTextmode
    v-if="currentItem"
    v-model="showTextEditor"
    :values="currentItem.values"
    @save="handleTextEditorSave"
  />
</template>

<script setup lang="ts">
import { computed, inject, ref, Ref } from "vue";
import DialogPlaceTextmode from "./DialogPlaceTextmode.vue";
import DialogPlaceEditor from "./DialogPlaceEditor.vue";
import type {
  PlaceType,
  PlaceValueType,
  OmikenEntry,
  OmikenCategory,
  ListEntry,
  AppStateType,
  ListCategory,
} from "../types";

const props = defineProps<{
  entry: ListEntry<"place"> | null;
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

// inject
const AppState = inject<Ref<AppStateType>>("AppStateKey");
const place = AppState?.value.Omiken.place;

// propsからデータを解読
const currentItem = computed(() =>
  props.entry?.key && place ? place[props.entry.key as string] : null
);
const isWeightMode = computed({
  get: () => currentItem.value?.isWeight ?? false,
  set: (value) => updateItem("isWeight", value),
});

// テキストエディター用の状態
const showTextEditor = ref(false);

// テキストエディターの保存ハンドラー
const handleTextEditorSave = (values: PlaceValueType[]) => {
  if (!currentItem.value) return;
  updateOmikenPlace({ ...currentItem.value, values });
};

// これはなに？
const updateItem = (field: keyof PlaceType, value: any) => {
  if (!currentItem.value) return;
  updateOmikenPlace({ ...currentItem.value, [field]: value });
};

// 値の追加
const addValue = () => {
  if (!currentItem.value) return;
  currentItem.value.values.push({ weight: 1, value: "" });
};

// Omikenのemit
const updateOmikenPlace = (updatedItem: PlaceType) => {
  if (!currentItem.value || !props.entry?.key) return;
  const key = props.entry.key as string;
  emit("update:Omiken", {
    type: "place",
    update: { [key]: updatedItem },
  });
};
const updateOmiken = (payload: OmikenEntry<OmikenCategory>) =>
  emit("update:Omiken", payload);
</script>

<style scoped>
.handle {
  cursor: move;
}
</style>
