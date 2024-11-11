<script setup lang="ts">
import { ref } from 'vue';
// import SkillDetails from './SkillDetails.vue';
// import PersonDetails from './PersonData.vue';
import CertificationDetails from './CertificationsDetails.vue';
import EducationDetails from './EducationDetails.vue';
import JobHistory from './JobHistory.vue';
import ProfessionalSummaries from './ProfessionalSummaries.vue';
import ProjectDetails from './ProjectDetails.vue';
import VolunteerDetails from './VolunteerDetails.vue';

// Import PrimeVue components
import InputSwitch from 'primevue/inputswitch';
import InputText from 'primevue/inputtext';
import Menubar from 'primevue/menubar';
import MultiSelect from 'primevue/multiselect';
import TabPanel from 'primevue/tabpanel';
import TabView from 'primevue/tabview';

// Centralized filter state
const globalFilter = ref('');
const selectedTags = ref([]);
const showIncludedOnly = ref(false);

import { useTagsStore } from '../../stores/resumeDataStore';

const tagsStore = useTagsStore();
</script>

<template>
    <div class="card">
        <Menubar>
            <template #start>
                <div>
                    <MultiSelect v-model="selectedTags" :options="searchTags" placeholder="Select Tags" @complete="handleSearchTags"></MultiSelect>
                    <InputText v-model="globalFilter" placeholder="Search..."></InputText>
                    <InputSwitch v-model="showIncludedOnly" class="w-full"></InputSwitch>
                </div>
            </template>
        </Menubar>
    </div>

    <div class="card">
        <TabView>
            <!-- <TabPanel header="My Info"> -->
            <!-- <PersonDetails :globalFilter="globalFilter" /> -->
            <!-- </TabPanel> -->
            <TabPanel header="Summaries">
                <ProfessionalSummaries />
            </TabPanel>
            <TabPanel header="Job History">
                <JobHistory />
            </TabPanel>
            <!-- <TabPanel header="Skills"> -->
            <!-- <SkillDetails :globalFilter="globalFilter" /> -->
            <!-- </TabPanel> -->
            <TabPanel header="Education">
                <EducationDetails :globalFilter="globalFilter" />
            </TabPanel>
            <TabPanel header="Certifications">
                <CertificationDetails :globalFilter="globalFilter" />
            </TabPanel>
            <TabPanel header="Project Details">
                <ProjectDetails :globalFilter="globalFilter" />
            </TabPanel>

            <TabPanel header="Volunteer Work">
                <VolunteerDetails :globalFilter="globalFilter" />
            </TabPanel>
        </TabView>
    </div>
</template>
