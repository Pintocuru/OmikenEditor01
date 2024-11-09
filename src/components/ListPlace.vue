<!-- src/components/ListPlace.vue -->
<template>
  <!-- Place List View -->
  <v-row dense>
    <v-col
      v-for="placeId in sortedPlaceIds"
      :key="placeId"
      cols="12"
      sm="6"
      md="4"
      lg="3"
    >
      <v-card variant="tonal">
        <!-- タイトルバーと操作ボタン -->
        <v-toolbar density="compact">
          <v-toolbar-title
            class="ml-4"
            @click="openEditorItem('place', placeId)"
          >
            {{ Omiken.place[placeId]?.name }}
          </v-toolbar-title>
          <template #append>
            <ListItemPartsAction
              selectCategory="place"
              :item="Omiken.place[placeId]"
              @edit="openEditorItem('place', placeId)"
              @update:Omiken="updateOmiken"
            />
          </template>
        </v-toolbar>

        <!-- プレースホルダー内容 -->
        <v-card-text class="py-4">
          <div class="list-group d-flex flex-wrap">
            <template
              v-for="(value, index) in getRandomValues(
                Omiken.place[placeId].values,
                3
              )"
              :key="index"
            >
              <span class="mr-2">{{ value }}</span>
            </template>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <v-sheet>
    <v-btn
      block
      @click="addItemPlace"
      color="primary"
      variant="flat"
      class="mt-6"
    >
      <v-icon left>mdi-plus</v-icon> 📍 プレースホルダーの追加
    </v-btn>
  </v-sheet>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ListItemPartsAction from "./common/PartsToolbarAction.vue";
import type {
  ListCategory,
  ListEntry,
  OmikenCategory,
  OmikenEntry,
  OmikenType,
  PlaceValueType,
} from "@/types";
import { FunkEmits } from "@/composables/FunkEmits";

const props = defineProps<{
  Omiken: OmikenType;
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

// コンポーザブル:FunkEmits
const { updateOmiken, openEditorItem } = FunkEmits(emit);

// プレースホルダーIDをソートして取得
const sortedPlaceIds = computed(() => {
  return Object.keys(props.Omiken.place).sort((a, b) => {
    const nameA = props.Omiken.place[a]?.name || "";
    const nameB = props.Omiken.place[b]?.name || "";
    return nameA.localeCompare(nameB);
  });
});

// プレースホルダーの値をランダムに3つ取得
const getRandomValues = (values: PlaceValueType[], count: number) => {
  const shuffledValues = [...values].sort(() => Math.random() - 0.5);
  return shuffledValues.slice(0, count).map((v) => v.value);
};

// アイテムを追加
const addItemPlace = () => {
  emit("update:Omiken", {
    type: "place",
    addKeys: [{}],
  });
};
</script>
