import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/tokens.css'  // first
import './styles/style.css'   // second (uses the tokens)

createApp(App).use(createPinia()).use(router).mount('#app')