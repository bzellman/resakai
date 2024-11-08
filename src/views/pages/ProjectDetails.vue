<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

import AutoComplete from 'primevue/autocomplete';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import DataTable from 'primevue/datatable';
import InputText from 'primevue/inputtext';

import { useProjectsStore, useTagsStore } from '../../stores/resumeDataStore';
import { Project } from '../../types/interfaceTypes';

// Stores
const projectStore = useProjectsStore();
const tagsStore = useTagsStore();
const toast = useToast();
// State variables
const projectDialog = ref(false);
const project = ref<Project>({
    id: '',
    createDate: new Date(),
    included: false,
    tags: [],
    projectName: '',
    projectDetails: ''
});
const submitted = ref(false);

// For tag suggestions and selection
const filteredTags = ref<string[]>([]);
const selectedTags = ref<string[]>([]);

// For included projects
const includedProjects = ref<string[]>([]);

// Filters for DataTable
const filters = ref({
    global: { value: '' }
});

onMounted(async () => {
    await Promise.all([projectStore.loadItems(), tagsStore.loadItems()]);

    // Initialize selectedTags when editing
    if (project.value.tags.length > 0) {
        selectedTags.value = project.value.tags.map((tag) => tag.tagName);
    }

    // Initialize includedProjects
    includedProjects.value = projectStore.items.filter((proj) => proj.included).map((proj) => proj.id);
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
function toggleIncludeProject(projId: string) {
    const projItem = projectStore.items.find((proj) => proj.id === projId);
    if (projItem) {
        projItem.included = !projItem.included;
        projectStore.updateItem(projItem);
        if (projItem.included) {
            includedProjects.value.push(projId);
        } else {
            const index = includedProjects.value.indexOf(projId);
            if (index !== -1) {
                includedProjects.value.splice(index, 1);
            }
        }
    }
}

// Save skill
function saveProject() {
    submitted.value = true;
    if (project.value.projectName.trim() && project.value.projectDetails.trim()) {
        // Handle tags
        project.value.tags = selectedTags.value.map((tagName) => {
            let tag = tagsStore.items.find((t) => t.tagName === tagName);
            if (!tag) {
                tag = { id: tagsStore.createId(), tagName };
                tagsStore.addItem(tag);
            }
            return tag;
        });

        // Save or update project
        if (project.value.id) {
            projectStore.updateItem(project.value);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Project Updated', life: 3000 });
        } else {
            project.value.id = projectStore.createId();
            projectStore.addItem(project.value);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Project Created', life: 3000 });
        }

        // Reset form
        resetForm();
    }
}

// Reset form
function resetForm() {
    project.value = {
        id: '',
        createDate: new Date(),
        included: false,
        tags: [],
        projectName: '',
        projectDetails: ''
    };
    selectedTags.value = [];
    submitted.value = false;
}
function editProject(projToEdit: Project) {
    project.value = { ...projToEdit };
    selectedTags.value = projToEdit.tags.map((tag) => tag.tagName);
    projectDialog.value = true;
}

function deleteProject(projId: string) {
    projectStore.deleteItem(projId);
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Project Deleted', life: 3000 });
}
</script>

<template>
    <div>
        <div class="card">
            <!-- Project Form -->
            <div class="flex mt-8">
                <div class="card flex flex-col gap-4 w-full">
                    <!-- Project Name -->
                    <div class="flex flex-col gap-4 w-full">
                        <label for="projectName">Project Name</label>
                        <InputText id="projectName" v-model="project.projectName" placeholder="Enter project name" />
                    </div>
                    <!-- Project Details -->
                    <div class="flex flex-col gap-4 w-full">
                        <label for="projectDetails">Project Details</label>
                        <InputText id="projectDetails" v-model="project.projectDetails" placeholder="Enter project details" />
                    </div>
                    <!-- Tags AutoComplete -->
                    <div class="flex flex-col gap-4 w-full">
                        <label for="tags">Tags</label>
                        <AutoComplete id="tags" v-model="selectedTags" :suggestions="filteredTags" placeholder="Add tags" @complete="searchTags" multiple :force-selection="false" @keydown="handleTagInput" class="w-full" />
                    </div>
                    <!-- Include in Resume Checkbox -->
                    <div class="flex flex-wrap gap-2">
                        <label for="included" class="mr-2">Include in Resume</label>
                        <Checkbox id="included" v-model="project.included" :binary="true" />
                    </div>
                    <Button label="Save Project" icon="pi pi-save" @click="saveProject" />
                </div>
            </div>

            <!-- Projects Table -->
            <div v-if="projectStore.loading" class="flex justify-center items-center">
                <p>Loading...</p>
            </div>
            <div v-else-if="projectStore.items.length === 0" class="flex flex-col items-center">
                <p>No projects available. Please add a new project.</p>
            </div>
            <div v-else>
                <DataTable
                    :value="projectStore.items"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} projects"
                    :rowsPerPageOptions="[5, 10, 25]"
                    tableStyle="min-width: 60rem"
                    resizableColumns
                    columnResizeMode="fit"
                >
                    <template #header>
                        <div class="flex flex-wrap gap-2 items-center justify-between">
                            <h4 class="m-0">Projects</h4>
                            <span class="p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Search..." />
                            </span>
                        </div>
                    </template>

                    <!-- Included Checkbox Column -->
                    <Column field="included" header="Included" style="min-width: 8rem">
                        <template #body="slotProps">
                            <Checkbox :value="slotProps.data.id" v-model="includedProjects" @change="() => toggleIncludeProject(slotProps.data.id)" />
                        </template>
                    </Column>

                    <!-- Other Columns -->
                    <Column field="projectName" header="Project Name" sortable style="min-width: 12rem" />
                    <Column field="projectDetails" header="Project Details" sortable style="min-width: 16rem" />
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
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editProject(slotProps.data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="deleteProject(slotProps.data.id)" />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>
