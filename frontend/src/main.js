import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios'; // <- sudah ada
axios.defaults.baseURL = 'http://localhost:5000'; // ✅ tambahkan ini
import { createPinia } from 'pinia'

import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import '@/assets/styles.scss';

const app = createApp(App);

app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
});
app.use(ToastService);
app.use(ConfirmationService);
app.use(createPinia())
app.mount('#app');
