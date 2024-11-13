<script setup lang="ts">
import { FilterMatchMode } from '@primevue/core/api';
import { DataTableFilterMetaData } from 'primevue';
import Menubar from 'primevue/menubar';
import MultiSelect from 'primevue/multiselect';
import TabPanel from 'primevue/tabpanel';
import TabView from 'primevue/tabview';
import { computed, onMounted, ref, watch } from 'vue';
import { useTagsStore } from '../../stores/resumeDataStore';
import { useEntity } from '../composables/useEntity';
import CertificationDetails from './CertificationsDetails.vue';
import EducationDetails from './EducationDetails.vue';
import JobHistory from './JobHistory.vue';
import PersonDetails from './PersonDetails.vue';
import ProfessionalSummaries from './ProfessionalSummaries.vue';
import ProjectDetails from './ProjectDetails.vue';
import SkillDetails from './SkillDetails.vue';
import VolunteerDetails from './VolunteerDetails.vue';

export interface TableFilters {
    selectedTags: DataTableFilterMetaData;
}

const filters = ref<Record<string, DataTableFilterMetaData>>({
    selectedTags: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const selectedTags = ref([]);
const tagsStore = useTagsStore();
const { entity: tag, searchTags, handleTagInput } = useEntity(tagsStore);

const allTags = computed(() => {
    return tagsStore.items.map((tag) => ({
        label: tag.tagName,
        value: tag.id
    }));
});

onMounted(async () => {
    await tagsStore.loadItems();
});

watch(selectedTags, (newTags) => {
    filters.value.selectedTags.value = newTags;
});
</script>

<template>
    <div class="card">
        <Menubar>
            <template #start>
                <div>
                    <MultiSelect v-model="selectedTags" :options="allTags" optionLabel="label" optionValue="value" placeholder="Select Tags" @change="handleTagInput"></MultiSelect>
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
