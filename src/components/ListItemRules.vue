<!-- src/components/ListItemRules.vue -->
<template>
  <v-col cols="12">
    <v-card @click.stop="openEditorRules">
      <v-toolbar :color="item.color" density="compact">
        <v-toolbar-title>
          {{ item.name }}
          <v-chip class="ml-4" label variant="outlined">
            {{ enabledOmikujiLists.length }} items <!-- おみくじの個数に変更 -->
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
              sm="4"
              md="3"
              class="pa-1"
            >
              <v-sheet
                class="d-flex justify-space-between align-center px-2 py-1"
                
              >
                <span class="font-weight-bold">
                  {{ option.name }}
                </span>
                <span>
                  <span  >
                    {{ option.weight }}/{{ totalWeight() }}
                  </span>
                  <span class="ml-1">
                    ({{ totalWeightPercentage(option.id) }}%)
                  </span>
                </span>
              </v-sheet>
            </v-col>
          </v-row>
        </v-sheet>
        <v-sheet class="mt-2">
          <span
            v-if="item.matchStartsWith && item.matchStartsWith.length > 0"
            class="mr-4"
          >
            <v-icon color="primary">mdi-arrow-right-bold-box</v-icon>
            {{ item.matchStartsWith.join(", ") }}
          </span>
                    <span            v-else            class="mr-4"          >
            <v-icon color="primary">mdi-arrow-right-bold-box</v-icon>
            (すべてのコメントが対象)
          </span>
        </v-sheet>
      </v-card-text>
    </v-card>
  </v-col>
</template>

<script setup lang="ts">
import { computed, inject, ref, Ref } from "vue";
import {
  ListEntry,
  ListCategory,
  RulesType,
  OmikenEntry,
  OmikenType,
  OmikenCategory,
  AppStateType,
} from "@/types";
import ListItemPartsAction from "./common/ListItemPartsAction.vue";
import { funkRules } from "../composables/funkRules";

// Props Emits
const props = defineProps<{
  Omiken: OmikenType;
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

// props.itemをrefでラップ
const currentItem = ref(props.item);

// コンポーザブル:funkRules
const {
  weightTotal: totalWeight,
  weightPercentage: totalWeightPercentage,
  getSwitchLabel,
  getSwitchColor,
  weightColor,
  omikujiLists,
  enabledOmikujiLists,
} = funkRules(omikuji, omikujiOrder, currentItem);

// すべてのおみくじが無効かどうかを確認
const isAllDisabled = computed(() => {
  return (
    props.item?.enabledIds?.length === Object.keys(props.Omiken.omikuji).length
  );
});

// Rulesのエディターを開く
function openEditorRules() {
  const key = props.item.id;
  emit("open-editor", {
    isOpen: true,
    type: "rules",
    mode:null,
    key,
  });
}

// Omikenの更新をemit
function updateOmiken(payload: OmikenEntry<OmikenCategory>) {
  emit("update:Omiken", payload);
}
</script>
