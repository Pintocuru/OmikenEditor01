<!-- src/components/RuleEditor.vue -->
<template>
  <v-card v-if="editingItem">
    <v-card-title>ルールエディタ</v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" sm="9">
          <v-text-field
            v-model="editingItem.name"
            label="おみくじ名"
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="3">
          <v-select
            v-model="editingItem.modes"
            label="モード"
            :items="editingItem.modeSelect"
          ></v-select>
        </v-col>
        <v-col cols="12">
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
          ></v-slider>
        </v-col>
        <v-col cols="12">
          <v-combobox
            v-model="editingItem.matchExact"
            label="完全一致"
            clearable
            chips
            multiple
          ></v-combobox>
        </v-col>
        <v-col cols="12">
          <v-combobox
            v-model="editingItem.matchStartsWith"
            label="前方一致"
            clearable
            chips
            multiple
          ></v-combobox>
        </v-col>
        <v-col cols="12">
          <v-combobox
            v-model="editingItem.matchIncludes"
            label="部分一致"
            clearable
            chips
            multiple
          ></v-combobox>
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
import { ItemType, SelectedItem } from "@/AppTypes";

// props/emits
const props = defineProps<{
  STATE: DefaultState;
  selectedItem: SelectedItem;
}>();

const emit = defineEmits<{
  (e: "update:item", value: omikujiRule): void;
}>();

// 更新のコンポーザブル
const { editingItem } = useItemEditor(props, emit);
</script>
