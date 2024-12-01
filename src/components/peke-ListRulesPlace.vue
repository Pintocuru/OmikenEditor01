<!-- src/components/ListRulesPlace.vue -->
<!-- ! おそらく使わない-->>
<template>
  <v-row dense>
    <v-col
      v-for="place in getRulesOfPlaces"
      :key="place.id"
      cols="12"
      sm="4"
      md="3"
    >
      <v-card>
        <v-toolbar density="compact">
          <v-toolbar-title
            class="ml-3"
            @click="openEditorItem('places', place.id)"
          >
            {{ place.name }}
            <!-- アイテム数を表示 -->
            <span v-if="place.values.length > 0">
              <v-badge
                :content="place.values.length"
                color="primary"
                class="ml-3"
                style="transform: translateY(-8px)"
              />
            </span>
            <!-- 長さが0の場合 -->
            <span v-else>
              <v-icon color="error">mdi-alert-circle</v-icon>
            </span>
          </v-toolbar-title>
          <template #append>
            <v-btn icon size="small" @click="openEditorItem('place', place.id)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </template>
        </v-toolbar>
        <v-card-text @click="shuffleValue(place.id, place.values)">
          {{ randomValues[place.id] }}
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import {
  ListCategory,
  ListEntry,
  OmikenCategory,
  OmikenEntry,
  OmikenType,
  PlaceValueType,
} from "@/types/index";
import { ref, watchEffect } from "vue";
import { FunkRules } from "../composables/FunkRules";
import { FunkEmits } from "../composables/FunkEmits";

const props = defineProps<{
  Omiken: OmikenType;
  enableIds?: string[];
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

// コンポーザブル:FunkEmits
const { openEditorItem } = FunkEmits(emit);

// コンポーザブル:FunkRules
const { rulesOfPlaces } = FunkRules();
const getRulesOfPlaces = rulesOfPlaces(props.Omiken, props.enableIds);

// ランダムでvaluesの内容を表示させる
const randomValues = ref<Record<string, string>>({});
const shuffleValue = (placeId: string, values: PlaceValueType[]) => {
  randomValues.value[placeId] = getRandomValue(values);
};
const getRandomValue = (values: PlaceValueType[]) => {
  return values[Math.floor(Math.random() * values.length)].value;
};
watchEffect(() => {
  getRulesOfPlaces.value.forEach((place) => {
    if (!randomValues.value[place.id]) {
      shuffleValue(place.id, place.values);
    }
  });
});
</script>
