<!-- src/components/ListItemOmikuji.vue -->
<template>
  <v-col cols="6">
    <v-card height="150" @click="openEditor">
      <v-toolbar :color="toolbarColor" density="compact">
        <v-toolbar-title>{{ item.name }}</v-toolbar-title>
        <template v-slot:append>
          <ListItemPartsAction
            :selectCategory="selectCategory"
            :item="item"
              @edit="openEditor"
            @update:STATE="updateSTATE"
          />
        </template>
      </v-toolbar>
      <v-card-text>
        <v-chip :color="getWeightColor(item.weight)" class="ma-2">
          重み: {{ item.weight }}
        </v-chip>
        <div class="mt-2">
          <strong>閾値タイプ:</strong>
          {{ getThresholdTypeLabel(item.threshold.type) }}
        </div>
        <div class="mt-2">
          <strong>閾値:</strong> {{ item.threshold.value }}
          <span v-if="item.threshold.valueMax">
            - {{ item.threshold.valueMax }}</span
          >
        </div>
        <div class="mt-2">
          <strong>比較方法:</strong>
          {{ getComparisonLabel(item.threshold.comparison) }}
        </div>
      </v-card-text>
    </v-card>
  </v-col>
</template>

<script setup lang="ts">
import {
  EditorItem,
  ItemCategory,
  omikujiType,
  SelectItem,
  STATEType,
  thresholdType,
} from "@/types";
import { computed } from "vue";
import _ from "lodash";
const props = defineProps<{
  STATE: STATEType;
  item: omikujiType;
  selectCategory: ItemCategory;
}>();
const emit = defineEmits<{
  (e: "update:STATE", payload: SelectItem): void;
  (e: "open-editor", editorItem: EditorItem): void;
}>();

const toolbarColor = computed(() => {
  return getWeightColor(props.item.weight);
});

const getWeightColor = (weight: number) => {
  if (weight > 80) return "error";
  if (weight > 50) return "warning";
  if (weight > 20) return "success";
  return "info";
};

const getThresholdTypeLabel = (type: thresholdType) => {
  const labels: Record<thresholdType, string> = {
    none: "基準なし",
    time: "時間指定",
    lc: "配信枠のコメント番号",
    no: "配信枠の個人コメント数",
    tc: "総数の個人コメント数",
    second: "投稿してからの秒",
    minute: "投稿してからの分",
    hour: "投稿してからの時間",
    day: "投稿してからの日数",
    price: "ギフト金額",
    custom: "カスタム",
  };
  return labels[type] || "Unknown";
};

const getComparisonLabel = (comparison: string) => {
  const labels: Record<string, string> = {
    min: "以下",
    equal: "等しい",
    max: "以上",
    loop: "ループ",
    range: "範囲",
  };
  return labels[comparison] || "Unknown";
};

// エディターを開く
function openEditor() {
  const item = { [props.item.id]: props.item };
  emit("open-editor", {
    type: props.selectCategory,
    item: item,
  });
}

// STATEの更新をemit
const updateSTATE = (payload: SelectItem) => emit("update:STATE", payload);
</script>
