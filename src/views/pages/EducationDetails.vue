<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

import AutoComplete from 'primevue/autocomplete';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import DataTable from 'primevue/datatable';
import InputText from 'primevue/inputtext';

import { useEducationStore, useTagsStore } from '../../stores/resumeDataStore';
import { Education } from '../../types/interfaceTypes';

// Stores
const educationStore = useEducationStore();
const tagsStore = useTagsStore();
const toast = useToast();

// State variables
const educationDialog = ref(false);
const education = ref<Education>({
    id: '',
    createDate: new Date(),
    included: false,
    tags: [],
    schoolName: '',
    degreeName: '',
    startDate: new Date(),
    endDate: new Date(),
    location: ''
});
const submitted = ref(false);

// For tag suggestions and selection
const filteredTags = ref<string[]>([]);
const selectedTags = ref<string[]>([]);

// For included education entries
const includedEducation = ref<string[]>([]);

// Filters for DataTable
const filters = ref({
    global: { value: '' }
});

onMounted(async () => {
    await Promise.all([educationStore.loadItems(), tagsStore.loadItems()]);

    // Initialize selectedTags when editing
    if (education.value.tags.length > 0) {
        selectedTags.value = education.value.tags.map((tag) => tag.tagName);
    }

    // Initialize includedEducation
    includedEducation.value = educationStore.items.filter((edu) => edu.included).map((edu) => edu.id);
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
function toggleIncludeEducation(eduId: string) {
    const eduItem = educationStore.items.find((edu) => edu.id === eduId);
    if (eduItem) {
        eduItem.included = !eduItem.included;
        educationStore.updateItem(eduItem);
        if (eduItem.included) {
            includedEducation.value.push(eduId);
        } else {
            const index = includedEducation.value.indexOf(eduId);
            if (index !== -1) {
                includedEducation.value.splice(index, 1);
            }
        }
    }
}

// Save skill
function saveEducation() {
    submitted.value = true;
    if (education.value.schoolName.trim() && education.value.degreeName.trim()) {
        // Handle tags
        education.value.tags = selectedTags.value.map((tagName) => {
            let tag = tagsStore.items.find((t) => t.tagName === tagName);
            if (!tag) {
                tag = { id: tagsStore.createId(), tagName };
                tagsStore.addItem(tag);
            }
            return tag;
        });

        // Save or update education
        if (education.value.id) {
            educationStore.updateItem(education.value);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Education Updated', life: 3000 });
        } else {
            education.value.id = educationStore.createId();
            educationStore.addItem(education.value);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Education Created', life: 3000 });
        }

        // Reset form
        resetForm();
    }
}

// Reset form
function resetForm() {
    education.value = {
        id: '',
        createDate: new Date(),
        included: false,
        tags: [],
        schoolName: '',
        degreeName: '',
        startDate: new Date(),
        endDate: new Date(),
        location: ''
    };
    selectedTags.value = [];
    submitted.value = false;
}
function editEducation(eduToEdit: Education) {
    education.value = { ...eduToEdit };
    selectedTags.value = eduToEdit.tags.map((tag) => tag.tagName);
    educationDialog.value = true;
}

function deleteEducation(eduId: string) {
    educationStore.deleteItem(eduId);
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Education Deleted', life: 3000 });
}
</script>

<template>
    <div>
        <div class="card">
            <!-- Education Form -->
            <div class="flex mt-8">
                <div class="card flex flex-col gap-4 w-full">
                    <!-- School Name -->
                    <div class="flex flex-col gap-4 w-full">
                        <label for="schoolName">School Name</label>
                        <InputText id="schoolName" v-model="education.schoolName" placeholder="Enter school name" />
                    </div>
                    <!-- Degree Name -->
                    <div class="flex flex-col gap-4 w-full">
                        <label for="degreeName">Degree Name</label>
                        <InputText id="degreeName" v-model="education.degreeName" placeholder="Enter degree name" />
                    </div>
                    <!-- Start Date -->
                    <div class="flex flex-col gap-4 w-full">
                        <label for="startDate">Start Date</label>
                        <InputText id="startDate" v-model="education.startDate" type="date" />
                    </div>
                    <!-- End Date -->
                    <div class="flex flex-col gap-4 w-full">
                        <label for="endDate">End Date</label>
                        <InputText id="endDate" v-model="education.endDate" type="date" />
                    </div>
                    <!-- Location -->
                    <div class="flex flex-col gap-4 w-full">
                        <label for="location">Location</label>
                        <InputText id="location" v-model="education.location" placeholder="Enter location" />
                    </div>
                    <!-- Tags AutoComplete -->
                    <div class="flex flex-col gap-4 w-full">
                        <label for="tags">Tags</label>
                        <AutoComplete id="tags" v-model="selectedTags" :suggestions="filteredTags" placeholder="Add tags" @complete="searchTags" multiple :force-selection="false" @keydown="handleTagInput" class="w-full" />
                    </div>
                    <!-- Include in Resume Checkbox -->
                    <div class="flex flex-wrap gap-2">
                        <label for="included" class="mr-2">Include in Resume</label>
                        <Checkbox id="included" v-model="education.included" :binary="true" />
                    </div>
                    <Button label="Save Education" icon="pi pi-save" @click="saveEducation" />
                </div>
            </div>

            <!-- Education Table -->
            <div v-if="educationStore.loading" class="flex justify-center items-center">
                <p>Loading...</p>
            </div>
            <div v-else-if="educationStore.items.length === 0" class="flex flex-col items-center">
                <p>No education entries available. Please add a new education entry.</p>
            </div>
            <div v-else>
                <DataTable
                    :value="educationStore.items"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} education entries"
                    :rowsPerPageOptions="[5, 10, 25]"
                    tableStyle="min-width: 60rem"
                    resizableColumns
                    columnResizeMode="fit"
                >
                    <template #header>
                        <div class="flex flex-wrap gap-2 items-center justify-between">
                            <h4 class="m-0">Education</h4>
                            <span class="p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Search..." />
                            </span>
                        </div>
                    </template>

                    <!-- Included Checkbox Column -->
                    <Column field="included" header="Included" style="min-width: 8rem">
                        <template #body="slotProps">
                            <Checkbox :value="slotProps.data.id" v-model="includedEducation" @change="() => toggleIncludeEducation(slotProps.data.id)" />
                        </template>
                    </Column>

                    <!-- Other Columns -->
                    <Column field="schoolName" header="School Name" sortable style="min-width: 12rem" />
                    <Column field="degreeName" header="Degree Name" sortable style="min-width: 12rem" />
                    <Column field="startDate" header="Start Date" sortable style="min-width: 12rem">
                        <template #body="slotProps">
                            {{ new Date(slotProps.data.startDate).toLocaleDateString() }}
                        </template>
                    </Column>
                    <Column field="endDate" header="End Date" sortable style="min-width: 12rem">
                        <template #body="slotProps">
                            {{ new Date(slotProps.data.endDate).toLocaleDateString() }}
                        </template>
                    </Column>
                    <Column field="location" header="Location" sortable style="min-width: 12rem" />
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
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editEducation(slotProps.data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="deleteEducation(slotProps.data.id)" />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>
