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

import { useEducationStore } from '../../stores/resumeDataStore';
import { useEntity } from '../composables/useEntity';

// Stores
const entityStore = useEducationStore();
const toast = useToast();

// State variables from useEntity
const { entityDialog: educationDialog, entity: education, submitted, filters, allTags, relatedTags, searchTags, handleTagInput, getTagNameById, saveEntity, editEntity, deleteEntity, includedEntities, toggleIncludeEntity } = useEntity(entityStore);

const props = defineProps({
    filters: {
        type: Object,
        required: true
    }
});

// Reset form
// function resetForm() {
//     education.value = {
//         id: '',
//         createDate: new Date(),
//         included: false,
//         tags: [],
//         institution: '',
//         degree: '',
//         fieldOfStudy: '',
//         startDate: '',
//         endDate: '',
//         description: ''
//     };
//     relatedTags.value = [];
//     submitted.value = false;
// }

// Load initial data
onMounted(async () => {
    await entityStore.loadItems();
});
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
                        <AutoComplete id="tags" v-model="relatedTags" :suggestions="allTags" placeholder="Add tags" @complete="searchTags" multiple :force-selection="false" @keydown="handleTagInput" class="w-full" />
                    </div>
                    <!-- Include in Resume Checkbox -->
                    <div class="flex flex-wrap gap-2">
                        <label for="included" class="mr-2">Include in Resume</label>
                        <Checkbox id="included" v-model="education.included" :binary="true" />
                    </div>
                    <Button label="Save Education" icon="pi pi-save" @click="saveEntity" />
                </div>
            </div>

            <!-- Education Table -->
            <div v-if="entityStore.loading" class="flex justify-center items-center">
                <p>Loading...</p>
            </div>
            <div v-else-if="entityStore.items.length === 0" class="flex flex-col items-center">
                <p>No education entries available. Please add a new education entry.</p>
            </div>
            <div v-else>
                <DataTable
                    :value="entityStore.items"
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
