<!-- src/components/RuleEditor.vue -->
<template>
  <v-card v-if="editingItem">
    <v-card-text>
      <v-row dense>
        <v-col cols="12" sm="4">
          <v-text-field v-model="editingItem.name" label="おみくじ名"></v-text-field>
        </v-col>
        <v-col cols="12" sm="8">
          <v-slider
            v-model="editingItem.switch"
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
            :color="getThumbColor(editingItem.switch)"
          ></v-slider>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="6">
          <v-list dense>
            <v-subheader>有効なおみくじ一覧</v-subheader>
            <v-list-item v-for="option in validOmikujiOptions" :key="option.id">
              {{ option.name }}
            </v-list-item>
          </v-list>
          <v-select
            v-model="editingItem.disabledIds"
            :items="omikujiOptions"
            label="無効にするID"
            clearable
            chips
            multiple
            item-title="name"
            item-value="id"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props" :title="item.raw.name" :value="item.raw.id"></v-list-item>
            </template>
          </v-select>
        </v-col>
        <v-col cols="12" sm="6">
          <v-combobox v-model="editingItem.matchExact" label="完全一致" clearable chips multiple></v-combobox>
          <v-combobox v-model="editingItem.matchStartsWith" label="前方一致" clearable chips multiple></v-combobox>
          <v-combobox v-model="editingItem.matchIncludes" label="部分一致" clearable chips multiple></v-combobox>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
  <v-alert v-else type="warning">アイテムが選択されていません。</v-alert>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useItemEditor } from "@/composables/funkOmikenEdit";
import type { DefaultState, omikujiRule } from "../types";
import { SelectItem } from "@/AppTypes";

// props/emits
const props = defineProps<{
  STATE: DefaultState;
  selectItem: SelectItem;
}>();

const emit = defineEmits<{
  (e: "update:item", value: omikujiRule): void;
}>();

// 更新のコンポーザブル
const { editingItem } = useItemEditor(props, emit);

// omikujiのpost配列からIDを抽出
const omikujiOptions = computed(() =>
  props.STATE.omikuji.map((omikuji) => ({
    id: omikuji.id, // 選択するためのID
    name: omikuji.name, // 表示するための名前
  }))
);

const validOmikujiOptions = computed(() => {
  if (!editingItem.value || !editingItem.value.disabledIds) return omikujiOptions.value;
  return omikujiOptions.value.filter(option => !editingItem.value.disabledIds.includes(option.id));
});

const getThumbColor = (value: number) => {
  const colors = ['', 'yellow', 'green', 'blue', 'red'];
  return colors[value] || '';
};

const getTrackColor = (value: number) => {
  const colors = ['', 'yellow', 'green', 'blue', 'red'];
  return colors[value] ? `${colors[value]}--lighten-3` : '';
};
</script>
