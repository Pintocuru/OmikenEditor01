<!-- src/components/DialogOmikujiStatus.vue -->
<template>
 <v-card>
  <v-toolbar :color="themeColor" density="compact" class="mb-2">
   <v-toolbar-title> ステータス設定 </v-toolbar-title>
  </v-toolbar>
  <v-card-text>
   <v-text-field
    v-model="currentItem.status"
    label="ステータス"
    item-title="text"
    item-value="value"
    dense="compact"
    @update:modelValue="updateOmikenOmikuji"
   >
   </v-text-field>
  </v-card-text>
 </v-card>


  <v-card>
    <v-toolbar :color="themeColor" density="compact" class="mb-2">
      <v-toolbar-title>スクリプト設定</v-toolbar-title>
    </v-toolbar>
    <v-card-text>
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
            @update:modelValue="updateOmikenOmikuji"
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
                <v-col cols="12" sm="6" v-for="param in selectedScript.scriptParams" :key="param.id">
                  <v-text-field
                    v-model="scriptParamValues[param.id]"
                    :label="param.name"
                    :hint="param.description"
                    persistent-hint
                    dense="compact"
                    @update:modelValue="updateOmikenOmikuji"
                  />
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>

        <!-- プレースホルダーの説明 -->
        <v-row dense v-if="selectedScript.placeholders?.length">
          <v-col cols="12">
            <v-card variant="outlined" class="pa-2 mt-2">
              <div class="text-subtitle-1 mb-2">使用可能なプレースホルダー</div>
              <v-list density="compact">
                <v-list-item v-for="placeholder in selectedScript.placeholders" :key="placeholder.id">
                  <v-list-item-title>{{ placeholder.name }}</v-list-item-title>
                  <v-list-item-subtitle>{{ placeholder.description }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, inject, ref, Ref } from 'vue';
import type { ListCategory, ListEntry, OmikujiType, OmikenEntry, AppEditorType, ScriptsType } from '@/type';

const props = defineProps<{
 currentItem: OmikujiType;
 themeColor: string;
}>();

const emit = defineEmits<{
 (e: 'update:Omiken', payload: OmikenEntry<ListCategory>): void;
 (e: 'open-editor', editorItem: ListEntry<ListCategory>): void;
}>();

// inject
const AppEditor = inject<Ref<AppEditorType>>('AppEditorKey');
const Scripts = AppEditor?.value.Scripts;

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
        ...props.currentItem.script,  // 他のプロパティはそのままに
        scriptId: newValue,
        params: props.currentItem.script?.params ?? []  // `params` がない場合、空配列を使用
      };

      // 更新を反映
      updateOmikenOmikuji();
    }
  }
});

// 更新アップデート
const updateOmikenOmikuji = () => {
 if (props.currentItem) {
    console.log('Before emit - currentItem type:', typeof props.currentItem);
  console.log('Before emit - currentItem:', props.currentItem);
  console.log('Is currentItem plain object?', Object.getPrototypeOf(props.currentItem) === Object.prototype);

  emit('update:Omiken', {
   type: 'omikujis',
   update: props.currentItem
  });
 }
};
</script>
