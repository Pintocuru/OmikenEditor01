// src/composables/funkJSON.ts
import { ref } from "vue";
import { validateData } from "./FunkValidate";
import type {
  AppEditerType,
  CharaType,
  OmikenType,
  PresetType,
} from "@/types/index";
import _ from "lodash";
import Swal from "sweetalert2";
import axios from "axios";
import { configs } from "@/config";

// JSONデータの読み込み・書き込み
export function funkJSON() {
  const canUpdateJSON = ref(false); // * テストモード:JSONを書き込みするか
  const isLoading = ref(false); // 読み込み中かどうか、読み込み失敗ならずっとtrue
  const noAppBoot = ref(false); // 起動できたか

  // Omikenの保存
  const saveOmiken = async (Omiken: OmikenType): Promise<void> => {
    if (noAppBoot.value) {
      showToast("データ保存はできません", "warning");
      return;
    }
    // テストモード:保存できたことをログに表示
    if (!canUpdateJSON.value) {
      showToast("💾saveDataまで届きました", "info");
      console.warn("💾saveDataまで届きました:", Omiken);
      return;
    }
    // ロード中ならreturn
    if (isLoading.value) {
      console.warn("💾canUpdateJSON:true");
      return;
    }

    isLoading.value = true;

    try {
      const response = await DataService.apiRequest(
        "POST",
        "writing",
        "",
        Omiken
      );
      // PluginのAPIにPOST送信
      await Swal.fire({
        title: "保存したよ",
        text: "データの保存に成功したよ。",
        icon: "success",
        confirmButtonText: "OK",
      });

      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json(); // ? これはなに？
    } catch (error) {
      console.error("Error saving data:", error);
      await Swal.fire({
        title: "保存失敗",
        text: "データの保存に失敗しました。",
        icon: "error",
        confirmButtonText: "OK",
      });
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  // Sweetalert2を使用したトースト的な通知
  const showToast = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "info"
  ) => {
    Swal.fire({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      icon: type,
      title: message,
    });
  };

  return {
    canUpdateJSON,
    isLoading,
    saveOmiken,
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
    unused: [],
  },
  rules: {},
  omikujis: {},
  places: {},
};
export const defaultAppEditer: AppEditerType = {
  Presets: {},
  Charas: {},
  Scripts: {},
  Omiken: defaultOmiken,
};

export class DataService {
  // 共通のAPI呼び出しメソッド
  static async apiRequest(
    method: "GET" | "POST",
    mode: string,
    type?: string,
    data?: object
  ): Promise<Record<string, unknown>> {
    const baseUrl = `http://localhost:11180/api/plugins/${configs.PLUGIN_UID}`;
    try {
      const url = `${baseUrl}?mode=${mode}&type=${type || ""}`;
      const response =
        method === "GET" ? await axios.get(url) : await axios.post(url, data);

      if (!response.data) {
        throw new Error(`No data returned for ${type}`);
      }

      return response.data as Record<string, unknown>;
    } catch (error) {
      console.error(`API Request Error (${method}, ${mode}, ${type}):`, error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(
            `API Error: ${error.response.status} - ${
              error.response.data?.message || "Unknown error"
            }`
          );
        } else if (error.request) {
          throw new Error(`No response received for ${type}`);
        }
      }

      throw new Error(
        `Failed to fetch ${type}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Omiken専用の読み込みメソッド
  private static async fetchOmiken(): Promise<OmikenType> {
    try {
      // APIリクエストの結果を取得
      const data = await this.apiRequest("GET", "data", "Omiken");

      // ステータスコードが 200 以外の場合はエラーをスロー
      if (data.code !== 200) {
        throw new Error(`Unexpected response code: ${data.code}`);
      }

      // 実際のデータが response 内に格納されていることを考慮
      const responseData = data.response as OmikenType;

      if (!responseData) {
        throw new Error("Response data is missing or invalid.");
      }

      // 検証済みデータの作成
      const validatedData: OmikenType = {
        types: validateData("types", responseData.types),
        rules: validateData("rules", responseData.rules),
        omikujis: validateData("omikujis", responseData.omikujis),
        places: validateData("places", responseData.places),
      };

      // データ読み込み成功の通知
      await Swal.fire({
        title: "読み込み完了",
        text: "データの読み込みが完了しました。",
        icon: "success",
        confirmButtonText: "OK",
      });

      return validatedData;
    } catch (error) {
      // エラーをコンソールに出力
      console.error("Failed to fetch Omiken:", error);

      // デフォルトデータを返す
      return defaultOmiken;
    }
  }

  // 初期データ一括読み込み
  static async fetchInitialData(): Promise<AppEditerType> {
    try {
      // APIリクエストと Omiken データを並行して取得
      const [presetsResponse, charasResponse, scriptsResponse, omikenData] =
        await Promise.all([
          this.apiRequest("GET", "data", "Presets"),
          this.apiRequest("GET", "data", "Charas"),
          this.apiRequest("GET", "data", "Scripts"),
          this.fetchOmiken(),
        ]);

      // code チェックと response の抽出
      if (presetsResponse.code !== 200 || !presetsResponse.response) {
        throw new Error("Failed to fetch Presets data");
      }
      if (charasResponse.code !== 200 || !charasResponse.response) {
        throw new Error("Failed to fetch Charas data");
      }
      if (scriptsResponse.code !== 200 || !scriptsResponse.response) {
        throw new Error("Failed to fetch Scripts data");
      }

      // AppEditerType を構築
      return {
        Presets: presetsResponse.response as Record<string, OmikenType>,
        Charas: charasResponse.response as Record<string, CharaType>,
        Scripts: scriptsResponse.response as Record<string, PresetType>,
        Omiken: omikenData,
      };
    } catch (error) {
      // エラー処理
      await this.handleInitializationError(error);
      throw error;
    }
  }

  // エラーハンドリング
  private static async handleInitializationError(error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "データの読み込みに失敗しました。";

    await Swal.fire({
      title: "読み込み失敗",
      text: errorMessage,
      icon: "error",
      confirmButtonText: "OK",
    });
  }
}
