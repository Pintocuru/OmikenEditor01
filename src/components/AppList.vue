<!-- src/components/AppList.vue -->
<template>
  <v-card class="ma-4 list-card" elevation="3">
    <v-card-title :class="['text-h5', 'font-weight-bold', 'white--text', getTitleColor()]">
      {{ capitalizeFirstLetter(props.type) }}
      <v-spacer></v-spacer>
      <v-chip :color="getChipColor()" label>
        {{ listItems.length }} items
      </v-chip>
    </v-card-title>
    <v-card-text>
      <v-row>
        <draggable
          v-model="listItems"
          :item-key="(item: any, index: any) => index"
          @change="emitChange"
          tag="div"
          class="d-flex flex-wrap"
        >
          <template #item="{ element, index }">
            <v-col
              :cols="gridcols[selectgridcols].cols"
              :sm="gridcols[selectgridcols].sm"
              :md="gridcols[selectgridcols].md"
              :lg="gridcols[selectgridcols].lg"
            >
              <v-hover v-slot="{ isHovering, props: hoverProps }">
                <v-card
                  v-bind="hoverProps"
                  :elevation="isHovering ? 8 : 2"
                  :class="{ 'on-hover': isHovering }"
                  :height="gridcols[selectgridcols].height"
                  :color="getCardColor(element)"
                  @click.stop="$emit('open-editor', type, element)"
                >
                  <v-card-title class="text-subtitle-1">{{ element.name }}</v-card-title>
                </v-card>
              </v-hover>
            </v-col>
          </template>
        </draggable>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import draggable from "vuedraggable";
import { ItemContent, ItemType } from "@/AppTypes";
import { useMainList } from "@/composables/funkOmikenUI";
import type {
  DefaultState,
  OmikujiMessage,
  omikujiRule,
  Placeholder,
} from "@/types";

const props = defineProps<{
  state: DefaultState;
  type: ItemType;
  selectgridcols: number;
  dai: ItemType;
}>();

const emit = defineEmits<{
  (e: "update:state", state: DefaultState): void;
  (e: "update:selectgridcols", selectgridcols: number): void;
  (e: "open-editor", type: ItemType, item: ItemContent): void;
}>();

const listItems = computed({
  get: () => props.state[props.type] || [],
  set: (value) => {
    const updatedState = { ...props.state, [props.type]: value };
    emit("update:state", updatedState);
  },
});

const emitChange = () => {
  emit("update:selectgridcols", props.selectgridcols);
};

type GridCol = {
  cols: number;
  sm: number;
  md: number;
  lg: number;
  height: number;
  icon: string;
};

const gridcols: Record<number, GridCol> = {
  0: { cols: 12, sm: 12, md: 12, lg: 6, height: 50, icon: "mdi-view-list" },
  1: { cols: 12, sm: 6, md: 4, lg: 3, height: 100, icon: "mdi-view-grid" },
  2: { cols: 4, sm: 3, md: 2, lg: 1, height: 100, icon: "mdi-view-module" },
};

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};


const getTitleColor = () => {
  switch(props.type) {
    case 'rules':
      return 'blue darken-2';
    case 'omikuji':
      return 'green darken-2';
    case 'placeholder':
      return 'purple darken-2';
    default:
      return 'grey darken-2';
  }
};

const getChipColor = () => {
  switch(props.type) {
    case 'rules':
      return 'blue lighten-4';
    case 'omikuji':
      return 'green lighten-4';
    case 'placeholder':
      return 'purple lighten-4';
    default:
      return 'grey lighten-4';
  }
};

const getCardColor = (element: ItemContent) => {
  // ここでelement.typeや他のプロパティに基づいて色を決定できます
  return "white";
};
</script>


<style scoped>
.list-card {
  border-radius: 8px;
  overflow: hidden;
}
.on-hover {
  transition: all 0.3s ease-in-out;
}
</style>