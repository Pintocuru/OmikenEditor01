<!-- src/components/ListRulesOmikuji.vue -->
<template>
  <!-- Omikuji View -->
  <v-select
    v-model="localEnabledIds"
    :items="omikujiLists"
    label="有効にするID"
    chips
    multiple
    item-title="name"
    item-value="id"
    @update:modelValue="(value) => emit('update:enabledIds', value)"
  />
<ListRulesWeight
  :Omiken="Omiken"
  :ruleId="ruleId"
  :enabledIds="localEnabledIds"
  @update:enabledIds="(value) => emit('update:enabledIds', value)"
  @open-editor="openEditorItem"
  @update:Omiken="updateOmiken"
/>
  <!-- Omikuji View -->
  <v-row>
    
    <draggable
      v-model="localEnabledIds"
      item-key="id"
      class="d-flex flex-wrap"
      @end="updateEnabledIds"
    >
      <template #item="{ element: omikujiId }">
        <v-col cols="12" sm="6" md="4" lg="3" class="pa-1">
          <v-card variant="tonal" :color="weightColor(omikujiId, enabledIds)">
            <!-- タイトルバーと操作ボタン -->
            <v-toolbar
              density="compact"
              :color="getPostTypeColor(Omiken.omikuji[omikujiId].post, true)"
            >
              <v-toolbar-title
                class="ml-4"
                @click="openEditorItem('omikuji', omikujiId)"
              >
                <!-- 発動条件の表示 -->
                <span v-if="isThreshold(Omiken.omikuji[omikujiId]?.threshold)">
                  🔐
                </span>
                {{ Omiken.omikuji[omikujiId]?.name }}
              </v-toolbar-title>
              <template #append>
                <PartsToolbarAction
                  selectCategory="omikuji"
                  :rule-id="ruleId"
                  :item="Omiken.omikuji[omikujiId]"
                  :isSmall="true"
                  @edit="openEditorItem('omikuji', omikujiId)"
                  @update:Omiken="updateOmiken"
                />
              </template>
            </v-toolbar>

            <!-- おみくじ内容 -->
            <v-card-text class="py-4">
              <!-- onecommeのcontent表示 -->
              <v-sheet class="pb-3" v-if="Omiken.omikuji[omikujiId]?.post">
                {{ getOnecommeContent(Omiken.omikuji[omikujiId].post) }}
              </v-sheet>

              <v-sheet class="list-group d-flex flex-wrap">
                <!-- 発動条件の表示 -->
                <v-chip
                  v-if="isThreshold(Omiken.omikuji[omikujiId]?.threshold)"
                  density="compact"
                  variant="outlined"
                  color="yellow lighten-3"
                >
                  🔐 {{ getExampleText(Omiken.omikuji[omikujiId].threshold) }}
                </v-chip>
                <!-- 既存の出現割合表示 -->
                <v-chip density="compact" variant="text">
                  🎯 {{ Omiken.omikuji[omikujiId]?.weight }}/{{
                    weightTotal(enabledIds)
                  }}
                  <span class="ml-2"
                    >({{ weightPercentage(omikujiId, enabledIds) }}%)</span
                  >
                </v-chip>
              </v-sheet>
            </v-card-text>
          </v-card>
        </v-col>
      </template>
    </draggable>
  </v-row>
  <v-sheet>
    <v-btn
      block
      @click="addItemOmikuji"
      color="primary"
      variant="flat"
      class="mt-6"
    >
      <v-icon left>mdi-plus</v-icon> 🥠 おみくじの追加
    </v-btn>
  </v-sheet>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ListRulesWeight from "./ListRulesWeight.vue";
import PartsToolbarAction from "./common/PartsToolbarAction.vue";
import { FunkRules } from "../composables/FunkRules";
import { FunkOmikuji } from "../composables/FunkOmikuji";
import { FunkThreshold } from "../composables/FunkThreshold";
import draggable from "vuedraggable";
import type {
  ListCategory,
  ListEntry,
  OmikenCategory,
  OmikenEntry,
  OmikenType,
} from "@/types";

const props = defineProps<{
  Omiken: OmikenType;
  ruleId?: string;
  enabledIds: string[];
}>();

const emit = defineEmits<{
  (e: "update:enabledIds", ids: string[]): void;
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

// コンポーザブル:funkRules
const { weightTotal, weightPercentage, omikujiLists, weightColor } =
  FunkRules();
// コンポーザブル:FunkOmikuji
const { getOnecommeContent, getPostTypeColor } = FunkOmikuji();

// コンポーザブル:funkThreshold
const { isThreshold, getExampleText } = FunkThreshold();

// ドラッグ&ドロップでの更新も同様に
const localEnabledIds = computed({
  get: () => [...props.enabledIds],
  set: (value) => {
    emit("update:enabledIds", value);
  },
});

// omikujiのエディターを開く
const openEditorItem = (type: ListCategory, id: string) => {
  // typeは'rules'か'omikuji'か'place'のいずれか
  if (
    (type === "omikuji" && props.Omiken.omikuji?.[id]) ||
    (type === "place" && props.Omiken.place?.[id]) ||
    (type === "rules" && props.Omiken.rules?.[id])
  ) {
    emit("open-editor", {
      isOpen: true,
      type,
      mode: null,
      key: id,
    });
  }
};

// アイテムを追加
const addItemOmikuji = () => {
  if (props.ruleId) {
    emit("update:Omiken", {
      type: "omikuji",
      addKeys: [{ rulesId: props.ruleId }],
    });
  }
};

// update:enabledIdsのみを発火
const updateEnabledIds = () => {
  emit("update:enabledIds", localEnabledIds.value);
};
const updateOmiken = (payload: OmikenEntry<OmikenCategory>) =>
  emit("update:Omiken", payload);
</script>
