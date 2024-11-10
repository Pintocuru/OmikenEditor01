<!-- src/components/DialogThresholdRules.vue -->
<template>
  <DialogThresholdBase
    v-if="currentItem"
    v-model:threshold="threshold"
    type="rules"
    :currentItem="currentItem"
    :themeColor="currentItem.color"
    :availableConditions="ruleConditions"
    @update:Omiken="updateOmiken"
  >
    <v-sheet
      v-if="threshold?.conditionType === ConditionType.TIMER"
      class="d-flex align-center ga-2"
    >
      <v-text-field
        v-model.number="threshold.timer!.minutes"
        type="number"
        min="1"
        max="180"
        label="開始時刻"
        class="mr-4"
        @change="updateThreshold"
      />
      <v-switch
        v-model="threshold.timer!.isBaseZero"
        label="0分ちょうどからカウントする"
        @change="updateThreshold"
      />
    </v-sheet>

    <v-radio-group
      v-if="threshold.conditionType === ConditionType.SYOKEN"
      v-model="threshold.syoken"
      inline
      @change="updateThreshold"
    >
      <v-radio class="pr-8" label="初見さん" value="syoken" />
      <v-radio class="pr-8" label="枠初コメ" value="hi" />
      <v-radio label="久しぶり" value="again" />
    </v-radio-group>

    <v-slider
      v-if="threshold.conditionType === ConditionType.ACCESS"
      v-model="threshold.access"
      :min="0"
      :max="4"
      :step="1"
      show-ticks="always"
      tick-size="4"
      :ticks="[0, 1, 2, 3, 4]"
      @update:modelValue="updateThreshold"
    >
      <template #tick-label="{ tick }">
        {{ items.access[tick.value]?.title }}
      </template>
    </v-slider>
  </DialogThresholdBase>
</template>

<script setup lang="ts">
import { FunkEmits } from "@/composables/FunkEmits";
import {
  ConditionType,
  OmikenEntry,
  OmikenCategory,
  RulesType,
  RuleThresholdType,
} from "../types";
import DialogThresholdBase from "./DialogThresholdBase.vue";
import {
  FunkThreshold,
  FunkThresholdInitial,
} from "@/composables/FunkThreshold";
import { ref } from "vue";

// props/emits
const props = defineProps<{
  currentItem: RulesType;
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
}>();

const threshold = ref<RuleThresholdType>({
  ...FunkThresholdInitial().rule, // 初期値を付与
  ...props.currentItem.threshold,
});

// コンポーザブル:FunkThreshold
const { items } = FunkThreshold();
// コンポーザブル:FunkEmits
const { updateOmiken } = FunkEmits(emit);

// フィルタリングの並び順
const ruleConditions = [
  ConditionType.MATCH,
  ConditionType.TIMER,
  ConditionType.ACCESS,
  ConditionType.SYOKEN,
  ConditionType.COUNT,
  ConditionType.GIFT,
];

// 更新処理
const updateThreshold = () => {
  if (!props.currentItem) return;
  const update = {
    [props.currentItem.id]: props.currentItem,
  };
  emit("update:Omiken", { type: "rules", update });
};
</script>
