// src/composables/funkOmikenJSON.ts
import { ref } from 'vue';
import type { OmiEditType, ListCategory, CHARAType, EditerTypeMap } from '../types';
import { z } from 'zod';
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

      // xxxOrderの検証
      const generateOrder = (items: { [key: string]: any }): string[] => {
        return Object.keys(items);
      }

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
      console.warn('saveDataまで届きました:',Omiken);
      return;
    }
    // ロード中ならreturn(書き込みONの表示も兼ねて)
    if (isLoading.value) {
      console.warn('💾canUpdateJSON:true');
      return;
    }

    isLoading.value = true;
    toast('💾データ保存中…');
    try {
      const response = await fetch('/api/save-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Omiken)
      });
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      // 最後の状態を取得
      lastSavedState.value = _.cloneDeep(Omiken);
      toast('💾データ保存が完了しました。');
      console.log('💾データの保存が完了しました。');
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

  // fetchCHARA関数の定義
  async function fetchCHARA(fileNames: string[]): Promise<CHARAType> {

    const charaData = await Promise.all(
      fileNames.map(async (fileName) => {
        const response = await fetch(`/img/${fileName}`);
        if (!response.ok) {
          throw new Error(`Error fetching ${fileName}: ${response.statusText}`);
        }
        return await response.json() as { id: string; name: string; frameId?: string; color: { "--lcv-name-color": string; "--lcv-text-color": string; "--lcv-background-color": string; }; image: { Default: string;[key: string]: string; }; }; // 型を明示的に指定
      })
    );

    // 配列からオブジェクトに変換
    return charaData.reduce<CHARAType>((acc, chara) => {
      acc[chara.id] = chara; // idをキーにしてオブジェクトを構築
      return acc;
    }, {});
  }

  // 1つ前に戻る機能(使えるだろうか…？)
  const undoLastChange = () => {
    if (lastSavedState.value) {
      return _.cloneDeep(lastSavedState.value);
    }
    return null;
  };


  return {
    canUpdateJSON,
    isLoading,
    fetchOmiken: fetchOmiken,
    saveOmiken: saveOmiken,
    fetchCHARA,
    undoLastChange
  };
}




// rulesのZodスキーマ
const rulesSchema = z.record(z.object({
  // ID
  id: z.string(),
  // おみくじルール名
  name: z.string().default('おみくじ'),
  // 説明文
  description: z.string().default(''), 
  // ルールの有効/無効 0:OFF/1:だれでも/2:メンバー以上/3:モデレーター/4:管理者
  switch: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).default(1),
  // omikujiの適用しないIDリスト
  enabledIds: z.array(z.string()).default([]),
  // キーワード(完全一致/前方一致/部分一致)
  matchExact: z.array(z.string()).default([]),
  matchStartsWith: z.array(z.string()).default([]),
  matchIncludes: z.array(z.string()).default([])
}));


// omikujiのZodスキーマ
// 共通の数値変換
const thresholdValueTransform = z.number().transform(val => {
  return typeof val !== 'number' || val < 0 ? 0 : val;
});

// value1とvalue2のチェック関数
const thresholdValueRangeSwap = (schema:any) => schema.transform((data: any) => {
  if (data.comparison === 'range' && data.value1 > data.value2) {
    [data.value1, data.value2] = [data.value2, data.value1];
  }
  return data;
});

// 時間フィルターのスキーマ
const thresholdTimeSchema = z.object({
  isEnabled: z.boolean().default(false),
  value1: thresholdValueTransform.refine(val => val >= 0 && val < 24, { message: "0-23の範囲で指定してください" }),
  value2: thresholdValueTransform.refine(val => val >= 0 && val < 24, { message: "0-23の範囲で指定してください" })
});

// 経過時間フィルターのスキーマ
const thresholdElapsedSchema = thresholdValueRangeSwap(z.object({
  isEnabled: z.boolean().default(false),
  unit: z.enum(['second', 'minute', 'hour', 'day']),
  comparison: z.enum(['min', 'max', 'range']),
  value1: thresholdValueTransform,
  value2: thresholdValueTransform
}));

// カウントフィルターのスキーマ
const thresholdCountSchema = thresholdValueRangeSwap(z.object({
  isEnabled: z.boolean().default(false),
  unit: z.enum(['lc', 'no', 'tc']),
  comparison: z.enum(['min', 'equal', 'max', 'loop', 'range']),
  value1: thresholdValueTransform,
  value2: thresholdValueTransform
}));

// ギフトフィルターのスキーマ
const thresholdGiftSchema = thresholdValueRangeSwap(z.object({
  isEnabled: z.boolean().default(false),
  comparison: z.enum(['min', 'equal', 'max', 'range']),
  value1: thresholdValueTransform,
  value2: thresholdValueTransform
}));

// omikuji.thresholdスキーマ
const omikujiThresholdSchema = z.object({
  isSyoken: z.boolean().default(false),
  time: thresholdTimeSchema,
  elapsed: thresholdElapsedSchema,
  count: thresholdCountSchema,
  gift: thresholdGiftSchema,
});

// omikuji.postスキーマ
const omikujiPostSchema = z.array(z.object({
  type: z.enum(['onecomme', 'party', 'toast', 'speech']).default('onecomme'),
  botKey: z.string().default('mamono'),
  iconKey: z.string().default('Default'),
  delaySeconds: z.number().nonnegative().default(0),
  content: z.string().default('<<user>>さんの運勢は【大吉】<<random>>')
}))
  .transform((posts) =>
    posts.sort((a, b) => {
      // delaySecondsで昇順ソート
      if (a.delaySeconds !== b.delaySeconds) {
        return a.delaySeconds - b.delaySeconds;
      }
      // delaySecondsが同じ場合はtypeの順序でソート
      const typeOrder = ['onecomme', 'party', 'toast', 'speech'];
      return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
    })
  );

// omikujiのZodスキーマ
const omikujiSchema = z.record(z.object({
  id: z.string(),
  name: z.string().default('大吉'),
  description: z.string().default(''),
  weight: z.number().int().positive().default(1),
  threshold: omikujiThresholdSchema,
  post: omikujiPostSchema.default([])
}));


// placeのZodスキーマ
const placeSchema = z.record(z.object({
  // ID
  id: z.string(),
  // プレースホルダー名
  name: z.string().default('<<random>>'),
  // 説明文
  description: z.string().default(''),  
  // タイプ(出現割合の有無)
  isWeight: z.boolean().default(false),

  // 値の配列
  values: z.array(z.object({
    // 出現割合
    weight: z.number().positive().default(1),
    // 内容(1度だけプレースホルダーを利用可能)
    value: z.string().default('')
  })).default([])
}));

const preferencesSchema = z.record(z.object({
  // コメントしてからBotが反応するまでの遅延(秒)
  basicDelay: z.number().default(1),
  // おみくじ機能のクールダウン時間（秒)
  omikujiCooldown: z.number().default(2),
  // コメントしてからおみくじを有効とする時間(秒)
  commentDuration: z.number().positive().default(5),
  // このスクリプトBOTのcomment.data.userId
  BotUserIDname: z.string().default('FirstCounter')
}));


// スキーマをまとめる
const schemas = {
  rules: rulesSchema,
  omikuji: omikujiSchema,
  place: placeSchema,
  preferences: preferencesSchema
} as const;

// デフォルト値の設定
const defaultValues = {
  rules: {
    name: 'おみくじ',
    description:'',
    switch: 1,
    enabledIds: [],
    matchExact: [],
    matchStartsWith: [],
    matchIncludes: []
  },
  omikuji: {
    name: '大吉',
    description: '',
    weight: 1,
    threshold: {
      isSyoken: false,
      time: {
        isEnabled: false, // 時間指定が無効
        value1: 0, // 開始時間
        value2: 0, // 終了時間
      },
      elapsed: {
        isEnabled: false, // 経過時間が無効
        unit: 'hour', // デフォルトの単位
        value1: 0, // 開始値
        value2: 0, // 終了値
        comparison: 'max', // デフォルトの比較方法
      },
      count: {
        isEnabled: false, // コメント数が無効
        unit: 'no', // デフォルトの単位
        value1: 0, // 開始値
        value2: 0, // 終了値
        comparison: 'max', // デフォルトの比較方法
      },
      gift: {
        isEnabled: false, // ギフトが無効
        value1: 0, // 開始値
        value2: 0, // 終了値
        comparison: 'max', // デフォルトの比較方法
      },
    },
    post: [{
      type: 'onecomme',
      botKey: 'mamono',
      iconKey: 'Default',
      delaySeconds: 0,
      content: '<<user>>さんの運勢は【大吉】'
    }]
  },
  place: {
    name: '<<random>>',
    description: '',
    isWeight:false,
    values:[{
      weight: 1,
      value: '',
    }],
  },
  preferences: {
    basicDelay: 1,
    omikujiCooldown: 2,
    commentDuration: 5,
    BotUserIDname: 'FirstCounter'
  }
};

// rules omikuji placeのバリデーション
export function validateData<T extends ListCategory>(
  type: T,
  items: Record<string, unknown>
): Record<string, EditerTypeMap[T]> {
  const validatedData: Record<string, EditerTypeMap[T]> = {};

  for (const [key, item] of Object.entries(items)) {
    const itemWithDefaults = _.merge({}, defaultValues[type], { id: key }, item);

    try {
      const validatedItem = schemas[type].parse({ [key]: itemWithDefaults });
      validatedData[key] = validatedItem[key] as EditerTypeMap[T];
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error(`Validation error for ${type} item ${key}:`, error.errors);
      } else {
        console.error(`Unexpected error validating ${type} item ${key}:`, error);
      }
      validatedData[key] = defaultValues[type] as unknown as EditerTypeMap[T];
    }
  }

  return validatedData;
}
