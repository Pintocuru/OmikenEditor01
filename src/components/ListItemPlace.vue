<!-- src/components/ListItemPlace.vue -->
<template>
    <v-col cols="12">
  <v-card @click="openEditor">
    <v-toolbar :color="toolbarColor" density="compact">
      <v-toolbar-title>
        {{
          isGroup
            ? `${(item as PlaceGroup).name} (${getItemCount(
                item as PlaceGroup
              )})`
            : (item as PlaceType).name
        }}
      </v-toolbar-title>
      <template v-slot:append>
        <ListItemPartsAction
          :selectCategory="naviCategory"
          :item="item"
            @edit="openEditor"
          @update:STATE="updateSTATE"
        />
      </template>
    </v-toolbar>
    <v-card-text>
      <!-- 単独表示 -->
      <template v-if="!isGroup">
        <v-chip
          :color="getWeightColor((item as PlaceType).weight)"
          class="ma-2"
        >
          重み: {{ (item as PlaceType).weight }}
        </v-chip>
        <v-chip :color="getGroupColor((item as PlaceType).group)" class="ma-2">
          グループ: {{ (item as PlaceType).group }}
        </v-chip>
        <div class="mt-2 text-truncate">
          <strong>内容:</strong> {{ (item as PlaceType).content }}
        </div>
      </template>
      <!-- グループ表示 -->
      <template v-else>
          <span v-for="place in (item as PlaceGroup).items"
            :key="place.id"          >
            <!-- 1行で収まらない場合は　…　と省略させる -->
            <!-- 最後の　/　は表示させない -->
            {{ place.content }} / 
          </span>
      </template>
    </v-card-text>
  </v-card>
  </v-col>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  ListEntry,
  ListCategory,
  PlaceType,
  STATEEntry,
  STATEType,
  STATECategory,
} from "@/types";
import ListItemPartsAction from "./common/ListItemPartsAction.vue";
import _ from 'lodash';
// ここでの限定型 // TODOなくすこと
export interface PlaceGroup {
  name: string;
  items: PlaceType[];
}

// Props Emits
const props = defineProps<{
  STATE: STATEType;
  item: PlaceType | { name: string; items: PlaceType[] };
  naviCategory: ListCategory;
  groupBy?: "none" | "name" | "group";
}>();
const emit = defineEmits<{
  (e: "update:STATE", payload: STATEEntry<STATECategory>): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

// グループかどうか
const isGroup = computed(() => "items" in props.item);

// エディターを開く(グループ対応版)
function openEditor() {
  if (isGroup.value) {
    // グループ
    const groupItems = (props.item as { items: PlaceType[] }).items.reduce(
      (acc, item) => {
        acc[item.id] = item;
        return acc;
      },
      {} as Record<string, PlaceType>
    );
    emit("open-editor", {
      type: props.naviCategory,
      item: groupItems,
      mode: props.groupBy as string,
    });
  } else {
    // 単独
    const item = { [(props.item as PlaceType).id]: props.item as PlaceType };
    emit("open-editor", { type: props.naviCategory, item: item });
  }
}

// 各種操作関数(STATE更新)
const updateSTATE = (payload: STATEEntry<STATECategory>) => emit("update:STATE", payload);


function getItemCount(element: { items: PlaceType[] }): number {
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
  return getGroupColor((props.item as PlaceType).group);
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
