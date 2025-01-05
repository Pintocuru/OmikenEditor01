// webpack.config.mjs
import { fileURLToPath, URL } from 'url';
import { VueLoaderPlugin } from 'vue-loader';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import TerserPlugin from 'terser-webpack-plugin';
import sass from 'sass';

export default {
 mode: 'production', // 本番:production 開発:development
 entry: './main.ts', // エントリーポイント
 context: fileURLToPath(new URL('./src', import.meta.url)), // 対象フォルダ
 output: {
  filename: '[name].js', // 出力ファイル名
  path: fileURLToPath(new URL('./dist', import.meta.url)), // 出力ディレクトリ
  clean: true // 出力ディレクトリをクリーンアップ
 },
 resolve: {
  extensions: ['.ts', '.js', '.vue', '.json'], // 拡張子の省略
  alias: {
   '@': fileURLToPath(new URL('./src', import.meta.url)),
   '@type': fileURLToPath(new URL('./src/type.ts', import.meta.url)),
   vue: '@vue/runtime-dom'
  }
 },
 module: {
  rules: [
   // Vueファイル
   {
    test: /\.vue$/,
    use: 'vue-loader'
   },
   // TypeScriptファイル
   {
    test: /\.ts$/,
    exclude: /node_modules/,
    use: [
     {
      loader: 'ts-loader',
      options: {
       appendTsSuffixTo: [/\.vue$/],
       transpileOnly: true, // 型チェックを有効化
       configFile: 'tsconfig.json'
      }
     }
    ]
   },
   // CSSファイル
   {
    test: /\.css$/,
    use: ['style-loader', 'css-loader']
   },
   // SCSSファイル
   {
    test: /\.s(a|c)ss$/,
    use: [
     'style-loader',
     'css-loader',
     {
      loader: 'sass-loader',
      options: {
       implementation: sass
      }
     }
    ]
   },
   // 画像ファイル(要らないと思う)
   {
    test: /\.(eot|ttf|woff|woff2)$/,
    type: 'asset/resource'
   }
  ]
 },
 plugins: [
  // Vue用プラグイン
  new VueLoaderPlugin(),
  // HTMLプラグイン(小さいのでminifyは不要)
  new HtmlWebpackPlugin({
   template: './index.ejs',
   filename: 'index.html',
   inject: 'body'
  }),
  // 軽量化するプラグインらしい
  new BundleAnalyzerPlugin({
   analyzerMode: 'static',
   openAnalyzer: false
  })
 ],
 optimization: {
  minimize: true, // コードを最小化
  usedExports: true, // 使用されていないエクスポートを削除
  sideEffects: true, // サイドエフェクトがないコードを削除
  splitChunks: {
   // チャンクの分割を制御
   cacheGroups: {
    defaultVendors: {
     name: 'vendors', // ベンダーコードを 'vendors.js' に含める
     test: /[\\/]node_modules[\\/]/,
     chunks: 'all',
     enforce: true
    },
    default: {
     name: 'main', // アプリケーションコードを 'main.js' に含める
     chunks: 'all',
     enforce: true,
     minSize: 0
    }
   }
  },
  minimizer: [
   new TerserPlugin({
    terserOptions: {
     compress: {
      drop_console: true, // console.log等を削除
      pure_funcs: ['console.log'] // 特定の関数呼び出しを削除
     },
     mangle: true, // 変数名を短縮
     output: {
      comments: false // コメントを削除
     }
    }
   })
  ]
 }
};