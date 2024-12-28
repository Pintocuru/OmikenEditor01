<!-- src/components/common/PartsArrayRemove.vue -->
<template>
  <v-menu v-model="menu" :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" color="info" :size="size">
        <v-icon>{{ icon }}</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item @click="postDuplicate(index)">
        <v-icon class="text-info">mdi-content-copy</v-icon>
        <span class="text-info pl-6">複製</span>
      </v-list-item>
      <v-list-item @click="postRemove(index)">
        <v-icon class="text-error">mdi-delete</v-icon>
        <span class="text-error pl-6">削除</span>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, PropType } from "vue";
import type { OmikenEntry, ListCategory, OmikenTypeMap } from "@type";

const props = defineProps({
  type: { type: String as PropType<ListCategory>, required: true }, // "omikuji" または "place"
  currentItem: { type: Object, required: true },
  array: { type: Array, required: true },
  index: { type: Number, required: true },
  icon: { type: String, default: "mdi-dots-vertical" },
  size: { type: String, default: "default" },
});
const emit =
  defineEmits<
    (e: "update:Omiken", payload: OmikenEntry<ListCategory>) => void
  >();

const menu = ref(false);

function updateOmiken() {
  if (props.currentItem) {
    const update = {
      type: props.type as ListCategory,
      update: {
        [String(props.currentItem.id)]: props.currentItem,
        // @ts-ignore preferences preset ではこのコンポーネントを使わないので
      } as OmikenTypeMap[typeof props.type],
    } satisfies OmikenEntry<typeof props.type>;

    emit("update:Omiken", update);
  }
}

function postDuplicate(index: number) {
  const newPost = JSON.parse(JSON.stringify(props.array[index]));
  props.array.splice(index + 1, 0, newPost);
  updateOmiken();
}

function postRemove(index: number) {
  props.array.splice(index, 1);
  updateOmiken();
}
</script>
