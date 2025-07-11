import { defineStore } from 'pinia';
import { api } from '@/boot/axios';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: null,
    }),
    actions: {
        async login(username, password) {
            try {
                const response = await api.post('/api/auth/login', {
                    username,
                    password
                });

                this.token = response.data.token;
                this.user = response.data.user;

                if (localStorage) {
                    localStorage.setItem('authToken', this.token);
                }

                return response.data;
            } catch (error) {
                throw error;
            }
        }
    }
});