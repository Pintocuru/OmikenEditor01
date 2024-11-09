<!-- src/components/DialogPlaceEditor.vue -->
<template>
  <v-list density="compact">
    <draggable
      :model-value="currentItem.values"
      item-key="id"
      handle=".handle"
      @update:model-value="updateItem"
      @end="handleDragEnd"
    >
      <template #item="{ element: value, index }">
        <v-list-item>
          <v-row align="center" no-gutters>
            <v-col cols="auto" class="me-1">
              <v-icon class="handle" color="grey">mdi-drag</v-icon>
            </v-col>
            <v-col
              :cols="isWeightMode ? 2 : 0"
              v-if="isWeightMode"
              class="me-2"
            >
              <v-text-field
                v-model.number="value.weight"
                label="重み"
                type="number"
                @update:model-value="updateValue(index, 'weight', $event)"
              />
            </v-col>
            <v-col>
              <v-text-field
                v-model="value.value"
                label="値"
                @update:model-value="updateValue(index, 'value', $event)"
              />
            </v-col>
            <v-col cols="auto">
              <PartsArrayRemovePlace
                type="omikuji"
                :currentItem="currentItem"
                :index="index"
                size="32"
                v-model:array="currentItem.values"
                @update:array="handleArrayUpdate(index, $event)"
              />
            </v-col>
          </v-row>
        </v-list-item>
      </template>
    </draggable>
  </v-list>
</template>

<script setup lang="ts">
import draggable from "vuedraggable";
import PartsArrayRemovePlace from "./common/PartsArrayRemovePlace.vue";
import type { PlaceValueType, PlaceType, ListEntry } from "../types";

const props = defineProps<{
  entry: ListEntry<"place"> | null;
  currentItem: PlaceType;
  isWeightMode: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: PlaceValueType[]): void;
}>();

// 値の更新処理を統合
const updateItem = (updatedValues: PlaceValueType[]) => {
  emit("update:modelValue", updatedValues);
};

// 各種ハンドラー
const updateValue = (
  index: number,
  field: keyof PlaceValueType,
  value: any
) => {
  const newValues = props.currentItem.values.map((item, i) =>
    i === index ? { ...item, [field]: value } : item
  );
  emit("update:modelValue", newValues);
};

const handleDragEnd = () => {
  emit("update:modelValue", [...props.currentItem.values]);
};
const handleArrayUpdate = (index: number, newArray: PlaceValueType[]) => {
  emit("update:modelValue", newArray);
};
</script>
