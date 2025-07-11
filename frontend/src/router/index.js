import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/layout/AppLayout.vue'

const routes = [
    {
        path: '/',
        component: AppLayout,
        children: [
            {
                path: '/',
                name: 'dashboard',
                component: () => import('@/views/Dashboard.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: '/MasterData',
                name: 'MasterData',
                component: () => import('@/views/MasterData.vue'),
                meta: {
                    requiresAuth: true,
                    roles: ['admin']
                }
            },
            {
                path: '/HistoryPeminjaman',
                name: 'HistoryPeminjaman',
                component: () => import('@/views/HistoryPeminjaman.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: '/Inventory',
                name: 'Inventory',
                component: () => import('@/views/Inventory.vue'),
                meta: {
                    requiresAuth: true,
                    roles: ['admin']
                }
            },
            {
                path: '/Transaksi',
                name: 'Transaksi',
                component: () => import('@/views/Transaksi.vue'),
                meta: { requiresAuth: true }
            }
        ]
    },
    {
        path: '/landing',
        name: 'landing',
        component: () => import('@/views/pages/Landing.vue')
    },
    {
        path: '/pages/notfound',
        name: 'notfound',
        component: () => import('@/views/pages/NotFound.vue')
    },
    {
        path: '/auth/login',
        name: 'login',
        component: () => import('@/views/pages/auth/Login.vue'),
        meta: { guestOnly: true }
    },
    {
        path: '/auth/access',
        name: 'accessDenied',
        component: () => import('@/views/pages/auth/Access.vue')
    },
    {
        path: '/auth/error',
        name: 'error',
        component: () => import('@/views/pages/auth/Error.vue')
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/pages/notfound'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach(async (to) => {
    const auth = useAuthStore()

    if (!auth.token && localStorage.getItem('authToken')) {
        auth.token = localStorage.getItem('authToken')
    }

    if (to.meta.requiresAuth) {
        if (!auth.token) {
            return '/auth/login'
        }

        try {
            if (!auth.user) {
                await auth.fetchUser()
            }

            if (to.meta.roles) {
                if (!to.meta.roles.includes(auth.user.role)) {
                    if (auth.user.role === 'student') {
                        return '/'
                    }
                    return '/auth/access'
                }
            }
        } catch (error) {
            console.error('Failed to fetch user:', error)
            return '/auth/login'
        }
    }

    if (to.meta.guestOnly && auth.token) {
        return '/'
    }

    return undefined
})

export default router