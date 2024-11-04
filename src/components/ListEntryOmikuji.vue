<!-- src/components/ListEntryOmikuji.vue -->
<template>
  <v-card-text><!--  :class="getTypeColor(Omiken.omikuji[omikujiId].post.type)" -->
    <v-row no-gutters>
      <draggable v-model="localEnabledIds" item-key="id" class="list-group d-flex flex-wrap" @end="updateEnabledIds">
        <template #item="{ element: omikujiId }">
          <v-col cols="12" sm="6" md="4" lg="3" class="pa-1">
            <v-card variant="outlined" :color="weightColor(omikujiId, enabledIds)">
              <!-- タイトルバーと操作ボタン -->
              <v-card-title class="d-flex justify-space-between align-center pa-2">
                <span class="text-subtitle-1">{{ Omiken.omikuji[omikujiId]?.name }}</span>
                <div class="d-flex align-center">
                  <v-btn
                    icon="mdi-pencil"
                    density="comfortable"
                    variant="text"
                    size="small"
                    class="mr-1"
                    @click.stop="openEditorOmikuji(Omiken.omikuji[omikujiId])"
                  >
                    <v-tooltip activator="parent" location="top">編集</v-tooltip>
                  </v-btn>
                  <v-btn
                    icon="mdi-content-copy"
                    density="comfortable"
                    variant="text"
                    size="small"
                    class="mr-1"
                    @click.stop="duplicateOmikuji(omikujiId)"
                  >
                    <v-tooltip activator="parent" location="top">複製</v-tooltip>
                  </v-btn>
                  <v-btn
                    icon="mdi-delete"
                    density="comfortable"
                    variant="text"
                    size="small"
                    color="error"
                    @click.stop="deleteOmikuji(omikujiId)"
                  >
                    <v-tooltip activator="parent" location="top">削除</v-tooltip>
                  </v-btn>
                </div>
              </v-card-title>

              <!-- 重みの表示 -->
              <v-card-text class="text-center pt-2">
                {{ Omiken.omikuji[omikujiId]?.weight }}/{{ weightTotal(enabledIds) }}
                <span class="ml-2">({{ weightPercentage(omikujiId, enabledIds) }}%)</span>
              </v-card-text>
            </v-card>
          </v-col>
        </template>
      </draggable>
    </v-row>
  </v-card-text>
</template>

<script setup lang="ts">
import { computed, inject, Ref } from "vue";
import { funkRules } from "@/composables/funkRules";
import draggable from "vuedraggable";
import type { AppStateType, ListEntry, OmikenType, OmikujiType } from "@/types";

const props = defineProps<{
  Omiken: OmikenType;
  ruleId?: string; // オプショナルに
  enabledIds: string[];
}>();

const emit = defineEmits<{
  (e: "update:enabledIds", ids: string[]): void;
  (e: "open-editor", item: ListEntry<"omikuji">): void;
}>();

// コンポーザブル
const { weightTotal, weightPercentage, weightColor } = funkRules(
  props.Omiken.omikuji
);

// 複製ハンドラー //TODO 書いて
const duplicateOmikuji = (id: string) => {
  emit("duplicate", id);
};

// 削除ハンドラー //TODO 書いて
const deleteOmikuji = (id: string) => {
  emit("delete", id);
};

// omikujiのエディターを開く
const openEditorOmikuji = (omikuji: OmikujiType) => {
  emit("open-editor", {
    isOpen: true,
    type: "omikuji",
    mode: null,
    key: omikuji.id,
  });
};

// タイプによる色分け
const getTypeColor = (type: string): string => {
  switch (type) {
    case 'onecomme':
      return getCharaColor(); // 既存の関数を使用
    case 'party':
      return 'bg-purple-lighten-5';
    case 'toast':
      return 'bg-orange-lighten-5';
    case 'speech':
      return 'bg-green-lighten-5';
    default:
      return '';
  }
};

// inject
const AppState = inject<Ref<AppStateType>>("AppStateKey");
const CHARA = AppState?.value.CHARA;

// CHARA の背景色を取得
const getCharaColor = (botKey: string | undefined) => {
  if (!botKey || !CHARA?.[botKey]) return undefined;
  return CHARA[botKey].color["--lcv-background-color"];
};

// ドラッグ&ドロップでの更新も同様に
const localEnabledIds = computed({
  get: () => [...props.enabledIds],
  set: (value) => {
    emit("update:enabledIds", value);
  },
});

// update:enabledIdsのみを発火
const updateEnabledIds = () => {
  emit("update:enabledIds", localEnabledIds.value);
};
</script>
