//ResumeDetails.vue
<script setup lang="ts">
import { FilterMatchMode } from '@primevue/core/api';
import Menubar from 'primevue/menubar';
import MultiSelect from 'primevue/multiselect';
import TabPanel from 'primevue/tabpanel';
import { computed, onMounted, ref } from 'vue';
import { useTagsStore } from '../../stores/resumeDataStore';
import CertificationDetails from './CertificationsDetails.vue';
import EducationDetails from './EducationDetails.vue';
import JobHistory from './JobHistory.vue';
import PersonDetails from './PersonDetails.vue';
import ProfessionalSummaries from './ProfessionalSummaries.vue';
import ProjectDetails from './ProjectDetails.vue';
import SkillDetails from './SkillDetails.vue';
import VolunteerDetails from './VolunteerDetails.vue';

const filters = ref({
    tags: { value: null, matchMode: FilterMatchMode.CONTAINS },
    included: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const tagsStore = useTagsStore();

const allTags = computed(() => {
    return tagsStore.items.map((tag) => ({
        label: tag.tagName,
        value: tag.id
    }));
});

onMounted(async () => {
    await tagsStore.loadItems();
});
</script>

<template>
    <div class="card">
        <Menubar>
            <template #start>
                <div class="flex items-center gap-4">
                    <MultiSelect v-model="filters.tags.value" :options="allTags" optionLabel="label" optionValue="value" placeholder="Select Tags"></MultiSelect>
                    <!-- TODO: Refactor to use some kind of get/set to resolve error but use null in filter and falue in ToggleSwitch -->
                    <ToggleSwitch v-model="filters.included.value" :true-value="true" :false-value="null" />
                </div>
            </template>
        </Menubar>
    </div>

    <div class="card">
        <Tabs value="0">
            <TabList>
                <Tab value="0">My Info</Tab>
                <Tab value="1">Summaries</Tab>
                <Tab value="2">Job History</Tab>
                <Tab value="3">Skills</Tab>
                <Tab value="4">Education</Tab>
                <Tab value="5">Certifications</Tab>
                <Tab value="6">Project Details</Tab>
                <Tab value="7">Volunteer Work</Tab>
            </TabList>
            <TabPanels>
                <TabPanel value="0">
                    <PersonDetails />
                </TabPanel>
                <TabPanel value="1">
                    <ProfessionalSummaries :filters="filters" />
                </TabPanel>
                <TabPanel value="2">
                    <JobHistory :filters="filters" />
                </TabPanel>
                <TabPanel value="3">
                    <SkillDetails :filters="filters" />
                </TabPanel>
                <TabPanel value="4">
                    <EducationDetails :filters="filters" />
                </TabPanel>
                <TabPanel value="5">
                    <CertificationDetails :filters="filters" />
                </TabPanel>
                <TabPanel value="6">
                    <ProjectDetails :filters="filters" />
                </TabPanel>
                <TabPanel value="7">
                    <VolunteerDetails :filters="filters" />
                </TabPanel>
            </TabPanels>
        </Tabs>
    </div>
</template>
