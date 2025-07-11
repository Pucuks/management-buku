import { defineStore } from 'pinia';
import { api } from '@/boot/axios';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: localStorage.getItem('authToken') || null,
    }),

    actions: {
        async login(username, password) {
            try {
                const response = await api.post('/api/auth/login', { username, password });

                this.token = response.data.token;
                this.user = response.data.user;
                localStorage.setItem('authToken', this.token);
                localStorage.setItem('nim', response.data.user.nim)
                localStorage.setItem('role', response.data.user.role)
                return response.data;
            } catch (error) {
                this.logout();
                throw error;
            }
        },

        async fetchUser() {
            try {
                if (!this.token) throw new Error('No token available');

                const response = await api.get('/api/auth/me', {
                    headers: {
                        Authorization: `Bearer ${this.token}`
                    }
                });

                this.user = response.data.user;
                return this.user;
            } catch (error) {
                console.error('Failed to fetch user:', error);

                if (error.response?.status === 401) {
                    this.logout();
                }

                throw error;
            }
        },

        logout() {
            this.user = null;
            this.token = null;
            this.returnUrl = null;
            localStorage.removeItem('authToken');
        },

        setReturnUrl(url) {
            this.returnUrl = url;
        }
    }
});