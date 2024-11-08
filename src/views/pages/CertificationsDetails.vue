<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

import AutoComplete from 'primevue/autocomplete';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import DataTable from 'primevue/datatable';
import InputText from 'primevue/inputtext';

import { useCertificationsStore, useTagsStore } from '../../stores/resumeDataStore';
import { Certification } from '../../types/interfaceTypes';

// Stores
const certificationStore = useCertificationsStore();
const tagsStore = useTagsStore();
const toast = useToast();

// State variables
const certificationDialog = ref(false);
const certification = ref<Certification>({
    id: '',
    createDate: new Date(),
    included: false,
    tags: [],
    orgName: '',
    certName: '',
    details: ''
});
const submitted = ref(false);

// For tag suggestions and selection
const filteredTags = ref<string[]>([]);
const selectedTags = ref<string[]>([]);

// For included certifications
const includedCertifications = ref<string[]>([]);

// Filters for DataTable
const filters = ref({
    global: { value: '' }
});

onMounted(async () => {
    await Promise.all([certificationStore.loadItems(), tagsStore.loadItems()]);

    // Initialize selectedTags when editing
    if (certification.value.tags.length > 0) {
        selectedTags.value = certification.value.tags.map((tag) => tag.tagName);
    }

    // Initialize includedCertifications
    includedCertifications.value = certificationStore.items.filter((cert) => cert.included).map((cert) => cert.id);
});

// Function to search and filter tags
function searchTags(event: { query: string }) {
    const query = event.query.toLowerCase();
    filteredTags.value = tagsStore.items.map((tag) => tag.tagName).filter((tagName) => tagName && tagName.toLowerCase().includes(query));
}

// Function to handle tag input
function handleTagInput(event: KeyboardEvent) {
    if (event.key === 'Enter') {
        const input = (event.target as HTMLInputElement).value.trim();
        if (input && !selectedTags.value.includes(input)) {
            selectedTags.value.push(input);
            (event.target as HTMLInputElement).value = ''; // Clear the input field
        }
    }
}

// Function to toggle included property
function toggleIncludeCertification(certId: string) {
    const certItem = certificationStore.items.find((cert) => cert.id === certId);
    if (certItem) {
        certItem.included = !certItem.included;
        certificationStore.updateItem(certItem);
        if (certItem.included) {
            includedCertifications.value.push(certId);
        } else {
            const index = includedCertifications.value.indexOf(certId);
            if (index !== -1) {
                includedCertifications.value.splice(index, 1);
            }
        }
    }
}

// Save skill
function saveCertification() {
    submitted.value = true;
    if (certification.value.certName.trim() && certification.value.orgName.trim()) {
        // Handle tags
        certification.value.tags = selectedTags.value.map((tagName) => {
            let tag = tagsStore.items.find((t) => t.tagName === tagName);
            if (!tag) {
                tag = { id: tagsStore.createId(), tagName };
                tagsStore.addItem(tag);
            }
            return tag;
        });

        // Save or update certification
        if (certification.value.id) {
            certificationStore.updateItem(certification.value);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Certification Updated', life: 3000 });
        } else {
            certification.value.id = certificationStore.createId();
            certificationStore.addItem(certification.value);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Certification Created', life: 3000 });
        }

        // Reset form
        resetForm();
    }
}

// Reset form
function resetForm() {
    certification.value = {
        id: '',
        createDate: new Date(),
        included: false,
        tags: [],
        orgName: '',
        certName: '',
        details: ''
    };
    selectedTags.value = [];
    submitted.value = false;
}
function editCertification(certToEdit: Certification) {
    certification.value = { ...certToEdit };
    selectedTags.value = certToEdit.tags.map((tag) => tag.tagName);
    certificationDialog.value = true;
}

function deleteCertification(certId: string) {
    certificationStore.deleteItem(certId);
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Certification Deleted', life: 3000 });
}
</script>

<template>
    <div>
        <div class="card">
            <!-- Certification Form -->
            <div class="flex mt-8">
                <div class="card flex flex-col gap-4 w-full">
                    <!-- Organization Name -->
                    <div class="flex flex-col gap-4 w-full">
                        <label for="orgName">Organization Name</label>
                        <InputText id="orgName" v-model="certification.orgName" placeholder="Enter organization name" />
                    </div>
                    <!-- Certification Name -->
                    <div class="flex flex-col gap-4 w-full">
                        <label for="certName">Certification Name</label>
                        <InputText id="certName" v-model="certification.certName" placeholder="Enter certification name" />
                    </div>
                    <!-- Details -->
                    <div class="flex flex-col gap-4 w-full">
                        <label for="details">Details</label>
                        <InputText id="details" v-model="certification.details" placeholder="Enter details" />
                    </div>
                    <!-- Tags AutoComplete -->
                    <div class="flex flex-col gap-4 w-full">
                        <label for="tags">Tags</label>
                        <AutoComplete id="tags" v-model="selectedTags" :suggestions="filteredTags" placeholder="Add tags" @complete="searchTags" multiple :force-selection="false" @keydown="handleTagInput" class="w-full" />
                    </div>
                    <!-- Include in Resume Checkbox -->
                    <div class="flex flex-wrap gap-2">
                        <label for="included" class="mr-2">Include in Resume</label>
                        <Checkbox id="included" v-model="certification.included" :binary="true" />
                    </div>
                    <Button label="Save Certification" icon="pi pi-save" @click="saveCertification" />
                </div>
            </div>

            <!-- Certifications Table -->
            <div v-if="certificationStore.loading" class="flex justify-center items-center">
                <p>Loading...</p>
            </div>
            <div v-else-if="certificationStore.items.length === 0" class="flex flex-col items-center">
                <p>No certifications available. Please add a new certification.</p>
            </div>
            <div v-else>
                <DataTable
                    :value="certificationStore.items"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} certifications"
                    :rowsPerPageOptions="[5, 10, 25]"
                    tableStyle="min-width: 60rem"
                    resizableColumns
                    columnResizeMode="fit"
                >
                    <InputText v-model="filters.global.value" placeholder="Search..." />
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Certifications</h4>
                        <span class="p-input-icon-left">
                            <i class="pi pi-search" />
                            <InputText v-model="filters['global'].value" placeholder="Search..." />
                        </span>
                    </div>

                    <!-- Included Checkbox Column -->
                    <Column field="included" header="Included" style="min-width: 8rem">
                        <template #body="slotProps">
                            <Checkbox :value="slotProps.data.id" v-model="includedCertifications" @change="() => toggleIncludeCertification(slotProps.data.id)" />
                        </template>
                    </Column>

                    <!-- Other Columns -->
                    <Column field="orgName" header="Organization" sortable style="min-width: 12rem" />
                    <Column field="certName" header="Certification" sortable style="min-width: 12rem" />
                    <Column field="details" header="Details" style="min-width: 16rem" />
                    <Column field="tags" header="Tags" style="min-width: 16rem">
                        <template #body="slotProps">
                            <div class="flex flex-wrap gap-1">
                                <Tag v-for="tag in slotProps.data.tags" :key="tag.id" :value="tag.tagName" :rounded="true" />
                            </div>
                        </template>
                    </Column>

                    <!-- Actions Column -->
                    <Column header="Actions" style="min-width: 8rem">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editCertification(slotProps.data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="deleteCertification(slotProps.data.id)" />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>
