<!-- src/components/DialogOmikuji/DialogOmikuji.vue -->
<template>
 <v-card v-if="currentItem" style="max-height: 80vh; overflow-y: auto">
  <v-toolbar :color="themeColor">
   <v-toolbar-title> {{ currentItem.name }} </v-toolbar-title>
   <template #append>
    {{ currentItem.description }}
   </template>
  </v-toolbar>
  <v-tabs v-model="tab" align-tabs="center" stacked>
   <v-tab v-for="tabItem in tabs" :key="tabItem.value" :value="tabItem.value">
    <v-icon :icon="tabItem.icon"></v-icon>
    {{ tabItem.label }}
   </v-tab>
  </v-tabs>

  <v-card-text>
   <v-form @submit.prevent>
    <v-tabs-window v-model="tab">
     <!-- 各メニューの表示 -->
     <component
      :is="currentListComponent"
      :currentItem="currentItem"
      @update:Omiken="updateOmiken"
      @open-editor="openEditor"
     />
    </v-tabs-window>

    <!-- 基本情報 -->
    <v-row dense>
     <v-col cols="12" sm="4">
      <v-text-field v-model="currentItem.name" label="結果名" @input="updateOmikenEntry('omikujis', currentItem)">
       <v-tooltip activator="parent" location="bottom">
        おみくじの結果の名称（ラベル）を入力してください。<br />
        例: 「大吉」「中吉」「小吉」など。
       </v-tooltip>
      </v-text-field>
     </v-col>

     <v-col cols="12" sm="8">
      <v-text-field
       v-model="currentItem.description"
       label="説明文"
       @input="updateOmikenEntry('omikujis', currentItem)"
      />
     </v-col>
    </v-row>
   </v-form>
  </v-card-text>
 </v-card>
 <v-alert v-else type="warning">おみくじが選択されていません。</v-alert>
</template>

<script setup lang="ts">
import { computed, inject, Ref, ref } from 'vue';
import { OmikenEntry, ListEntry, ListCategory, AppEditorType } from '@type';
import DialogOmikujiPost from '@/components/DialogOmikuji/DialogOmikujiPost.vue';
import DialogOmikujiThreshold from '@/components/DialogOmikuji/DialogOmikujiThreshold.vue';
import DialogOmikujiStatus from '@/components/DialogOmikuji/DialogOmikujiStatus.vue';
import DialogOmikujiPlaces from '@/components/DialogOmikuji/DialogOmikujiPlaces.vue';
import DialogOmikujiScripts from '@/components/DialogOmikuji/DialogOmikujiScripts.vue';
import { FunkOmikuji } from '@/composables/FunkOmikuji';
import { FunkEmits } from '@/composables/FunkEmits';

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
const { updateOmiken, openEditor, updateOmikenEntry } = FunkEmits(emit);

// コンポーザブル:FunkOmikuji
const { getPostTypeColor } = FunkOmikuji();

// タブ
const tab = ref<'post' | 'threshold' | 'status' | 'places' | 'scripts'>('post'); // タブの状態管理
const tabs = [
 { value: 'post', icon: 'mdi-message', label: 'メッセージ' },
 { value: 'threshold', icon: 'mdi-tune', label: '条件設定' },
 { value: 'status', icon: 'mdi-chart-bar', label: 'ステータス' },
 { value: 'places', icon: 'mdi-swap-horizontal', label: 'プレース' },
 { value: 'scripts', icon: 'mdi-script-text', label: 'スクリプト' }
];

// 子コンポーネントの指定
const currentListComponent = computed(() => {
 const componentMap = {
  post: DialogOmikujiPost,
  threshold: DialogOmikujiThreshold,
  status: DialogOmikujiStatus,
  places: DialogOmikujiPlaces,
  scripts: DialogOmikujiScripts
 } as const;

 return componentMap[tab.value];
});

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
</script>
