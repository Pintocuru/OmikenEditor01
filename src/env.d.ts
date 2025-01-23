/// <reference types="vite/client" />
import { ConfigProps } from './config';

// Vite環境変数の型定義
interface ImportMetaEnv extends ConfigProps {}

// import.meta型の定義
interface ImportMeta {
 readonly env: ImportMetaEnv;
}
