<!-- src/components/ListItemRules.vue -->
<template>
  <v-col cols="12">
    <v-card @click.stop="openEditorRules">
      <v-toolbar :color="getSwitchColor(item.switch)" density="compact">
        <v-toolbar-title>
          {{ item.name }}
          <v-chip class="ml-4" label variant="outlined">
            {{ getSwitchLabel(item.switch) }}</v-chip
          >
        </v-toolbar-title>
        <template v-slot:append>
          <ListItemPartsAction
            :selectCategory="naviCategory"
            :item="item"
            @edit="openEditorRules"
            @update:Omiken="updateOmiken"
          />
        </template>
      </v-toolbar>
      <v-card-text>
        <v-alert v-if="isAllDisabled" type="warning">
          おみくじが選択されていません
        </v-alert>
        <v-chip-group v-else>
          <v-hover v-slot="{ isHovering, props }">
            <v-card
              v-for="option in enabledOmikujiLists"
              :key="option.id"
              class="ma-1 d-inline-block"
              min-width="100"
              :color="getWeightColor(option.id)"
              variant="outlined"
              v-bind="props"
              @click.stop="openEditorOmikuji(option)"
            >
              <v-card-text class="text-center">
                {{ option.name }}
              </v-card-text>
            </v-card>
          </v-hover>
        </v-chip-group>
        <v-sheet class="mt-2">
          <span
            v-if="item.matchExact && item.matchExact.length > 0"
            class="mr-4"
          >
            <v-icon color="primary">mdi-equal-box</v-icon>
            {{ item.matchExact.join(", ") }}
          </span>
          <span
            v-if="item.matchStartsWith && item.matchStartsWith.length > 0"
            class="mr-4"
          >
            <v-icon color="primary">mdi-arrow-right-bold-box</v-icon>
            {{ item.matchStartsWith.join(", ") }}
          </span>
          <span
            v-if="item.matchIncludes && item.matchIncludes.length > 0"
            class="mr-4"
          >
            <v-icon color="primary">mdi-contain</v-icon>
            {{ item.matchIncludes.join(", ") }}
          </span>
        </v-sheet>
      </v-card-text>
    </v-card>
  </v-col>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  ListEntry,
  ListCategory,
  RulesType,
  OmikenEntry,
  OmiEditType,
  OmikenCategory,
} from "@/types";
import ListItemPartsAction from "./common/ListItemPartsAction.vue";
import { funkRules } from "../composables/funkRules";
import _ from "lodash";
// Props Emits
const props = defineProps<{
  Omiken: OmiEditType;
  item: RulesType;
  naviCategory: ListCategory;
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

// 0～4のswitchによって色を変える
const { getSwitchLabel, getSwitchColor, getWeightColor } = funkRules(
  props.Omiken.omikuji,
  props.item
);

// コンポーザブルを使うとcomputedがインポテンツなので直接書く
const enabledOmikujiLists = computed(() => {
  const omikujiOptions = Object.entries(props.Omiken.omikuji).map(
    ([id, data]) => ({
      id,
      name: data.name,
      weight: data.weight,
    })
  );
  // enabledIdsが空なら、すべてのオプションを返す
  if (!Array.isArray(props.item?.enabledIds)) return omikujiOptions;

  // enabledIdsに含まれているオプションを返す
  return omikujiOptions.filter((option) =>
    props.item.enabledIds.includes(option.id)
  );
});

// すべてのおみくじが無効かどうかを確認
const isAllDisabled = computed(() => {
  return (
    props.item?.enabledIds?.length === Object.keys(props.Omiken.omikuji).length
  );
});

// エディターを開く
function openEditorRules() {
  const item = { [props.item.id]: props.item };
  emit("open-editor", {
    isOpen: true,
    type: "rules",
    item: item,
  });
}

// おみくじのエディターを開く
const openEditorOmikuji = (option: { id: string; name: string }) => {
  const omikuji = props.Omiken.omikuji?.[option.id];
  if (omikuji) {
    emit("open-editor", {
      isOpen: true,
      type: "omikuji",
      item: { [option.id]: omikuji },
    });
  }
};

// Omikenの更新をemit
function updateOmiken(payload: OmikenEntry<OmikenCategory>) {
  emit("update:Omiken", payload);
}
</script>
