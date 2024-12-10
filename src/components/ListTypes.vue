<!-- src/components/ListTypes.vue -->
<template>
  <v-container fluid>
    <v-row>
      <v-col
        v-for="(typeKey, index) in ['comment', 'timer', 'unused']"
        :key="typeKey"
        cols="12"
        md="4"
      >
        <h3>{{ typeKey.charAt(0).toUpperCase() + typeKey.slice(1) }} Rules</h3>
        <draggable
          v-model="draggableRules[typeKey]"
          item-key="id"
          group="rules"
          @change="handleDragChange"
        >
          <template #item="{ element: ruleId, index: subIndex }">
            <div :key="ruleId" class="mb-2">
              <v-card
                elevation="0"
                class="w-100"
                @click="togglePanel(ruleId)"
                :class="{ 'cursor-pointer': true }"
              >
                <v-toolbar :color="Omiken.rules[ruleId]?.color">
                  <v-toolbar-title class="ml-2">
                    {{ typeKey.charAt(0).toUpperCase() }} {{ subIndex + 1 }}.
                    {{ Omiken.rules[ruleId]?.name }}
                    <v-chip label class="ml-4">
                      {{ Omiken.rules[ruleId]?.enableIds.length }} items
                    </v-chip>
                  </v-toolbar-title>
                  <template #append>
                    <PartsToolbarAction
                      selectCategory="rules"
                      :item="Omiken.rules[ruleId]"
                      @edit="openEditorItem('rules', ruleId)"
                      @update:Omiken="updateOmiken"
                    />
                  </template>
                </v-toolbar>

                <v-card-text class="list-group d-flex flex-wrap">
                  <v-chip
                    density="compact"
                    variant="outlined"
                    color="yellow lighten-3"
                    @click.stop="openEditorItem('rules', ruleId)"
                  >
                    🔐{{ getExampleText(Omiken.rules[ruleId].threshold) }}
                  </v-chip>
                </v-card-text>
              </v-card>
            </div>
          </template>
          <template #footer>
            <v-card
              v-if="draggableRules[typeKey].length === 0"
              class="text-center py-2 mb-4 dashed-border"
            >
              <v-card-text class="text-grey">
                <v-icon class="mr-2">mdi-arrow-all</v-icon>
                ここにドラッグ＆ドロップ
              </v-card-text>
            </v-card>
          </template>
        </draggable>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, inject, Ref } from "vue";
import Draggable from "vuedraggable";
import PartsToolbarAction from "./common/PartsToolbarAction.vue";
import { FunkThreshold } from "@/composables/FunkThreshold";
import { FunkEmits } from "@/composables/FunkEmits";
import type {
  OmikenEntry,
  ListCategory,
  ListEntry,
  OmikenEntryType,
  CategoryActive,
  AppEditerType,
} from "@/types/index";

const expandedPanels = ref<string[]>([]);

const togglePanel = (ruleId: string) => {
  const index = expandedPanels.value.indexOf(ruleId);
  if (index === -1) {
    expandedPanels.value.push(ruleId);
  } else {
    expandedPanels.value.splice(index, 1);
  }
};

const props = defineProps<{
  categoryActive: CategoryActive;
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenEntryType>): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

const AppEditer =
  inject<Ref<AppEditerType>>("AppEditerKey") ?? ref({} as AppEditerType);
const Omiken = AppEditer.value.Omiken;

const { updateOmiken, openEditor, openEditorItem } = FunkEmits(emit);
const { getExampleText } = FunkThreshold();

const draggableRules = computed({
  get: () => ({
    comment: Omiken.types["comment"] || [],
    timer: Omiken.types["timer"] || [],
    unused: Omiken.types["unused"] || [],
  }),
  set: (newRules) => {
    Omiken.types["comment"] = newRules.comment;
    Omiken.types["timer"] = newRules.timer;
    Omiken.types["unused"] = newRules.unused;
  },
});

const handleDragChange = (evt: any) => {
  const typesUpdate: OmikenEntry<"types"> = {
    type: "types",
    reTypes: {
      comment: Omiken.types["comment"],
      timer: Omiken.types["timer"],
      unused: Omiken.types["unused"],
    },
  };

  emit("update:Omiken", typesUpdate);
};
</script>

<style scoped>
.dashed-border {
  border: 2px dashed #9e9e9e;
  border-style: dashed;
}
</style>
