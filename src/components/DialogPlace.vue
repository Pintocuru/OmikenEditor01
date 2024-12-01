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
          <v-btn variant="outlined" class="me-2" @click="openTextEditor">
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
          v-model="currentItem.values"
          @update:modelValue="handleValuesUpdate"
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
import { computed, inject, ref, Ref, watch } from "vue";
import DialogPlaceTextmode from "./DialogPlaceTextmode.vue";
import DialogPlaceEditor from "./DialogPlaceEditor.vue";
import type {
  PlaceType,
  PlaceValueType,
  OmikenEntry,
  OmikenCategory,
  ListEntry,
  AppEditerType,
  ListCategory,
} from "@/types/index";
import Swal from "sweetalert2";

const props = defineProps<{
  entry: ListEntry<"places"> | null;
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

// inject
const AppEditer = inject<Ref<AppEditerType>>("AppEditerKey");
const place = AppEditer?.value.Omiken.places;

const currentItem = ref<PlaceType | null>(null);

// props.entryが変わるたびにcurrentItemを更新
watch(
  () => props.entry,
  (newEntry) => {
    if (newEntry?.key && place) {
      currentItem.value = { ...place[newEntry.key as string] };
    }
  },
  { immediate: true }
);
// テキストエディターモードを開く前に最新データを反映
const openTextEditor = async () => {
  if (currentItem.value) {
    const result = await Swal.fire({
      title: "テキストエディターモード",
        icon: "info",
      text: "出現割合はすべて1になります。よろしいですか？",
      didOpen: () => {
        const popup = Swal.getPopup();
        const backdrop = Swal.getContainer();
        if (popup && backdrop) {
          popup.style.zIndex = "9999";
          backdrop.style.zIndex = "9998";
        }
      },
      showCancelButton: true,
      confirmButtonText: "編集する",
      cancelButtonText: "キャンセル",
      showDenyButton: true,
      denyButtonText: "編集しない",
      denyButtonColor: "#3085d6",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6e7881",
    });

    if (result.isConfirmed ) {
      showTextEditor.value = true;
    }
  }
};

// テキストエディターモードを閉じた際にデータを更新
const handleTextEditorSave = (values: PlaceValueType[]) => {
  if (!currentItem.value) return;
  currentItem.value.values = values;
  showTextEditor.value = false;

  // 編集内容を確定させたい場合は、emitや関数で外部にデータを渡す
  updateOmikenPlace(currentItem.value);
};

// TODO 仕様変更:Weightモードのみになりました
const isWeightMode = computed({
  get: () => currentItem.value?.isWeight ?? false,
  set: (value) => updateItem("isWeight", value),
});

// テキストエディター用の状態
const showTextEditor = ref(false);

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

// これはなに？
const handleValuesUpdate = (newValues: PlaceValueType[]) => {
  if (!currentItem.value) return;
  currentItem.value.values = newValues;
  updateOmikenPlace(currentItem.value);
};

// Omikenのemit
const updateOmikenPlace = (updatedItem: PlaceType) => {
  if (!currentItem.value || !props.entry?.key) return;
  const key = props.entry.key as string;
  emit("update:Omiken", {
    type: "places",
    update: { [key]: updatedItem },
  });
};
</script>
