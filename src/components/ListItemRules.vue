<!-- src/components/ListItemRules.vue -->
<template>
  <v-col cols="12">
    <v-card @click.stop="openEditor">
      <v-toolbar :color="getSwitchColor(item.switch)" density="compact">
        <v-toolbar-title>
          {{ item.name }}
          <v-chip class="ml-4" label variant="outlined">
            {{ getSwitchLabel(item.switch) }}</v-chip
          >
        </v-toolbar-title>
        <template v-slot:append>
          <ListItemPartsAction
            :selectCategory="selectCategory"
            :item="item"
            @edit="openEditor"
            @update:STATE="updateSTATE"
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
              v-for="option in validOmikujiOptions"
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
          <span v-if="item.matchExact && item.matchExact.length > 0" class="mr-4">
            <v-icon color="primary">mdi-equal-box</v-icon>
            {{ item.matchExact.join(", ") }}
          </span>
          <span v-if="item.matchStartsWith && item.matchStartsWith.length > 0" class="mr-4">
            <v-icon color="primary">mdi-arrow-right-bold-box</v-icon>
            {{ item.matchStartsWith.join(", ") }}
          </span>
          <span v-if="item.matchIncludes && item.matchIncludes.length > 0" class="mr-4">
            <v-icon color="primary">mdi-contain</v-icon>
            {{ item.matchIncludes.join(", ") }}
          </span>
        </v-sheet>
      </v-card-text>
    </v-card>
  </v-col>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  EditorItem,
  ItemCategory,
  rulesType,
  SelectItem,
  STATEType,
} from "@/types";
import ListItemPartsAction from "./common/ListItemPartsAction.vue";
import { useSwitchStyles } from "../composables/useSwitchStyles";
import _ from "lodash";
// Props Emits
const props = defineProps<{
  STATE: STATEType;
  item: rulesType;
  selectCategory: ItemCategory;
}>();

const emit = defineEmits<{
  (e: "update:STATE", payload: SelectItem): void;
  (e: "open-editor", editorItem: EditorItem): void;
}>();

// 0～4のswitchによって色を変える
const { chipColors, getSwitchLabel, getSwitchColor, getWeightColor } =
  useSwitchStyles(props.STATE.omikuji, props.item);

// コンポーザブルを使うとcomputedがインポテンツなので直接書く
const validOmikujiOptions = computed(() => {
  const omikujiOptions = Object.entries(props.STATE.omikuji).map(
    ([id, data]) => ({
      id,
      name: data.name,
      weight: data.weight,
    })
  );

  // disabledIdsが存在しないか、Arrayでない場合はすべてのオプションを返す
  if (!Array.isArray(props.item?.disabledIds)) {
    return omikujiOptions;
  }

  // disabledIdsに含まれていないオプションのみを返す
  return omikujiOptions.filter(
    (option) => !props.item.disabledIds.includes(option.id)
  );
});

// すべてのおみくじが無効かどうかを確認
const isAllDisabled = computed(() => {
  return (
    props.item?.disabledIds?.length === Object.keys(props.STATE.omikuji).length
  );
});

// エディターを開く
function openEditor() {
  const item = { [props.item.id]: props.item };
  emit("open-editor", {
    type: props.selectCategory,
    item: item,
  });
}

// おみくじのエディターを開く
const openEditorOmikuji = (option: { id: string; name: string }) => {
  const omikuji = props.STATE.omikuji?.[option.id];
  if (omikuji) {
    emit("open-editor", {
      type: "omikuji",
      item: { [option.id]: omikuji },
    });
  }
};

// STATEの更新をemit
function updateSTATE(payload: SelectItem) {
  emit("update:STATE", payload);
}
</script>
