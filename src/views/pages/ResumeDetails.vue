<script setup lang="ts">
import { ref, computed } from 'vue';
import SkillDetails from './SkillDetails.vue';
import ProjectDetails from './ProjectDetails.vue';
import PersonDetails from './PersonData.vue';
import EducationDetails from './EducationDetails.vue';
import VolunteerDetails from './VolunteerDetails.vue';
import ProfessionalSummaries from './ProfessionalSummaries.vue';
import CertificationDetails from './CertificationsDetails.vue';

// Import PrimeVue components
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Menubar from 'primevue/menubar';
import MultiSelect from 'primevue/multiselect';
import InputSwitch from 'primevue/inputswitch';
import InputText from 'primevue/inputtext';

// Centralized filter state
const globalFilter = ref('');
const selectedTags = ref([]);
const showIncludedOnly = ref(false);

import { useEntity } from '../composables/useEntity';
import { useTagsStore } from '../../stores/resumeDataStore';

const tagsStore = useTagsStore();
const { filteredTags, searchTags } = useEntity(tagsStore);

const computedFilteredTags = computed(() => filteredTags.value);
const handleSearchTags = (event) => {
    searchTags(event.query);
};
</script>
<!-- src/views/pages/ResumeDetails.vue -->

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
            <TabPanel header="My Info">
                <PersonDetails :globalFilter="globalFilter" />
            </TabPanel>
            <TabPanel header="Summaries">
                <ProfessionalSummaries :globalFilter="globalFilter" />
            </TabPanel>
            <TabPanel header="Skills">
                <SkillDetails :globalFilter="globalFilter" />
            </TabPanel>
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
