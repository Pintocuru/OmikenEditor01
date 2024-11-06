<!-- src/components/ListPlace.vue -->
<template>
  <!-- Place List View -->
  <v-row dense>
    <v-col
      v-for="placeId in sortedPlaceIds"
      :key="placeId"
      cols="12"
      sm="6"
      md="4"
      lg="3"
    >
      <v-card variant="tonal">
        <!-- タイトルバーと操作ボタン -->
        <v-toolbar density="compact">
          <v-toolbar-title
            class="ml-4"
            @click="openEditorItem('place', placeId)"
          >
            {{ Omiken.place[placeId]?.name }}
          </v-toolbar-title>
          <template #append>
            <ListItemPartsAction
              selectCategory="place"
              :item="Omiken.place[placeId]"
              @edit="openEditorItem('place', placeId)"
              @update:Omiken="updateOmiken"
            />
          </template>
        </v-toolbar>

        <!-- プレースホルダー内容 -->
        <v-card-text class="py-4">
          <div class="list-group d-flex flex-wrap">
            <template
              v-for="(value, index) in getRandomValues(
                Omiken.place[placeId].values,
                3
              )"
              :key="index"
            >
              <span class="mr-2">{{ value }}</span>
            </template>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <v-sheet>
    <v-btn
      block
      @click="addItemPlace"
      color="primary"
      variant="flat"
      class="mt-6"
    >
      <v-icon left>mdi-plus</v-icon> 📍 プレースホルダーの追加
    </v-btn>
  </v-sheet>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ListItemPartsAction from "./common/ListItemPartsAction.vue";
import type {
  ListCategory,
  ListEntry,
  OmikenCategory,
  OmikenEntry,
  OmikenType,
  PlaceValueType,
} from "@/types";

const props = defineProps<{
  Omiken: OmikenType;
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

// TODO あとでTrello で、今からでもいいから作業のチケット管理を試みる
// 
// TODO
// わんコメプラグインでAPIの設置と試作
// 
// TODO プレースホルダーリスト
// 使用されているプレースホルダーの数を表示
// 0か1以上かがわかるようにしたい
// itemsの数もわかるようにしたい
// リストは3列が良い。
// Q.最大200とか区切ったほうがいいのだろうか？
//
//
//
// TODO　おみくじのリストの件
// 使用しているプレースホルダーをクリックでダイアログ表示
// これをListOmikujiでも使いたい
//
// TODO　おみくじのダイアログ
// <<>>で囲った時、place.nameと同じならリンクを表示し、
// 異なるなら赤く表示され、クリックすると「新しいプレースホルダーを作成しますか？」と
// 出て、新しいプレースホルダーを作成できる。
//
// TODO　おみくじのダイアログ
// widget編集モードの創設
// このボタンを置くなら、rulesだろう(リスト化されてるので)
//
// TODO　おみくじのダイアログ
// 複製・削除ボタンにツールチップを入れておく「複製」「削除」
// 追加ボタンにツールチップを入れておく
//
// TODO プレースホルダーのダイアログ
// 複製ボタンを作る
// 
//
// TODO プレースホルダーのダイアログ
// 「テキストエディターモード」の創設
//
// TODO ルールリスト
// 編集・複製・削除のボタン、大きいモード・小さいモードをON／OFFして
//
// TODO ルールリスト
// プレースホルダーの数値が意味不明。6 items　という表記が良い。
// 
// TODO プレースホルダーの仕様
// <<user>> <<ul>> <<price>>等の特殊な値を使えないようにしておきたい
//
// TODO プリセット
// 「ゲーム」の創設 スロットやバトルといったゲーム系おみくじを稼働させるための仕組み
//
//
//
//
//
//
//


// プレースホルダーIDをソートして取得
const sortedPlaceIds = computed(() => {
  return Object.keys(props.Omiken.place).sort((a, b) => {
    const nameA = props.Omiken.place[a]?.name || "";
    const nameB = props.Omiken.place[b]?.name || "";
    return nameA.localeCompare(nameB);
  });
});

// プレースホルダーの値をランダムに3つ取得
const getRandomValues = (values: PlaceValueType[], count: number) => {
  const shuffledValues = [...values].sort(() => Math.random() - 0.5);
  return shuffledValues.slice(0, count).map((v) => v.value);
};

// プレースホルダーのエディターを開く
const openEditorItem = (type: ListCategory, id: string) => {
  if (
    (type === "omikuji" && props.Omiken.omikuji?.[id]) ||
    (type === "place" && props.Omiken.place?.[id]) ||
    (type === "rules" && props.Omiken.rules?.[id])
  ) {
    emit("open-editor", {
      isOpen: true,
      type,
      mode: null,
      key: id,
    });
  }
};

// アイテムを追加
const addItemPlace = () => {
  emit("update:Omiken", {
    type: "place",
    addKeys: [{}],
  });
};

const updateOmiken = (payload: OmikenEntry<OmikenCategory>) =>
  emit("update:Omiken", payload);
</script>
