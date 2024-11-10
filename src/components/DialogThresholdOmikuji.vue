<!-- src/components/DialogThresholdOmikuji.vue -->
<template>
  <DialogThresholdBase
    v-if="currentItem"
    v-model:threshold="threshold"
    type="omikuji"
    :currentItem="currentItem"
    :themeColor="themeColor"
    :availableConditions="omikujiConditions"
    @update:Omiken="updateOmiken"
  >
    <v-sheet
      v-if="threshold.conditionType === ConditionType.CLOCK"
      class="d-flex align-center ga-2 w-100"
    >
      <v-text-field
        v-model.number="threshold.clock!.startHour"
        type="number"
        min="0"
        max="23"
        label="開始時刻"
        @change="updateThreshold"
      />
      <v-text-field
        v-model.number="threshold.clock!.durationHours"
        type="number"
        min="1"
        max="23"
        label="開始時刻から何時間有効か"
        @change="updateThreshold"
      />
    </v-sheet>

    <v-sheet v-if="threshold.conditionType === ConditionType.ELAPSED">
      <DialogThresholdInput
        v-model="threshold.elapsed"
        :conditionType="ConditionType.ELAPSED"
        @update:modelValue="updateThreshold"
      />
    </v-sheet>
  </DialogThresholdBase>
</template>

<script setup lang="ts">
import { FunkEmits } from "@/composables/FunkEmits";
import {
  ConditionType,
  OmikenEntry,
  OmikenCategory,
  OmikujiType,
  OmikujiThresholdType,
  ClockCondition,
} from "../types";
import DialogThresholdBase from "./DialogThresholdBase.vue";
import DialogThresholdInput from "./DialogThresholdInput.vue";
import {
  FunkThreshold,
  FunkThresholdInitial,
} from "@/composables/FunkThreshold";
import { ref } from "vue";

type ModelValueType = ClockCondition | undefined;

const props = defineProps<{
  currentItem: OmikujiType;
  themeColor: string;
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
}>();

const threshold = ref<OmikujiThresholdType>({
  ...FunkThresholdInitial().omikuji, // 初期値を付与
  ...props.currentItem.threshold,
});

// コンポーザブル:FunkEmits
const { getComparisonItems, getValueLabel, getUnitItems } = FunkThreshold();
// コンポーザブル:FunkEmits
const { updateOmiken } = FunkEmits(emit);

// フィルタリングの並び順
const omikujiConditions = [
  ConditionType.NONE,
  ConditionType.GIFT,
  ConditionType.CLOCK,
  ConditionType.ELAPSED,
  ConditionType.COUNT,
  ConditionType.MATCH,
];

// 更新処理
const updateThreshold = () => {
  if (!props.currentItem) return;
  const update = {
    [props.currentItem.id]: props.currentItem,
  };
  emit("update:Omiken", { type: "omikuji", update });
};
</script>
