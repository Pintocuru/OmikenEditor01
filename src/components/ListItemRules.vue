<!-- src/components/ListItemRules.vue -->
<template>
  <v-card height="200" @click="openEditor">
    <v-toolbar :color="getSwitchColor(item.switch)" density="compact">
      <v-toolbar-title>
        {{ item.name }}
      </v-toolbar-title>
      <template v-slot:append>
        <ListItemPartsAction
          :selectCategory="selectCategory"
          :item="item"
          @update:STATE="updateSTATE"
        />
      </template>
    </v-toolbar>
    <v-card-text>
      <v-chip-group>
        <v-chip
          v-for="option in validOmikujiOptions"
          :key="option.id"
          size="x-large"
          class="ma-1"
        >
          {{ option.name }}
        </v-chip>
      </v-chip-group>
      <v-sheet class="mt-2">
        <v-chip :color="getSwitchColor(item.switch)">
          {{ getSwitchLabel(item.switch) }}
        </v-chip>
        <span v-if="item.matchExact && item.matchExact.length > 0">
          <v-icon color="primary">mdi-equal-box</v-icon>
          {{ item.matchExact.join(", ") }}
        </span>
        <span v-if="item.matchStartsWith && item.matchStartsWith.length > 0">
          <v-icon color="primary">mdi-arrow-right-bold-box</v-icon>
          {{ item.matchStartsWith.join(", ") }}
        </span>
        <span v-if="item.matchIncludes && item.matchIncludes.length > 0">
          <v-icon color="primary">mdi-contain</v-icon>
          {{ item.matchIncludes.join(", ") }}
        </span>
      </v-sheet>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  EditorItem,
  ItemCategory,
  rulesType,
  SelectItem,
  STATEType,
} from "@/types";
import ListItemPartsAction from "./common/ListItemPartsAction.vue";
import { useSwitchStyles } from "../composables/useSwitchStyles";

// Props Emits
const props = defineProps<{
  STATE: STATEType;
  item: rulesType;
  selectCategory: ItemCategory;
}>();

const emit = defineEmits<{
  (e: "update:STATE", payload: SelectItem): void;
  (e: "open-editor", editorItem: EditorItem): void;
}>();

// 0～4のswitchによって色を変える
const { getSwitchLabel, getSwitchColor } = useSwitchStyles();


// なんだっけ？？？？
const omikujiOptions = computed(() =>
  Object.entries(props.STATE.omikuji).map(([id, omikuji]) => ({
    id,
    name: omikuji.name,
  }))
);

// なにするの？？？？
const validOmikujiOptions = computed(() => {
  console.log(props.item);
  const disabledIds = props.item.disabledIds;
  if (!Array.isArray(disabledIds)) return omikujiOptions.value;
  return omikujiOptions.value.filter(
    (option) => !disabledIds.includes(option.id)
  );
});

// エディターを開く
function openEditor() {
  const item = { [props.item.id]: props.item };
  emit("open-editor", {
    type: props.selectCategory,
    item: item,
  });
}
// STATEの更新をemit
function updateSTATE(payload: SelectItem) {
  emit("update:STATE", payload);
}
</script>
