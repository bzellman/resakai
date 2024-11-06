<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useJobDescriptionsStore, useJobsStore } from '../../stores/resumeDataStore';
import { Job } from '../../types/interfaceTypes';

const jobsStore = useJobsStore();
const jobDescriptionsStore = useJobDescriptionsStore();
const toast = useToast();
const jobDialog = ref(false);
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
const submitted = ref(false);
const noData = ref(false);
const filters = ref<{ global: { value: string } }>({ global: { value: '' } });

// Safe computed property with fallback
const tableData = computed(() => {
    return Array.isArray(jobsStore.items) ? [...jobsStore.items] : [];
});

onMounted(async () => {
    try {
        await jobsStore.loadItems();
        await jobDescriptionsStore.loadItems();
        noData.value = !tableData.value.length;
    } catch (error) {
        console.error('Failed to load jobs or job descriptions:', error);
    }
});

function saveJob() {
    submitted.value = true;

    if (job.value?.jobTitle?.trim()) {
        if (job.value.id) {
            jobsStore.updateItem(job.value);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Job Updated', life: 3000 });
        } else {
            job.value.id = createId();
            jobsStore.addItem(job.value);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Job Created', life: 3000 });
        }

        jobDialog.value = false;
        resetForm();
    }
}

function resetForm() {
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
    jobDialog.value = false;
    submitted.value = false;
    noData.value = !tableData.value.length;
}

function createId(): string {
    let id = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
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
                <DataTable :value="tableData" dataKey="id" :paginator="true" :rows="10" currentPageReportTemplate="Showing {first} to {last} of {totalRecords} jobs" :rowsPerPageOptions="[5, 10, 25]">
                    <template #header>
                        <div class="flex flex-wrap gap-2 items-center justify-between">
                            <h4 class="m-0">Job History</h4>
                            <span class="p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Search..." />
                            </span>
                        </div>
                    </template>

                    <Column field="jobTitle" header="Job Title" sortable style="min-width: 12rem"></Column>
                    <Column field="companyName" header="Company" sortable style="min-width: 16rem"></Column>
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
                            <!-- <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editJob(slotProps.data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="deleteJob(slotProps.data.id)" /> -->
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>
