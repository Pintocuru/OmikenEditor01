<!-- src/components/ListItemPlace.vue -->
<template>
  <v-col cols="12">
    <v-card @click="openEditor">
      <v-toolbar density="compact">
        <v-toolbar-title>
          {{ item.name }}
          <span class="text-subtitle-2">({{ item.values.length }} items)</span>
        </v-toolbar-title>
        <template v-slot:append>
          <ListItemPartsAction
            :selectCategory="naviCategory"
            :item="item"
            @edit="openEditor"
            @update:STATE="updateSTATE"
          />
        </template>
      </v-toolbar>
      <v-card-text>
        <div class="text-body-2">
          Values: 
          {{ displayValues }}
        </div>
      </v-card-text>
    </v-card>
  </v-col>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  ListEntry,
  ListCategory,
  PlaceType,
  STATEEntry,
  STATEType,
  STATECategory,
} from "@/types";
import ListItemPartsAction from "./common/ListItemPartsAction.vue";

// Props Emits
const props = defineProps<{
  STATE: STATEType;
  item: PlaceType;
  naviCategory: ListCategory;
}>();

const emit = defineEmits<{
  (e: "update:STATE", payload: STATEEntry<STATECategory>): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

// 値の表示用に整形
const displayValues = computed(() => {
  const values = props.item.values.map(value => {
    if (typeof value === 'string') {
      return value;
    } else {
      return `${value.value} (${value.weight}%)`;
    }
  });
  
  // 3つ以上ある場合は最初の2つだけ表示して省略
  if (values.length > 3) {
    return `${values.slice(0, 2).join(', ')} ... and ${values.length - 2} more`;
  }
  return values.join(', ');
});

// エディターを開く
function openEditor() {
  emit("open-editor", {
    type: props.naviCategory,
    item: { [props.item.id]: props.item },
    isOpen: false
  });
}

// STATE更新
const updateSTATE = (payload: STATEEntry<STATECategory>) => emit("update:STATE", payload);
</script>