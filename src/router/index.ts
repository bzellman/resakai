import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import AppLayout from '../layout/AppLayout.vue';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        component: AppLayout,
        children: [
            {
                path: '/pages/resumedetails',
                name: 'resumedetails,',
                component: () => import('../views/pages/ResumeDetails.vue')
            },
            {
                path: 'pages/activeresume',
                name: 'activeresume,',
                component: () => import('../views/pages/ActiveResume.vue')
            }
        ]
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
