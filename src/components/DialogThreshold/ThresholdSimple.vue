<!-- src/components/DialogThreshold/ThresholdSimple.vue -->
<template>
  <div>
    <!-- target条件 -->
    <v-sheet v-if="threshold.conditionType === 'target'" class="pt-8">
      (詳細設定はありません)
    </v-sheet>

    <!-- coolDown条件 -->
    <v-sheet v-if="threshold.conditionType === 'coolDown'" class="pt-8">
      <v-text-field
        v-model.number="currentItem.coolDown"
        type="number"
        min="1"
        max="3600"
        label="指定した時間(秒)"
        @update:modelValue="$emit('update:threshold', currentItem)"
      />
    </v-sheet>

    <!-- syoken条件 -->
    <v-slider
      v-if="threshold.conditionType === 'syoken'"
      v-model="currentItem.syoken"
      :min="1"
      :max="4"
      :step="1"
      show-ticks="always"
      tick-size="4"
      :ticks="[
        SyokenCondition.SYOKEN,
        SyokenCondition.AGAIN,
        SyokenCondition.HI,
        SyokenCondition.ALL,
      ]"
      @update:modelValue="$emit('update:threshold', currentItem)"
    >
      <template #tick-label="{ tick }">
        {{ EXAMPLES[type].syoken[tick.value as SyokenCondition] }}
      </template>
    </v-slider>

    <!-- access条件 -->
    <v-slider
      v-if="threshold.conditionType === 'access'"
      v-model="currentItem.access"
      :min="2"
      :max="4"
      :step="1"
      show-ticks="always"
      tick-size="3"
      :ticks="[
        AccessCondition.MEMBER,
        AccessCondition.MODERATOR,
        AccessCondition.ADMIN,
      ]"
      @update:modelValue="$emit('update:threshold', currentItem)"
    >
      <template #tick-label="{ tick }">
        {{ EXAMPLES[type].access[tick.value as AccessCondition] }}
      </template>
    </v-slider>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  ThresholdType,
  SyokenCondition,
  AccessCondition,
  TypesType,
} from "@/type";
import {
  FunkThreshold,
  FunkThresholdInitial,
} from "@/composables/FunkThreshold";

const props = defineProps<{
  threshold: ThresholdType;
  type: TypesType;
}>();
// typeのdefaultはcomment
const type = computed(() => props.type || "comment");

const emit = defineEmits<{
  (e: "update:threshold", threshold: ThresholdType): void;
}>();

// コンポーザブル:FunkThreshold
const { EXAMPLES } = FunkThreshold();

// computedプロパティで型安全な値を提供
const currentItem = computed({
  get: () => props.threshold || FunkThresholdInitial("target"),
  set: (value) => emit("update:threshold", value),
});
</script>
