<!-- src/components/DialogThreshold.vue -->
<template>
  <v-card>
    <v-toolbar :color="themeColor" density="compact">
      <v-toolbar-title
        >🔐 フィルタリング設定
        <v-chip
          density="compact"
          variant="outlined"
          :color="
            isThreshold(currentItem.threshold) ? 'yellow lighten-3' : 'grey'
          "
          class="ml-4"
        >
          🔐 {{ getExampleText(currentItem.threshold) }}
        </v-chip>
      </v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <!-- アイコン -->
      <v-row justify="space-around">
        <v-col v-for="item in items.threshold" :key="item.value" cols="auto">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-btn
                icon
                :variant="
                  currentItem.threshold.conditionType === item.value
                    ? 'elevated'
                    : 'flat'
                "
                :color="
                  currentItem.threshold.conditionType === item.value
                    ? themeColor
                    : ''
                "
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
        <v-radio-group
          v-if="currentItem.threshold.conditionType === ConditionType.SYOKEN"
          v-model="currentItem.threshold.syoken"
          inline
        >
          <v-radio class="pr-8" label="初見さん" value="syoken" />
          <v-radio class="pr-8" label="枠初コメ" value="hi" />
          <v-radio label="久しぶり" value="again" />
        </v-radio-group>

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
          <DialogThresholdInput
            v-model="currentItem.threshold.time"
            :conditionType="ConditionType.TIME"
            @update:modelValue="updateThreshold"
          />
        </v-card>

        <v-card
          v-if="currentItem.threshold.conditionType === ConditionType.ELAPSED"
        >
          <DialogThresholdInput
            v-model="currentItem.threshold.elapsed"
            :conditionType="ConditionType.ELAPSED"
            @update:modelValue="updateThreshold"
          />
        </v-card>

        <v-card
          v-if="currentItem.threshold.conditionType === ConditionType.COUNT"
        >
          <DialogThresholdInput
            ref="childRef"
            v-model="currentItem.threshold.count"
            :conditionType="ConditionType.COUNT"
            @update:modelValue="updateThreshold"
          />
        </v-card>

        <v-card
          v-if="currentItem.threshold.conditionType === ConditionType.GIFT"
        >
          <DialogThresholdInput
            v-model="currentItem.threshold.gift"
            :conditionType="ConditionType.GIFT"
            @update:modelValue="updateThreshold"
          />
        </v-card>
      </v-sheet>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import DialogThresholdInput from "./DialogThresholdInput.vue";
import { FunkThreshold } from "../composables/FunkThreshold";
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
import { onMounted, ref } from "vue";

const props = defineProps<{
  currentItem: OmikujiType | RulesType;
  themeColor: string;
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
}>();

// コンポーザブル:funkThreshold
const { items, isThreshold, getExampleText } = FunkThreshold();

// dialogThresholdInput用のrefを追加
const childRef = ref<InstanceType<typeof DialogThresholdInput>>();

// 選択以外のすべての値にデフォルト値を入れる
const initializeThreshold = () => {
  if (!props.currentItem?.threshold) return;
  const base = { value1: 0 };
  const defaults: Partial<ThresholdType> = {
    access: AccessLevel.ANYONE,
    syoken: SyokenType.SYOKEN,
    match: [],
    time: {
      ...base,
      type: ConditionType.TIME,
      comparison: "range" as const,
      value2: 23,
    },
    elapsed: {
      ...base,
      type: ConditionType.ELAPSED,
      comparison: "max" as const,
      unit: "minute" as const,
    },
    count: {
      ...base,
      type: ConditionType.COUNT,
      comparison: "max" as const,
      unit: "lc" as const,
    },
    gift: { ...base, type: ConditionType.GIFT, comparison: "max" as const },
  };
  props.currentItem.threshold = {
    ...defaults,
    ...props.currentItem.threshold,
  };
};

// コンポーネントマウント時に初期化
onMounted(() => {
  initializeThreshold();
});

// 更新処理
const updateThreshold = () => {
  if (!props.currentItem) return;

  const type =
    "weight" in props.currentItem ? ("omikuji" as const) : ("rules" as const);
  const update = {
    [props.currentItem.id]: props.currentItem,
  } as EditerEntryTypeMap[typeof type];

  emit("update:Omiken", { type, update });
};
</script>
