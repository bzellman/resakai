//TODO: Refactor with useEntity.ts

<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useJobsStore } from '../../stores/resumeDataStore';
import { useEntity } from '../composables/useEntity';

const toast = useToast();
const jobsStore = useJobsStore();

const props = defineProps({
    filters: {
        type: Object,
        required: true
    }
});

const {
    entityDialog: jobDialog,
    entity: job,
    submitted,
    includedEntities: includedJobs,
    filters: filterFromEntity,
    allTags,
    relatedTags,
    searchTags,
    handleTagInput,
    getTagNameById,
    saveEntity: saveJob,
    editEntity: editJob,
    deleteEntity: deleteJob,
    toggleIncludeEntity: toggleIncludeJob
} = useEntity(jobsStore);

const noData = computed(() => !jobsStore.items.length);
const expandedRows = ref<any[]>([]);

// Load data on mounted
onMounted(async () => {
    await Promise.all([jobsStore.loadItems()]);
});
</script>

<template>
    <div>
        <div class="card">
            <Fluid>
                <Accordion value="0">
                    <AccordionPanel value="0">
                        <AccordionHeader>Add Job</AccordionHeader>
                        <AccordionContent>
                            <div class="flex mt-8">
                                <div class="card flex flex-col gap-4 w-full">
                                    <div class="flex flex-col gap-4">
                                        <div class="field">
                                            <label for="jobTitle">Job Title</label>
                                            <InputText id="jobTitle" v-model="job.jobTitle" placeholder="Enter job title" class="w-full" />
                                        </div>
                                        <div class="field">
                                            <label for="companyName">Company Name</label>
                                            <InputText id="companyName" v-model="job.companyName" placeholder="Enter company name" class="w-full" />
                                        </div>
                                        <div class="field flex gap-4">
                                            <div class="flex-1">
                                                <label for="startDate">Start Date</label>
                                                <Calendar id="startDate" v-model="job.startDate" placeholder="Select start date" class="w-full" />
                                            </div>
                                            <div class="flex-1">
                                                <label for="endDate">End Date</label>
                                                <Calendar id="endDate" v-model="job.endDate" placeholder="Select end date" class="w-full" />
                                            </div>
                                            <div class="flex-1">
                                                <label for="endDate">Location</label>
                                                <InputText id="endDate" v-model="job.location" placeholder="Location" class="w-full" />
                                            </div>
                                        </div>
                                        <div class="field">
                                            <label for="tags">Tags</label>
                                            <AutoComplete id="tags" v-model="relatedTags" :suggestions="allTags" placeholder="Add tags" @complete="searchTags" multiple :force-selection="false" @keydown="handleTagInput" class="w-full" />
                                        </div>
                                        <Button label="Save Job" icon="pi pi-save" @click="saveJob" class="w-full" />
                                    </div>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionPanel>
                </Accordion>
            </Fluid>

            <div v-if="jobsStore.loading" class="flex justify-center items-center">
                <p>Loading...</p>
            </div>
            <div v-else-if="noData" class="flex flex-col items-center">
                <p>No job data available. Please add a new job.</p>
            </div>
            <div v-else>
                <DataTable :value="jobsStore.items" :filters="filters" dataKey="id" :paginator="true" :rows="10" v-model:expandedRows="expandedRows">
                    <!-- Columns -->
                    <Column filterField="included" header="Included">
                        <template #body="slotProps">
                            <Checkbox :value="slotProps.data.id" v-model="includedJobs" @change="toggleIncludeJob(slotProps.data.id)" />
                        </template>
                    </Column>
                    <Column expander style="width: 3em" />

                    <Column field="jobTitle" header="Job Title" sortable></Column>
                    <Column field="companyName" header="Company Name" sortable></Column>
                    <Column filterField="tags" header="Tags">
                        <template #body="slotProps">
                            <div class="flex flex-wrap gap-1">
                                <Tag v-for="tagId in slotProps.data.tags" :key="tagId" :value="getTagNameById(tagId)" :rounded="true" />
                            </div>
                        </template>
                    </Column>
                    <!-- Actions Column -->
                    <Column header="Actions">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editJob(slotProps.data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="deleteJob(slotProps.data.id)" />
                        </template>
                    </Column>
                    <template #expansion="slotProps">
                        <JobDescriptionInput :parentJob="slotProps.data" :filters="filters" />
                    </template>
                </DataTable>
            </div>
        </div>
    </div>
</template>
