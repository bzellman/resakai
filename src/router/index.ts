import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import AppLayout from '../layout/AppLayout.vue';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        component: AppLayout,
        children: [
            {
                path: '/pages/persondata',
                name: 'persondata',
                component: () => import('../views/pages/PersonData.vue')
            },
            {
                path: '/pages/professionalsummaries',
                name: 'professionalsummaries',
                component: () => import('../views/pages/ProfessionalSummaries.vue')
            },
            {
                path: '/pages/jobhistory',
                name: 'jobhistory',
                component: () => import('../views/pages/JobHistory.vue')
            }
        ]
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
