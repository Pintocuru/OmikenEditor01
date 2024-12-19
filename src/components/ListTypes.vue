<!-- src/components/ListTypes.vue -->
<template>
 <v-container fluid>
  <v-row>
   <v-col v-for="(typeKey, index) in ['comment', 'timer', 'unused']" :key="typeKey" cols="12" md="4">
    <h3>{{ typeKey.charAt(0).toUpperCase() + typeKey.slice(1) }} Rules</h3>
    <draggable v-model="draggableRules[typeKey as TypesType]" item-key="id" group="rules" @change="handleDragChange">
     <template #item="{ element: ruleId, index: subIndex }">
      <div :key="ruleId" class="mb-2">
       <v-card elevation="0" class="w-100" @click="openEditorItem('rules', ruleId)" :class="{ 'cursor-pointer': true }">
        <v-toolbar :color="Omiken.rules[ruleId]?.color">
         <v-toolbar-title class="ml-2">
          <v-icon class="mr-2">
           {{
            typeKey === 'comment' ? 'mdi-comment-outline' : typeKey === 'timer' ? 'mdi-timer-outline' : 'mdi-cancel'
           }}
          </v-icon>
          {{ subIndex + 1 }}.
          {{ Omiken.rules[ruleId]?.name }}
          <v-chip label class="ml-4"> {{ Omiken.rules[ruleId]?.enableIds.length }} items </v-chip>
         </v-toolbar-title>
         <template #append>
          <PartsToolbarAction
           selectCategory="rules"
           :item="Omiken.rules[ruleId]"
           @edit="openEditorItem('rules', ruleId)"
           @update:Omiken="updateOmiken"
          />
         </template>
        </v-toolbar>

        <v-card-text class="list-group d-flex flex-wrap">
         <v-chip
          density="compact"
          variant="outlined"
          color="yellow lighten-3"
          @click.stop="openEditorItem('rules', ruleId)"
         >
          🔐{{ getExampleText(Omiken.rules[ruleId].threshold) }}
         </v-chip>
        </v-card-text>
       </v-card>
      </div>
     </template>
     <template #footer>
      <v-card v-if="draggableRules[typeKey as TypesType].length === 0" class="text-center py-2 mb-4 dashed-border">
       <v-card-text class="text-grey">
        <v-icon class="mr-2">mdi-arrow-all</v-icon>
        ここにドラッグ＆ドロップ
       </v-card-text>
      </v-card>
     </template>
    </draggable>
   </v-col>
  </v-row>
 </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Draggable from 'vuedraggable';
import PartsToolbarAction from './common/PartsToolbarAction.vue';
import { FunkThreshold } from '@/composables/FunkThreshold';
import { FunkEmits } from '@/composables/FunkEmits';
import type {
 OmikenEntry,
 ListCategory,
 ListEntry,
 OmikenEntryType,
 CategoryActive,
 TypesType,
 OmikenType
} from '@/types/index';

const props = defineProps<{
 Omiken: OmikenType;
 categoryActive: CategoryActive;
}>();

const emit = defineEmits<{
 (e: 'update:Omiken', payload: OmikenEntry<OmikenEntryType>): void;
 (e: 'open-editor', editorItem: ListEntry<ListCategory>): void;
}>();

const { updateOmiken, openEditor, openEditorItem } = FunkEmits(emit);
const { getExampleText } = FunkThreshold();

const draggableRules = computed<Record<TypesType, string[]>>({
 get: () => ({
  comment: props.Omiken.types['comment'] || [],
  timer: props.Omiken.types['timer'] || [],
  unused: props.Omiken.types['unused'] || [],
  meta: props.Omiken.types['meta'] || [],
  waitingList: props.Omiken.types['waitingList'] || [],
  setList: props.Omiken.types['setList'] || [],
  reactions: props.Omiken.types['reactions'] || []
 }),
 set: (newRules) => {
  (Object.keys(newRules) as TypesType[]).forEach((key) => {
   props.Omiken.types[key] = newRules[key];
  });
 }
});

const handleDragChange = (evt: any) => {
 const typesUpdate: OmikenEntry<'types'> = {
  type: 'types',
  reTypes: {
   comment: props.Omiken.types['comment'],
   timer: props.Omiken.types['timer'],
   unused: props.Omiken.types['unused']
  }
 };

 emit('update:Omiken', typesUpdate);
};
</script>

<style scoped>
.dashed-border {
 border: 2px dashed #9e9e9e;
 border-style: dashed;
}
</style>
