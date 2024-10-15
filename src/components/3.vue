<!-- src/components/AppPlaceholder.vue -->
<template>
  <v-card>
    <v-layout>
      <v-main>
        <v-app-bar color="primary" density="compact">
          <v-app-bar-title>
            {{ props.type }}
            <v-chip label> {{ listItems.length }} items </v-chip>
          </v-app-bar-title>
               <template v-slot:append>
          <v-btn icon="mdi-dots-vertical">＋追加</v-btn>
        </template>
          
        </v-app-bar>
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
                      @click.stop="$emit('open-editor', type, element)"
                    >
                      <v-card-title class="text-subtitle-1">{{
                        element.name
                      }}</v-card-title>
                    </v-card>
                  </v-hover>
                </v-col>
              </template>
            </draggable>
          </v-row>
        </v-card-text>
      </v-main>
    </v-layout>
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



</script>
