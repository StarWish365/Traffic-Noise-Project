import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            redirect: '/main', // 当路径为 '/' 时，重定向到 '/history'
        },
        {
            path: '/main',
            name: 'main',
            component: () => import('@/views/mainMap.vue')
        },
        {
            path: '/data',
            name: 'data',
            component: () => import('../views/dataControl.vue')
        }
    ]
})

export default router
