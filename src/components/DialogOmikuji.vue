<!-- src/components/DialogOmikuji.vue -->
<template>
  <v-card v-if="currentItem" style="max-height: 80vh; overflow-y: auto">
    <v-card-text>
      <v-form @submit.prevent>
        <!-- 基本情報 -->
        <v-row dense>
          <v-col cols="12" sm="4">
            <v-text-field v-model="currentItem.name" label="結果名" density="compact" @input="updateItem">
              <v-tooltip activator="parent" location="bottom">
                おみくじの結果の名称（ラベル）を入力してください。<br />
                例: 「大吉」「中吉」「小吉」など。
              </v-tooltip>
            </v-text-field>
          </v-col>
          <v-col cols="12" sm="2">
            <v-text-field v-model.number="currentItem.weight" label="出現比" type="number" min="0" max="100"
              density="compact" @input="updateItem">
              <v-tooltip activator="parent" location="bottom">
                ランダムに偏りをつける
              </v-tooltip>
            </v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="currentItem.description" label="説明文" @input="updateItem" />
          </v-col>
        </v-row>

        <!-- タブ -->
        <v-tabs v-model="tab" class="w-100">
          <v-tab value="post" class="d-flex align-center w-50">
            メッセージ
            <v-badge v-if="postCount ? postCount > 0 : 0" :content="postCount" color="primary" class="ms-2">
              <v-icon size="small">mdi-message-text</v-icon>
            </v-badge>
          </v-tab>
          <v-tab value="filter" class="d-flex align-center w-50">
            フィルタリング
            <v-badge v-if="activeFilters" content="1" color="primary" class="ms-2"><!-- //TODO 数値の代わりに、有効であれば何らかのアイコンを表示する -->
              <v-icon size="small">mdi-filter-variant</v-icon>
            </v-badge>
          </v-tab>
        </v-tabs>

        <v-window v-model="tab">
          <v-window-item value="post">
            <DialogOmikujiPost :currentItem="currentItem" @update:Omiken="updateOmiken" />
          </v-window-item>
          <v-window-item value="filter">
            <DialogThreshold :currentItem="currentItem" @update:Omiken="updateOmiken" />
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
  AppStateType,
  OmikenCategory,
  ListCategory,
} from "../types";
import DialogOmikujiPost from "./DialogOmikujiPost.vue";
import DialogThreshold from "./DialogThreshold.vue";
// props/emits
const props = defineProps<{
  entry: ListEntry<"omikuji"> | null;
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

// inject
const AppState = inject<Ref<AppStateType>>("AppStateKey");
const omikuji = AppState?.value.Omiken.omikuji;

// ref
const tab = ref("post"); // タブの状態管理

// propsからデータを解読
const currentItem = computed(() =>
  props.entry?.key && omikuji ? omikuji[props.entry.key as string] : null
);

// postのアイテム数
const postCount = computed(() => {
  if (!currentItem.value) return;
  return currentItem.value.post.length;
});

// アクティブなフィルタリング
const activeFilters = computed(() => {
  if (!currentItem.value) return;
  const conditionType = currentItem.value.threshold.conditionType;

  if(conditionType !=='none'){
    return true
  } else {return false}
});

// 更新アップデート
const updateItem = () => {
  if (currentItem.value) {
    emit("update:Omiken", {
      type: "omikuji",
      update: { [currentItem.value.id]: currentItem.value },
    });
  }
};
// 子コンポーネントのOmiken更新
const updateOmiken = (payload: OmikenEntry<OmikenCategory>) =>
  emit("update:Omiken", payload);
</script>
