<!-- src/components/OmikujiList.vue -->
<template>
  <div>
    <h2>おみくじ一覧</h2>
    <draggable 
      :list="omikujiState.omikujiList" 
      item-key="id"
      @end="onDragEnd"
    >
      <template #item="{ element }">
        <v-list-item @click="omikujiState.openOmikujiDialog(element)">
          <v-list-item-content>
            <v-list-item-title>{{ element.message }}</v-list-item-title>
          </v-list-item-content>
          <v-list-item-icon>
            <v-icon>mdi-drag</v-icon>
          </v-list-item-icon>
        </v-list-item>
      </template>
    </draggable>
  </div>
</template>

<script setup lang="ts">
import { inject, Ref } from 'vue';
import draggable from 'vuedraggable';
import { OmikujiMessage } from "@/types";

const omikujiState = inject('omikujiState') as {
  omikujiList: Ref<OmikujiMessage[]>;
  updateOmikujiList: (newList: OmikujiMessage[]) => void;
  openOmikujiDialog: (omikuji: OmikujiMessage) => void;
};

const onDragEnd = () => {
  omikujiState.updateOmikujiList([...omikujiState.omikujiList.value]);
};
</script>

<style scoped>
.v-list-item {
  cursor: move;
}
</style>