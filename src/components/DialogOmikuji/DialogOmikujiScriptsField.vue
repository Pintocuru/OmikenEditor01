<!-- src/components/DialogOmikuji/DialogOmikujiScriptsField.vue -->
<template>
   <!-- 文字列の場合 -->
 <v-text-field
  v-if="param.type === 'string' || param.type === undefined"
  :model-value="modelValue"
  :label="param.name"
  :hint="param.description"
  persistent-hint
  dense="compact"
  @update:model-value="$emit('update:model-value', $event)"
 />
   <!-- 数値の場合 -->
 <v-text-field
  v-else-if="param.type === 'number'"
  :model-value="modelValue"
  type="number"
  :label="param.name"
  :hint="param.description"
  persistent-hint
  dense="compact"
  @update:model-value="$emit('update:model-value', Number($event))"
 />
   <!-- 真偽値の場合 -->
<v-switch
  v-else-if="param.type === 'boolean'"
  :model-value="modelValue"
  :label="param.name"
  :hint="param.description"
  persistent-hint
  dense="compact"
  @update:model-value="$emit('update:model-value', $event !== null ? $event : false)"
/>

</template>

<script setup lang="ts">
import { ScriptParam } from '@type';

defineProps<{
 param: ScriptParam;
 modelValue: string | number | boolean;
}>();

defineEmits<{
 (e: 'update:model-value', value: string | number | boolean): void;
}>();
</script>