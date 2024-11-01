<!-- src/components/ListItemRules.vue -->
<template>
  <v-col cols="12">
    <v-card @click.stop="openEditorRules">
      <v-toolbar :color="getSwitchColor(item.switch)" density="compact">
        <v-toolbar-title>
          {{ item.name }}
          <v-chip class="ml-4" label variant="outlined">
            {{ getSwitchLabel(item.switch) }}
          </v-chip>
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
        <v-sheet v-else>
          <v-row no-gutters>
            <v-col
              v-for="option in enabledOmikujiLists"
              :key="option.id"
              cols="12"
              sm="6"
              md="4"
              lg="3"
              class="pa-1"
            >
              <v-card
                class="d-flex justify-space-between align-center px-2 py-1"
                variant="outlined"
                color="grey"
              >
                <span class="font-weight-bold">
                  {{ option.name }}
                </span>
                <span>
                  <span :style="{ color: weightColor(option.id) }">
                    {{ option.weight }}/{{ totalWeight() }}
                  </span>
                  <span class="ml-2">
                    ({{ totalWeightPercentage(option.id) }}%)
                  </span>
                </span>
              </v-card>
            </v-col>
          </v-row>
        </v-sheet>
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
import { computed, inject, Ref } from "vue";
import {
  ListEntry,
  ListCategory,
  RulesType,
  OmikenEntry,
  OmikenEditType,
  OmikenCategory,
  AppStateType,
} from "@/types";
import ListItemPartsAction from "./common/ListItemPartsAction.vue";
import { funkRules } from "../composables/funkRules";
import _ from "lodash";
// Props Emits
const props = defineProps<{
  Omiken: OmikenEditType;
  item: RulesType;
  naviCategory: ListCategory;
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

// inject
const AppState = inject<Ref<AppStateType>>("AppStateKey");
const omikuji = AppState?.value.Omiken.omikuji;
const omikujiOrder = AppState?.value.Omiken.omikujiOrder;

// コンポーザブル:funkRules
const {
  totalWeight,
  totalWeightPercentage,
  getSwitchLabel,
  getSwitchColor,
  weightColor,
  omikujiLists,
  enabledOmikujiLists,
} = funkRules(omikuji, omikujiOrder, props.item);

// すべてのおみくじが無効かどうかを確認
const isAllDisabled = computed(() => {
  return (
    props.item?.enabledIds?.length === Object.keys(props.Omiken.omikuji).length
  );
});

// Rulesのエディターを開く
function openEditorRules() {
  const item = { [props.item.id]: props.item };
  const key = props.item.id;
  emit("open-editor", {
    isOpen: true,
    type: "rules",
    key,
    item: item,
  });
}

// omikujiのエディターを開く
const openEditorOmikuji = (option: { id: string; name: string }) => {
  const omikujiKey = props.Omiken.omikuji?.[option.id];
  if (omikujiKey) {
    emit("open-editor", {
      isOpen: true,
      type: "omikuji",
      key: option.id,
      item: { [option.id]: omikujiKey },
    });
  }
};

// Omikenの更新をemit
function updateOmiken(payload: OmikenEntry<OmikenCategory>) {
  emit("update:Omiken", payload);
}
</script>
