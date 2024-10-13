// src/composables/funkOmikenEdit.ts
import { reactive, ref, computed, Ref, onMounted, watch } from 'vue';
import type { DefaultState, OmikujiMessage, omikujiRule, Post, Placeholder } from '../types';
import type { SelectedItem, ItemType, ItemContent } from '../AppTypes';
/*

アイテムの編集機能を担当
useOmikujiEditor: おみくじアイテムの編集機能を提供
useRuleEditor: ルールの編集機能を提供（新規追加）#TODO
useRandomItemEditor: ランダムアイテムの編集機能を提供（新規追加）#TODO
*/

export function useFunkOmikenEdit(STATE: Ref<DefaultState>) {
  // アイテムを更新
  const updateItem = (type: ItemType, updatedItem: ItemContent) => {
    const index = STATE.value[type].findIndex(i => i === updatedItem);
    if (index !== -1) {
      STATE.value[type][index] = updatedItem;
    }
  };
  // アイテムを追加
  const addItem = (type: ItemType) => {
    let newItem: ItemContent;

    switch (type) {
      case 'rules':
        newItem = {
          name: `新しいルール ${STATE.value.rules.length + 1}`,
          modes: '',
          modeSelect: [],
          switch: 0,
          matchExact: [],
          matchStartsWith: [],
          matchIncludes: []
        } as omikujiRule; // `omikujiRule` 型として明示
        break;

      case 'omikuji':
        newItem = {
          name: '大吉',
          weight: 1,
          threshold: { type: 'none', value: 0, valueMax: 0, comparison: 'equal' },
          message: [],
          party: [],
          toast: [],
          speech: []
        } as OmikujiMessage; // `OmikujiMessage` 型として明示
        break;

      case 'placeholder':
        newItem = {
          name: `新しいタグ ${STATE.value.placeholder.length + 1}`,
          weight: 1,
          group: 0,
          content: ''
        } as Placeholder; // `Placeholder` 型として明示
        break;
    }

    // 正しい配列にアイテムを追加
    if (type === 'rules') {
      STATE.value.rules.push(newItem as omikujiRule);
    } else if (type === 'omikuji') {
      STATE.value.omikuji.push(newItem as OmikujiMessage);
    } else if (type === 'placeholder') {
      STATE.value.placeholder.push(newItem as Placeholder);
    }

    return newItem;
  };


  // アイテムを削除
  const deleteItem = (type: ItemType, index: number) => {
    if (index !== -1 && STATE.value[type][index]) {
      STATE.value[type].splice(index, 1);
    }
  };

  return {
    updateItem,
    addItem,
    deleteItem,
  };
}


// おみくじエディット用
export function useEditOmikuji(STATE: DefaultState, ) {
  // メッセージタイプの配列
  const messageTypes = ["message", "party", "toast", "speech"] as const;
  type MessageType = (typeof messageTypes)[number];

  // フィルタリング基準の選択肢
  const thresholdTypes = [
    { text: "なし", value: "none" },
    { text: "時間指定(0-23時)", value: "time" },
    { text: "配信枠:コメント数", value: "lc" },
    { text: "配信枠:個人コメント数", value: "no" },
    { text: "総数:個人コメント数", value: "tc" },
    { text: "前回からの経過時間(秒)", value: "second" },
    { text: "前回からの経過時間(分)", value: "minute" },
    { text: "前回からの経過時間(時)", value: "hour" },
    { text: "前回からの経過時間(日数)", value: "day" },
    { text: "ギフト金額", value: "price" },
    { text: "その他(script参照)", value: "custom" },
  ];
  // 比較方法の選択肢
  const comparisonItems = [
    { text: "以下", value: 'min' },
    { text: "等しい", value: 'equal' },
    { text: "以上", value: 'max' },
    { text: "ループ", value: 'loop' },
    { text: "範囲", value: 'range' },
  ];


  // 新しいメッセージを追加
  const addPost = (omikuji: OmikujiMessage, type: MessageType) => {
    if (!Array.isArray(omikuji[type])) {
      omikuji[type] = [];
    }
    (omikuji[type] as Post[]).push({
      botKey: 0,
      iconKey: "",
      delaySeconds: 0,
      content: "",
    });
  };


  // メッセージを削除
  const removePost = (omikuji: OmikujiMessage, type: MessageType, index: number) => {
    (omikuji[type] as Post[])?.splice(index, 1);
  };


  function sanitizeThresholdSettings(editingItem: Ref<any>) {
    if (!editingItem.value || !editingItem.value.threshold) {
      return false;
    }

    const threshold = editingItem.value.threshold;
    let { type, comparison, value, valueMax } = threshold;
    let modified = false;

    const sanitizeNumber = (num: number, min: number, max: number) => {
      return Math.max(min, Math.min(num, max));
    };

    switch (type) {
      case "time":
        comparison = "range";
        value = sanitizeNumber(value, 0, 23);
        valueMax = sanitizeNumber(valueMax, 0, 23);
        // 23時から6時のような指定を許可
        if (value > valueMax && valueMax !== value) {
          // この場合は正常なので何もしない
        } else if (value === valueMax) {
          valueMax = (value + 1) % 24; // 1時間の範囲を設定
        }
        break;

      case "second":
      case "minute":
      case "hour":
      case "day":
        if (["equal", "loop"].includes(comparison)) {
          comparison = "min";
          modified = true;
        }
        value = Math.max(0, value);
        if (comparison === "range") {
          valueMax = Math.max(value + 1, valueMax);
        }
        break;

      case "price":
        if (comparison === "loop") {
          comparison = "min";
          modified = true;
        }
        value = Math.max(0, value);
        if (comparison === "range") {
          valueMax = Math.max(value + 1, valueMax);
        }
        break;

      case "lc":
      case "no":
      case "tc":
      case "custom":
        value = Math.max(0, value);
        if (comparison === "range") {
          valueMax = Math.max(value + 1, valueMax);
        }
        break;

      default:
        return false;
    }

    // 変更があった場合、編集中のアイテムを更新
    if (
      modified ||
      threshold.comparison !== comparison ||
      threshold.value !== value ||
      threshold.valueMax !== valueMax
    ) {
      editingItem.value.threshold = { ...threshold, comparison, value, valueMax };
      console.log(
        "Threshold settings were adjusted:",
        editingItem.value.threshold
      );
      return true; // 変更があったことを示す
    }

    return false; // 変更がなかったことを示す
  }


  // weight の数値を合計したものと、引数に対しての％を返す
  // 後で他でも使えるようにしたいな
  const sumWeightValues = (num: number) => {
    const total = STATE.omikuji.reduce(
      (sum, obj) => sum + (obj.hasOwnProperty("weight") ? obj.weight : 0),
      0
    );

    // totalが0の場合は0を返す
    if (total <= 0) {
      return 0; // または適切なデフォルト値を返す
    }

    return Math.round((num / total) * 100);
  };




  return {
    addPost,
    messageTypes,
    thresholdTypes,
    comparisonItems,
    removePost,
    sanitizeThresholdSettings,
    sumWeightValues,
  };
}




export function useItemEditor(props: {
  STATE: DefaultState;
  selectedItem: SelectedItem;
}, emit: (event: 'update:item', value: any) => void) {
  const editingItem = ref<any>(null);

  const initializeEditingItem = () => {
    console.log('ItemEditor: initializeEditingItem called', props.selectedItem);
    if (props.selectedItem && props.selectedItem.index !== undefined) {
      const itemArray = props.STATE[props.selectedItem.type as keyof DefaultState] as any[];
      editingItem.value = JSON.parse(JSON.stringify(itemArray[props.selectedItem.index]));
      // threshold プロパティが存在しない場合、デフォルト値を設定
      if (!editingItem.value.threshold) {
        editingItem.value.threshold = {
          type: 'none',
          comparison: 'min',
          value: 0,
          valueMax: 0
        };
      }
    } else {
      editingItem.value = null;
    }
  };

  onMounted(() => {
    initializeEditingItem();
  });

  watch(() => props.selectedItem, () => {
    console.log('ItemEditor: selectedItem changed');
    initializeEditingItem();
  }, { deep: true });

  watch(editingItem, (newValue) => {
    console.log('ItemEditor: editingItem changed', newValue);
    if (newValue) {
      emit('update:item', newValue);
    }
  }, { deep: true });

  return {
    editingItem
  };
}