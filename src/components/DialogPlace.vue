<!-- src/components/DialogPlace.vue -->
<template>
  <v-card v-if="currentItem" style="max-height: 80vh; overflow-y: auto;">
    <v-card-title>プレースホルダーエディタ</v-card-title>
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

      <!-- 値のリスト -->
      <v-list>
        <v-list-item v-for="(value, index) in currentItem.values" :key="index">
          <v-row align="center">
            <template v-if="typeof value === 'string'">
              <!-- 文字列の場合(// TODO 後で削除:Objectしかないため) -->
              <v-col cols="11">
                <v-text-field
                  v-model="currentItem.values[index]"
                  label="値"
                  density="compact"
                  @update:model-value="updateValue(index, 'type', $event)"
                />
              </v-col>
            </template>
            <template v-else>
              <!-- オブジェクトの場合 -->
              <v-col cols="2">
                <v-select
                  v-model="value.type"
                  :items="['simple', 'weight']"
                  label="タイプ"
                  density="compact"
                  @update:model-value="updateValueObject(index, 'type', $event)"
                />
              </v-col>
              <v-col cols="2">
                <v-text-field
                  v-model.number="value.weight"
                  label="重み"
                  type="number"
                  density="compact"
                  @update:model-value="updateValueObject(index, 'weight', $event)"
                />
              </v-col>
              <v-col cols="7">
                <v-text-field
                  v-model="value.value"
                  label="値"
                  density="compact"
                  @update:model-value="updateValueObject(index, 'value', $event)"
                />
              </v-col>
            </template>
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
          <v-btn
            color="primary"
            class="mr-2"
            @click="addValue('simple')"
          >
            <v-icon start>mdi-plus</v-icon>
            シンプル値を追加
          </v-btn>
          <v-btn
            color="secondary"
            @click="addValue('weight')"
          >
            <v-icon start>mdi-plus</v-icon>
            重み付き値を追加
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
import type { PlaceType, PlaceValueType, STATEEntry, STATECategory } from "../types";
import Swal from "sweetalert2";

const props = defineProps<{
  entry: Record<string, PlaceType> | null;
}>();

const emit = defineEmits<{
  (e: "update:STATE", payload: STATEEntry<STATECategory>): void;
}>();

const currentItem = computed(() => {
  if (props.entry) {
    const firstKey = Object.keys(props.entry)[0];
    return props.entry[firstKey];
  }
  return null;
});

// 基本情報の更新
const updateBasicInfo = (field: keyof PlaceType, value: any) => {
  if (!currentItem.value || !props.entry) return;
  
  const firstKey = Object.keys(props.entry)[0];
  emit("update:STATE", {
    type: "place",
    update: {
      [firstKey]: {
        ...currentItem.value,
        [field]: value
      }
    }
  });
};

// 単純な値の更新
const updateValue = (index: number, field: keyof Exclude<PlaceValueType, string>, value: any) => {
  if (!currentItem.value || !props.entry) return;
  
  const firstKey = Object.keys(props.entry)[0];
  const newValues = [...currentItem.value.values];
  const oldValue = newValues[index];
  
  if (typeof oldValue !== 'string') {
    newValues[index] = { ...oldValue, [field]: value };
    
    emit("update:STATE", {
      type: "place",
      update: {
        [firstKey]: {
          ...currentItem.value,
          values: newValues
        }
      }
    });
  }
};

// オブジェクト値の更新
const updateValueObject = (index: number, field: keyof Exclude<PlaceValueType, string>, value: any) => {
  if (!currentItem.value || !props.entry) return;
  
  const firstKey = Object.keys(props.entry)[0];
  const newValues = [...currentItem.value.values];
  const oldValue = newValues[index];
  
  if (typeof oldValue !== 'string') {
    newValues[index] = { ...oldValue, [field]: value };
    
    emit("update:STATE", {
      type: "place",
      update: {
        [firstKey]: {
          ...currentItem.value,
          values: newValues
        }
      }
    });
  }
};

// 値の追加
const addValue = (type: 'simple' | 'weight') => {
  if (!currentItem.value || !props.entry) return;
  
  const firstKey = Object.keys(props.entry)[0];
  const newValues = [...currentItem.value.values];
  
  if (type === 'simple') {
     newValues.push({ type: 'weight', weight: 1, value: '' });
  } else {
    newValues.push({ type: 'weight', weight: 1, value: '' });
  }
  
  emit("update:STATE", {
    type: "place",
    update: {
      [firstKey]: {
        ...currentItem.value,
        values: newValues
      }
    }
  });
};

// 値の削除
const removeValue = async (index: number) => {
  if (!currentItem.value || !props.entry) return;
  
  const result = await Swal.fire({
    title: '削除の確認',
    text: "この値を削除してもよろしいですか？",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: '削除する'
  });

  if (result.isConfirmed) {
    const firstKey = Object.keys(props.entry)[0];
    const newValues = currentItem.value.values.filter((_, i) => i !== index);
    
    emit("update:STATE", {
      type: "place",
      update: {
        [firstKey]: {
          ...currentItem.value,
          values: newValues
        }
      }
    });
  }
};
</script>