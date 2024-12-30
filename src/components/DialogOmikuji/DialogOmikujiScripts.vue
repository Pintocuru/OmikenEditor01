<!-- src/components/DialogOmikuji/DialogOmikujiScripts.vue -->
<template>
 <v-row dense>
  <v-col cols="12" sm="6">
   <v-select
    v-model="selectedScriptId"
    :items="scriptItems"
    label="外部スクリプト"
    item-title="text"
    item-value="value"
    dense="compact"
    clearable
    @update:modelValue="updateOmikenEntry('omikujis', currentItem)"
   />
  </v-col>
 </v-row>

 <!-- スクリプトが選択されている場合のパラメータ入力欄 -->
 <template v-if="selectedScript">
  <v-row dense v-if="selectedScript.scriptParams?.length">
   <v-col cols="12">
    <v-card variant="outlined" class="pa-2 mt-2">
     <div class="text-subtitle-1 mb-2">パラメータ設定</div>
     <v-row dense>
      <v-col cols="12" sm="6" md="4" lg="3" v-for="param in selectedScript.scriptParams" :key="param.id">
       <v-text-field
        v-model="scriptParamValues[param.id]"
        :label="param.name"
        :hint="param.description"
        persistent-hint
        dense="compact"
        @update:modelValue="updateOmikenEntry('omikujis', currentItem)"
       />
      </v-col>
     </v-row>
    </v-card>
   </v-col>
  </v-row>

 </template>
</template>

<script setup lang="ts">
import { computed, inject, ref, Ref } from 'vue';
import type { ListCategory, ListEntry, OmikujiType, OmikenEntry, AppEditorType, ScriptsType } from '@/type';
import { FunkEmits } from '@/composables/FunkEmits';

const props = defineProps<{
 currentItem: OmikujiType;
}>();

const emit = defineEmits<{
 (e: 'update:Omiken', payload: OmikenEntry<ListCategory>): void;
 (e: 'open-editor', editorItem: ListEntry<ListCategory>): void;
}>();

// inject
const AppEditor = inject<Ref<AppEditorType>>('AppEditorKey');
const Scripts = AppEditor?.value.Scripts;

// コンポーザブル:FunkEmits
const { updateOmiken, openEditor, updateOmikenEntry } = FunkEmits(emit);

// スクリプトの選択項目を生成
const scriptItems = computed(() => {
 return Object.entries(Scripts || {}).map(([key, value]) => ({
  text: key,
  value: key
 }));
});

// 選択されているスクリプトの情報を取得
const selectedScript = computed(() => {
 if (!props.currentItem.script || !Scripts) return null;
 return Scripts[props.currentItem.script.scriptId];
});

// スクリプトパラメータの値を管理
const scriptParamValues = ref<{ [key: string]: string }>({});

// 選択されているスクリプトIDを管理
const selectedScriptId = computed({
 get() {
  return props.currentItem.script?.scriptId || '';
 },
 set(newValue: string) {
  if (props.currentItem) {
   // `params` がオプショナルなので空配列をデフォルトで設定
   props.currentItem.script = {
    ...props.currentItem.script, // 他のプロパティはそのままに
    scriptId: newValue,
    params: props.currentItem.script?.params ?? [] // `params` がない場合、空配列を使用
   };

   // 更新を反映
   updateOmikenEntry('omikujis', props.currentItem);
  }
 }
});
</script>
