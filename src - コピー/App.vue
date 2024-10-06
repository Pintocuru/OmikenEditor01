<!-- src/App.vue -->
<template>
  <v-app>
    <v-container fluid>
       <pre>{{ JSON.stringify({ selectedItem, omikujiData: state.botMessage.omikuji }, null, 2) }}</pre>
      <v-row>
        <v-col cols="3">
         <NavigationList 
    :state="state"
    :selectedItem="selectedItem"
    @update:selectedItem="updateSelectedItem"
    @add-rule="addRule"
    @add-omikuji="addOmikuji"
    @add-random="addRandom"
    @delete-item="deleteItem"
  />
        </v-col>
        <v-col cols="9">
          <v-card>
            <v-card-title>おみくじエディタ</v-card-title>
            <v-card-text>
              <v-window v-model="tab">
                <v-window-item>
                  <RuleEditor 
                  v-if="selectedItem?.type === 'rule'"
                   v-model:rule="state.rules[selectedItem.index]"
                    :state="state"
                     :selectedItem="selectedItem" 
                    @delete="deleteItem('rule', selectedItem.index)" 
                    />
                  <v-alert v-else type="info">左側のリストからルールを選択してください。</v-alert>
                </v-window-item>
                <v-window-item>

  <OmikujiEditor
      v-if="selectedItem?.type === 'omikuji'"
      :state="state"
      :selectedItem="selectedItem"
      @update:omikuji="updateOmikuji"
    />

                  <v-alert v-else type="info">左側のリストからおみくじを選択してください。</v-alert>
                </v-window-item>
                <v-window-item>
                  <RandomEditor v-if="selectedItem?.type === 'random'"
                    v-model:random="state.botMessage.random[selectedItem.index]"
                    @delete="deleteItem('random', selectedItem.index)" />
                  <v-alert v-else type="info">左側のリストからランダムアイテムを選択してください。</v-alert>
                </v-window-item>
              </v-window>
            </v-card-text>
            <v-card-actions>
              <v-btn color="success" @click="saveData">保存</v-btn>
              <v-spacer></v-spacer>
              <v-snackbar v-model="showSnackbar" :timeout="3000">
                {{ saveStatus }}
              </v-snackbar>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, defineProps, defineEmits } from 'vue';
import NavigationList from './components/NavigationList.vue';
import RuleEditor from './components/RuleEditor.vue';
import OmikujiEditor from './components/OmikujiEditor.vue';
import RandomEditor from './components/RandomEditor.vue';
import type { DefaultState, omikujiRule, OmikujiMessage, RandomItem } from './types';
import type { SelectedItem, ItemType } from './AppTypes.ts';


// defineModelを使用してtab、state、selectedItemを定義
const tab = ref<number | null>(null);
// アプリケーションの状態
const state = reactive<DefaultState>({
  defaultRules: [],
  rules: [],
  botMessage: {
    omikuji: [],
    random: []
  },
});
// 選択されたアイテム
const selectedItem = ref<SelectedItem | null>(null);

// データをpropsとして受け取り、emitで親に伝える
const props = defineProps(['rules', 'omikujiMessages', 'randomItems']);
const emit = defineEmits(['update:tab', 'update:selectedItem', 'add-rule', 'add-omikuji', 'add-random', 'delete-item']);

// tabとselectedItemの更新をemit
const updateTab = (newTab: number) => {
  tab.value = newTab;
  emit('update:tab', newTab);
};

const selectItem = (type: ItemType, index: number) => {
  selectedItem.value = { type, index };
  emit('update:selectedItem', selectedItem.value);
};


// ローディング状態を管理
const loading = ref(true);

// スナックバーの表示状態を管理
const showSnackbar = ref(false);

// 保存状態のメッセージを管理
const saveStatus = ref('');


// データをフェッチする非同期関数
const fetchData = async () => {
  try {
    loading.value = true;
    const response = await fetch('/src/state.json');
    if (!response.ok) {
      throw new Error('Network response was not ok: ' + response.statusText);
    }
    const data = await response.json();

    // stateをまとめて更新
    Object.assign(state, {
      rules: data.rules || [],
      botMessage: {
        omikuji: data.botMessage.omikuji || [],
        random: data.botMessage.random || []
      }
    });
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
};

// データを保存する非同期関数
const saveData = async () => {
  try {
    saveStatus.value = 'Saving...';
    const response = await fetch('/src/state.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(state)
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

const updateSelectedItem = (newSelectedItem: SelectedItem) => {
  selectedItem.value = newSelectedItem;
};

// 新しいルールを作成する関数
const createNewRule = (): omikujiRule => ({
  name: "",
  modes: "",
  modeSelect: [],
  switch: 0,
  matchExact: [],
  matchStartsWith: [],
  matchIncludes: [],
});

// ルールを追加する関数
const addRule = () => {
  const newRule = createNewRule();
  state.rules.push(newRule);
  selectedItem.value = { type: 'rule', index: state.rules.length - 1 };
};

// 新しいおみくじを作成する関数
const createNewOmikuji = (): OmikujiMessage => ({
  weight: 0,
  threshold: {
    type: 'none',
    value: 0,
    loop: false,
    comparison: 0,
  },
  message: [],
  party: [],
  toast: [],
  speech: [],
});

// おみくじを追加する関数
const addOmikuji = () => {
  const newOmikuji = createNewOmikuji();
  state.botMessage.omikuji.push(newOmikuji);
  selectedItem.value = { type: 'omikuji', index: state.botMessage.omikuji.length - 1 };
};

// ランダムアイテムを追加する関数
const addRandom = () => {
  const newItem: RandomItem = {
    tag: '',
    weight: 0,
    group: 0,
    content: '',
  };
  state.botMessage.random.push(newItem);
  selectedItem.value = { type: 'random', index: state.botMessage.random.length - 1 };
};

// アイテムを削除する一般的な関数
const deleteItem = (type: ItemType, index: number) => {
  if (type === 'rule') {
    state.rules.splice(index, 1);
  } else if (type === 'omikuji') {
    state.botMessage.omikuji.splice(index, 1);
  } else if (type === 'random') {
    state.botMessage.random.splice(index, 1);
  }

  if (selectedItem.value && selectedItem.value.type === type && selectedItem.value.index === index) {
    selectedItem.value = null;
  }
};

// 選択されたおみくじを取得するコンピューテッドプロパティ
const getSelectedOmikuji = computed(() => {
  if (selectedItem.value?.type === 'omikuji' && selectedItem.value.index >= 0) {
    return state.botMessage.omikuji[selectedItem.value.index] || createNewOmikuji();
  }
  return createNewOmikuji(); // デフォルト値を返す
});

// おみくじを更新する関数
const updateOmikuji = (updatedOmikuji: OmikujiMessage) => {
  console.log('App: updateOmikuji called', updatedOmikuji);
  if (selectedItem.value?.type === 'omikuji' && selectedItem.value.index >= 0) {
    state.botMessage.omikuji[selectedItem.value.index] = updatedOmikuji;
  }
};


// アイテムが選択されているかチェックする関数
const isItemSelected = computed(() =>
  (type: ItemType, index: number) =>
    selectedItem.value?.type === type && selectedItem.value?.index === index
);

// コンポーネントのマウント
onMounted(() => {
  fetchData();
});

</script>