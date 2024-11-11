<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import { onMounted } from 'vue';

import AutoComplete from 'primevue/autocomplete';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';

import { useProjectsStore } from '../../stores/resumeDataStore';
import { useEntity } from '../composables/useEntity';

// **Stores**
const entityStore = useProjectsStore();
const toast = useToast();

// **Use the useEntity composable**
const { entityDialog: projectDialog, entity, submitted, includedEntities, filters, allTags, relatedTags, searchTags, handleTagInput, getTagNameById, saveEntity, editEntity, deleteEntity, toggleIncludeEntity } = useEntity(entityStore);

// **Reset form function**
function resetForm() {
    entity.value = {
        id: '',
        createDate: new Date(),
        included: false,
        tags: [],
        projectName: '',
        projectDetails: ''
    };
    relatedTags.value = [];
    submitted.value = false;
}

// **Load initial data**
onMounted(async () => {
    await entityStore.loadItems();
});
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
                        <InputText id="projectName" v-model="entity.projectName" placeholder="Enter project name" />
                    </div>
                    <!-- Project Details -->
                    <div class="flex flex-col gap-4 w-full">
                        <label for="projectDetails">Project Details</label>
                        <InputText id="projectDetails" v-model="entity.projectDetails" placeholder="Enter project details" />
                    </div>
                    <!-- Tags AutoComplete -->
                    <div class="flex flex-col gap-4 w-full">
                        <label for="tags">Tags</label>
                        <AutoComplete id="tags" v-model="relatedTags" :suggestions="allTags" placeholder="Add tags" @complete="searchTags" multiple :force-selection="false" @keydown="handleTagInput" class="w-full" />
                    </div>
                    <!-- Include in Resume Checkbox -->
                    <div class="flex flex-wrap gap-2">
                        <label for="included" class="mr-2">Include in Resume</label>
                        <Checkbox id="included" v-model="entity.included" :binary="true" />
                    </div>
                    <Button label="Save Project" icon="pi pi-save" @click="saveEntity" />
                </div>
            </div>

            <!-- Projects Table -->
            <div v-if="entityStore.loading" class="flex justify-center items-center">
                <p>Loading...</p>
            </div>
            <div v-else-if="entityStore.items.length === 0" class="flex flex-col items-center">
                <p>No projects available. Please add a new project.</p>
            </div>
            <div v-else>
                <DataTable
                    :value="entityStore.items"
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
                                <InputText v-model="filters.global.value" placeholder="Search..." />
                            </span>
                        </div>
                    </template>
                    <!-- Included Checkbox Column -->
                    <Column field="included" header="Included" style="min-width: 8rem">
                        <template #body="slotProps">
                            <Checkbox :value="slotProps.data.id" v-model="includedEntities" @change="toggleIncludeEntity(slotProps.data.id)" />
                        </template>
                    </Column>
                    <!-- Other Columns -->
                    <Column field="projectName" header="Project Name" sortable style="min-width: 12rem" />
                    <Column field="projectDetails" header="Project Details" sortable style="min-width: 16rem" />
                    <Column field="tags" header="Tags" style="min-width: 16rem">
                        <template #body="slotProps">
                            <div class="flex flex-wrap gap-1">
                                <Tag v-for="tagId in slotProps.data.tags" :key="tagId" :value="getTagNameById(tagId)" :rounded="true" />
                            </div>
                        </template>
                    </Column>
                    <!-- Actions Column -->
                    <Column header="Actions" style="min-width: 8rem">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editEntity(slotProps.data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="deleteEntity(slotProps.data.id)" />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>
