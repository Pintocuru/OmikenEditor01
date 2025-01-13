<!-- src/components/ListPreset/ListPresetCharas.vue -->
<template>
 <v-container>
  <!-- タグフィルター部分 -->
  <div class="mb-4">
   <v-chip-group v-model="selectedTags" column multiple>
    <v-chip
     v-for="tag in uniqueTags"
     :key="tag"
     :value="tag"
     filter
     variant="outlined"
     :color="selectedTags.includes(tag) ? 'primary' : undefined"
    >
     {{ tag }}
    </v-chip>
   </v-chip-group>
  </div>

  <!-- キャラクターリスト -->
  <v-row>
   <v-col v-for="(preset, key) in filteredPresets" :key="key" cols="12" sm="6" md="4">
    <v-card class="preset-card h-100" elevation="3" hover @click="showDetails(preset)">
     <v-img
      :src="getPresetsImage(preset.banner)"
      height="200"
      cover
      class="align-end"
      gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
     >
      <v-card-title class="text-white text-h6 font-weight-bold">
       {{ preset.name }}
      </v-card-title>
     </v-img>

     <v-card-text>
      <div class="d-flex align-center mb-2">
       <v-chip color="primary" size="small" class="mr-2"> キャラクター </v-chip>
       <v-chip v-if="preset.version" color="secondary" size="small"> v{{ preset.version }} </v-chip>
      </div>
      <p class="preset-description mb-3">{{ preset.description }}</p>

      <div class="d-flex flex-wrap mt-2">
       <v-chip
        v-for="(tag, index) in preset.tags"
        :key="index"
        color="secondary"
        size="small"
        variant="outlined"
        class="mr-1 mb-1"
       >
        {{ tag }}
       </v-chip>
      </div>
     </v-card-text>
    </v-card>
   </v-col>
  </v-row>

  <!-- 詳細ダイアログ -->
  <v-dialog v-model="dialogVisible" max-width="600">
   <v-card v-if="selectedPreset">
    <v-img
     :src="getPresetsImage(selectedPreset.banner)"
     height="200"
     cover
     gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
    >
     <v-card-title class="text-white">
      {{ selectedPreset.name }}
     </v-card-title>
    </v-img>

    <v-card-text class="pt-4">
     <div class="d-flex flex-column gap-4">
      <!-- 基本情報 -->
      <div>
       <h3 class="text-h6 mb-2">基本情報</h3>
       <div class="ml-3">
        <p><strong>作者:</strong> {{ selectedPreset.author || '未設定' }}</p>
        <p><strong>バージョン:</strong> {{ selectedPreset.version }}</p>
        <p><strong>説明:</strong> {{ selectedPreset.description }}</p>
       </div>
      </div>

      <!-- カラー設定 -->
      <div v-if="selectedPreset.color">
       <h3 class="text-h6 mb-2">カラー設定</h3>
       <v-sheet class="pa-3 rounded" :style="selectedPreset.color">
        <div class="d-flex align-center justify-space-between">
         <span>表示サンプル</span>
         <span class="text-right">{{ selectedPreset.nickname || selectedPreset.name }}</span>
        </div>
       </v-sheet>
      </div>

      <!-- タグ一覧 -->
      <div>
       <h3 class="text-h6 mb-2">タグ</h3>
       <div class="d-flex flex-wrap gap-2">
        <v-chip v-for="tag in selectedPreset.tags" :key="tag" size="small" color="secondary" variant="outlined">
         {{ tag }}
        </v-chip>
       </div>
      </div>
     </div>
    </v-card-text>

    <v-card-actions>
     <v-spacer />
     <v-btn color="grey" variant="text" @click="dialogVisible = false"> 閉じる </v-btn>
    </v-card-actions>
   </v-card>
  </v-dialog>
 </v-container>
</template>

<script setup lang="ts">
import {
 AppEditorType,
 CategoryActive,
 CharaType,
 ListCategory,
 ListEntry,
 OmikenEntry,
 PresetOmikenType
} from '@type';
import { FunkEmits } from '@/composables/FunkEmits';
import { FunkPresets } from '@/composables/FunkPresets';
import { computed, ref } from 'vue';

// props/emits
const props = defineProps<{
 AppEditor: AppEditorType;
}>();

const emit = defineEmits<{
 (e: 'open-editor', editorItem: ListEntry<ListCategory>): void;
 (e: 'update:Omiken', payload: OmikenEntry<ListCategory>): void;
 (e: 'update:category', value: CategoryActive): void;
}>();

// コンポーザブル
const { openList } = FunkEmits(emit);
const {} = FunkPresets();

// データソース
const Charas = props.AppEditor.Charas;

// ステート
const selectedTags = ref<string[]>([]);
const dialogVisible = ref(false);
const selectedPreset = ref<CharaType | null>(null);

// 算出プロパティ
const uniqueTags = computed(() => {
 const tags = Object.values(Charas || {}).reduce((acc: string[], preset) => {
  if (preset?.tags) {
   acc.push(...preset.tags);
  }
  return acc;
 }, []);
 return [...new Set(tags)];
});

const filteredPresets = computed(() => {
 if (!selectedTags.value.length) return Charas;

 return Object.entries(Charas).reduce(
  (acc, [key, preset]) => {
   if (preset?.tags && selectedTags.value.some((tag) => preset.tags.includes(tag))) {
    acc[key] = preset;
   }
   return acc;
  },
  {} as Record<string, CharaType>
 );
});

// メソッド
const getPresetsImage = (banner?: string): string => {
 if (!banner) return '';
 const basePath = process.env.NODE_ENV === 'development' ? './Presets' : './Presets';
 return `${basePath}/${banner}`;
};

const showDetails = (preset: CharaType) => {
 selectedPreset.value = preset;
 dialogVisible.value = true;
};

</script>
