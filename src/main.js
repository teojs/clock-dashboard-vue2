import { PiniaVuePlugin, createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import Vue from 'vue'
import App from './App.vue'
import './style.css'

Vue.use(PiniaVuePlugin)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

new Vue({
  pinia,
  render: h => h(App),
}).$mount('#app')
