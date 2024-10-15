<!-- src/components/MainItemList.vue -->
<template>
  <v-card-text>
    <v-row>
      <draggable
        v-model="localItems"
        :item-key="(item: any, index: any) => index"
        tag="div"
        class="d-flex flex-wrap w-100"
        @change="updateItems"
      >
        <template #item="{ element, index }">
          <v-col v-bind="colProps">
            <v-card
              :height="cardHeight"
              @click.stop="$emit('open-editor', selectCategory, index)"
            >
              <v-toolbar density="compact" color="transparent">
                <v-toolbar-title>
                  <div class="text-h5">{{ element.name }}</div>
                </v-toolbar-title>
                <template v-slot:append>
                  <v-btn
                    height="30"
                    width="30"
                    icon
                    @click.stop="localDeleteItem(selectCategory, index)"
                  >
                    <v-icon>mdi-close</v-icon>
                    <v-tooltip activator="parent" location="bottom"
                      >この設定を消去</v-tooltip
                    >
                  </v-btn>
                </template>
              </v-toolbar>

              <v-card-subtitle v-if="selectCategory === 'omikuji'">
                重み: {{ element.weight }}
              </v-card-subtitle>
              <v-card-subtitle v-if="selectCategory === 'placeholder'">
                重み: {{ element.weight }}, グループ: {{ element.group }}
              </v-card-subtitle>
            </v-card>
          </v-col>
        </template>
      </draggable>
    </v-row>
  </v-card-text>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import draggable from "vuedraggable";
import type { ItemContent, ItemType } from "../AppTypes";

const props = defineProps<{
  items: ItemContent[];
  selectCategory: ItemType;
  selectCols: number;
}>();

const emit = defineEmits<{
  (e: "update-items", items: ItemContent[]): void;
  (e: "open-editor", type: ItemType, index: number): void;
}>();

const localItems = ref<ItemContent[]>(props.items);

// アイテムを削除
// TODO 消す際の確認ダイアログを出す
const localDeleteItem = (type: ItemType, index: number) => {
  if (index !== -1 && localItems.value[index]) {
    localItems.value.splice(index, 1);
  }
  updateItems();
};

watch(
  () => props.items,
  (newItems) => {
    localItems.value = newItems;
  },
  { deep: true }
);

const updateItems = () => {
  emit("update-items", localItems.value);
};

const colProps = computed(() => {
  switch (props.selectCols) {
    case 0:
      return { cols: 12, sm: 12, md: 12, lg: 6 };
    case 1:
      return { cols: 12, sm: 6, md: 4, lg: 3 };
    case 2:
      return { cols: 4, sm: 3, md: 2, lg: 1 };
    default:
      return { cols: 12, sm: 6, md: 4, lg: 3 };
  }
});

const cardHeight = computed(() => {
  return props.selectCols === 0 ? 50 : 100;
});
</script>
