// 環境設定
export const ENV = {
 // development:開発環境設定
 development: {
  cssPath: '../src/css/app.css',
  vuePath: 'https://unpkg.com/vue@3/dist/vue.global.js',
  onesdkPath: '../../../public/onesdk.js',
  scriptPath: './script.js'
 },
 // production:本番環境設定
 production: {
  cssPath: './css/app.css',
  vuePath: '../__origin/js/vue3.min.js',
  onesdkPath: '../__origin/js/onesdk.js',
  scriptPath: './script.js'
 }
};
