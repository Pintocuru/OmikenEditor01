<!-- src/components/ListOmikuji.vue -->
<template>
  <!-- Omikuji List View -->
  <v-row dense>
    <v-col
      v-for="omikujiId in sortedOmikujiIds"
      :key="omikujiId"
      cols="12"
      sm="6"
      md="4"
      lg="3"
    >
      <v-card variant="tonal">
        <!-- タイトルバーと操作ボタン -->
        <v-toolbar
          density="compact"
          :color="getPostTypeColor(Omiken.omikujis[omikujiId].post, true)"
        >
          <v-toolbar-title @click="openEditorItem('omikujis', omikujiId)">
            <span v-if="isThreshold(Omiken.omikujis[omikujiId]?.threshold)"
              >🔐</span
            >
            {{ Omiken.omikujis[omikujiId]?.name }}
          </v-toolbar-title>
          <template #append>
            <PartsArrayAction
            category="omikujis"
              :omikujiEntry="Omiken.omikujis[omikujiId]"
              @edit="openEditorItem('omikujis', omikujiId)"
              @update:Omiken="updateOmiken"
            />
          </template>
        </v-toolbar>

        <!-- おみくじ内容 -->
        <v-card-text class="py-4">
          <v-sheet class="pb-3" v-if="Omiken.omikujis[omikujiId]?.post">
            {{ getOnecommeContent(Omiken.omikujis[omikujiId].post) }}
          </v-sheet>

          <v-sheet class="list-group d-flex flex-wrap">
            <!-- 発動条件の表示 -->
            <v-chip
              v-if="isThreshold(Omiken.omikujis[omikujiId]?.threshold)"
              density="compact"
              variant="outlined"
              color="yellow lighten-3"
            >
              🔐 {{ getExampleText(Omiken.omikujis[omikujiId].threshold) }}
            </v-chip>
            <!-- 既存の出現割合表示 -->
            <v-chip density="compact" variant="text">
              🎯 {{ Omiken.omikujis[omikujiId]?.weight }}
            </v-chip>
          </v-sheet>
        </v-card-text>
      </v-card>
    </v-col>
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
import PartsArrayAction from "./common/PartsArrayAction.vue";
import { FunkOmikuji } from "../composables/FunkOmikuji";
import { FunkThreshold } from "../composables/FunkThreshold";
import type {
  ListCategory,
  ListEntry,
  OmikenEntryType,
  OmikenEntry,
  OmikenType,
} from "@/types/index";
import { FunkEmits } from "@/composables/FunkEmits";

const props = defineProps<{
  Omiken: OmikenType;
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenEntryType>): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

// コンポーザブル:FunkEmits
const { updateOmiken, openEditorItem } = FunkEmits(emit);
// コンポーザブル:FunkOmikuji
const { getOnecommeContent, getPostTypeColor } = FunkOmikuji();
// コンポーザブル:FunkThreshold
const { isThreshold, getExampleText } = FunkThreshold();

// おみくじIDをソートして取得
const sortedOmikujiIds = computed(() =>
  Object.keys(props.Omiken.omikujis).sort((a, b) =>
    (props.Omiken.omikujis[a]?.name || "").localeCompare(
      props.Omiken.omikujis[b]?.name || ""
    )
  )
);

// アイテムを追加
const addItemOmikuji = () => {
  emit("update:Omiken", {
    type: "omikuji",
    addKeys: [{}],
  });
};
</script>
