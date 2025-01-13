// src/composables/FunkPresets.ts

import { computed, inject, Ref } from 'vue';
import { AppEditorType, OneCommePostType } from '@type';

export function FunkPresets() {
 // Inject
 const AppEditor = inject<Ref<AppEditorType>>('AppEditorKey');
 const Chara = AppEditor?.value.Charas;


 
 return {
 };
}
