<!-- src/components/ListItemPlace.vue -->
<template>
  <v-col cols="12" sm="6" md="4">
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
            @update:Omiken="updateOmiken"
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
  OmikenEntry,
  OmikenEditType,
  OmikenCategory,
} from "@/types";
import ListItemPartsAction from "./common/ListItemPartsAction.vue";

// Props Emits
const props = defineProps<{
  Omiken: OmikenEditType;
  item: PlaceType;
  naviCategory: ListCategory;
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
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

// Omiken更新
const updateOmiken = (payload: OmikenEntry<OmikenCategory>) => emit("update:Omiken", payload);
</script>