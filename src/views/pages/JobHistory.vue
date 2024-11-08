<script setup lang="ts">
import Checkbox from 'primevue/checkbox';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useJobDescriptionsStore, useJobsStore, useTagsStore } from '../../stores/resumeDataStore';
import { Job, JobDescription } from '../../types/interfaceTypes';

const jobsStore = useJobsStore();
const jobDescriptionsStore = useJobDescriptionsStore();
const tagsStore = useTagsStore();
const toast = useToast();

const job = ref<Job>({
    id: '',
    jobTitle: '',
    companyName: '',
    startDate: undefined,
    endDate: undefined,
    location: '',
    tags: [],
    descriptions: [],
    createDate: new Date(),
    included: false
});

const tableData = computed(() => jobsStore.items || []);
const noData = computed(() => !jobsStore.items.length && !jobDescriptionsStore.items.length);
const expandedRows = ref<any[]>([]);
const filters = ref<any>({ global: { value: '' } });
const newDescriptions = ref<{ [key: string]: string }>({});
const newTags = ref<{ [key: string]: string[] }>({});
const filteredTags = ref<string[]>([]);
const includedDescriptions = ref<string[]>([]);
const includedJobs = ref<string[]>([]);

// Map to store selected tags for each description
const descriptionTagsMap = ref<{ [key: string]: string[] }>({});

// Function to search and filter tags
function searchTags(event: { query: string }) {
    const query = event.query.toLowerCase();
    filteredTags.value = tagsStore.items.map((tag) => tag.tagName).filter((tagName) => tagName && tagName.toLowerCase().includes(query));
}

// Handle tag input for new descriptions
function handleTagInput(jobId: string, event: KeyboardEvent) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const inputElement = event.target as HTMLInputElement;
        const input = inputElement.value.trim();

        if (input && !newTags.value[jobId].includes(input)) {
            newTags.value[jobId].push(input);
        }

        // Clear the input field
        inputElement.value = '';
    }
}

// Handle tag input for existing descriptions
function handleTagInputDescription(descriptionId: string, event: KeyboardEvent) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const inputElement = event.target as HTMLInputElement;
        const input = inputElement.value.trim();

        if (input) {
            if (!descriptionTagsMap.value[descriptionId]) {
                descriptionTagsMap.value[descriptionId] = [];
            }
            if (!descriptionTagsMap.value[descriptionId].includes(input)) {
                descriptionTagsMap.value[descriptionId].push(input);
            }
        }

        // Clear the input field
        inputElement.value = '';
    }
}

// Function to add a job description
function addJobDescription(jobId: string) {
    const description = newDescriptions.value[jobId];
    if (description) {
        const tags = newTags.value[jobId].map((tagName) => {
            let tag = tagsStore.items.find((t) => t.tagName === tagName);
            if (!tag) {
                tag = { id: tagsStore.createId(), tagName };
                tagsStore.addItem(tag);
            }
            return tag;
        });

        jobDescriptionsStore.addItem({
            id: jobDescriptionsStore.createId(),
            jobId,
            description,
            tags,
            included: false,
            createDate: new Date(),
            checked: false
        });
        newDescriptions.value[jobId] = '';
        newTags.value[jobId] = [];
        toast.add({ severity: 'success', summary: 'Success', detail: 'Job description added' });
    }
}

// Function to update a job description
function updateJobDescription(description: JobDescription) {
    const selectedTagsForDescription = descriptionTagsMap.value[description.id] || [];
    description.tags = selectedTagsForDescription.map((tagName) => {
        let tag = tagsStore.items.find((t) => t.tagName === tagName);
        if (!tag) {
            tag = { id: tagsStore.createId(), tagName };
            tagsStore.addItem(tag);
        }
        return tag;
    });
    jobDescriptionsStore.updateItem(description);
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Job Description Updated', life: 3000 });
}

// Function to toggle include for job descriptions
function toggleIncludeDescription(descriptionId: string) {
    const description = jobDescriptionsStore.items.find((desc) => desc.id === descriptionId);
    if (description) {
        description.included = !description.included;
        jobDescriptionsStore.updateItem(description);
        if (description.included) {
            includedDescriptions.value.push(descriptionId);
        } else {
            const index = includedDescriptions.value.indexOf(descriptionId);
            if (index !== -1) {
                includedDescriptions.value.splice(index, 1);
            }
        }
    }
}

// Function to toggle include for jobs
function toggleInclude(jobId: string) {
    const jobItem = jobsStore.items.find((job) => job.id === jobId);
    if (jobItem) {
        jobItem.included = !jobItem.included;
        jobsStore.updateItem(jobItem);
        if (jobItem.included) {
            includedJobs.value.push(jobId);
        } else {
            const index = includedJobs.value.indexOf(jobId);
            if (index !== -1) {
                includedJobs.value.splice(index, 1);
            }
        }
    }
}

// Load data on mounted
onMounted(async () => {
    await Promise.all([jobsStore.loadItems(), jobDescriptionsStore.loadItems(), tagsStore.loadItems()]);
    // Initialize descriptionTagsMap
    jobDescriptionsStore.items.forEach((description) => {
        descriptionTagsMap.value[description.id] = description.tags.map((tag) => tag.tagName);
    });
    // Initialize includedDescriptions and includedJobs
    includedDescriptions.value = jobDescriptionsStore.items.filter((description) => description.included).map((description) => description.id);
    includedJobs.value = jobsStore.items.filter((job) => job.included).map((job) => job.id);
});

// Function to edit a job
function editJob(jobItem: Job) {
    job.value = { ...jobItem };
}

// Function to delete a job
function deleteJob(jobId: string) {
    jobsStore.deleteItem(jobId);
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Job Deleted', life: 3000 });
}

// Function to delete a job description
function deleteJobDescription(descriptionId: string) {
    jobDescriptionsStore.deleteItem(descriptionId);
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Job Description Deleted', life: 3000 });
}

// Function to save a job
function saveJob() {
    if (job.value.jobTitle && job.value.companyName) {
        jobsStore.addItem({ ...job.value });
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Job Saved', life: 3000 });
        job.value = {
            id: '',
            jobTitle: '',
            companyName: '',
            startDate: undefined,
            endDate: undefined,
            location: '',
            tags: [],
            descriptions: [],
            createDate: new Date(),
            included: false
        };
    } else {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Job Title and Company Name are required', life: 3000 });
    }
}
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
                                    <div class="flex flex-col md:flex-row gap-4">
                                        <div class="flex flex-wrap gap-2 w-full md:w-full">
                                            <label for="jobTitle">Job Title</label>
                                            <InputText id="jobTitle" v-model="job.jobTitle" type="text" />
                                        </div>
                                    </div>
                                    <div class="flex flex-col md:flex-row gap-4">
                                        <div class="flex flex-wrap gap-2 w-full md:w-full">
                                            <label for="companyName" class="block">Company</label>
                                            <InputText id="companyName" v-model="job.companyName" type="text" class="w-full" />
                                        </div>
                                    </div>
                                    <div class="flex flex-col md:flex-row gap-4">
                                        <div class="flex flex-col gap-4 w-full">
                                            <div class="flex flex-wrap gap-2 w-full">
                                                <label for="startDate">Start Date</label>
                                                <DatePicker id="startDate" v-model="job.startDate" :showIcon="true" :showButtonBar="true" class="w-full"></DatePicker>
                                            </div>
                                        </div>
                                        <div class="flex flex-col gap-4 w-full">
                                            <div class="flex flex-wrap gap-2 w-full">
                                                <label for="endDate">End Date</label>
                                                <DatePicker id="endDate" v-model="job.endDate" :showIcon="true" :showButtonBar="true" class="w-full"></DatePicker>
                                            </div>
                                        </div>
                                    </div>
                                    <Button label="Save Job" icon="pi pi-save" @click="saveJob" />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionPanel>
                </Accordion>
            </Fluid>

            <div v-if="jobsStore.loading || jobDescriptionsStore.loading" class="flex justify-center items-center">
                <p>Loading...</p>
            </div>
            <div v-else-if="noData" class="flex flex-col items-center">
                <p>No job data available. Please add a new job.</p>
            </div>
            <div v-else>
                <DataTable
                    :value="jobsStore.items"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} jobs"
                    :rowsPerPageOptions="[5, 10, 25]"
                    v-model:expandedRows="expandedRows"
                    tableStyle="min-width: 60rem"
                    resizableColumns
                    columnResizeMode="fit"
                >
                    <template #header>
                        <div class="flex flex-wrap gap-2 items-center justify-between">
                            <h4 class="m-0">Job History</h4>
                            <span class="p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Search..." />
                            </span>
                        </div>
                    </template>

                    <Column style="width: 3em">
                        <template #body="slotProps">
                            <Checkbox :value="slotProps.data.id" v-model="includedJobs" @change="() => toggleInclude(slotProps.data.id)" />
                        </template>
                    </Column>

                    <Column expander style="width: 3em" />
                    <Column field="jobTitle" header="Job Title" sortable style="min-width: 12rem" />
                    <Column field="companyName" header="Company" sortable style="min-width: 16rem" />
                    <Column field="startDate" header="Start Date" sortable style="min-width: 12rem">
                        <template #body="slotProps">
                            {{ new Date(slotProps.data.startDate).toLocaleDateString() }}
                        </template>
                    </Column>
                    <Column field="endDate" header="End Date" sortable style="min-width: 12rem">
                        <template #body="slotProps">
                            {{ slotProps.data.endDate ? new Date(slotProps.data.endDate).toLocaleDateString() : 'Present' }}
                        </template>
                    </Column>
                    <Column header="Actions" style="min-width: 8rem">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editJob(slotProps.data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="deleteJob(slotProps.data.id)" />
                        </template>
                    </Column>

                    <template #expansion="slotProps">
                        <div class="p-4">
                            <h5>Job Descriptions for {{ slotProps.data.jobTitle }}</h5>
                            <div v-for="description in jobDescriptionsStore.items.filter((d) => d.jobId === slotProps.data.id)" :key="description.id" class="flex items-center gap-2 mb-2">
                                <Checkbox :value="description.id" v-model="includedDescriptions" @change="() => toggleIncludeDescription(description.id)" />
                                <InputText v-model="description.description" class="flex-grow" style="flex-basis: 75%" />
                                <div @keydown="(event) => handleTagInputDescription(description.id, event)" style="flex-basis: 25%">
                                    <AutoComplete
                                        :id="'tags-' + description.id"
                                        v-model="descriptionTagsMap[description.id]"
                                        :suggestions="filteredTags"
                                        placeholder="Add tags"
                                        @complete="searchTags"
                                        multiple
                                        :force-selection="false"
                                        class="w-full"
                                    />
                                </div>
                                <div class="flex gap-2">
                                    <Button icon="pi pi-save" class="p-button-rounded p-button-success" @click="updateJobDescription(description)" />
                                    <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="deleteJobDescription(description.id)" />
                                </div>
                            </div>
                            <div class="flex items-center gap-2 mt-2">
                                <InputText v-model="newDescriptions[slotProps.data.id]" placeholder="Add description" class="flex-grow" style="flex-basis: 75%" />
                                <div @keydown="(event) => handleTagInput(slotProps.data.id, event)" style="flex-basis: 25%">
                                    <AutoComplete id="new-tags" v-model="newTags[slotProps.data.id]" :suggestions="filteredTags" placeholder="Add tags" @complete="searchTags" multiple :force-selection="false" class="w-full" />
                                </div>
                                <div class="flex gap-2">
                                    <Button label="Add" icon="pi pi-plus" @click="addJobDescription(slotProps.data.id)" />
                                </div>
                            </div>
                        </div>
                    </template>
                </DataTable>
            </div>
        </div>
    </div>
</template>
