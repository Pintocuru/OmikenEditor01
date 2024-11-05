<!-- src/components/DialogThreshold.vue -->
<template>
  <v-card>
    <v-toolbar color="primary" density="compact">
      <v-toolbar-title>フィルタリング設定🔐</v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <div class="text-caption">
        条件例：{{ getExampleText(currentItem.threshold) }}
      </div>

      <!-- アイコン -->
    <v-row justify="space-around">
      <v-col v-for="item in items.threshold" :key="item.value" cols="auto">
        <v-tooltip location="top">
          <template v-slot:activator="{ props }">
            <v-btn
              icon
              :class="{
                'active-button':
                  currentItem.threshold.conditionType === item.value,
              }"
              v-bind="props"
              @click="currentItem.threshold.conditionType = item.value"
            >
              <v-icon>{{ item.icon }}</v-icon>
            </v-btn>
          </template>
          <span>{{ item.label }}: {{ item.description }}</span>
        </v-tooltip>
      </v-col>
    </v-row>
      <!-- 各設定群 -->
      <v-sheet class="pt-8">
        <v-slider
          v-if="currentItem.threshold.conditionType === ConditionType.SYOKEN"
          v-model="currentItem.threshold.syoken"
          :min="0"
          :max="2"
          :step="1"
          show-ticks="always"
          tick-size="4"
          :ticks="[0, 1, 2]"
          @update:modelValue="updateThreshold"
        >
          <template #tick-label="{ tick }">
            {{ items.syoken[tick.value]?.title }}
          </template>
        </v-slider>

        <v-slider
          v-if="currentItem.threshold.conditionType === ConditionType.ACCESS"
          v-model="currentItem.threshold.access"
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
        <v-combobox
          v-if="currentItem.threshold.conditionType === ConditionType.MATCH"
          v-model="currentItem.threshold.match"
          label="含まれるキーワード"
          chips
          multiple
          clearable
          @update:modelValue="updateThreshold"
        />

        <v-card
          v-if="currentItem.threshold.conditionType === ConditionType.TIME"
        >
          <v-card-text>
            <dialogThresholdInput
              v-model="currentItem.threshold.time"
              :conditionType="ConditionType.TIME"
              @update:modelValue="updateThreshold"
            />
          </v-card-text>
        </v-card>

        <v-card
          v-if="currentItem.threshold.conditionType === ConditionType.ELAPSED"
        >
          <v-card-text>
            <dialogThresholdInput
              v-model="currentItem.threshold.elapsed"
              :conditionType="ConditionType.ELAPSED"
              @update:modelValue="updateThreshold"
            />
          </v-card-text>
        </v-card>

        <v-card
          v-if="currentItem.threshold.conditionType === ConditionType.COUNT"
        >
          <v-card-text>
            <dialogThresholdInput
              v-model="currentItem.threshold.count"
              :conditionType="ConditionType.COUNT"
              @update:modelValue="updateThreshold"
            />
          </v-card-text>
        </v-card>

        <v-card
          v-if="currentItem.threshold.conditionType === ConditionType.GIFT"
        >
          <v-card-text>
            <dialogThresholdInput
              v-model="currentItem.threshold.gift"
              :conditionType="ConditionType.GIFT"
              @update:modelValue="updateThreshold"
            />
          </v-card-text>
        </v-card>
      </v-sheet>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import dialogThresholdInput from "./dialogThresholdInput.vue";
import { funkThreshold  } from "../composables/funkThreshold";
import {
  OmikenCategory,
  OmikenEntry,
  ConditionType,
  RulesType,
  OmikujiType,
  EditerEntryTypeMap,
  AccessLevel,
  SyokenType,
  ThresholdType,
} from "../types";
import { onMounted } from "vue";

const props = defineProps<{
  currentItem: OmikujiType | RulesType;
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
}>();

// コンポーザブル:funkThreshold
const { items, getExampleText } = funkThreshold();

// 条件タイプごとの初期値を生成
const defaultThreshold = (type: ConditionType): Partial<ThresholdType> => {
  switch (type) {
    case ConditionType.ACCESS:
      return { access: AccessLevel.ANYONE };
    case ConditionType.SYOKEN:
      return { syoken: SyokenType.SYOKEN };
    case ConditionType.MATCH:
      return { match: [] };
    case ConditionType.TIME:
      return { time: { type, isEnabled: true, comparison: 'range', value1: 0, value2: 23 } };
    case ConditionType.ELAPSED:
      return { elapsed: { type, isEnabled: true, comparison: 'min', unit: 'minute', value1: 0 } };
    case ConditionType.COUNT:
      return { count: { type, isEnabled: true, comparison: 'min', unit: 'lc', value1: 0 } };
    case ConditionType.GIFT:
      return { gift: { type, isEnabled: true, comparison: 'min', value1: 0 } };
    case ConditionType.NONE:
    default:
      return {};
  }
};

// 初期化関数
const initializeThreshold = () => {
  if (!props.currentItem?.threshold) return;
  
  const type = props.currentItem.threshold.conditionType;
  const defaults = defaultThreshold(type);
  
  // 各プロパティについて、未設定の場合のみデフォルト値を設定
  props.currentItem.threshold = {
    ...defaults,
    ...props.currentItem.threshold
  };
};

// コンポーネントマウント時に初期化
onMounted(() => {
  initializeThreshold();
});


// 更新関数
const updateThreshold = () => {
  if (!props.currentItem) return;

  if ("weight" in props.currentItem) {
    // OmikujiType
    emit("update:Omiken", {
      type: "omikuji",
      update: {
        [props.currentItem.id]: props.currentItem,
      } as EditerEntryTypeMap["omikuji"],
    });
  } else {
    // RulesType
    emit("update:Omiken", {
      type: "rules",
      update: {
        [props.currentItem.id]: props.currentItem,
      } as EditerEntryTypeMap["rules"],
    });
  }
};
</script>
