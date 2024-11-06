<script setup lang="ts">
import { useJobsStore } from '@/stores/resumeDataStore.ts';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

const jobsStore = useJobsStore();
const toast = useToast();
const dt = ref(null);

// Safe computed property with fallback
const tableData = computed(() => {
    return Array.isArray(jobsStore.jobs) ? jobsStore.jobs : [];
});

const jobDialog = ref(false);
const job = ref({
    job_title: '',
    company_name: '',
    start_date: null,
    end_date: null,
    location: '',
    tags: [] // Add tags to job
});
const selectedJobs = ref([]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);
const loading = ref(true);
const noData = ref(false);

// State for job description items
const jobDescriptionItems = ref({});
const newDescriptions = ref({}); // State for new descriptions for each job
const newTags = ref({}); // State for new tags for each job description
const expandedRows = ref([]); // State for expanded rows

// Initialize jobs array if needed
onMounted(async () => {
    try {
        loading.value = true;
        await jobsStore.loadJobs();
        jobDescriptionItems.value = jobsStore.jobDescriptions;
        noData.value = jobsStore.jobs.length === 0;
    } catch (error) {
        console.error('Failed to load jobs:', error);
        noData.value = true;
    } finally {
        loading.value = false;
    }
});

// Function to add job description item
function addJobDescriptionItem(jobId) {
    const description = newDescriptions.value[jobId];
    const tags = newTags.value[jobId] || [];
    if (!jobDescriptionItems.value[jobId]) {
        jobDescriptionItems.value[jobId] = [];
    }
    jobDescriptionItems.value[jobId].push({ description, tags, id: createId(), checked: false });
    jobsStore.updateJobDescriptions(jobId, jobDescriptionItems.value[jobId]);
    newDescriptions.value[jobId] = ''; // Clear input field
    newTags.value[jobId] = []; // Clear tags field
}

// Function to delete job description item
function deleteJobDescriptionItem(jobId, itemId) {
    jobDescriptionItems.value[jobId] = jobDescriptionItems.value[jobId].filter((item) => item.id !== itemId);
    jobsStore.updateJobDescriptions(jobId, jobDescriptionItems.value[jobId]);
}

// Function to create unique ID
function createId() {
    let id = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

// Function to expand all rows
function expandAll() {
    expandedRows.value = tableData.value.map((job) => job.id);
}

// Function to collapse all rows
function collapseAll() {
    expandedRows.value = [];
}

// Keep existing saveJob function as is since it works
function saveJob() {
    submitted.value = true;

    if (job.value?.job_title?.trim()) {
        const newJob = { ...job.value };
        if (newJob.id) {
            jobsStore.updateJob(newJob);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Job Updated', life: 3000 });
        } else {
            newJob.id = createId();
            jobsStore.addJob(newJob);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Job Created', life: 3000 });
        }
        // Reset form after successful save
        resetForm();
    }
}

function resetForm() {
    job.value = {
        job_title: '',
        company_name: '',
        start_date: null,
        end_date: null,
        location: '',
        tags: [] // Reset tags
    };
    jobDialog.value = false;
    submitted.value = false;
    noData.value = !tableData.value.length;
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
                                    <!-- <div class="font-semibold text-xl">Job History</div> -->
                                    <div class="flex flex-col md:flex-row gap-4">
                                        <div class="flex flex-wrap gap-2 w-full md:w-full">
                                            <label for="jobTitle">Job Title</label>
                                            <InputText id="jobTitle" v-model="job.job_title" type="text" />
                                        </div>
                                    </div>
                                    <div class="flex flex-col md:flex-row gap-4">
                                        <div class="flex flex-wrap gap-2 w-full md:w-full">
                                            <label for="companyName" class="block">Company</label>
                                            <InputText id="companyName" v-model="job.company_name" type="text" class="w-full" />
                                        </div>
                                    </div>
                                    <div class="flex flex-col md:flex-row gap-4">
                                        <div class="flex flex-col gap-4 w-full">
                                            <div class="flex flex-wrap gap-2 w-full">
                                                <label for="startDate">Start Date</label>
                                                <DatePicker id="startDate" v-model="job.start_date" :showIcon="true" :showButtonBar="true" class="w-full"></DatePicker>
                                            </div>
                                        </div>
                                        <div class="flex flex-col gap-4 w-full">
                                            <div class="flex flex-wrap gap-2 w-full">
                                                <label for="endDate">End Date</label>
                                                <DatePicker id="endDate" v-model="job.end_date" :showIcon="true" :showButtonBar="true" class="w-full"></DatePicker>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex flex-col md:flex-row gap-4">
                                        <div class="flex flex-wrap gap-2 w-full md:w-full">
                                            <label for="location">Location</label>
                                            <InputText id="location" v-model="job.location" type="text" />
                                        </div>
                                    </div>
                                    <div class="flex flex-wrap gap-2 w-full md:w-full">
                                        <label for="tags">Tags</label>
                                        <InputText id="tags" v-model="job.tags" type="text" placeholder="Comma separated tags" />
                                    </div>
                                    <Button label="Add Job" icon="pi pi-upload" severity="secondary" @click="saveJob" />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionPanel>
                </Accordion>
            </Fluid>
            <div v-if="loading" class="flex justify-center items-center">
                <p>Loading...</p>
            </div>
            <div v-else-if="noData" class="flex flex-col items-center">
                <p>No job data available. Please add a new job.</p>
            </div>
            <div v-else>
                <DataTable
                    ref="dt"
                    v-model:selection="selectedJobs"
                    v-model:expandedRows="expandedRows"
                    :value="tableData"
                    :loading="loading"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} jobs"
                    removableSort
                    :resizeable="false"
                    rowExpansion
                >
                    <template #header>
                        <div class="flex flex-wrap gap-2 items-center justify-between">
                            <h4 class="m-0">Jobs</h4>
                            <IconField>
                                <InputIcon>
                                    <i class="pi pi-search" />
                                </InputIcon>
                                <InputText v-model="filters['global'].value" placeholder="Search..." />
                            </IconField>
                            <Button text icon="pi pi-plus" label="Expand All" @click="expandAll" />
                            <Button text icon="pi pi-minus" label="Collapse All" @click="collapseAll" />
                        </div>
                    </template>

                    <Column expander style="width: 3rem"></Column>
                    <Column field="job_title" header="Job Title" sortable style="min-width: 12rem"></Column>
                    <Column field="company_name" header="Company" sortable style="min-width: 16rem"></Column>
                    <Column field="start_date" header="Start Date" sortable style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ new Date(data.start_date).toLocaleDateString('en-US') }}
                        </template>
                    </Column>
                    <Column field="end_date" header="End Date" sortable style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.end_date ? new Date(data.end_date).toLocaleDateString('en-US') : 'Present' }}
                        </template>
                    </Column>

                    <Column field="location" header="Location" sortable style="min-width: 12rem"></Column>

                    <template #expansion="slotProps">
                        <div class="p-3 px-16 w-full">
                            <h5>Job Descriptions</h5>
                            <!-- Display existing job description items -->
                            <div v-if="jobDescriptionItems[slotProps.data.id]" class="w-full">
                                <div v-for="item in jobDescriptionItems[slotProps.data.id]" :key="item.id" class="flex items-center gap-2 w-full">
                                    <Checkbox v-model="item.checked" />
                                    <span class="flex-grow">{{ item.description }}</span>
                                    <Button icon="pi pi-trash" class="p-button-danger" @click="deleteJobDescriptionItem(slotProps.data.id, item.id)" />
                                </div>
                            </div>

                            <!-- Input for adding new job description item -->
                            <div class="flex items-center gap-2 mt-2 w-full">
                                <InputText v-model="newDescriptions[slotProps.data.id]" placeholder="Add description" class="flex-grow" />
                                <InputText v-model="newTags[slotProps.data.id]" placeholder="Comma separated tags" class="flex-grow" />
                                <Button label="Add" icon="pi pi-plus" @click="addJobDescriptionItem(slotProps.data.id)" />
                            </div>
                        </div>
                    </template>
                </DataTable>
            </div>
        </div>
    </div>
</template>
