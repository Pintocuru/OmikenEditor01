<!-- src/components/RuleEditor.vue -->
<template>
  <v-list>
    <v-list-item>
      <v-row>
        <v-col cols="12" sm="9">
          <v-text-field v-model="rule.name" label="おみくじ名"></v-text-field>
        </v-col>
        <v-col cols="12" sm="3">
          <v-autocomplete v-model="rule.modes" label="モード" :items="rule.modeSelect"></v-autocomplete>
        </v-col>
        <v-col cols="12">
          <v-slider v-model="rule.switch" :max="4" :ticks="{
            0: '無効', 1: '誰でも', 2: 'メンバー', 3: 'モデレーター', 4: '管理者',
          }" show-ticks="always" step="1" tick-size="4"></v-slider>
        </v-col>
        <v-col cols="12">
          <v-combobox v-model="rule.matchExactList" label="完全一致" clearable chips multiple>
          </v-combobox>
        </v-col>
        <v-col cols="12">
          <v-combobox v-model="rule.matchStartsWith" label="前方一致" clearable chips multiple></v-combobox>
        </v-col>
        <v-col cols="12">
          <v-combobox v-model="rule.matchIncludes" label="部分一致" clearable chips multiple></v-combobox>
        </v-col>
        <v-col cols="12">
          <v-btn color="error" @click="$emit('delete')">削除</v-btn>
        </v-col>
      </v-row>
    </v-list-item>
  </v-list>
</template>


<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  rule: Object,
});

</script>