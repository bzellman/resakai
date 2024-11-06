import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/pages/persondata',
                    name: 'persondata',
                    component: () => import('@/views/pages/PersonData.vue')
                },
                {
                    path: '/pages/professionalsummaries',
                    name: 'professionalsummaries',
                    component: () => import('@/views/pages/ProfessionalSummaries.vue')
                },
                {
                    path: '/pages/jobhistory',
                    name: 'jobhistory',
                    component: () => import('@/views/pages/JobHistory.vue')
                }
            ]
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
        }
    ]
});

export default router;
