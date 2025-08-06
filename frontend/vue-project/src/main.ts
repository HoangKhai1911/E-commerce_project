import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Import custom styles (nếu có)
// import './assets/main.scss'

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css'
// Import Bootstrap Icons CSS (cần thiết cho các icon trong header)
import 'bootstrap-icons/font/bootstrap-icons.css'

// Quan trọng: Import Bootstrap JS Bundle để kích hoạt các component tương tác
import 'bootstrap'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')