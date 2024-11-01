// src/composables/funkJSON.ts
import { ref } from 'vue';
import { validateData, generateOrder } from "./funkValidate";
import type { OmikenEditType, fetchJSONType, CHARAEditType, PresetOmikenEditType, ListCategory, EditerTypeMap, RulesType, OmikujiType, PlaceType } from '../types';
import _ from 'lodash';
import Swal from 'sweetalert2';
import { useToast } from 'vue-toastification';


// ! /////////////////////////////////////////
// !
// ! すべてのJSON読み込み・更新 は、代わりに「APIで通信をする」に変わります。
// ! Editer自身では、fetchを使ったJSON読み込みも更新も行えません!
// !
// ! /////////////////////////////////////////


// JSONデータの読み込み・書き込み
export function funkJSON() {
  const canUpdateJSON = ref(false); // テストモード:JSONを書き込みするか
  const isLoading = ref(false); // 読み込み中かどうか、読み込み失敗ならずっとtrue
  const noAppBoot = ref(false); // 起動できたか
  const lastSavedState = ref<OmikenEditType | null>(null); // 1つ前へ戻る機能
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
        fetchCHARA(presets.filter((p: fetchJSONType) => p.type === 'CHARA')),
        fetchPreOmiken(presets.filter((p: fetchJSONType) => p.type === 'Omiken'))
      ]);

      return { charaData, presetData };
    } catch (error) {
      console.error('Failed to load data:', error);
      throw new Error('データの読み込みに失敗しました');
    } finally {
      isLoading.value = false;
    }
  };

  // Preset.CHARAの読み込み
  const fetchCHARA = async (charaPaths: fetchJSONType[]) => {
    const responses = await Promise.all(
      charaPaths.map(async p => {
        const item = await fetch(p.path).then(r => r.json());
        return { ...p, item } as CHARAEditType;
      })
    );
    return responses.reduce<Record<string, CHARAEditType>>((acc, chara) => {
      acc[chara.id] = chara;
      return acc;
    }, {});
  };

  // Preset.Omikenの読み込み
  const fetchPreOmiken = async (presetPaths: fetchJSONType[]) => {
    const responses = await Promise.all(
      presetPaths.map(async p => {
        const item = await fetch(p.path).then(r => r.json());
        return { ...p, item } as PresetOmikenEditType;
      })
    );
    console.log(responses);
    return responses.reduce<Record<string, PresetOmikenEditType>>((acc, data) => {
      acc[data.id] = data;
      return acc;
    }, {});
  };

  // 現在のOmiken読み込み
  const fetchOmiken = async (): Promise<OmikenEditType | null> => {
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

      // データの検証と正規化 // TODO 並び順のバリデーションも行いたい
      // TODO 例えば、Objectのキーと配列が合わない可能性もあるので。
      const validatedData: OmikenEditType = {
        rules: validateData('rules', data.rules),
        omikuji: validateData('omikuji', data.omikuji),
        place: validateData('place', data.place),
        rulesOrder: data.rulesOrder,
        omikujiOrder: data.omikujiOrder,
        placeOrder: data.placeOrder,
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

  // Objectを指定された順序で並び替える関数
  function reorderObject<T>(obj: Record<string, T>, order: string[]): Record<string, T> {
    // 順序配列の検証
    const validOrder = order.filter(key => key in obj);
    // オブジェクトのキーと順序配列の整合性チェック
    const objKeys = Object.keys(obj);
    if (validOrder.length !== objKeys.length ||
      !objKeys.every(key => validOrder.includes(key))) {
      console.warn(`順序配列とオブジェクトのキーが一致しません: ${validOrder.length} != ${objKeys.length}`);
      // 不足しているキーを順序配列に追加
      objKeys.forEach(key => {
        if (!validOrder.includes(key)) validOrder.push(key);
      });
    }
    // 順序に従って新しいオブジェクトを構築
    return validOrder.reduce((acc, key) => {
      if (key in obj) {
        acc[key] = obj[key];
      }
      return acc;
    }, {} as Record<string, T>);
  }

  // Omikenの保存
  const saveOmiken = async (Omiken: OmikenEditType): Promise<void> => {

    // 各ObjectをOrderの順番に直す
    const newOmiken: OmikenEditType = {
      rules: reorderObject(Omiken.rules, Omiken.rulesOrder ?? Object.keys(Omiken.rules)),
      omikuji: reorderObject(Omiken.omikuji, Omiken.omikujiOrder ?? Object.keys(Omiken.omikuji)),
      place: reorderObject(Omiken.place, Omiken.placeOrder ?? Object.keys(Omiken.place)),
      rulesOrder: Omiken.rulesOrder ?? Object.keys(Omiken.rules),
      omikujiOrder: Omiken.omikujiOrder ?? Object.keys(Omiken.omikuji),
      placeOrder: Omiken.placeOrder ?? Object.keys(Omiken.place),
      preferences: Omiken.preferences
    };

    if (noAppBoot.value) {
      toast('🚫データ保存はできません');
      return;
    }
    // テストモード:保存できたことをログに表示
    if (!canUpdateJSON.value) {
      toast('💾saveDataまで届きました');
      console.warn('saveDataまで届きました:', newOmiken);
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

