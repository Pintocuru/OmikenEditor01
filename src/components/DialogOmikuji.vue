<!-- src/components/DialogOmikuji.vue -->
<template>
 <v-card v-if="currentItem" style="max-height: 80vh; overflow-y: auto">
  <v-card-text>
   <v-form @submit.prevent>
    <!-- 基本情報 -->
    <v-row dense>
     <v-col cols="12" sm="4">
      <v-text-field v-model="currentItem.name" label="結果名" @input="updateOmikenEntry('omikujis',currentItem)">
       <v-tooltip activator="parent" location="bottom">
        おみくじの結果の名称（ラベル）を入力してください。<br />
        例: 「大吉」「中吉」「小吉」など。
       </v-tooltip>
      </v-text-field>
     </v-col>

     <v-col cols="12" sm="8">
      <v-text-field v-model="currentItem.description" label="説明文" @input="updateOmikenEntry('omikujis',currentItem)" />
     </v-col>
    </v-row>
    <!-- 条件設定 -->
    <v-card class="mb-4">
     <v-toolbar :color="themeColor" density="compact" class="mb-2">
      <v-toolbar-title> 条件設定 </v-toolbar-title>
     </v-toolbar>
     <ThresholdMain :Thresholds="currentItem.threshold" type="comment" mode="omikuji" @update:Thresholds="updateItem" />
    </v-card>

        <!-- ステータス・外部スクリプト・プレースホルダー設定 -->
    <DialogOmikujiStatus
     :currentItem="currentItem"
     :themeColor="themeColor"
     @update:Omiken="updateOmiken"
     @open-editor="openEditor"
    />

    <!-- おみくじの結果 -->
    <DialogOmikujiPost
     :currentItem="currentItem"
     :themeColor="themeColor"
     @update:Omiken="updateOmiken"
     @open-editor="openEditor"
    />
   </v-form>
  </v-card-text>
 </v-card>
 <v-alert v-else type="warning">おみくじが選択されていません。</v-alert>
</template>

<script setup lang="ts">
import { computed, inject, Ref, ref } from 'vue';
import type { OmikenEntry, ListEntry, ListCategory, AppEditorType } from '@type';
import DialogOmikujiStatus from '@/components/DialogOmikujiStatus.vue';
import DialogOmikujiPost from '@/components/DialogOmikujiPost.vue';
import { FunkThreshold } from '@/composables/FunkThreshold';
import { FunkOmikuji } from '@/composables/FunkOmikuji';
import { FunkEmits } from '@/composables/FunkEmits';
import ThresholdMain from '@/components/DialogThreshold/ThresholdMain.vue';
// props/emits
const props = defineProps<{
 entry: ListEntry<'omikujis'> | null;
}>();

const emit = defineEmits<{
 (e: 'update:Omiken', payload: OmikenEntry<ListCategory>): void;
 (e: 'open-editor', editorItem: ListEntry<ListCategory>): void;
}>();

// inject
const AppEditor = inject<Ref<AppEditorType>>('AppEditorKey');
const omikujis = AppEditor?.value.Omiken.omikujis;

// コンポーザブル:FunkEmits
const { updateOmiken, openEditor,updateOmikenEntry } = FunkEmits(emit);

// コンポーザブル:FunkOmikuji
const { getPostTypeColor } = FunkOmikuji();
// コンポーザブル:funkThreshold
const {} = FunkThreshold();

// ref
const tab = ref('post'); // タブの状態管理

// propsからデータを解読
const currentItem = computed(() => (props.entry?.key && omikujis ? omikujis[props.entry.key as string] : null));

// postのonecommeで使われているBotKeyの色を取得する
const key = props.entry?.key;
let themeColor: string;
if (omikujis && typeof key === 'string' && omikujis[key]) {
 themeColor = getPostTypeColor(omikujis[key].post, true);
} else {
 themeColor = '';
}

// postのアイテム数
const postCount = computed(() => {
 if (!currentItem.value) return;
 return currentItem.value.post.length;
});

// 更新アップデート
const updateItem = () => {
 if (currentItem.value) {
  emit('update:Omiken', {
   type: 'omikujis',
   update: currentItem.value
  });
 }
};
</script>
