// src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

// Import CSS toàn cục (bao gồm Bootstrap và tùy chỉnh của bạn)
import './assets/css/main.scss';

// Chỉ import các module JS của Bootstrap mà bạn thực sự cần để tối ưu bundle.
// Ví dụ: Navbar cần Collapse, Dropdown.
import 'bootstrap/js/dist/collapse';
import 'bootstrap/js/dist/dropdown';

// Import Bootstrap Icons CSS (nếu đã cài đặt npm install bootstrap-icons)
import 'bootstrap-icons/font/bootstrap-icons.css';


const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');