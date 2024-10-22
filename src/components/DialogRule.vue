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
          />
        </v-col>
        <v-col cols="12" sm="8">
          <v-slider
            v-model="currentItem.switch"
            :max="4"
            :ticks="switchLabels"
            show-ticks="always"
            step="1"
            tick-size="4"
            :color="getSwitchColor(currentItem.switch)"
            @update:modelValue="updateItem"
          />
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
          />
          <v-alert v-if="isAllDisabled" type="warning">
          おみくじが選択されていません
        </v-alert>
        <v-chip-group v-else>
<v-hover v-slot="{ isHovering, props }">
  <v-card
    v-for="option in validOmikujiOptions"
    :key="option.id"
    class="ma-1 d-inline-block"
    min-width="100"
    :color="getWeightColor(option.id)"
    variant="outlined"
    v-bind="props"
    @click.stop="openEditorOmikuji(option)"
  >
    <v-card-text class="text-center">
      {{ option.name }}
    </v-card-text>
  </v-card>
</v-hover>
        </v-chip-group>
        </v-col>
        <v-col cols="12" sm="6">
          <v-combobox
            v-for="(label, key) in matchLabels"
            :key="key"
            v-model="currentItem[key]"
            :label="label"
            clearable
            chips
            multiple
            @update:modelValue="updateItem"
          />
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
import { useSwitchStyles } from "../composables/useSwitchStyles";

// props/emits
const props = defineProps<{
  STATE: STATEType;
  selectItem: Record<string, rulesType> | null;
}>();

const emit = defineEmits<{
  (e: "update:STATE", payload: SelectItem): void;
  (e: "open-editor", editorItem: EditorItem): void;
}>();

// 現在のアイテムを計算
const currentItem = computed(
  () => props.selectItem && Object.values(props.selectItem)[0]
);

// コンポーザブルの使用
const {
  switchLabels,
  getSwitchLabel,
  getSwitchColor,
  omikujiOptions,
  validOmikujiOptions,
  isAllDisabled,
  getWeightColor,
} = useSwitchStyles(
  props.STATE.omikuji,
  props.selectItem?.[Object.keys(props.selectItem)[0]]
);

// マッチングのラベル
const matchLabels = {
  matchExact: "完全一致",
  matchStartsWith: "前方一致",
  matchIncludes: "部分一致",
};

// 更新処理
const updateItem = () => {
  if (currentItem.value) {
    emit("update:STATE", {
      type: "rules",
      update: { [currentItem.value.id]: currentItem.value },
    });
  }
};

// おみくじのエディターを開く
const openEditorOmikuji = (option: { id: string; name: string }) => {
  const omikuji = props.STATE.omikuji?.[option.id];
  if (omikuji) {
    emit("open-editor", {
      type: "omikuji",
      item: { [option.id]: omikuji },
    });
  }
};
</script>
