// src/composables/funkOmikenJSON.ts
import { reactive, ref, computed } from 'vue';
import type { DefaultState, OmikujiMessage, omikujiRule,  Placeholder, PostOnecomme } from '../types';
import type { SelectItem, ItemType } from '../AppTypes';
/*
JSONデータの操作を担当
useDataFetcher: JSONデータの読み込み機能を提供
useDataSaver: JSONデータの保存機能を提供
*/


// データ読み込み
export function useDataFetcher() {
  const loading = ref(false);
  const DEFAULT_RULES: omikujiRule[] = [
    {
      name: "デフォルトおみくじ",
      switch: 1,
      matchExact: ["おみくじ"],
      matchStartsWith: [],
      matchIncludes: []
    }
  ];

  const fetchData = async (STATE: DefaultState) => {
    try {
      loading.value = true;
      const response = await fetch('/src/state.json');
      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.statusText);
      }
      const data = await response.json();

      // データの検証と正規化
      const validatedData: DefaultState = {
        defaultRules: data.defaultRules || DEFAULT_RULES,
        rules: validateRules(data.rules),
        omikuji: validateOmikuji(data.omikuji),
        placeholder: validateRandomItems(data.placeholder, true),
      };

      Object.assign(STATE, validatedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    fetchData
  };
}


// 各データ型の検証関数
export function validateRules(items: any | any[]): omikujiRule[] {
  // 単一のオブジェクトの場合は配列に変換
  const itemsArray = Array.isArray(items) ? items : [items];
  // ルールの検証ロジックを実装
  return itemsArray.map((item: any): omikujiRule => ({
    // おみくじルール名
    name: typeof item.name === 'string' ? item.name : 'おみくじ',
    // ルールの有効/無効 0:OFF/1:だれでも/2:メンバー以上/3:モデレーター/4:管理者
    switch: [0, 1, 2, 3, 4].includes(item.switch) ? item.switch : 0,
    // omikujiの適用しないIDリスト
    disabledIds: Array.isArray(item.disabledIds) ? item.disabledIds.filter((item: any) => typeof item === 'number') : [],
    // 完全一致するキーワード
    matchExact: Array.isArray(item.matchExact) ? item.matchExact.filter((item: any) => typeof item === 'string') : ['*'],
    // 特定のフレーズで始まるキーワード
    matchStartsWith: Array.isArray(item.matchStartsWith) ? item.matchStartsWith.filter((item: any) => typeof item === 'string') : [],
    // 部分一致するキーワード
    matchIncludes: Array.isArray(item.matchIncludes) ? item.matchIncludes.filter((item: any) => typeof item === 'string') : [],
  }));
}

// おみくじのデータチェック
export function validateOmikuji(items: any | any[]): OmikujiMessage[] {
  // 単一のオブジェクトの場合は配列に変換
  const itemsArray = Array.isArray(items) ? items : [items];
  // 使用済みのIDを追跡するセット
  const usedIds = new Set<number>();
  // 正規化されたデータを作成
  return itemsArray.map((item: any, index: number): OmikujiMessage => {
    let id = item.id;
    // IDが重複している、または無効な場合は、新しいIDを割り当て
    if (typeof id !== 'number' || id <= 0 || usedIds.has(id)) {
      id = index + 1; // 重複を避けるためにindexを基にしたIDを付与
    }
    // 使用済みIDに追加
    usedIds.add(id);

    return {
    // ID
    id,
    // おみくじの結果名(「大吉」など)
    name: typeof item.name === 'string' ? item.name : '大吉',
    // メッセージの重み付け
    weight: typeof item.weight === 'number' || typeof item.weight === 'string'
      ? Math.abs(parseInt(item.weight)) || 1
      : 1,
    // フィルタリング基準
    threshold: {
      // タイプ
      type: ['none', 'time', 'lc', 'no', 'tc', 'second', 'minute', 'hour', 'day', 'price', 'custom'].includes(item.threshold?.type) ? item.threshold.type : 'none',
      // 比較方法
      comparison: ['min', 'equal', 'max', 'loop', 'range'].includes(item.threshold?.comparison) ? item.threshold.comparison : 'equal',
      // 基準となる数値
      value: typeof item.threshold?.value === 'number' ? Math.abs(item.threshold.value) : 0,
      valueMax: typeof item.threshold?.valueMax === 'number' ? Math.abs(item.threshold.valueMax) : 0,
    },
    // メッセージの投稿情報 message:わんコメ party:WordParty toast:トースト speech:わんコメspeech
    post: Array.isArray(item.post) ?
      (item.post as PostOnecomme[]).map((post: any): PostOnecomme => ({
        type: ['onecomme', 'party', 'toast', 'speech'].includes(post.type) ? post.type : 'onecomme',
        botKey: typeof post.botKey === 'string' ? post.botKey : "mamono",
        iconKey: typeof post.iconKey === 'string' ? post.iconKey : "Default",
        delaySeconds: typeof post.delaySeconds === 'number' ? post.delaySeconds : 0,
        content: typeof post.content === 'string' ? post.content : '<<user>>さんの運勢は【大吉】',
      }))
        .sort((a, b) => a.delaySeconds - b.delaySeconds) : [],
    };
  });
}


// プレースホルダーのデータチェック
export function validateRandomItems(items: any | any[], generateIds: boolean = false): Placeholder[] {
  // 単一のオブジェクトの場合は配列に変換
  const itemsArray = Array.isArray(items) ? items : [items];
  return itemsArray.map((item: any, index: number): Placeholder => ({
    // id(エディターのみの用途なので、読み込み時にすべて書き換えてます)
    id: generateIds ? index + 1 : (typeof item.id === 'number' ? item.id : Math.floor(Math.random() * 999999999)),
    // プレースホルダー名
    name: typeof item.name === 'string' ? item.name : '<<random>>',
    // ランダム選択時の重み付け
    weight: typeof item.weight === 'number' ? Math.abs(item.weight) : 1,
    // グループ番号
    group: typeof item.group === 'number' ? item.group : 0,
    // メッセージ内容
    content: typeof item.content === 'string' ? item.content : '',
  }));
}



// データ保存
export function useDataSaver() {
  const saveStatus = ref('');
  const showSnackbar = ref(false);

  const saveData = async (STATE: DefaultState) => {
    try {
      saveStatus.value = 'Saving...';
      const response = await fetch('/src/state.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(STATE)
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      saveStatus.value = 'Saved successfully!';
      showSnackbar.value = true;
    } catch (error) {
      console.error('Error saving data:', error);
      saveStatus.value = 'Error saving data';
      showSnackbar.value = true;
    }
  };

  return {
    saveData,
    saveStatus,
    showSnackbar
  };
}