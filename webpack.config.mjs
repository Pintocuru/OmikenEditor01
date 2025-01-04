// webpack.config.mjs
import { fileURLToPath, URL } from 'url';
import { VueLoaderPlugin } from 'vue-loader';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default (env, argv) => {
 return {
  mode: 'production', // 本番モード
  entry: './main.ts', // エントリーポイント
  context: fileURLToPath(new URL('./src', import.meta.url)), // 対象フォルダ
  output: {
   filename: 'script.js', // 出力ファイル名
   path: fileURLToPath(new URL('./dist', import.meta.url)), // 出力ディレクトリ
   clean: true // 出力ディレクトリをクリーンアップ
  },
  plugins: [
   new VueLoaderPlugin(), // Vue用プラグイン
   // HTMLプラグイン
   new HtmlWebpackPlugin({
    template: './src/index.ejs',
    filename: 'index.html',
    inject: 'body',
    minify: true // コード量を軽減する
   })
  ],
  resolve: {
   extensions: ['.ts', '.js', '.vue'], // 拡張子の省略
   alias: {
    '@': fileURLToPath(new URL('./src', import.meta.url)),
    '@type': fileURLToPath(new URL('./src/type.ts', import.meta.url))
   }
  },
  module: {
   rules: [
    // Vueファイル
    {
     test: /\.vue$/,
     loader: 'vue-loader'
    },
    // TypeScriptファイル
    {
     test: /\.ts$/,
     loader: 'ts-loader',
     exclude: /node_modules/,
     options: {
      transpileOnly: false // 型チェックを有効化（必要に応じて true に変更）
     }
    },
    // CSSファイル
    {
     test: /\.css$/,
     use: ['style-loader', 'css-loader']
    }
   ]
  },
  optimization: {
   minimize: true, // コードを最小化
   usedExports: true, // 使用されていないエクスポートを削除
   sideEffects: true // サイドエフェクトがないコードを削除
  }
 };
};
