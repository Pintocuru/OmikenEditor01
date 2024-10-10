<!-- src/components/RandomEditor.vue -->
<template>
  <v-card v-if="randomItems">
    <v-card-title>ランダムメッセージエディタ</v-card-title>
    <v-card-text>
      <v-select v-model="selectedTag" :items="tags" label="タグ" @change="onTagChange"></v-select>

      <v-btn @click="addRandomItem" color="primary" small class="mb-2">新しい項目を追加</v-btn>

      <v-list>
        <v-list-item v-for="(item, index) in currentItems" :key="index">
          <v-row>
            <v-col cols="12" sm="6" md="4">
              <v-text-field v-model.number="item.weight" label="重み" type="number"></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field v-model.number="item.group" label="グループ" type="number"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="item.content" label="内容"></v-textarea>
            </v-col>
            <v-col cols="12">
              <v-btn @click="removeRandomItem(index)" color="error" small>削除</v-btn>
            </v-col>
          </v-row>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
  <v-alert v-else type="warning">ランダムアイテムが選択されていません。</v-alert>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Placeholder } from '../types';

const props = defineProps<{
  selectedRandomItems: Placeholder[] | null;
}>();

const emit = defineEmits<{
  (e: 'update:randomItems', value: Placeholder[]): void;
}>();

const randomItems = ref<Placeholder[] | null>(null);
const selectedTag = ref<string>('');

watch(() => props.selectedRandomItems, (newValue) => {
  randomItems.value = newValue ? JSON.parse(JSON.stringify(newValue)) : null;
  if (randomItems.value && randomItems.value.length > 0) {
    selectedTag.value = randomItems.value[0].name;
  }
}, { immediate: true, deep: true });

const tags = computed(() => {
  return [...new Set(randomItems.value?.map(item => item.name) || [])];
});

const currentItems = computed(() => {
  return randomItems.value?.filter(item => item.name === selectedTag.value) || [];
});

const onTagChange = (newTag: string) => {
  selectedTag.value = newTag;
};

const addRandomItem = () => {
  if (!randomItems.value) return;
  randomItems.value.push({
    name: selectedTag.value,
    weight: 1,
    group: 1,
    content: ''
  });
  emit('update:randomItems', randomItems.value);
};

const removeRandomItem = (index: number) => {
  if (!randomItems.value) return;
  randomItems.value = randomItems.value.filter((_, i) => i !== index);
  emit('update:randomItems', randomItems.value);
};

watch(randomItems, (newValue) => {
  // 変更があった場合のみ emit を実行
  if (newValue && JSON.stringify(newValue) !== JSON.stringify(props.selectedRandomItems)) {
    emit('update:randomItems', newValue);
  }
}, { deep: true });
</script>