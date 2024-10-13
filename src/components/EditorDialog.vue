<!-- src/components/EditorDialog.vue -->
<template>
  <v-dialog
    :model-value="show"
    @update:model-value="updateShow"
    max-width="700px"
  >
    <v-card>
        <component
          :is="getEditorComponent"
          :STATE="STATE"
          :selectedItem="selectedItem"
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
import type { ItemContent, SelectedItem } from "../AppTypes";
import { DefaultState, omikujiRule } from "@/types";

// props/emits
const props = defineProps<{
  show: boolean;
  STATE: DefaultState;
  selectedItem: SelectedItem;
}>();

const emit = defineEmits<{
  (e: "update:show", value: boolean): void;
  (e: "update:STATE", STATE: DefaultState): void;
}>();

const updateShow = (value: boolean) => {
  emit("update:show", value);
};

const getEditorComponent = computed(() => {
  const type = props.selectedItem?.type || "meow";
  switch (type) {
    case "rules":
      return RuleEditor;
    case "omikuji":
      return OmikujiEditor;
    case "placeholder":
      return RandomEditor;
    default:
      return null;
  }
});

const localState = ref(JSON.parse(JSON.stringify(props.STATE)));

watch(
  () => props.STATE,
  (newState) => {
    console.log("EditorDialog: props.STATE changed", newState);
    localState.value = JSON.parse(JSON.stringify(newState));
  },
  { deep: true }
);

const handleUpdate = (updatedItem: ItemContent) => {
  console.log("EditorDialog: handleUpdate called", updatedItem);

  if (props.selectedItem) {
    const { type, index } = props.selectedItem;

    switch (type) {
      case "rules":
        if (index !== undefined) {
          localState.value.rules[index] = updatedItem;
        }
        break;
      case "omikuji":
        if (index !== undefined) {
          localState.value.omikuji[index] = updatedItem; // 同様にインデックスを使って更新
        }
        break;
      case "placeholder":
        if (index !== undefined) {
          localState.value.placeholder[index] = updatedItem; // 同様にインデックスを使って更新
        }
        break;
      default:
        console.warn("Unknown type:", type);
    }

    // 状態を更新
    emit("update:STATE", localState.value);
  }
};

const closeDialog = () => {
  console.log("EditorDialog: closeDialog called");
  emit("update:STATE", localState.value);
  emit("update:show", false);
};
</script>
