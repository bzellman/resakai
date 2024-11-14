//ResumeDetails.vue
<script setup lang="ts">
import { FilterMatchMode } from '@primevue/core/api';
import Menubar from 'primevue/menubar';
import MultiSelect from 'primevue/multiselect';
import TabPanel from 'primevue/tabpanel';
import TabView from 'primevue/tabview';
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
                    <ToggleSwitch v-model="filters.included.value" :true-value="true" :false-value="null" />

                    <!-- <ToggleButton v-model="filters.included.value" onLabel="Included Only" offLabel="All" :onIcon="'pi pi-check'" :offIcon="'pi pi-times'" /> -->
                </div>
            </template>
        </Menubar>
    </div>

    <div class="card">
        <TabView>
            <TabPanel header="My Info">
                <PersonDetails />
            </TabPanel>
            <TabPanel header="Summaries">
                <ProfessionalSummaries :filters="filters" />
            </TabPanel>
            <TabPanel header="Job History">
                <JobHistory :filters="filters" />
            </TabPanel>
            <TabPanel header="Skills">
                <SkillDetails :filters="filters" />
            </TabPanel>
            <TabPanel header="Education">
                <EducationDetails :filters="filters" />
            </TabPanel>
            <TabPanel header="Certifications">
                <CertificationDetails :filters="filters" />
            </TabPanel>
            <TabPanel header="Project Details">
                <ProjectDetails :filters="filters" />
            </TabPanel>
            <TabPanel header="Volunteer Work">
                <VolunteerDetails :filters="filters" />
            </TabPanel>
        </TabView>
    </div>
</template>
