<!-- src/components/EditorDialog.vue -->
<template>
  <v-dialog :model-value="show" @update:model-value="updateShow" max-width="800px">
    <v-card>
      <component
        :is="editorComponent"
        :STATE="STATE"
        :selectItem="selectItem"
        @update:item="handleUpdate"
      />
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" @click="closeDialog">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import RuleEditor from "./RuleEditor.vue";
import OmikujiEditor from "./OmikujiEditor.vue";
import RandomEditor from "./RandomEditor.vue";
import type { ItemContent, SelectItem } from "../AppTypes";
import { DefaultState, Placeholder } from "@/types";

// Props and emits
const props = defineProps<{
  show: boolean;
  STATE: DefaultState;
  selectItem: SelectItem;
}>();

const emit = defineEmits<{
  (e: "update:show", value: boolean): void;
  (e: "update:STATE", STATE: DefaultState): void;
}>();

// Computed property for editor component
const editorComponent = computed(() => {
  console.log(props.selectItem);
  const type = props.selectItem?.type;
  const editorMap = {
    rules: RuleEditor,
    omikuji: OmikujiEditor,
    placeholder: RandomEditor
  };
  return editorMap[type as keyof typeof editorMap] || null;
});

// Local state management
const localState = ref<DefaultState>(JSON.parse(JSON.stringify(props.STATE)));

watch(() => props.STATE, (newState) => {
  localState.value = JSON.parse(JSON.stringify(newState));
}, { deep: true });

// Event handlers
const updateShow = (value: boolean) => emit("update:show", value);

const handleUpdate = (updatedItem: ItemContent) => {
  if (props.selectItem) {
    const { type, index } = props.selectItem;
    if (index !== undefined && type in localState.value) {
      if (Array.isArray(updatedItem)) {
        // グループ編集の場合
        const stateArray = localState.value[type as keyof DefaultState] as Placeholder[];
        updatedItem.forEach((item: Placeholder) => {
          const stateIndex = stateArray.findIndex((stateItem: Placeholder) => stateItem.id === item.id);
          if (stateIndex !== -1) {
            stateArray[stateIndex] = item;
          }
        });
      } else {
        // 単一アイテムの編集の場合
        (localState.value[type as keyof DefaultState] as ItemContent[])[index] = updatedItem as Placeholder;
      }
    }
    emit("update:STATE", localState.value);
  }
};


const closeDialog = () => {
  emit("update:STATE", localState.value);
  emit("update:show", false);
};
</script>
