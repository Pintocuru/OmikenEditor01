<template>
 <v-dialog :model-value="modelValue" max-width="300" @update:model-value="$emit('update:modelValue', $event)">
  <v-card>
   <v-card-title>削除の確認</v-card-title>
   <v-card-text>本当に削除しますか？</v-card-text>
   <v-card-actions>
    <v-spacer></v-spacer>
    <v-btn color="grey darken-1" @click="$emit('update:modelValue', false)">キャンセル</v-btn>
    <v-btn color="red darken-1" @click="$emit('confirm')">削除</v-btn>
   </v-card-actions>
  </v-card>
 </v-dialog>
</template>

<script setup lang="ts">
defineProps<{
 modelValue: boolean;
}>();

defineEmits<{
 (e: 'update:modelValue', value: boolean): void;
 (e: 'confirm'): void;
}>();
</script>