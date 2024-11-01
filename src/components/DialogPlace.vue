<!-- src/components/DialogPlace.vue -->
<template>
  <v-card v-if="currentItem" style="max-height: 80vh; overflow-y: auto">
    <v-card-text>
      <v-row>
        <v-col cols="12" sm="3">
          <v-text-field
            v-model="currentItem.name"
            label="プレースホルダー名"
            @update:model-value="updateItem('name', $event)"
          />
        </v-col>
      </v-row>

      <!-- おみくじワード -->
      <v-card>
        <v-toolbar color="primary" density="compact">
          <v-toolbar-title>おみくじワード</v-toolbar-title>
          <v-spacer></v-spacer>
<v-btn-toggle
  v-model="currentItem.isWeight"
  density="compact"
  color="primary"
  mandatory
  class="me-2"
>
            <v-btn :value="false">
              <v-icon>mdi-format-list-bulleted</v-icon>
            </v-btn>
            <v-btn :value="true">
              <v-icon>mdi-scale-balance</v-icon>
              <v-tooltip activator="parent" location="bottom"
                >重み付けモード</v-tooltip
              >
            </v-btn>
          </v-btn-toggle>
          <v-btn variant="outlined" @click="addValue">＋追加</v-btn>
        </v-toolbar>
        <v-list density="compact">
          <draggable
            v-model="currentItem.values"
            item-key="id"
            handle=".handle"
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
                  <v-col :cols="isWeightMode ? 8 : 10">
                    <v-text-field
                      v-model="value.value"
                      label="値"
                      @update:model-value="updateValue(index, 'value', $event)"
                    />
                  </v-col>
                  <v-col cols="1">
                    <v-btn color="error" @click="removeValue(index)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-list-item>
            </template>
          </draggable>
        </v-list>
      </v-card>
    </v-card-text>
  </v-card>
  <v-alert v-else type="warning"
    >プレースホルダーが選択されていません。</v-alert
  >
</template>

<script setup lang="ts">
import { computed, inject, Ref } from "vue";
import draggable from "vuedraggable";
import type {
  PlaceType,
  PlaceValueType,
  OmikenEntry,
  OmikenCategory,
  ListEntry,
  AppStateType,
} from "../types";

const props = defineProps<{
  entry: ListEntry<"place"> | null;
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
}>();

// inject
const AppState = inject<Ref<AppStateType>>("AppStateKey");
const place = AppState?.value.Omiken.place;

// propsからデータを解読
const currentItem = computed(() =>
  props.entry?.key && place ? place[props.entry.key as string] : null
);
const isWeightMode = computed({
  get: () => currentItem.value?.isWeight ?? false,
  set: (value) => updateItem("isWeight", value),
});

// 基本情報とvaluesの更新を統合
const emitUpdate = (updatedItem: PlaceType) => {
  if (!currentItem.value || !props.entry?.key) return;
  const key = props.entry.key as string;
  emit("update:Omiken", {
    type: "place",
    update: { [key]: updatedItem },
  });
};

// これはなに？
const updateItem = (field: keyof PlaceType, value: any) => {
  if (!currentItem.value) return;
  emitUpdate({ ...currentItem.value, [field]: value });
};

// 値の更新
const updateValue = (
  index: number,
  field: keyof PlaceValueType,
  value: any
) => {
  if (!currentItem.value) return;
  const newValues = [...currentItem.value.values];
  newValues[index] = { ...newValues[index], [field]: value };
  emitUpdate({ ...currentItem.value, values: newValues });
};

// 値の追加
const addValue = () => {
  if (!currentItem.value) return;
  currentItem.value.values.push({ weight: 1, value: "" });
};

// 値の削除
const removeValue = (index: number) => {
  if (!currentItem.value) return;
  currentItem.value.values.splice(index, 1);
};

const handleDragEnd = () => {
  if (!currentItem.value) return;
  emitUpdate({ ...currentItem.value, values: [...currentItem.value.values] });
};
</script>

<style scoped>
.handle {
  cursor: move;
}
</style>
