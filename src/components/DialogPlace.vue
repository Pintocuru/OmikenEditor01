<!-- src/components/DialogPlace.vue -->
<template>
 <v-card v-if="currentItem" style="max-height: 80vh; overflow-y: auto">
  <!-- ツールバーの変更 -->
  <v-toolbar color="primary">
   <v-toolbar-title>
    {{ currentItem.name }}
    <PartsNameEditor type="places" :currentItem="currentItem" @update:Omiken="updateOmiken" />
   </v-toolbar-title>
   <template #append>
    {{ currentItem.description }}
   </template>
  </v-toolbar>

  <v-card-text>
   <!-- プレースホルダー -->
   <v-card>
    <v-toolbar color="primary" density="compact">
     <v-toolbar-title>プレースホルダー</v-toolbar-title>
     <v-spacer></v-spacer>
     <!-- テキストエディター -->
     <DialogPlaceTextMode v-if="currentItem"   :currentItem="currentItem" @update:Omiken="updateOmiken" />

     <v-btn variant="outlined" @click="addValue">＋追加</v-btn>
    </v-toolbar>
    <!-- 複製・削除ボタン -->
    <DialogPlaceEditor :currentItem="currentItem" @update:Omiken="updateOmiken" />
   </v-card>
  </v-card-text>
 </v-card>
 <v-alert v-else type="warning">プレースホルダーが選択されていません。</v-alert>

</template>

<script setup lang="ts">
import { computed, inject, ref, Ref, watch } from 'vue';
import { PlaceType, PlaceValueType, OmikenEntry, ListCategory, ListEntry, AppEditorType } from '@type';
import DialogPlaceTextMode from '@/components/DialogPlaceTextMode.vue';
import DialogPlaceEditor from '@/components/DialogPlaceEditor.vue';
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
 currentItem.value.values.push({ weight: 1, value: '' });
};
</script>
