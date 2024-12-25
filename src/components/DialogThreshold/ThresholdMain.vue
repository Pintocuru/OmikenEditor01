<!-- src/components/DialogThreshold/ThresholdMain.vue -->
<template>
  <div>
    <v-card-text>
      <!-- しきい値リスト -->
      <v-row
        v-for="(threshold, index) in thresholds"
        :key="index"
        class="mb-4 align-center"
      >
        <v-col cols="10">
          <v-chip color="primary" variant="outlined" class="mr-4">
            {{ getExampleText([threshold]) }}
          </v-chip>
        </v-col>
        <v-col cols="2">
          <v-btn
            icon
            color="error"
            @click="removeThreshold(index)"
            :disabled="thresholds.length <= 1"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </v-col>
      </v-row>

      <!-- 新規追加ボタン -->
      <v-btn
        block
        color="primary"
        variant="outlined"
        @click="addThreshold"
        :disabled="thresholds.length >= maxArray"
      >
        条件を追加 ({{ thresholds.length }}/{{ maxArray }})
      </v-btn>
    </v-card-text>

    <!-- 現在選択中のしきい値の詳細編集 -->
    <!-- TODO ここは v-dialogを使いたい -->
    <v-card-text v-if="currentIndex !== null">
      <!-- 条件リスト(ボタン選択) -->
      <ThresholdSelect
        :threshold="thresholds[currentIndex]"
        @update:condition="updateConditionType"
      />

      <!-- 条件タイプに応じたコンポーネント -->
      <component
        :is="getComponent"
        :threshold="thresholds[currentIndex]"
        :type="type"
        @update:threshold="updateThreshold"
      />
    </v-card-text>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  ThresholdType,
  ConditionType,
  TypesType,
} from "@/type";
import {
  FunkThresholdInitial,
  FunkThreshold,
} from "@/composables/FunkThreshold";

import ThresholdSelect from "./ThresholdSelect.vue";
import ThresholdSimple from "./ThresholdSimple.vue";
import ThresholdCount from "./ThresholdCount.vue";
import ThresholdMatch from "./ThresholdMatch.vue";

const props = defineProps<{
  Thresholds: ThresholdType[];
  type:TypesType;
  maxArray?: number;
  minArray?: number; // 最低値(ないとerror表記)
}>();
// typeのdefaultはcomment
const maxArray = computed(() => props.maxArray || 3);
const minArray = computed(() => props.minArray || 1);

const emit = defineEmits<{
  (e: "update:Thresholds", value: ThresholdType[]): void;
}>();

const { getExampleText } = FunkThreshold();

// 現在編集中のしきい値のインデックス
const currentIndex = ref<number | null>(null);

// しきい値リスト
const thresholds = ref<ThresholdType[]>(
  props.Thresholds.length > 0 ? props.Thresholds : [FunkThresholdInitial()]
);

// 条件タイプに応じたコンポーネントを動的に選択
const getComponent = computed(() => {
  if (currentIndex.value === null) return null;

  const conditionComponentMap = {
    target: ThresholdSimple,
    coolDown: ThresholdSimple,
    syoken: ThresholdSimple,
    access: ThresholdSimple,
    count: ThresholdCount,
    match: ThresholdMatch,
  };

  return conditionComponentMap[
    thresholds.value[currentIndex.value].conditionType
  ];
});

// しきい値追加
const addThreshold = () => {
  if (thresholds.value.length < 3) {
    thresholds.value.push(FunkThresholdInitial());
    currentIndex.value = thresholds.value.length - 1;
    emitUpdate();
  }
};

// しきい値削除
const removeThreshold = (index: number) => {
  if (thresholds.value.length > 1) {
    thresholds.value.splice(index, 1);
    currentIndex.value =
      currentIndex.value !== null &&
      currentIndex.value >= thresholds.value.length
        ? thresholds.value.length - 1
        : currentIndex.value;
    emitUpdate();
  }
};

// 条件タイプ更新
const updateConditionType = (condition: ConditionType) => {
  if (currentIndex.value !== null) {
    thresholds.value[currentIndex.value].conditionType = condition;
    emitUpdate();
  }
};

// しきい値更新
const updateThreshold = (updatedThreshold: ThresholdType) => {
  if (currentIndex.value !== null) {
    thresholds.value[currentIndex.value] = updatedThreshold;
    emitUpdate();
  }
};

// 親コンポーネントへ更新を通知
const emitUpdate = () => {
  emit("update:Thresholds", thresholds.value);
};

// 初期状態で最初のしきい値を選択
currentIndex.value = 0;
</script>
