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
              <PartsArrayRemove
                type="omikuji"
                :currentItem="currentItem"
                :array="currentItem.values"
                :index="index"
                size="32"
                @update:Omiken="updateOmiken"
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
import PartsArrayRemove from "./common/PartsArrayRemove.vue";
import type {
  PlaceValueType,
  PlaceType,
  OmikenEntry,
  OmikenCategory,
  ListEntry,
} from "../types";

const props = defineProps<{
  entry: ListEntry<"place"> | null;
  currentItem: PlaceType;
  isWeightMode: boolean;
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
}>();

// 値の更新処理を統合
const updateItem = (updatedValues: PlaceValueType[]) => {
  if (!props.currentItem || !props.entry?.key) return;

  // keyがstring型であることを確認
  if (typeof props.entry.key === 'string') {
    emit("update:Omiken", {
      type: "place",
      update: {
        [props.entry.key]: {
          ...props.currentItem,
          values: updatedValues,
        },
      },
    });
  }
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
  updateItem(newValues);
};

const handleDragEnd = () => {
  updateItem([...props.currentItem.values]);
};
const updateOmiken = (payload: OmikenEntry<OmikenCategory>) =>
  emit("update:Omiken", payload);
</script>
