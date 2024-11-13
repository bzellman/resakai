//ResumeDetails.vue
<script setup lang="ts">
import { FilterMatchMode } from '@primevue/core/api';
import Menubar from 'primevue/menubar';
import MultiSelect from 'primevue/multiselect';
import TabPanel from 'primevue/tabpanel';
import TabView from 'primevue/tabview';
import { computed, onMounted, ref, watch } from 'vue';
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
    tags: { value: null, matchMode: FilterMatchMode.CONTAINS }
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

watch(filters, (tags) => {
    // filters.value.selectedTags = newTags;
    console.log('new Filters tags:', tags);
});
</script>

<template>
    <div class="card">
        <Menubar>
            <template #start>
                <div>
                    <MultiSelect v-model="filters.tags.value" :options="allTags" optionLabel="label" optionValue="value" placeholder="Select Tags"></MultiSelect>
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
                <ProfessionalSummaries />
            </TabPanel>
            <TabPanel header="Job History">
                <JobHistory />
            </TabPanel>
            <TabPanel header="Skills">
                <SkillDetails :filters="filters" />
            </TabPanel>
            <TabPanel header="Education">
                <EducationDetails />
            </TabPanel>
            <TabPanel header="Certifications">
                <CertificationDetails />
            </TabPanel>
            <TabPanel header="Project Details">
                <ProjectDetails />
            </TabPanel>
            <TabPanel header="Volunteer Work">
                <VolunteerDetails />
            </TabPanel>
        </TabView>
    </div>
</template>
