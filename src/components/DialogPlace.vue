<!-- src/components/DialogPlace.vue -->
<template>
  <v-card v-if="currentItem" style="max-height: 80vh; overflow-y: auto">
    <v-card-text>
      <!-- 基本情報 -->
      <v-row>
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="currentItem.name"
            label="プレースホルダー名"
            density="compact"
            @update:model-value="updateBasicInfo('name', $event)"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="currentItem.description"
            label="説明文"
            density="compact"
            @update:model-value="updateBasicInfo('description', $event)"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <v-switch
            v-model="currentItem.isWeight"
            label="重み付けモード"
            density="compact"
            @update:model-value="updateBasicInfo('isWeight', $event)"
            :true-value="true"
            :false-value="false"
          />
        </v-col>
      </v-row>

      <!-- 値のリスト -->
      <v-list>
        <v-list-item v-for="(value, index) in currentItem.values" :key="index">
          <v-row align="center">
            <v-col cols="3" v-if="currentItem.isWeight">
              <v-text-field
                v-model.number="value.weight"
                label="重み"
                type="number"
                density="compact"
                @update:model-value="updateValue(index, 'weight', $event)"
              />
            </v-col>
            <v-col cols="8">
              <v-text-field
                v-model="value.value"
                label="値"
                density="compact"
                @update:model-value="updateValue(index, 'value', $event)"
              />
            </v-col>
            <v-col cols="1">
              <v-btn
                icon
                @click="removeValue(index)"
                color="error"
                density="compact"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-list-item>
      </v-list>

      <!-- 値の追加ボタン -->
      <v-row class="mt-2">
        <v-col cols="12">
          <v-btn color="secondary" @click="addValue">
            <v-icon start>mdi-plus</v-icon>
            追加
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
  <v-alert v-else type="warning">
    プレースホルダーが選択されていません。
  </v-alert>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type {
  PlaceType,
  PlaceValueType,
  OmikenEntry,
  OmikenCategory,
  ListEntry,
} from "../types";

const props = defineProps<{
  entry: ListEntry<"place"> | null;
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
}>();

// propsからデータを解読
const currentItem = computed(() => {
  const item = props.entry?.item;
  return item ? Object.values(item)[0] : null;
});
const currentValues = computed(() => currentItem.value?.values || []);

// 基本情報の更新
const updateBasicInfo = (field: keyof PlaceType, value: any) => {
  if (!currentItem.value || !props.entry?.item) return;

  const firstKey = Object.keys(props.entry.item)[0];
  emit("update:Omiken", {
    type: "place",
    update: {
      [firstKey]: {
        ...currentItem.value,
        [field]: value,
      },
    },
  });
};

// 値の更新
const updateValue = (
  index: number,
  field: keyof PlaceValueType,
  value: any
) => {
  if (!currentItem.value || !props.entry?.item) return;

  const firstKey = Object.keys(props.entry.item)[0];
  const newValues = [...currentItem.value.values];
  newValues[index] = { ...newValues[index], [field]: value };

  emit("update:Omiken", {
    type: "place",
    update: {
      [firstKey]: {
        ...currentItem.value,
        values: newValues,
      },
    },
  });
};

// 値の追加
const addValue = () => {
  if (!currentItem.value || !props.entry?.item) return;

  const firstKey = Object.keys(props.entry.item)[0];
  currentValues.value.push({ weight: 1, value: "" });

  emit("update:Omiken", {
    type: "place",
    update: {
      [firstKey]: {
        ...currentItem.value,
        values: currentValues.value,
      },
    },
  });
};

// 値の削除
const removeValue = (index: number) => {
  if (!currentItem.value || !props.entry?.item) return;

  const firstKey = Object.keys(props.entry.item)[0];
  currentValues.value.splice(index, 1);

  emit("update:Omiken", {
    type: "place",
    update: {
      [firstKey]: {
        ...currentItem.value,
        values: currentValues.value,
      },
    },
  });
};
</script>
