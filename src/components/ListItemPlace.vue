<!-- src/components/ListItemPlace.vue -->
<template>
  <v-card height="120" @click="openEditor">
    <v-toolbar :color="toolbarColor" density="compact">
      <v-toolbar-title>
        {{
          isGroup
            ? `${(item as PlaceGroup).name} (${getItemCount(
                item as PlaceGroup
              )})`
            : (item as placeType).name
        }}
      </v-toolbar-title>
      <template v-slot:append>
        <ListItemPartsAction
          :selectCategory="selectCategory"
          :item="item"
          @update:STATE="updateSTATE"
        />
      </template>
    </v-toolbar>
    <v-card-text>
      <template v-if="!isGroup">
        <v-chip
          :color="getWeightColor((item as placeType).weight)"
          class="ma-2"
        >
          重み: {{ (item as placeType).weight }}
        </v-chip>
        <v-chip :color="getGroupColor((item as placeType).group)" class="ma-2">
          グループ: {{ (item as placeType).group }}
        </v-chip>
        <div class="mt-2 text-truncate">
          <strong>内容:</strong> {{ (item as placeType).content }}
        </div>
      </template>
      <template v-else>
        <v-list>
          <v-list-item
            v-for="place in (item as PlaceGroup).items"
            :key="place.id"
          >
            {{ place.name }} (重み: {{ place.weight }}, グループ:
            {{ place.group }})
          </v-list-item>
        </v-list>
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  EditorItem,
  ItemCategory,
  placeType,
  rulesType,
  SelectItem,
  STATEType,
} from "@/types";
import ListItemPartsAction from "./common/ListItemPartsAction.vue";
import { useSwitchStyles } from "../composables/useSwitchStyles";

// ここでの限定型
export interface PlaceGroup {
  name: string;
  items: placeType[];
}

// Props Emits
const props = defineProps<{
  STATE: STATEType;
  item: placeType | { name: string; items: placeType[] };
  selectCategory: ItemCategory;
  groupBy?: "none" | "name" | "group";
}>();
const emit = defineEmits<{
  (e: "update:STATE", payload: SelectItem): void;
  (e: "open-editor", editorItem: EditorItem): void;
}>();

// グループかどうか
const isGroup = computed(() => "items" in props.item);

// エディターを開く(グループ対応版)
function openEditor() {
  if (isGroup.value) {
    // グループ
    const groupItems = (props.item as { items: placeType[] }).items.reduce(
      (acc, item) => {
        acc[item.id] = item;
        return acc;
      },
      {} as Record<string, placeType>
    );
    emit("open-editor", {
      type: props.selectCategory,
      item: groupItems,
      mode: props.groupBy as string,
    });
  } else {
    // 単独
    const item = { [(props.item as placeType).id]: props.item as placeType };
    emit("open-editor", { type: props.selectCategory, item: item });
  }
}

function updateSTATE(payload: SelectItem) {
  emit("update:STATE", payload);
}

function getItemCount(element: { items: placeType[] }): number {
  return element.items.length;
}

// つかわないかも
const getWeightColor = (weight: number) => {
  if (weight > 80) return "error";
  if (weight > 50) return "warning";
  if (weight > 20) return "success";
  return "info";
};

const toolbarColor = computed(() => {
  if (isGroup.value) return "primary";
  return getGroupColor((props.item as placeType).group);
});

const getGroupColor = (group: number) => {
  const colors = [
    "primary",
    "secondary",
    "accent",
    "error",
    "warning",
    "info",
    "success",
  ];
  return colors[group % colors.length];
};
</script>
