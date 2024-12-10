// src/config.ts

interface Configs {
  scriptRoot: string;
  dataRoot: string;
  isCreateService: boolean;
  basicDelaySeconds: number;
  botUserId: string;
  PLUGIN_UID:string;
}

// 環境変数 NODE_ENV=development を設定していれば開発、そうでないなら本番
process.env.NODE_ENV = process.env.NODE_ENV || "production";
const isProduction = process.env.NODE_ENV === "development";

export const configs = {
  scriptRoot: process.env.VUE_APP_SCRIPT_ROOT,
  dataRoot:
    process.env.NODE_ENV === "production"
      ? process.env.VUE_APP_DATA_ROOT
      : process.env.VUE_APP_SCRIPT_ROOT,
  isCreateService: true,
  basicDelaySeconds: 1,
  botUserId: "FirstCounter",
  PLUGIN_UID: "OmikenPlugin01",
};
