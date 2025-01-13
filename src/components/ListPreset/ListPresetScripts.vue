<template>
 <v-container>
  <!-- タグフィルター -->
  <v-chip-group v-model="selectedTags" column multiple class="mb-4">
   <v-chip
    v-for="tag in availableTags"
    :key="tag"
    :value="tag"
    filter
    variant="outlined"
    :color="selectedTags.includes(tag) ? 'primary' : undefined"
   >
    {{ tag }}
   </v-chip>
  </v-chip-group>

  <!-- スクリプトリスト -->
  <v-row>
   <v-col v-for="script in filteredScripts" :key="script.id" cols="12" sm="6" md="4">
    <v-card elevation="2" class="h-100">
     <v-card-item>
      <div class="d-flex align-center mb-2">
       <v-chip color="primary" size="small" class="mr-2"> v{{ script.version }} </v-chip>
       <span class="text-subtitle-1 font-weight-bold">{{ script.name }}</span>
      </div>
     </v-card-item>

     <v-card-text>
      <p class="mb-3">{{ script.description }}</p>

      <!-- Script情報 -->
      <div v-if="script.author" class="d-flex align-center mb-2">
       <v-icon size="small" class="mr-2">mdi-account</v-icon>
       <span class="text-caption">{{ script.author }}</span>
       <a :url = "script.url"><v-icon size="small" class="mr-2">mdi-link</v-icon></a>
      </div>

      <!-- タグ -->
      <div class="d-flex flex-wrap gap-1">
       <v-chip v-for="(tag, index) in script.tags" :key="index" size="x-small" variant="outlined" class="mr-1 mb-1">
        {{ tag }}
       </v-chip>
      </div>
     </v-card-text>

     <v-card-actions>
      <v-spacer />
      <v-btn
       v-if="script.url"
       variant="text"
       density="comfortable"
       :href="script.url"
       target="_blank"
       prepend-icon="mdi-open-in-new"
      >
       詳細
      </v-btn>
      <v-btn color="primary" variant="tonal" @click="handleScriptSelect(script)"> 選択 </v-btn>
     </v-card-actions>
    </v-card>
   </v-col>
  </v-row>
 </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ScriptsType } from '@type';

interface Props {
 AppEditor: {
  Scripts: Record<string, ScriptsType>;
 };
}

const props = defineProps<Props>();
const emit = defineEmits<{
 (e: 'select-script', script: ScriptsType): void;
}>();

// タグ関連
const selectedTags = ref<string[]>([]);

const availableTags = computed(() => {
 const tags = Object.values(props.AppEditor.Scripts).flatMap((script) => script.tags || []);
 return [...new Set(tags)];
});

// スクリプトのフィルタリング
const filteredScripts = computed(() => {
 const scripts = Object.values(props.AppEditor.Scripts);

 if (!selectedTags.value.length) {
  return scripts;
 }

 return scripts.filter((script) => selectedTags.value.some((tag) => script.tags.includes(tag)));
});

// スクリプト選択時の処理
const handleScriptSelect = (script: ScriptsType) => {
 emit('select-script', script);
};
</script>
