<script setup>
import { useSummaryStore } from '@/stores/resumeDataStore';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

const summaryStore = useSummaryStore();
const toast = useToast();
const summaryDialog = ref(false);
const summary = ref({
    id: '',
    createdDate: new Date().toISOString(),
    included: false,
    tags: [],
    summary: ''
});
const submitted = ref(false);

// Safe computed property with fallback
const tableData = computed(() => {
    return Array.isArray(summaryStore.professionalSummaries) ? [...summaryStore.professionalSummaries] : [];
});

onMounted(async () => {
    await summaryStore.loadProfessionalSummaries();
});

function saveSummary() {
    submitted.value = true;

    if (summary.value?.summary?.trim()) {
        if (summary.value.id) {
            summaryStore.updateProfessionalSummary(summary.value);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Summary Updated', life: 3000 });
        } else {
            summary.value.id = createId();
            summaryStore.addProfessionalSummary(summary.value);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Summary Created', life: 3000 });
        }

        summaryDialog.value = false;
        summary.value = {
            id: '',
            createdDate: new Date().toISOString(),
            included: false,
            tags: [],
            summary: ''
        };
    }
}

function deleteSummary(summaryId) {
    summaryStore.deleteProfessionalSummary(summaryId);
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Summary Deleted', life: 3000 });
}

function createId() {
    let id = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

function editSummary(summaryData) {
    summary.value = { ...summaryData };
    summaryDialog.value = true;
}
</script>

<template>
    <div>
        <div class="card">
            <Fluid>
                <Accordion value="0">
                    <AccordionPanel value="0">
                        <AccordionHeader>Add Professional Summary</AccordionHeader>
                        <AccordionContent>
                            <div class="flex mt-8">
                                <div class="card flex flex-col gap-4 w-full">
                                    <div class="flex flex-col md:flex-row gap-4">
                                        <div class="flex flex-wrap gap-2 w-full md:w-full">
                                            <label for="summary">Summary</label>
                                            <Textarea id="summary" v-model="summary.summary" rows="10" cols="30" />
                                        </div>
                                    </div>
                                    <div class="flex flex-col md:flex-row gap-4">
                                        <div class="flex flex-wrap gap-2 w-full md:w-full">
                                            <label for="tags">Tags</label>
                                            <InputText id="tags" v-model="summary.tags" type="text" placeholder="Comma separated tags" />
                                        </div>
                                    </div>
                                    <div class="flex flex-col md:flex-row gap-4">
                                        <div class="flex flex-wrap gap-2 w-full md:w-full">
                                            <label for="included">Included</label>
                                            <Checkbox id="included" v-model="summary.included" />
                                        </div>
                                    </div>
                                    <Button label="Save" icon="pi pi-save" severity="secondary" @click="saveSummary" />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionPanel>
                </Accordion>
            </Fluid>

            <div v-if="summaryStore.loading" class="flex justify-center items-center">
                <p>Loading...</p>
            </div>
            <div v-else-if="summaryStore.professionalSummaries.length === 0" class="flex flex-col items-center">
                <p>No professional summaries available. Please add a new summary.</p>
            </div>
            <div v-else>
                <DataTable :value="tableData" dataKey="id" :paginator="true" :rows="10" currentPageReportTemplate="Showing {first} to {last} of {totalRecords} summaries" :rowsPerPageOptions="[5, 10, 25]">
                    <template #header>
                        <div class="flex flex-wrap gap-2 items-center justify-between">
                            <h4 class="m-0">Professional Summaries</h4>
                            <IconField>
                                <InputIcon>
                                    <i class="pi pi-search" />
                                </InputIcon>
                                <!-- <InputText v-model="filters['global'].value" placeholder="Search..." /> -->
                            </IconField>
                        </div>
                    </template>

                    <Column field="summary" header="Summary" sortable style="min-width: 12rem"></Column>
                    <Column field="tags" header="Tags" sortable style="min-width: 16rem"></Column>
                    <Column field="included" header="Included" sortable style="min-width: 12rem">
                        <template #body="slotProps">
                            <Checkbox v-model="slotProps.data.included" disabled />
                        </template>
                    </Column>
                    <Column header="Actions" style="min-width: 8rem">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editSummary(slotProps.data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="deleteSummary(slotProps.data.id)" />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>
