<!-- src/components/DialogThreshold.vue -->
<template>
  <v-card>
    <v-toolbar color="primary">
      <v-toolbar-title>フィルタリング設定</v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <div class="text-caption">条件例：{{ getExampleText() }}</div>

<v-row>
  <v-col
    v-for="item in conditionTypeItems"
    :key="item.value"
    cols="auto"
  >
    <v-btn
      :class="{'active-button': currentItem.threshold.conditionType === item.value}"
      @click="currentItem.threshold.conditionType = item.value"
    >
      {{ item.label }}
    </v-btn>
  </v-col>
</v-row>

      <v-slider
        v-if="currentItem.threshold.conditionType === ConditionType.SYOKEN"
        v-model="currentItem.threshold.syoken"
        :min="0"
        :max="2"
        :step="1"
        show-ticks="always"
        tick-size="4"
        :ticks="syokenTicks"
        @update:modelValue="updateThreshold"
      />

      <v-slider
        v-if="currentItem.threshold.conditionType === ConditionType.ACCESS"
        v-model="currentItem.threshold.access"
        :min="0"
        :max="4"
        :step="1"
        show-ticks="always"
        tick-size="4"
        :ticks="accessTicks"
        @update:modelValue="updateThreshold"
      />
      <v-combobox
        v-if="currentItem.threshold.conditionType === ConditionType.MATCH"
        v-model="currentItem.threshold.match"
        label="含まれるキーワード"
        chips
        multiple
        clearable
        @update:modelValue="updateThreshold"
      />

      <v-card v-if="currentItem.threshold.conditionType === ConditionType.TIME">
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

      <v-card v-if="currentItem.threshold.conditionType === ConditionType.GIFT">
        <v-card-text>
          <dialogThresholdInput
            v-model="currentItem.threshold.gift"
            :conditionType="ConditionType.GIFT"
            @update:modelValue="updateThreshold"
          />
        </v-card-text>
      </v-card>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import dialogThresholdInput from "./dialogThresholdInput.vue";
import { funkThreshold } from "../composables/funkThreshold";
import {
  OmikenCategory,
  OmikenEntry,
  ConditionType,
  RulesType,
  OmikujiType,
  EditerEntryTypeMap,
} from "../types";

const props = defineProps<{
  currentItem: OmikujiType | RulesType;
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
}>();

// コンポーザブル:funkThreshold
const {
  accessTicks,
  syokenTicks,
  conditionTypeItems,
  accessLevelItems,
  syokenTypeItems,
  getExampleText,
} = funkThreshold(props.currentItem.threshold);

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
