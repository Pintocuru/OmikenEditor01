<!-- src/components/DialogOmikuji/DialogOmikujiThreshold.vue -->
<template>
 <DialogThreshold :item="currentItem" type="comment" mode="omikujis" @update:Omiken="updateOmiken" />
</template>

<script setup lang="ts">
import { ListCategory, ListEntry, OmikujiType, OmikenEntry } from '@type';
import { FunkEmits } from '@/composables/FunkEmits';
import DialogThreshold from '@/components/DialogThreshold/DialogThreshold.vue';

const props = defineProps<{
 currentItem: OmikujiType;
 modelValue: "places" | "post" | "threshold" | "status" | "scripts";
}>();

const emit = defineEmits<{
 (e: 'update:Omiken', payload: OmikenEntry<ListCategory>): void;
 (e: 'open-editor', editorItem: ListEntry<ListCategory>): void;
}>();

// コンポーザブル:FunkEmits
const { updateOmiken } = FunkEmits(emit);
</script>
