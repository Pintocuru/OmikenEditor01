import path from 'path';
import { VueLoaderPlugin } from 'vue-loader';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { ENV } from './webpackENV.js';
import { fileURLToPath } from 'url';

// 現在のファイルのURLを基に、ディレクトリパスを取得
const __filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(__filename);

// 個別用
export default (env, argv) => {
 const mode = argv.mode || 'development';
 const envConfig = ENV[mode];

 return {
  mode: mode, // モード
  entry: './main.ts', // エントリーポイント
  context: path.resolve(dirname, 'src'), // 対象フォルダ
  output: {
   filename: 'script.js', // 出力ファイル名
   path: path.resolve(dirname, 'dist'), // 出力ディレクトリ
   clean: true // 出力ディレクトリをクリーンアップ
  },
  plugins: [
   // Vue用のWebpackプラグイン
   new VueLoaderPlugin(),
   // HTML
   new HtmlWebpackPlugin({
    template: './index.ejs',
    filename: 'index.html',
    inject: 'body',
    templateParameters: envConfig,
    minify: false // コード量を軽減する
   })
  ],
  resolve: {
   extensions: ['.ts', '.js', '.vue'] // 省略可能な拡張子
  },
  module: {
   rules: [
    // Vueファイルを処理
    {
     test: /\.vue$/,
     loader: 'vue-loader'
    },
    // TypeScriptファイルを処理
    {
     test: /\.ts$/,
     loader: 'ts-loader',
     exclude: /node_modules/,
     options: {
      transpileOnly: true // 型チェックを除外
     }
    },
    {
     test: /\.css$/,
     use: ['style-loader', 'css-loader']
    }
   ]
  },
  // 外部で使用するもの
  externals: {
   vue: 'Vue',
   vuetify: 'Vuetify',
   lodash: 'lodash',
   sweetalert2: 'Swal',
   vuedraggable: 'vuedraggable',
   zod: 'Zod',
  },
  optimization: {
   minimize: false, // コードの最小化
   usedExports: true, // 使用されていないエクスポートを削除
   sideEffects: true // サイドエフェクトがない場合、不要なコードを削除
  },

 };
};
