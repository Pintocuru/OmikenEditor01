<!-- src/components/RuleEditor.vue -->
<template>
  <v-card v-if="currentRule">
    <v-card-text>
      <v-row dense>
        <v-col cols="12" sm="4">
          <v-text-field v-model="currentRule.name" label="おみくじ名" @input="updateRule"></v-text-field>
        </v-col>
        <v-col cols="12" sm="8">
          <v-slider
            v-model="currentRule.switch"
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
            :color="switchColor(currentRule.switch)"
            @change="updateRule"
          ></v-slider>
        </v-col>
      </v-row>
      <v-row>
<v-col cols="12" sm="6">
          <v-list dense>
            <v-list-item
              v-for="option in validOmikujiOptions"
              :key="option.id"
              @click="openEditor(option)"
            >
              {{ option.name }}
            </v-list-item>
          </v-list>
          <v-select
            v-model="currentRule.disabledIds"
            :items="omikujiOptions"
            label="無効にするID"
            clearable
            chips
            multiple
            item-title="name"
            item-value="id"
            @change="updateRule"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props" :title="item.raw.name" :value="item.raw.id"></v-list-item>
            </template>
          </v-select>
        </v-col>
        <v-col cols="12" sm="6">
          <v-combobox v-model="currentRule.matchExact" label="完全一致" clearable chips multiple @change="updateRule"></v-combobox>
          <v-combobox v-model="currentRule.matchStartsWith" label="前方一致" clearable chips multiple @change="updateRule"></v-combobox>
          <v-combobox v-model="currentRule.matchIncludes" label="部分一致" clearable chips multiple @change="updateRule"></v-combobox>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
  <v-alert v-else type="warning">アイテムが選択されていません。</v-alert>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ItemContent, STATEType, SelectItem, rulesType } from "../types";

  // props/emits
const props = defineProps<{
  STATE: STATEType;
  selectItem: SelectItem;
}>();

const emit = defineEmits<{
  (e: "update:STATE", payload: SelectItem): void;
    (e: "open-editor", selectItem: SelectItem): void;
}>();

// propsからデータを解読
const currentRule = computed(() => {
  if (props.selectItem?.type === 'rules') {
    const firstKey = Object.keys(props.selectItem.items)[0];
    return props.selectItem.items[firstKey] as rulesType;
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

const validOmikujiOptions = computed(() => {
  const disabledIds = currentRule.value?.disabledIds;
  if (!disabledIds) return omikujiOptions.value;
  return omikujiOptions.value.filter(option => !disabledIds.includes(option.id));
});

// switchの数値に合わせて色を変更
const switchColor = (value: number) => {
  const colors = ['', 'yellow', 'green', 'blue', 'red'];
  return colors[value] || '';
};

// 更新アップデート
const updateRule = () => {
  if (props.selectItem && currentRule.value) {
    emit("update:STATE", {
      type: "rules",
      items: { [currentRule.value.id]: currentRule.value },
      operation: "update",
    });
  }
};

// エディターを開く
function openEditor(option: { id: string; name: string }) {
  console.log({ [option.id]: props.STATE.omikuji[option.id] });
  emit("open-editor", {
    type: 'omikuji',
    items: { [option.id]: props.STATE.omikuji[option.id] },
  });
}
</script>