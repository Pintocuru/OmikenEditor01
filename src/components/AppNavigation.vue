<template>
  <v-expansion-panels
   v-model="expandedPanels" multiple>
    <v-expansion-panel
      v-for="(section, index) in sections"
      :key="index"
    >
      <v-expansion-panel-title
        @click="$emit('open-list', section.type as ItemType) "
      >
        {{ section.title }}
        <template v-slot:actions>
          <v-badge
            :content="section.items.length"
            color="primary"
          ></v-badge>
        </template>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-list>
          <v-list-item
            v-for="(item, idx) in section.items"
            :key="idx"
            @click="$emit('open-editor', section.type as ItemType, item)"
            :title="item.name"
          >
          </v-list-item>
          <v-list-item v-if="section.items.length === 0">
            <v-list-item-title>項目がありません</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ItemContent, ItemType, SelectedItem } from "../AppTypes";
import { DefaultState } from "@/types";

const props = defineProps<{
  state: DefaultState;
  selectedItem: SelectedItem | null;
}>();

const emit = defineEmits<{
  (e: "open-list", type: ItemType): void;
  (e: "open-editor", type: ItemType, item: ItemContent): void;
}>();

const sections = computed(() => [
  { title: 'Rules', type: 'rules', items: props.state.rules || [] },
  { title: 'Omikuji', type: 'omikuji', items: props.state.omikuji || [] },
  { title: 'Placeholder', type: 'placeholder', items: props.state.placeholder || [] },
]);

const expandedPanels = ref([0, 1, 2]);
</script>