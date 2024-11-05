<!-- src/components/ListEntryOmikuji.vue -->
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
    @update:modelValue="updateItem"
  />
    <!-- Omikuji View -->
  <v-row no-gutters>
    <draggable
      v-model="localEnabledIds"
      item-key="id"
      class="list-group d-flex flex-wrap"
      @end="updateEnabledIds"
    >
      <template #item="{ element: omikujiId }">
        <v-col cols="12" sm="6" md="4" lg="3" class="pa-1">
          <v-card variant="tonal" :color="weightColor(omikujiId, enabledIds)">
            <!-- タイトルバーと操作ボタン -->
            <v-toolbar
              density="compact"
              :color="getTypeColor(Omiken.omikuji[omikujiId].post)"
              ><!--   -->
              <v-icon class="mx-2">mdi-drag-horizontal-variant</v-icon>
              <v-toolbar-title
                class="ml-2"
                @click="openEditorItem('omikuji', omikujiId)"
              >
                {{ Omiken.omikuji[omikujiId]?.name }}
              </v-toolbar-title>
              <template #append>
                <ListItemPartsAction
                  selectCategory="omikuji"
                  :item="Omiken.omikuji[omikujiId]"
                  @edit="openEditorItem('omikuji', omikujiId)"
                  @update:Omiken="updateOmiken"
                />
              </template>
            </v-toolbar>

            <v-card-title
              class="d-flex justify-space-between align-center pa-2"
            >
              <span class="text-subtitle-1">{{
                Omiken.omikuji[omikujiId]?.name
              }}</span>
              <div class="d-flex align-center"></div>
            </v-card-title>

            <!-- 重みの表示 -->
            <v-card-text class="text-center pt-2">
              {{ Omiken.omikuji[omikujiId]?.weight }}/{{
                weightTotal(enabledIds)
              }}
              <span class="ml-2"
                >({{ weightPercentage(omikujiId, enabledIds) }}%)</span
              >
            </v-card-text>
          </v-card>
        </v-col>
      </template>
    </draggable>
  </v-row>
</template>

<script setup lang="ts">
import { computed, inject, Ref } from "vue";
import ListItemPartsAction from "./common/ListItemPartsAction.vue";
import { funkRules } from "@/composables/funkRules";
import draggable from "vuedraggable";
import type {
  AppStateType,
  ListCategory,
  ListEntry,
  OmikenCategory,
  OmikenEntry,
  OmikenType,
  OmikujiPostType,
  OmikujiType,
} from "@/types";

const props = defineProps<{
  Omiken: OmikenType;
  ruleId?: string; // オプショナルに
  enabledIds: string[];
}>();

const emit = defineEmits<{
  (e: "update:enabledIds", ids: string[]): void;
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

// コンポーザブル
const { weightTotal, weightPercentage, omikujiLists, weightColor } = funkRules(
  props.Omiken.omikuji
);

// タイプによる色分け
// getTypeColor関数の実装
const getTypeColor = (post: OmikujiPostType[]): string => {
  // まず、postの中でtype属性が'onecomme'のものがあるかチェックする
  const onecommePost = post.find((p) => p.type === "onecomme");
  if (onecommePost) {
    // 'onecomme'タイプがあれば、getCharaColorを呼び出して返す
    return getCharaColor(onecommePost.botKey);
  }

  // 'onecomme'がなければ、最初のtypeを判断して色を返す
  const firstPost = post[0];
  switch (firstPost.type) {
    case "party":
      return "bg-purple-lighten-5";
    case "toast":
      return "bg-orange-lighten-5";
    case "speech":
      return "bg-green-lighten-5";
    default:
      return "";
  }
};

// inject
const AppState = inject<Ref<AppStateType>>("AppStateKey");
const CHARA = AppState?.value.CHARA;

// CHARA の背景色を取得
const getCharaColor = (botKey: string | undefined): string | undefined => {
  // AppStateからCHARAデータを取得
  if (!botKey || !CHARA?.[botKey] || !CHARA[botKey].item) return undefined;

  // CHARA[botKey].item.colorから背景色を取得して返す
  return CHARA[botKey].item?.color["--lcv-background-color"];
};

// ドラッグ&ドロップでの更新も同様に
const localEnabledIds = computed({
  get: () => [...props.enabledIds],
  set: (value) => {
    emit("update:enabledIds", value);
  },
});

// 更新処理
const updateItem = () => {
  if (localEnabledIds.value) {
    emit("update:Omiken", {
      type: "rules",
      update: { [localEnabledIds.value.id]: localEnabledIds.value },
    });
  }
};

// omikujiのエディターを開く
const openEditorItem = (type: ListCategory, id: string) => {
  // typeは'rules'か'omikuji'か'place'のいずれか
  const item =
    type === "omikuji"
      ? props.Omiken.omikuji?.[id]
      : type === "place"
      ? props.Omiken.place?.[id]
      : props.Omiken.rules?.[id];

  if (item) {
    emit("open-editor", {
      isOpen: true,
      type,
      mode: null,
      key: id,
    });
  }
};

// update:enabledIdsのみを発火
const updateEnabledIds = () => {
  emit("update:enabledIds", localEnabledIds.value);
};
// ダイアログを開く
const openEditor = (editorItem: ListEntry<ListCategory>) =>
  emit("open-editor", editorItem);
const updateOmiken = (payload: OmikenEntry<OmikenCategory>) =>
  emit("update:Omiken", payload);
</script>
