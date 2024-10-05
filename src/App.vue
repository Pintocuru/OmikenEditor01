<!-- src/App.vue -->
<template>
  <v-app>
    <v-container fluid>
      <v-row>
        <v-col cols="3">
          <NavigationList 
          v-model="tab"
          :rules="state.rules" 
          :omikujiMessages="state.botMessage.omikuji"
         :randomItems="state.botMessage.random" 
         :selectedItem="selectedItem"
          @add-rule="addRule"
            @add-omikuji="addOmikuji" 
            @add-random="addRandom"
             @select-item="selectItem"
                 @update:tab="updateTab"
              />
        </v-col>
        <v-col cols="9">
          <v-card>
            <v-card-title>おみくじエディタ</v-card-title>
            <v-card-text>
              <v-window v-model="tab">
                <v-window-item>
                  <RuleEditor v-if="selectedItem?.type === 'rule'" :rule="state.rules[selectedItem.index]"
                    @delete="deleteItem('rule', selectedItem.index)" />
                  <v-alert v-else type="info">左側のリストからルールを選択してください。</v-alert>
                </v-window-item>
                <v-window-item>
                  <OmikujiEditor v-if="selectedItem?.type === 'omikuji'"
                    :omikuji="state.botMessage.omikuji[selectedItem.index]"
                    @delete="deleteItem('omikuji', selectedItem.index)" />
                  <v-alert v-else type="info">左側のリストからおみくじを選択してください。</v-alert>
                </v-window-item>
                <v-window-item>
                  <RandomEditor v-if="selectedItem?.type === 'random'" :random="state.botMessage.random"
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

<script lang="ts">
import { ref, reactive, onMounted, computed, watch, defineModel } from 'vue';
import NavigationList from './components/NavigationList.vue';
import RuleEditor from './components/RuleEditor.vue';
import OmikujiEditor from './components/OmikujiEditor.vue';
import RandomEditor from './components/RandomEditor.vue';
import type { DefaultState, omikujiRule, OmikujiMessage, RandomItem } from './types';
import type { SelectedItem, ItemType } from './AppTypes.ts';

export default {
  components: {
    NavigationList,
    RuleEditor,
    OmikujiEditor,
    RandomEditor,
  },
  setup() {
    // defineModelを使用してtab、state、selectedItemを定義
    const tab = defineModel<number | null>('tab', { default: null });
    const state = defineModel<DefaultState>('state');
    const selectedItem = defineModel<SelectedItem | null>('selectedItem', { default: null });


    // tabの変化を監視(test)
    watch(tab, (newValue, oldValue) => {
      console.log('タブが変化しました:', { newValue, oldValue });
      console.log('現在の選択アイテム:', selectedItem.value);
    });
    // タブを更新する関数
    const updateTab = (newTab: number) => {
      tab.value = newTab;
    };

    // アプリケーションの状態を管理
    const state = reactive<DefaultState>({
      defaultRules: [], 
      rules: [],
      botMessage: {
        omikuji: [],
        random: [], 
      },
    });

    // ローディング状態を管理
    const loading = ref(true);

    // 保存状態のメッセージを管理
    const saveStatus = ref('');

    // 選択されたアイテムを管理
    // defineModel を使って下さい
    const selectedItem = ref<SelectedItem | null>(null);

    // スナックバーの表示状態を管理
    const showSnackbar = ref(false);

    // データをフェッチする非同期関数
    const fetchData = async () => {
      try {
        loading.value = true;
        const response = await fetch('/src/state.json');
        if (!response.ok) {
          throw new Error('Network response was not ok: ' + response.statusText);
        }
        const data = await response.json();
        Object.assign(state, data);
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

    // 新しいルールを作成する関数
    const createNewRule = (): omikujiRule => ({
      name: "",
      modes: "", // 文字列に変更
      modeSelect: [], // 追加
      switch: 0, // 数値に変更
      matchExact: [],
      matchStartsWith: [],
      matchIncludes: [],
    });

    // ルールを追加する関数
    const addRule = () => {
      const newRule = createNewRule();
      state.rules.push(newRule);
      selectItem('rule', state.rules.length - 1);
    };

    // 新しいおみくじを作成する関数
    const createNewOmikuji = (): OmikujiMessage => ({
      weight: 0,
      threshold: {
        type: 'none', // 追加
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
      selectItem('omikuji', state.botMessage.omikuji.length - 1);
    };

    // ランダムアイテムを追加する関数
    const addRandom = () => {
      // randomキーが存在しない場合は初期化
      if (!state.botMessage.random) {
        state.botMessage.random = []; // 空の配列として初期化
      }
      const newItem: RandomItem = {
        tag: '',
        weight: 0,
        group: 0,
        content: '',
      };
      state.botMessage.random.push(newItem);
      selectItem('random', state.botMessage.random.length - 1);
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

      // 選択されているアイテムをクリア
      if (isItemSelected(type, index)) {
        selectedItem.value = null;
      }
    };

    // アイテムを選択する関数
    const selectItem = (type: ItemType, index: number) => {
      selectedItem.value = { type, index };
    };

    // アイテムが選択されているかチェックする関数
    const isItemSelected = (type: ItemType, index: number) =>
      selectedItem.value && selectedItem.value.type === type &&
      selectedItem.value.index === index;

    const isSelected = computed(() => isItemSelected);

    // コンポーネントのマウント
    onMounted(() => {
      fetchData();
    });

    return {
      tab,
      updateTab,
      state,
      loading,
      saveStatus,
      selectedItem,
      showSnackbar,
      fetchData,
      saveData,
      addRule,
      addOmikuji,
      addRandom,
      deleteItem,
      selectItem,
      isSelected,
    };
  },
};
</script>