<!-- src/components/ListEntry.vue -->
<template>
  <!-- Rules View -->
  <v-card v-for="(ruleId, index) in localRulesOrder" :key="ruleId" class="mb-2">
    <v-toolbar :color="Omiken.rules[ruleId]?.color">
      <div class="d-flex">
        <v-tooltip text="上に移動" location="top">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              icon="mdi-arrow-up"
              density="compact"
              :disabled="index === 0"
              @click="moveRule(index, 'up')"
            />
          </template>
        </v-tooltip>
        <v-tooltip text="下に移動" location="top">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              icon="mdi-arrow-down"
              density="compact"
              :disabled="index === localRulesOrder.length - 1"
              @click="moveRule(index, 'down')"
            />
          </template>
        </v-tooltip>
      </div>
      <v-toolbar-title class="ml-2" @click="openEditorItem('rules', ruleId)">
        <span v-if="isThreshold(Omiken.rules[ruleId]?.threshold)">🔐</span>
        {{ index + 1 }}. {{ Omiken.rules[ruleId]?.name }}
      </v-toolbar-title>
      <template #append>
        <ListItemPartsAction
          selectCategory="rules"
          :item="Omiken.rules[ruleId]"
          @edit="openEditorItem('rules', ruleId)"
          @update:Omiken="updateOmiken"
        />
      </template>
    </v-toolbar>
    <v-card-text class="list-group d-flex flex-wrap">
      <v-chip
        v-if="
          Omiken.rules[ruleId]?.matchStartsWith &&
          Omiken.rules[ruleId]?.matchStartsWith.length > 0
        "
        variant="text"
        density="compact"
      >
        <v-icon color="primary">mdi-arrow-right-bold-box</v-icon>
        {{ Omiken.rules[ruleId]?.matchStartsWith.join(", ") }}
      </v-chip>
      <v-chip v-else variant="text" density="compact">
        <v-icon color="primary">mdi-arrow-right-bold-box</v-icon>
        (すべてのコメントが対象)
      </v-chip>
      <!-- 発動条件の表示 -->
      <v-chip
        v-if="isThreshold(Omiken.rules[ruleId]?.threshold)"
        density="compact"
        variant="outlined"
        color="yellow lighten-3"
      >
        🔐{{ getExampleText(Omiken.rules[ruleId].threshold) }}
      </v-chip>

      <!-- Omikuji View -->
      <v-expansion-panels multiple class="pt-2">
        <v-expansion-panel>
          <v-expansion-panel-title color="primary">
            <span class="text-h6">
              <v-icon icon="mdi-crystal-ball"></v-icon>
              該当するおみくじ
            </span>
            <v-chip label class="ml-4">
              {{ Omiken.rules[ruleId]?.enabledIds.length }} items
            </v-chip>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <ListEntryOmikuji
              :Omiken="Omiken"
              :ruleId="ruleId"
              :enabledIds="Omiken.rules[ruleId].enabledIds"
              @update:enabledIds="
                (newEnabledIds) => updateRulesEnabledIds(newEnabledIds, ruleId)
              "
              @open-editor="openEditor"
              @update:Omiken="updateOmiken"
            />
          </v-expansion-panel-text>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-title color="secondary">
            <span class="text-h6">
              <v-icon icon="mdi-tag"></v-icon>
              該当するプレースホルダー
            </span>
            <v-chip label class="ml-4">
              {{
                rulesOfPlaces(Omiken, Omiken.rules[ruleId]?.enabledIds)
                  .displayPlaces.value.length
              }}
              items
            </v-chip>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <!-- Place View -->
            <ListEntryPlace
              ref="childRef"
              :Omiken="Omiken"
              :enabledIds="Omiken.rules[ruleId].enabledIds"
              @open-editor="openEditor"
              @update:Omiken="updateOmiken"
            />
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ComputedRef, nextTick, onMounted, ref, watch } from "vue";
import ListEntryOmikuji from "./ListEntryOmikuji.vue";
import ListEntryPlace from "./ListEntryPlace.vue";
import ListItemPartsAction from "./common/ListItemPartsAction.vue";
import type {
  OmikenType,
  OmikenEntry,
  ListCategory,
  ListEntry,
  OmikenCategory,
} from "@/types";
import { rulesOfPlaces } from "@/composables/FunkRules";
import { funkThreshold } from "@/composables/FunkThreshold";

const props = defineProps<{
  Omiken: OmikenType;
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

// コンポーザブル:funkThreshold
const { items, isThreshold, getExampleText } = funkThreshold();

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

// ListEntryPlace から displayPlaces を受け取る

// 型を指定して ref を初期化
const childRef = ref<{ displayPlaces: ComputedRef<any[]> } | null>(null);

onMounted(() => {
  if (childRef.value) {
    console.log(childRef.value.displayPlaces); // displayPlaces プロパティにアクセス
  }
});

// 配列要素の移動関数
function moveArrayElement(array: string[], fromIndex: number, toIndex: number) {
  const element = array[fromIndex];
  array.splice(fromIndex, 1);
  array.splice(toIndex, 0, element);
}

// コンポーネント内のメソッド
function moveRule(index: number, direction: "up" | "down") {
  const newIndex = direction === "up" ? index - 1 : index + 1;
  if (newIndex >= 0 && newIndex < localRulesOrder.value.length) {
    moveArrayElement(localRulesOrder.value, index, newIndex);
    updateRulesOrder();
  }
}

// 各種更新関数
const updateRulesOrder = () => {
  emit("update:Omiken", {
    type: "rules",
    reorder: localRulesOrder.value,
  });
};

const updateRulesEnabledIds = (enabledIds: string[], ruleId: string) => {
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
const openEditorItem = (type: ListCategory, id: string) => {
  emit("open-editor", {
    isOpen: true,
    type,
    mode: null,
    key: id,
  });
};

// ダイアログを開く
const openEditor = (editorItem: ListEntry<ListCategory>) =>
  emit("open-editor", editorItem);
const updateOmiken = (payload: OmikenEntry<OmikenCategory>) =>
  emit("update:Omiken", payload);
</script>
