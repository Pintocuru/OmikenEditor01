<!-- src/components/DialogRule.vue -->
<template>
  <v-card v-if="currentItem">
    <v-card-text>
      <v-row dense>
        <v-col cols="12" sm="4">
          <v-text-field
            v-model="currentItem.name"
            label="おみくじ名"
            @input="updateItem"
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="8">
          <v-slider
            v-model="currentItem.switch"
            :max="4"
            :ticks="{
              0: '無効',
              1: '誰でも',
              2: 'メンバー',
              3: 'モデレーター',
              4: '管理者',
            }"
            show-ticks="always"
            step="1"
            tick-size="4"
            :color="switchColor(currentItem.switch)"
            @update:modelValue="updateItem"
          ></v-slider>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="6">
          <v-select
            v-model="currentItem.disabledIds"
            :items="omikujiOptions"
            label="無効にするID"
            chips
            multiple
            item-title="name"
            item-value="id"
            @update:modelValue="updateItem"
          >
          </v-select>
          <v-list dense>
            <v-list-item
              v-for="option in validOmikujiOptions"
              :key="option.id"
              @click="openEditor(option)"
            >
              {{ option.name }}
            </v-list-item>
          </v-list>
        </v-col>
        <v-col cols="12" sm="6">
          <v-combobox
            v-model="currentItem.matchExact"
            label="完全一致"
            clearable
            chips
            multiple
            @update:modelValue="updateItem"
          ></v-combobox>
          <v-combobox
            v-model="currentItem.matchStartsWith"
            label="前方一致"
            clearable
            chips
            multiple
            @update:modelValue="updateItem"
          ></v-combobox>
          <v-combobox
            v-model="currentItem.matchIncludes"
            label="部分一致"
            clearable
            chips
            multiple
            @update:modelValue="updateItem"
          ></v-combobox>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
  <v-alert v-else type="warning"
    >アイテムが選択されていないか、データの形式が正しくありません。</v-alert
  >
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { EditorItem, STATEType, SelectItem, rulesType } from "../types";
import _ from 'lodash';
// props/emits
const props = defineProps<{
  STATE: STATEType;
  selectItem: Record<string, rulesType> | null;
}>();

const emit = defineEmits<{
  (e: "update:STATE", payload: SelectItem): void;
  (e: "open-editor", editorItem: EditorItem): void;
}>();

// propsからデータを解読
const currentItem = computed(() => {
  if (props.selectItem) {
    // オブジェクトの最初のキーの値を返す
    const firstKey = Object.keys(props.selectItem)[0];
    return props.selectItem[firstKey];
  }
  return null;
});

// props.STATE.omikujiのpost配列からIDを抽出
const omikujiOptions = computed(() =>
  Object.entries(props.STATE.omikuji).map(([id, omikuji]) => ({
    id,
    name: omikuji.name,
  }))
);

// TODO 型エラー
const validOmikujiOptions = computed(() => {
  const disabledIds = currentItem.value?.disabledIds;
  if (!Array.isArray(disabledIds)) return omikujiOptions.value;
  return omikujiOptions.value.filter(
    (option) => !disabledIds.includes(option.id)
  );
});

// switchの数値に合わせて色を変更
const switchColor = (value: number) => {
  const colors = ["", "yellow", "green", "blue", "red"];
  return colors[value] || "";
};

// 更新アップデート
const updateItem = () => {
  console.log("コンソールコメント");
  if (props.selectItem && currentItem.value) {
    emit("update:STATE", {
      type: "rules",
      update: { [currentItem.value.id]: currentItem.value },
    });
  }
};

// エディターを開く
function openEditor(option: { id: string; name: string }) {
  if (props.STATE.omikuji && props.STATE.omikuji[option.id]) {
    emit("open-editor", {
      type: "omikuji",
      item: { [option.id]: props.STATE.omikuji[option.id] },
    });
  }
}
</script>
