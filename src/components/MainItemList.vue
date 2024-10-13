<!-- src/components/ItemList.vue -->
<template>
  <v-card-text>
    <v-row>
      <draggable
        v-model="localItems"
        :item-key="(item: any, index: any) => index"
        tag="div"
        class="d-flex flex-wrap"
        @change="updateItems"
      >
        <template #item="{ element, index }">
          <v-col v-bind="colProps">
            <v-hover v-slot="{ isHovering, props: hoverProps }">
              <v-card
                v-bind="hoverProps"
                :elevation="isHovering ? 8 : 2"
                :class="{ 'on-hover': isHovering }"
                :height="100"
                @click.stop="$emit('open-editor', selectCategory, index)"
              >
                <v-card-title class="text-subtitle-1">{{
                  element.name
                }}</v-card-title>
                <v-card-subtitle v-if="selectCategory === 'omikuji'">
                  重み: {{ element.weight }}
                </v-card-subtitle>
                <v-card-subtitle v-if="selectCategory === 'placeholder'">
                  重み: {{ element.weight }}, グループ: {{ element.group }}
                </v-card-subtitle>
              </v-card>
            </v-hover>
          </v-col>
        </template>
      </draggable>
    </v-row>
  </v-card-text>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import draggable from "vuedraggable";
import type { ItemContent, ItemType } from "../AppTypes";

const props = defineProps<{
  items: ItemContent[];
  selectCategory: ItemType;
  colProps: Record<string, number>;
}>();

const emit = defineEmits<{
  (e: "update-items", items: ItemContent[]): void;
  (e: "open-editor", type: ItemType, index: number): void;
}>();

const localItems = ref(props.items);

watch(
  () => props.items,
  (newItems) => {
    localItems.value = newItems;
  },
  { deep: true }
);

const updateItems = () => {
  emit("update-items", localItems.value);
};
</script>
