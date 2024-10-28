<!-- src/components/DialogRule.vue -->
<template>
  <v-card v-if="currentItem">
    <v-card-text>
      <v-row dense>
        <v-col cols="12" sm="4">
          <v-text-field
            v-model="currentItem.name"
            label="おみくじ名"
            @input="updateItem"
          />
        </v-col>
        <v-col cols="12" sm="8">
          <v-slider
            v-model="currentItem.switch"
            :max="4"
            :ticks="switchLabels"
            show-ticks="always"
            step="1"
            tick-size="4"
            :color="getSwitchColor(currentItem.switch)"
            @update:modelValue="updateItem"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="6">
          <v-select
            v-model="currentItem.enabledIds"
            :items="omikujiOptions"
            label="有効にするID"
            chips
            multiple
            item-title="name"
            item-value="id"
            @update:modelValue="updateItem"
          />
          <v-alert v-if="validOmikujiOptions.length === 0" type="warning">
            少なくとも1つのおみくじを有効にしてください
          </v-alert>
          <v-chip-group v-else>
            <v-hover v-slot="{ props }">
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
        </v-col>
        <v-col cols="12" sm="6">
          <v-combobox
            v-for="(label, key) in matchLabels"
            :key="key"
            v-model="currentItem[key]"
            :label="label"
            clearable
            chips
            multiple
            @update:modelValue="updateItem"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
  <v-alert v-else type="warning"
    >アイテムが選択されていないか、データの形式が正しくありません。</v-alert
  >
</template>

<script setup lang="ts">
import { computed, inject, Ref } from "vue";
import type {
  ListEntry,
  STATEEntry,
  ListCategory,
  STATECategory,
  AppStateType,
} from "../types";
import { useSwitchStyles } from "../composables/useSwitchStyles";

// props/emits
const props = defineProps<{
  entry: ListEntry<"rules"> | null;
}>();

const emit = defineEmits<{
  (e: "update:STATE", payload: STATEEntry<STATECategory>): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

// inject
const AppState = inject<Ref<AppStateType>>("AppStateKey");
const omikuji = AppState?.value.STATE.omikuji;

// propsからデータを解読
const currentItem = computed(() => {
  const item = props.entry?.item;
  return item ? Object.values(item)[0] : null;
});

// コンポーザブルの使用
const {
  switchLabels,
  getSwitchColor,
  omikujiOptions,
  validOmikujiOptions,
  getWeightColor,
} = useSwitchStyles(
  omikuji,
  props.entry?.item && Object.values(props.entry.item)[0]
);

// マッチングのラベル
const matchLabels = {
  matchExact: "完全一致",
  matchStartsWith: "前方一致",
  matchIncludes: "部分一致",
};

// 更新処理
const updateItem = () => {
  if (currentItem.value) {
    emit("update:STATE", {
      type: "rules",
      update: { [currentItem.value.id]: currentItem.value },
    });
  }
};

// おみくじのエディターを開く
const openEditorOmikuji = (option: { id: string; name: string }) => {
  const omi = omikuji?.[option.id];
  console.log(omi);
  if (omi) {
    emit("open-editor", {
      isOpen: true,
      type: "omikuji",
      item: { [option.id]: omi },
    });
  }
};
</script>
