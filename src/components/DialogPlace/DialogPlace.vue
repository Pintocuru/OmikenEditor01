<!-- src/components/DialogPlace/DialogPlace.vue -->
<template>
 <v-card v-if="currentItem" style="max-height: 80vh; overflow-y: auto">
  <!-- ツールバーの変更 -->
  <v-toolbar color="primary" density="comfortable">
   <v-toolbar-title>
    {{ currentItem.name }}
    <!-- 名前・説明の編集 -->
    <PartsNameEditor type="places" :currentItem="currentItem" @update:Omiken="updateOmiken" />
   </v-toolbar-title>
   <template #append>
    <PartsArrayAction editMode="placeDialog" :entry="currentItem" @update:Omiken="updateOmiken" />
   </template>
  </v-toolbar>

  <v-card-text>
   <v-sheet v-if="currentItem.description" class="text-subtitle-2">
    {{ currentItem.description }}
   </v-sheet>
   <!-- プレースホルダー -->
   <v-card>
    <v-sheet class="d-flex ga-2 justify-end">
     <!-- テキストエディター -->
     <DialogPlaceTextMode v-if="currentItem" :currentItem="currentItem" @update:Omiken="updateOmiken" />

     <v-btn icon color="primary" @click="addValue">
      <v-tooltip activator="parent" location="bottom">新しい行を追加する</v-tooltip>
      <v-icon>mdi-plus</v-icon>
     </v-btn>
    </v-sheet>
    <!-- 複製・削除ボタン -->
    <DialogPlaceEditor :currentItem="currentItem" @update:Omiken="updateOmiken" />
   </v-card>
  </v-card-text>
 </v-card>
 <v-alert v-else type="warning">プレースホルダーが選択されていません。</v-alert>
</template>

<script setup lang="ts">
import { computed, inject, Ref } from 'vue';
import { OmikenEntry, ListCategory, ListEntry, AppEditorType } from '@type';
import PartsArrayAction from '@/components/common/PartsArrayAction.vue';
import DialogPlaceTextMode from '@/components/DialogPlace/DialogPlaceTextMode.vue';
import DialogPlaceEditor from '@/components/DialogPlace/DialogPlaceEditor.vue';
import PartsNameEditor from '@/components/common/PartsNameEditor.vue';
import { FunkEmits } from '@/composables/FunkEmits';

const props = defineProps<{
 entry: ListEntry<'places'> | null;
}>();

const emit = defineEmits<{
 (e: 'update:Omiken', payload: OmikenEntry<ListCategory>): void;
 (e: 'open-editor', editorItem: ListEntry<ListCategory>): void;
}>();

// inject
const AppEditor = inject<Ref<AppEditorType>>('AppEditorKey');
const places = computed(() => AppEditor?.value.Omiken.places || {});

// コンポーザブル:FunkEmits
const { updateOmiken, updateOmikenEntry } = FunkEmits(emit);

// props のidから読み込み
const currentItem = computed(() => (props.entry?.key && places ? places.value[props.entry.key as string] : null));

// 値の追加
const addValue = () => {
 if (!currentItem.value) return;
 currentItem.value.values.unshift({ weight: 1, value: '' });
};
</script>
