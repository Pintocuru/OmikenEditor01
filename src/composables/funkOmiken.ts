// composables/FunkOmiken.ts
import { provide, ref } from 'vue';
import { OmikenType, OmikenEntry, AppEditorType, ListCategory, PresetOmikenType } from '@type';
import { DataService, defaultAppEditor } from '@/composables/FunkJSON';
import { FunkOmikenUpdater } from './FunkOmikenUpdater';
import { FunkOmikenPreset } from './FunkOmikenPreset';
import Swal from 'sweetalert2';

export function FunkOmiken() {
 const AppEditor = ref<AppEditorType>(defaultAppEditor);
 const isAppEditorLoading = ref(true);

 // 他のコンポーザブルを初期化
 const { handleUpdate, handleAddItems, handleDeleteItems, handleReTypes } = FunkOmikenUpdater();
 const { handlePresetUpdate } = FunkOmikenPreset();

 // provide
 provide('AppEditorKey', AppEditor);

 // 初期化処理の実行
 async function AppEditorInitialize() {
  try {
   AppEditor.value = await DataService.fetchInitialData();
   isAppEditorLoading.value = false; // ローディング完了
   // データ読み込み成功の通知
   await Swal.fire({
    title: '読み込み完了',
    text: 'データの読み込みが完了しました。',
    icon: 'success',
    confirmButtonText: 'OK'
   });
  } catch (error) {
   console.error('Initialization failed', error);
   const errorMessage = error instanceof Error ? error.message : 'データの読み込みに失敗しました。';

   await Swal.fire({
    title: '読み込み失敗',
    text: errorMessage,
    icon: 'error',
    confirmButtonText: 'OK'
   });
  }
 }

 // Omikenの更新(rules/omikujis/places)
 function updateOmiken(payload: OmikenEntry<ListCategory>) {
  if (!payload || !AppEditor.value) return;
  const { type, update, addKeys, delKeys, reTypes } = payload;

  const newState: OmikenType = JSON.parse(JSON.stringify(AppEditor.value.Omiken));

  handleUpdate(newState, type, update);
  handleAddItems(newState, type, addKeys);
  handleDeleteItems(newState, type, delKeys);
  if (reTypes) handleReTypes(newState, reTypes);

  AppEditor.value.Omiken = newState;
   console.log('保存フラグが立ったよ', AppEditor.value.Omiken);
 }

 // Presetからの更新
 const updateOmikenPreset = (preset: PresetOmikenType) => {
  if (!AppEditor.value) return;
  const newState = handlePresetUpdate(AppEditor.value.Omiken, preset);
  AppEditor.value.Omiken = newState;
 };

 return {
  AppEditor,
  AppEditorInitialize,
  isAppEditorLoading,
  updateOmiken,
  updateOmikenPreset
 };
}
