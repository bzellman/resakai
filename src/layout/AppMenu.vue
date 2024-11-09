<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Pages',
        icon: 'pi pi-fw pi-briefcase',
        to: '/pages',
        items: [
            {
                label: 'My Info',
                icon: 'pi pi-fw pi-circle-off',
                to: '/pages/persondata'
            },
            {
                label: 'Professional Summaries',
                icon: 'pi pi-fw pi-circle-off',
                to: '/pages/professionalsummaries'
            },
            {
                label: 'Job History',
                icon: 'pi pi-fw pi-circle-off',
                to: '/pages/jobhistory'
            },
            {
                label: 'Skills',
                icon: 'pi pi-fw pi-circle-off',
                to: '/pages/skilldetails'
            },
            {
                label: 'Certifications',
                icon: 'pi pi-fw pi-circle-off',
                to: '/pages/certificationsdetails'
            },
            {
                label: 'Education',
                icon: 'pi pi-fw pi-circle-off',
                to: '/pages/educationdetails'
            },
            {
                label: 'Projects',
                icon: 'pi pi-fw pi-circle-off',
                to: '/pages/projectdetails'
            },
            {
                label: 'Resume Details',
                icon: 'pi pi-fw pi-circle-off',
                to: '/pages/resumedetails'
            }
        ]
    }
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
