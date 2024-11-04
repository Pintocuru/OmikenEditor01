<!-- src/components/ListEntry.vue -->
<template>
  <v-card>
    <v-toolbar dense>
      <v-toolbar-title>Entry View</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-checkbox v-model="showRules" label="Rules" class="mr-2"></v-checkbox>
      <v-checkbox v-model="showOmikuji" label="Omikuji" class="mr-2"></v-checkbox>
      <v-checkbox v-model="showPlace" label="Place" class="mr-2"></v-checkbox>
    </v-toolbar>

    <!-- Rules View -->
    <template v-if="showRules">
      <draggable v-model="localRulesOrder" item-key="id" class="list-group" @end="updateRulesOrder">
        <template #item="{ element: ruleId }">
          <v-card class="mb-2">
            <v-toolbar :color="Omiken.rules[ruleId]?.color">
              <v-icon class="mx-2">mdi-drag-horizontal-variant</v-icon>
              <v-toolbar-title class="ml-2" @click="openEditorOmikuji('rules', ruleId)">
                {{ Omiken.rules[ruleId]?.name }}
              </v-toolbar-title>
            </v-toolbar>

            <!-- Omikuji View -->
            <ListEntryOmikuji v-if="showOmikuji" :Omiken="Omiken" :ruleId="ruleId"
              :enabledIds="Omiken.rules[ruleId].enabledIds" 
              @update:enabledIds="(newEnabledIds) => updateEnabledIds(newEnabledIds, ruleId)"
              @open-editor="openEditor" />

            <!-- Place View -->
            <ListEntryPlace v-if="showPlace" :Omiken="Omiken" :enabledIds="Omiken.rules[ruleId].enabledIds" />
          </v-card>
        </template>
      </draggable>
    </template>

    <!-- Flat View (Rules非表示時) -->
    <v-card-text v-else>
      <div v-if="showOmikuji" class="flat-view">
        <template v-for="omikujiId in Object.keys(Omiken.omikuji)" :key="omikujiId">
          <v-card class="mb-2">
            <v-card-title class="text-body-1" @click="openEditorOmikuji('omikuji', omikujiId)">
              {{ Omiken.omikuji[omikujiId]?.name }}
            </v-card-title>
            <v-card-text v-if="showPlace">
              <div v-for="(post, index) in Omiken.omikuji[omikujiId]?.post" :key="index" class="text-body-2 ml-4">
                {{ post.content }}
              </div>
            </v-card-text>
          </v-card>
        </template>
      </div>
    </v-card-text>

    <!-- ダミーダイアログ -->
    <v-dialog v-model="dialogOpen" max-width="500px">
      <v-card>
        <v-card-title> Edit {{ dialogType }}: {{ dialogKey }} </v-card-title>
        <v-card-text>
          This is a dummy dialog for demonstration purposes.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="dialogOpen = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import ListEntryOmikuji from "./ListEntryOmikuji.vue";
import ListEntryPlace from "./ListEntryPlace.vue";
import draggable from "vuedraggable";
import type { OmikenType, OmikenEntry, ListCategory, ListEntry } from "@/types";

const props = defineProps<{
  Omiken: OmikenType;
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<"rules">): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

// 表示制御
const showRules = ref(true);
const showOmikuji = ref(true);
const showPlace = ref(true);

// ダイアログ制御
const dialogOpen = ref(false);
const dialogType = ref<ListCategory>("rules");
const dialogKey = ref("");

// ドラッグ&ドロップ用のローカルデータ
const localRulesOrder = computed({
  get: () => [...props.Omiken.rulesOrder],
  set: (value) => {
    emit("update:Omiken", {
      type: "rules",
      reorder: value,
    });
  },
});

const localEnabledIds = computed(() => {
  const result: Record<string, string[]> = {};
  Object.keys(props.Omiken.rules).forEach((ruleId) => {
    result[ruleId] = [...(props.Omiken.rules[ruleId]?.enabledIds || [])];
  });
  return result;
});

// 各種更新関数
const updateRulesOrder = () => {
  emit("update:Omiken", {
    type: "rules",
    reorder: localRulesOrder.value,
  });
};

const updateEnabledIds = (enabledIds: string[], ruleId: string) => {
  const updatedRule = {
    ...props.Omiken.rules[ruleId],
    enabledIds, // 直接受け取ったenabledIdsを使用
  };

  emit("update:Omiken", {
    type: "rules",
    update: {
      [ruleId]: updatedRule,
    },
  });
};

// omikujiのエディターを開く
const openEditorOmikuji = (option: { id: string; name: string }) => {
  const omi = props.Omiken.omikuji?.[option.id];
  if (omi) {
    emit("open-editor", {
      isOpen: true,
      type: "omikuji",
      mode: null,
      key: option.id,
    });
  }
};

// ダイアログを開く
const openEditor = (editorItem: ListEntry<ListCategory>) =>
  emit("open-editor", editorItem);
</script>
