// src/composables/AppPartsSnackbar.ts

import { App, ref, createApp, h } from 'vue'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'

type SnackbarColor = 'success' | 'error' | 'warning' | 'info'

interface SnackbarOptions {
  message: string
  color?: SnackbarColor
  timeout?: number
}

const SnackbarComponent = {
  name: 'SnackbarComponent',
  props: {
    message: String,
    color: String,
    timeout: Number,
  },
  setup(props: SnackbarOptions) {
    const isVisible = ref(true)

    return () =>
      h('v-snackbar', {
        modelValue: isVisible.value,
        'onUpdate:modelValue': (val: boolean) => (isVisible.value = val),
        color: props.color,
        timeout: props.timeout,
      }, [
        props.message,
        h('template', { slot: 'actions' }, [
          h('v-btn', {
            color: 'white',
            text: true,
            onClick: () => (isVisible.value = false),
          }, '閉じる'),
        ]),
      ])
  },
}

export const createSnackbarPlugin = () => {
  const snackbar = {
    show(options: SnackbarOptions) {
      const mountPoint = document.createElement('div')
      document.body.appendChild(mountPoint)

      const app = createApp(SnackbarComponent, {
        ...options,
        onVnodeUnmounted: () => {
          document.body.removeChild(mountPoint)
        },
      })

      app.use(createVuetify())
      app.mount(mountPoint)

      setTimeout(() => {
        app.unmount()
      }, options.timeout || 3000)
    },
  }

  return {
    install(app: App) {
      app.config.globalProperties.$snackbar = snackbar
      app.provide('snackbar', snackbar)
    },
  }
}

// プラグインの型定義を拡張
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $snackbar: {
      show: (options: SnackbarOptions) => void
    }
  }
}