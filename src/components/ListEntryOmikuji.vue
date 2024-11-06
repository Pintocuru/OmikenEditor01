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
    @update:modelValue="(value) => emit('update:enabledIds', value)"
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
              :color="getTypeColor(Omiken.omikuji[omikujiId].post, true)"
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
                <ListItemPartsAction
                  selectCategory="omikuji"
                  :rule-id="ruleId"
                  :item="Omiken.omikuji[omikujiId]"
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

              <span class="list-group d-flex flex-wrap">
                <!-- 既存の出現割合表示 -->
                🎯 {{ Omiken.omikuji[omikujiId]?.weight }}/{{
                  weightTotal(enabledIds)
                }}
                <span class="ml-2"
                  >({{ weightPercentage(omikujiId, enabledIds) }}%)</span
                >

                <!-- 発動条件の表示 -->
                <span
                  v-if="
                    Omiken.omikuji[omikujiId]?.threshold?.conditionType !==
                    'none'
                  "
                  class="ml-4"
                >
                  🔐{{ getExampleText(Omiken.omikuji[omikujiId].threshold) }}
                </span>
              </span>
            </v-card-text>
          </v-card>
        </v-col>
      </template>
    </draggable>
  </v-row>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ListItemPartsAction from "./common/ListItemPartsAction.vue";
import { funkRules } from "../composables/funkRules";
import { FunkOmikuji, FunkOmikujiHoge } from "../composables/FunkOmikuji";
import { funkThreshold } from "../composables/funkThreshold";
import draggable from "vuedraggable";
import type {
  ListCategory,
  ListEntry,
  OmikenCategory,
  OmikenEntry,
  OmikenType,
  OmikujiPostType,
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
const omikuji = computed(() => props.Omiken.omikuji);
const { weightTotal, weightPercentage, omikujiLists, weightColor } =
  funkRules();
// コンポーザブル:FunkOmikuji
const { getCharaColor, getOnecommeContent } = FunkOmikuji();
const {} = FunkOmikujiHoge();

// コンポーザブル:funkThreshold
const { items, isThreshold, getExampleText } = funkThreshold();

// postからonecommeを探し色を取得する
const getTypeColor = (
  post: OmikujiPostType[],
  isBotcolor?: boolean
): string => {
  const onecommePost = post.find((p) => p.type === "onecomme");
  if (onecommePost?.botKey && isBotcolor) {
    return getCharaColor(onecommePost.botKey) ?? "grey";
  }

  // 'onecomme'がなければ、最初のtypeを判断して色を返す
  const firstPost = post[0];
  switch (firstPost.type) {
    case "party":
      return "deep-orange";
    case "toast":
      return "blue";
    case "speech":
      return "green";
    default:
      return "";
  }
};

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
const addItem = () => {
  if (props.ruleId) {
    emit("update:Omiken", {
      type: "omikuji",
      addKeys: [
        {

          rulesId: props.ruleId,
        },
      ],
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
