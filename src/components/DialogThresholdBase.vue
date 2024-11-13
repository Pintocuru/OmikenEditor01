<!-- src/components/DialogThresholdBase.vue -->
<template>
  <v-card v-if="threshold">
    <v-toolbar :color="themeColor" density="compact">
      <v-toolbar-title>
        🔐 フィルタリング設定
        <v-chip
          density="compact"
          variant="outlined"
          :color="isThreshold(props.threshold) ? 'yellow lighten-3' : 'grey'"
          class="ml-4"
        >
          🔐 {{ getExampleText(props.threshold) }}
        </v-chip>
      </v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <!-- アイコン -->
      <v-row justify="space-around">
        <v-col v-for="item in filteredItems" :key="item.value" cols="auto">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-btn
                icon
                :variant="
                  threshold.conditionType === item.value ? 'elevated' : 'flat'
                "
                :color="
                  threshold.conditionType === item.value ? themeColor : ''
                "
                v-bind="props"
                @click="updateConditionType(item.value)"
              >
                <v-icon>{{ item.icon }}</v-icon>
              </v-btn>
            </template>
            <span>{{ item.label }}: {{ item.description }}</span>
          </v-tooltip>
        </v-col>
      </v-row>
      <!-- MATCH COUNT GIFT -->
        <v-sheet class="pt-8">
          <v-combobox
            v-if="threshold.conditionType === 'match'"
            v-model="threshold.match"
            label="含まれるキーワード"
            chips
            multiple
            clearable
            @update:modelValue="handleChange(threshold)"
          />
          <v-card v-if="threshold.conditionType === 'count'">
            <DialogThresholdInput
              v-model="threshold.count"
              conditionType="count"
              @update:modelValue="handleChange(threshold)"
            />
          </v-card>
          <v-card v-if="threshold.conditionType === 'gift'">
            <DialogThresholdInput
              v-model="threshold.gift"
              conditionType="gift"
              @update:modelValue="handleChange(threshold)"
            />
          </v-card>
          <!-- 子コンポーネント固有のスロット -->
          <slot />
        </v-sheet>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">

import { computed } from "vue";
import {
  ConditionType,
  OmikenCategory,
  OmikenEntry,
  OmikujiType,
  RulesType,
  ThresholdType,
} from "../types";
import { FunkThreshold } from "../composables/FunkThreshold";
import DialogThresholdInput from "./DialogThresholdInput.vue";

const props = defineProps<{
  type: "rules" | "omikuji";
  currentItem: RulesType | OmikujiType;
  threshold: ThresholdType;
  themeColor: string;
  availableConditions: ConditionType[];
}>();

const emit = defineEmits<{
  (e: "update:threshold", value: ThresholdType): void;
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
}>();

const { items, isThreshold, getExampleText } = FunkThreshold();

const filteredItems = computed(() => {
  const orderMap = new Map(
    props.availableConditions.map((type, index) => [type, index])
  );
  return items.threshold
    .filter((item) => props.availableConditions.includes(item.value))
    .sort((a, b) => {
      return (orderMap.get(a.value) ?? 0) - (orderMap.get(b.value) ?? 0);
    });
});

// 値が変更されたときに直接emitする
const handleChange = (newValue: ThresholdType) => {
  emit("update:threshold", newValue);
  const update = {
    [props.currentItem.id]: {
      ...props.currentItem,
      threshold: newValue,
    },
  };
  // @ts-ignore threshold　の型が複雑なので
  emit("update:Omiken", {
    type: props.type,
    update,
  });
};

// updateConditionTypeの修正
const updateConditionType = (type: ConditionType) => {
  const newThreshold = { ...props.threshold, conditionType: type };
  handleChange(newThreshold);
};
</script>
