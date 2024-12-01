<!-- src/components/DialogOmikuji.vue -->
<template>
  <v-card v-if="currentItem" style="max-height: 80vh; overflow-y: auto">
    <v-card-text>
      <v-form @submit.prevent>
        <!-- 基本情報 -->
        <v-row dense>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="currentItem.name"
              label="結果名"
              @input="updateItem"
            >
              <v-tooltip activator="parent" location="bottom">
                おみくじの結果の名称（ラベル）を入力してください。<br />
                例: 「大吉」「中吉」「小吉」など。
              </v-tooltip>
            </v-text-field>
          </v-col>
          <v-col cols="12" sm="2">
            <v-text-field
              v-model.number="currentItem.weight"
              label="出現比"
              type="number"
              min="0"
              max="100"
              @input="updateItem"
            >
              <v-tooltip activator="parent" location="bottom">
                ランダムに偏りをつける
              </v-tooltip>
            </v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="currentItem.description"
              label="説明文"
              @input="updateItem"
            />
          </v-col>
        </v-row>

        <!-- タブ -->
        <v-tabs v-model="tab" class="w-100">
          <v-tab value="post" class="d-flex align-center w-50">
            メッセージ
            <v-badge
              v-if="postCount ? postCount > 0 : 0"
              :content="postCount"
              :color="themeColor"
              class="ms-2"
            >
              <v-icon size="small">mdi-message-text</v-icon>
            </v-badge>
          </v-tab>
          <v-tab value="filter" class="d-flex align-center w-50">
            フィルタリング
            <v-badge
              v-if="isThreshold(currentItem?.threshold)"
              content="🔐"
              :color="themeColor"
              class="ms-5"
            >
            </v-badge>
          </v-tab>
        </v-tabs>

        <v-window v-model="tab">
          <v-window-item value="post">
            <DialogOmikujiPost
              :currentItem="currentItem"
              :themeColor="themeColor"
              @update:Omiken="updateOmiken"
              @open-editor="openEditor"
            />
          </v-window-item>
          <v-window-item value="filter">
            <DialogThresholdOmikuji
              :currentItem="currentItem"
              :themeColor="themeColor"
              @update:Omiken="updateOmiken"
            />
          </v-window-item>
        </v-window>
      </v-form>
    </v-card-text>
  </v-card>
  <v-alert v-else type="warning">おみくじが選択されていません。</v-alert>
</template>

<script setup lang="ts">
import { computed, inject, Ref, ref } from "vue";
import type {
  OmikenEntry,
  ListEntry,
  OmikenCategory,
  ListCategory,
  AppEditerType,
} from "@/types/index";
import DialogOmikujiPost from "./DialogOmikujiPost.vue";
import { FunkThreshold } from "@/composables/FunkThreshold";
import { FunkOmikuji } from "@/composables/FunkOmikuji";
import { FunkEmits } from "@/composables/FunkEmits";
import DialogThresholdOmikuji from "./DialogThresholdOmikuji.vue";
// props/emits
const props = defineProps<{
  entry: ListEntry<"omikujis"> | null;
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

// inject
const AppEditer = inject<Ref<AppEditerType>>("AppEditerKey");
const omikujis = AppEditer?.value.Omiken.omikujis;

// コンポーザブル:FunkEmits
const { updateOmiken, openEditor } = FunkEmits(emit);

// コンポーザブル:FunkOmikuji
const { getPostTypeColor } = FunkOmikuji();
// コンポーザブル:funkThreshold
const { isThreshold } = FunkThreshold();

// ref
const tab = ref("post"); // タブの状態管理

// propsからデータを解読
const currentItem = computed(() =>
  props.entry?.key && omikujis ? omikujis[props.entry.key as string] : null
);

// postのonecommeで使われているBotKeyの色を取得する
const key = props.entry?.key;
let themeColor: string;
if (omikujis && typeof key === "string" && omikujis[key]) {
  themeColor = getPostTypeColor(omikujis[key].post, true);
} else {
  themeColor = "";
}

// postのアイテム数
const postCount = computed(() => {
  if (!currentItem.value) return;
  return currentItem.value.post.length;
});

// 更新アップデート
const updateItem = () => {
  if (currentItem.value) {
    emit("update:Omiken", {
      type: "omikujis",
      update: { [currentItem.value.id]: currentItem.value },
    });
  }
};
</script>
