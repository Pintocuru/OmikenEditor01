// src/composables/funkJSON.ts
import { ref } from 'vue';
import { DataType, Mode, AppEditorType, OmikenType, ParamsType } from '@type';
import { configs } from '@/config';
import { validateData } from '@/composables/FunkValidate';
import Swal from 'sweetalert2';
import OneSDK from '@onecomme.com/onesdk';
import { AxiosRequestConfig } from 'axios';

// JSONデータの読み込み・書き込み
export function funkJSON() {
 const canUpdateJSON = ref(false); // * テストモード:JSONを書き込みするか
 const isLoading = ref(false); // 読み込み中かどうか、読み込み失敗ならずっとtrue
 const noAppBoot = ref(false); // 起動できたか

 // Omikenの保存
 const saveOmiken = async (Omiken: OmikenType): Promise<void> => {
  if (noAppBoot.value) {
   showToast('データ保存はできません', 'warning');
   return;
  }
  // テストモード:保存できたことをログに表示
  if (!canUpdateJSON.value) {
   showToast('💾saveDataまで届きました', 'info');
   console.warn('💾saveDataまで届きました:', Omiken);
   return;
  }
  // ロード中ならreturn
  if (isLoading.value) {
   console.warn('💾canUpdateJSON:true');
   return;
  }

  isLoading.value = true;

  try {
   const response = await ApiClient.request('POST', Mode.Backup, DataType.Omiken, Omiken);
   // PluginのAPIにPOST送信
   await Swal.fire({
    title: '保存したよ',
    text: 'データの保存に成功したよ。',
    icon: 'success',
    confirmButtonText: 'OK'
   });

   // エラーハンドリングしたいがなにをすればいいのか
   //if (!response.ok) throw new Error("Network response was not ok");
  } catch (error) {
   console.error('Error saving data:', error);
   await Swal.fire({
    title: '保存失敗',
    text: 'データの保存に失敗しました。',
    icon: 'error',
    confirmButtonText: 'OK'
   });
   throw error;
  } finally {
   isLoading.value = false;
  }
 };

 // Sweetalert2を使用したトースト的な通知
 const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  Swal.fire({
   toast: true,
   position: 'top-end',
   showConfirmButton: false,
   timer: 3000,
   timerProgressBar: true,
   icon: type,
   title: message
  });
 };

 return {
  canUpdateJSON,
  isLoading,
  saveOmiken
 };
}

const defaultOmiken: OmikenType = {
 types: {
  comment: [],
  timer: [],
  meta: [],
  waitingList: [],
  setList: [],
  reactions: [],
  unused: []
 },
 rules: {},
 omikujis: {},
 places: {}
};
export const defaultAppEditor: AppEditorType = {
 Presets: {},
 Charas: {},
 Scripts: {},
 Omiken: defaultOmiken
};

// APIクライアント
export class ApiClient {
 private static readonly baseUrl = `http://localhost:11180/api/plugins/${configs.PLUGIN_UID}`;

 static async request(
  method: 'GET' | 'POST',
  mode: ParamsType['mode'],
  type: ParamsType['type'],
  data?: object
 ): Promise<string> {
  const config: AxiosRequestConfig = {
   headers: { 'Content-Type': 'application/json' },
   data: data || {}
  };

  const url = `${this.baseUrl}?mode=${mode}&type=${type || ''}`;

  try {
   const response = method === 'GET' ? await OneSDK.get(url, {}) : await OneSDK.post(url, config);

   this.validateResponse(response, type);
   return response.data.response;
  } catch (error) {
   throw new ApiError(method, mode, type, error);
  }
 }

 // Validate: データがなければエラー
 private static validateResponse(response: any, type: string): void {
  if (!response.data || response.data.code !== 200) {
   throw new ApiError('VALIDATION', '', type, 'Invalid response');
  }
 }
}

// カスタムエラークラス
// TODO エラーハンドリングが詳しすぎて嫌、後で削る
export class ApiError extends Error {
 constructor(
  public method: string,
  public mode: string,
  public type: string,
  public originalError: unknown
 ) {
  super(`API Error: ${method} ${mode} ${type}`);
  this.name = 'ApiError';
 }
}

// メインのデータサービス
export class DataService {
 static async fetchInitialData(): Promise<AppEditorType> {
  try {
   const [presetsRaw, charasRaw, scriptsRaw, omikenData] = await Promise.all([
    ApiClient.request('GET', Mode.Data, DataType.Presets),
    ApiClient.request('GET', Mode.Data, DataType.Charas),
    ApiClient.request('GET', Mode.Data, DataType.Scripts),
    this.fetchOmiken()
   ]);

   return {
    Presets: JSON.parse(presetsRaw),
    Charas: JSON.parse(charasRaw),
    Scripts: JSON.parse(scriptsRaw),
    Omiken: omikenData
   };
  } catch (error) {
   if (error instanceof ApiError) {
    // APIエラーの専用ハンドリング
    await this.handleApiError(error);
   }
   throw error;
  }
 }

 // Omiken専用の読み込み
 private static async fetchOmiken(): Promise<OmikenType> {
  try {
   const rawData = await ApiClient.request('GET', Mode.Data, DataType.Omiken);
   const data = JSON.parse(rawData) as OmikenType;
   // 検証済みデータの作成
   const validatedData: OmikenType = {
    types: validateData('types', data.types),
    rules: validateData('rules', data.rules),
    omikujis: validateData('omikujis', data.omikujis),
    places: validateData('places', data.places)
   };
   return validatedData;
  } catch (error) {
   console.error('Omiken fetch failed:', error);
   return defaultOmiken;
  }
 }

 private static async handleApiError(error: ApiError) {
  console.error('API Error:', error);
 }
}
