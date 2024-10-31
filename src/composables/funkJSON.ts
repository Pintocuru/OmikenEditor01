// src/composables/funkJSON.ts
import { ref } from 'vue';
import { validateData, generateOrder } from "./funkValidate";
import type { OmiEditType, CHARAType, PresetType } from '../types';
import _ from 'lodash';
import Swal from 'sweetalert2';
import { useToast } from 'vue-toastification';

// JSONデータの読み込み・書き込み
export function funkJSON() {
  const canUpdateJSON = ref(false); // テストモード:JSONを書き込みするか
  const isLoading = ref(false); // 読み込み中かどうか、読み込み失敗ならずっとtrue
  const noAppBoot = ref(false); // 起動できたか
  const lastSavedState = ref<OmiEditType | null>(null); // 1つ前へ戻る機能
  const toast = useToast(); // vue-toastification


  // OmikenとCHARAデータの読み込み
  const fetchPreset = async () => {
    isLoading.value = true;
    try {
      // index.jsonからプリセット一覧取得
      const response = await fetch('/index.json');
      const presets = await response.json();

      // 型ごとにデータ取得と整形
      const [charaData, presetData] = await Promise.all([
        fetchCHARA(presets.filter((p: PresetType) => p.type === 'CHARA')),
        fetchPreOmiken(presets.filter((p: PresetType) => p.type === 'Omiken'))
      ]);

      return { charaData, presetData };
    } catch (error) {
      console.error('Failed to load data:', error);
      throw new Error('データの読み込みに失敗しました');
    } finally {
      isLoading.value = false;
    }
  };

  // preset.CHARAの読み込み
  const fetchCHARA = async (charaPaths: PresetType[]) => {
    const responses = await Promise.all(
      charaPaths.map(p => fetch(p.path).then(r => r.json()))
    );
    return responses.reduce<CHARAType>((acc, chara) => {
      acc[chara.id] = chara;
      return acc;
    }, {});
  };

  // preset.Omikenの読み込み
  const fetchPreOmiken = async (presetPaths: PresetType[]) => {
    const responses = await Promise.all(
      presetPaths.map(p => fetch(p.path).then(r => r.json()))
    );
    return responses.reduce((acc, data) => ({
      ...acc,
      ...data.preset
    }), {});
  };


  const fetchOmiken = async (): Promise<OmiEditType | null> => {
    // 取得中ならreturn
    if (isLoading.value) {
      console.warn('データの取得が既に進行中です');
      return null;
    }
    isLoading.value = true;

    try {
      // fetchを使って読み込み
      const response = await fetch('/src/state.json');
      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.statusText);
      }
      const data = await response.json();

      // データの検証と正規化
      const validatedData: OmiEditType = {
        rules: validateData('rules', data.rules),
        omikuji: validateData('omikuji', data.omikuji),
        place: validateData('place', data.place),
        rulesOrder: generateOrder(data.rules),
        omikujiOrder: generateOrder(data.omikuji),
        placeOrder: generateOrder(data.place),
        preferences: data.preferences
      };

      lastSavedState.value = _.cloneDeep(validatedData);
      await Swal.fire({
        title: '読み込み完了',
        text: 'データの読み込みが完了しました。',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      isLoading.value = false;
      return validatedData;
    } catch (error) {
      noAppBoot.value = true;
      await Swal.fire({
        title: '読み込み失敗',
        text: 'データの読み込みに失敗しました。アプリケーションを起動できません。',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      throw new Error('データ読み込み失敗');
    }
  };

  const saveOmiken = async (Omiken: OmiEditType): Promise<void> => {


    if (noAppBoot.value) {
      toast('🚫データ保存はできません');
      return;
    }
    // テストモード:保存できたことをログに表示
    if (!canUpdateJSON.value) {
      toast('💾saveDataまで届きました');
      console.warn('saveDataまで届きました:', Omiken);
      return;
    }
    // ロード中ならreturn
    if (isLoading.value) {
      console.warn('💾canUpdateJSON:true');
      return;
    }

    isLoading.value = true;
    try {
      // TODO ここでAppState.Omiken のデータをAPIで飛ばす
    } catch (error) {
      console.error('Error saving data:', error);
      await Swal.fire({
        title: '保存失敗',
        text: 'データの保存に失敗しました。',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      isLoading.value = false;
    }
  };


  return {
    fetchPreset,
    canUpdateJSON,
    isLoading,
    fetchOmiken,
    saveOmiken,
  };
}

