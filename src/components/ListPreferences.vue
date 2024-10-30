<!-- src/components/ListPreferences.vue -->
<template>
  <v-card>
    <v-card-title>環境設定</v-card-title>
    <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-text-field
              :model-value="Omiken.preferences.basicDelay"
              @update:model-value="updatePreference('basicDelay', $event)"
              label="BOTの基本遅延時間(秒)"
              type="number"
              :rules="numberRules"
              min="0"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              :model-value="Omiken.preferences.omikujiCooldown"
              @update:model-value="updatePreference('omikujiCooldown', $event)"
              label="おみくじクールダウン(秒)"
              type="number"
              :rules="numberRules"
              min="0"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              :model-value="Omiken.preferences.commentDuration"
              @update:model-value="updatePreference('commentDuration', $event)"
              label="コメントしてからおみくじを有効とする時間(秒)"
              type="number"
              :rules="numberRules"
              min="0"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              :model-value="Omiken.preferences.BotUserIDname"
              @update:model-value="updatePreference('BotUserIDname', $event)"
              label="BOTのUserID"
              :rules="[v => !!v || 'BOTのユーザーIDは必須です']"
            />
          </v-col>
        </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { OmiEditType, OmikenEntry, OmikenCategory } from '@/types';

const props = defineProps<{
  Omiken: OmiEditType;
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
}>();

const valid = ref(true);

// バリデーションルール
const numberRules = [
  (v: number | null) => (v !== null && v >= 0) || '0以上の値を入力してください',
  (v: number | null) => v !== null || '値を入力してください'
];

// フォームのバリデーション状態が変更されたときの処理
const validateForm = (isValid: boolean) => {
  valid.value = isValid;
};

// 各フィールドの更新処理
const updatePreference = (key: keyof OmiEditType['preferences'], value: number | string) => {
  const newValue = typeof value === 'string' && key !== 'BotUserIDname' 
    ? Number(value) 
    : value;

  if (valid.value) {
    emit('update:Omiken', {
      type: 'preferences',
      preferences: {
        ...props.Omiken.preferences,
        [key]: newValue
      }
    });
  }
};
</script>