<!-- src/components/EditorDialog.vue -->
<template>
  <v-dialog :model-value="show" @update:model-value="updateShow" max-width="500px">
    <v-card>
      <v-card-title>
        Edit {{ type }}
      </v-card-title>
      <v-card-text>
        <RuleEditor
          v-if="type === 'rules'"
          :selected-rule="selectedItem as omikujiRule"
          @update:rule="updateItem('rules', $event)"
        />
        <OmikujiEditor
          v-if="type === 'omikuji'"
          :selected-omikuji="selectedItem as OmikujiMessage"
          @update:omikuji="updateItem('omikuji', $event)"
        />
        <RandomEditor
          v-if="type === 'placeholder'"
          :selected-random-items="[selectedItem as Placeholder]"
          @update:random-items="updateRandomItems"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" @click="closeDialog">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import RuleEditor from './RuleEditor.vue';
import OmikujiEditor from './OmikujiEditor.vue';
import RandomEditor from './RandomEditor.vue';
import type { ItemContent, ItemType } from "../AppTypes";
import { omikujiRule, OmikujiMessage,  Placeholder } from "@/types";

const props = defineProps<{
  show: boolean; // modelValueをshowに変更
  type: ItemType | null;
  selectedItem: ItemContent | null;
}>();

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void; // update:modelValueをupdate:showに変更
  (e: 'update', type: ItemType, item: ItemContent): void;
}>();

const updateShow = (value: boolean) => {
  emit('update:show', value);
};

const closeDialog = () => {
  emit('update:show', false); // update:modelValueをupdate:showに変更
};

const updateItem = (type: ItemType, item: ItemContent) => {
  emit('update', type, item);
};

const updateRandomItems = (items: Placeholder[]) => {
  if (items.length > 0) {
    updateItem('placeholder', items[0]);
  }
};
</script>