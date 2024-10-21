// src/main.js
import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import 'vuetify/styles'
import App from './App.vue'

const vuetify = createVuetify()

createApp(App).use(vuetify).use(Toast).mount('#app')