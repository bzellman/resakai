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
            },
            {
                path: '/pages/skilldetails',
                name: 'skilldetails',
                component: () => import('../views/pages/SkillDetails.vue')
            },
            {
                path: '/pages/certificationsdetails',
                name: 'certificationsdetails',
                component: () => import('../views/pages/CertificationsDetails.vue')
            },
            {
                path: '/pages/educationdetails',
                name: 'educationdetails',
                component: () => import('../views/pages/EducationDetails.vue')
            },
            {
                path: '/pages/projectdetails',
                name: 'projectdetails,',
                component: () => import('../views/pages/ProjectDetails.vue')
            },
            {
                path: '/pages/volunteerdetails',
                name: 'volunteerdetails,',
                component: () => import('../views/pages/VolunteerDetails.vue')
            },
            {
                path: '/pages/resumedetails',
                name: 'resumedetails,',
                component: () => import('../views/pages/ResumeDetails.vue')
            }
        ]
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
