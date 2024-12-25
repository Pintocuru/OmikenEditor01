<!-- src/components/DialogPlaceTextMode.vue -->
<template>
  <v-dialog v-model="dialog" @click:outside="handleSave">
    <v-card>
      <v-card-title>テキストエディター</v-card-title>
      <v-card-text>
        <v-textarea
          v-model="editingText"
          label="値を1行ずつ入力してください"
          hint="※保存時、weightはすべて1に設定されます"
          persistent-hint
          rows="10"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="dialog = false">キャンセル</v-btn>
        <v-btn color="primary" @click="handleSave">保存</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { PlaceValueType } from '@/type'

const props = defineProps<{
  modelValue: boolean
  values: PlaceValueType[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', values: PlaceValueType[]): void
}>()

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const editingText = ref('')

// 初期値の設定
watch(() => props.values, (newValues) => {
  editingText.value = newValues.map(v => v.value).join('\n')
}, { immediate: true })

const handleSave = () => {
  const values: PlaceValueType[] = editingText.value
    .split('\n')
    .filter(line => line.trim())
    .map(value => ({
      weight: 1,
      value: value.trim()
    }))
  emit('save', values)
  dialog.value = false
}
</script>