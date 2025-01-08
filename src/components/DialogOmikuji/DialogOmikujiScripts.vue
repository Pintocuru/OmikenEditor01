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
        v-if="param.type === 'string' || param.type === undefined"
        v-model="scriptParamValues[param.id]"
        :label="param.name"
        :hint="param.description"
        persistent-hint
        dense="compact"
        @update:modelValue="updateScriptParam(param.id, $event)"
       />
       <!-- 数値の場合 -->
       <v-text-field
        v-else-if="param.type === 'number'"
        v-model.number="scriptParamValues[param.id]"
        type="number"
        :label="param.name"
        :hint="param.description"
        persistent-hint
        dense="compact"
        @update:modelValue="updateScriptParam(param.id, $event)"
       />
       <!-- 真偽値の場合 -->
       <v-switch
        v-else-if="param.type === 'boolean'"
        v-model="scriptParamValues[param.id]"
        :label="param.name"
        :hint="param.description"
        persistent-hint
        dense="compact"
        @update:modelValue="updateScriptParam(param.id, $event)"
       />
      </v-col>
     </v-row>
    </v-card>
   </v-col>
  </v-row>
 </template>
</template>

<script setup lang="ts">
import { computed, inject, ref, Ref, watch } from 'vue';
import { ListCategory, ListEntry, OmikujiType, OmikenEntry, AppEditorType, ScriptsType } from '@type';
import { FunkEmits } from '@/composables/FunkEmits';

const props = defineProps<{
 currentItem: OmikujiType;
 modelValue: 'places' | 'post' | 'threshold' | 'status' | 'scripts';
}>();

const emit = defineEmits<{
 (e: 'update:Omiken', payload: OmikenEntry<ListCategory>): void;
 (e: 'open-editor', editorItem: ListEntry<ListCategory>): void;
}>();

// inject
const AppEditor = inject<Ref<AppEditorType>>('AppEditorKey');
const Scripts = AppEditor?.value.Scripts;

// コンポーザブル:FunkEmits
const { updateOmikenEntry } = FunkEmits(emit);

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
const scriptParamValues = ref<{ [key: string]: string | number | boolean }>({});

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
    params: props.currentItem.script?.params ?? {} // `params` がない場合、空配列を使用
   };

   // 更新を反映
   updateOmikenEntry('omikujis', props.currentItem);
  }
 }
});

// スクリプト選択時のデフォルト値設定を追加
watch(
 () => selectedScript.value,
 (newScript) => {
  if (!newScript || !newScript.scriptParams) return;

  const existingParams = props.currentItem.script?.params || {};

  newScript.scriptParams.forEach((param) => {
   let value: string | number | boolean;

   if (param.id in existingParams) {
    // 既存の値を型に応じて変換
    switch (param.type) {
     case 'number':
      value = Number(existingParams[param.id]);
      break;
     case 'boolean':
      value = existingParams[param.id] === 'true';
      break;
     default:
      value = existingParams[param.id];
    }
   } else {
    value = param.value;
   }

   scriptParamValues.value[param.id] = value;

   if (!props.currentItem.script) {
    props.currentItem.script = {
     scriptId: selectedScriptId.value,
     params: {}
    };
   }
   props.currentItem.script.params[param.id] = String(value);
  });

  updateOmikenEntry('omikujis', props.currentItem);
 },
 { immediate: true }
);

// 更新ハンドラの追加
const updateScriptParam = (paramId: string, value: string | number | boolean| null) => {
 if (!props.currentItem.script) return;
 if (value === null) return;

 props.currentItem.script.params = {
  ...props.currentItem.script.params,
  [paramId]: value
 };
 updateOmikenEntry('omikujis', props.currentItem);
};
</script>
