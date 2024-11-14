<script setup lang="ts">
import { useToast } from 'primevue/usetoast';

import AutoComplete from 'primevue/autocomplete';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';

import { useVolunteerStore } from '../../stores/resumeDataStore';
import { useEntity } from '../composables/useEntity';

// Stores
const entityStore = useVolunteerStore();
const toast = useToast();

const props = defineProps({
    filters: {
        type: Object,
        required: true
    }
});

// State variables from useEntity
const {
    entityDialog: volunteerDialog,
    entity: volunteer,
    submitted,
    filters: filterFromEntity,
    allTags,
    relatedTags,
    searchTags,
    handleTagInput,
    getTagNameById,
    saveEntity,
    editEntity,
    deleteEntity,
    includedEntities,
    toggleIncludeEntity
} = useEntity(entityStore);

// Reset form
function resetForm() {
    volunteer.value = {
        id: '',
        createDate: new Date(),
        included: false,
        tags: [],
        orgName: '',
        details: ''
    };
    relatedTags.value = [];
    submitted.value = false;
}
</script>

<template>
    <div>
        <div class="card">
            <!-- Volunteer Form -->
            <div class="flex mt-8">
                <div class="card flex flex-col gap-4 w-full">
                    <!-- Organization Name -->
                    <div class="flex flex-col gap-4 w-full">
                        <label for="orgName">Organization Name</label>
                        <InputText id="orgName" v-model="volunteer.orgName" placeholder="Enter organization name" />
                    </div>
                    <!-- Details -->
                    <div class="flex flex-col gap-4 w-full">
                        <label for="details">Details</label>
                        <InputText id="details" v-model="volunteer.details" placeholder="Enter details" />
                    </div>
                    <!-- Tags AutoComplete -->
                    <div class="flex flex-col gap-4 w-full">
                        <label for="tags">Tags</label>
                        <AutoComplete id="tags" v-model="relatedTags" :suggestions="allTags" placeholder="Add tags" @complete="searchTags" multiple :force-selection="false" @keydown="handleTagInput" class="w-full" />
                    </div>
                    <!-- Include in Resume Checkbox -->
                    <div class="flex flex-wrap gap-2">
                        <label for="included" class="mr-2">Include in Resume</label>
                        <Checkbox id="included" v-model="volunteer.included" :binary="true" />
                    </div>
                    <Button label="Save Volunteer" icon="pi pi-save" @click="saveEntity" />
                </div>
            </div>

            <!-- Volunteers Table -->
            <div v-if="entityStore.loading" class="flex justify-center items-center">
                <p>Loading...</p>
            </div>
            <div v-else-if="entityStore.items.length === 0" class="flex flex-col items-center">
                <p>No volunteer entries available. Please add a new volunteer entry.</p>
            </div>
            <div v-else>
                <DataTable
                    :value="entityStore.items"
                    :filters="filters"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} volunteers"
                    :rowsPerPageOptions="[5, 10, 25]"
                    tableStyle="min-width: 60rem"
                    resizableColumns
                    columnResizeMode="fit"
                >
                    <!-- Included Checkbox Column -->
                    <Column filterField="included" header="Included" style="min-width: 8rem">
                        <template #body="slotProps">
                            <Checkbox :value="slotProps.data.id" v-model="includedEntities" @change="toggleIncludeEntity(slotProps.data.id)" />
                        </template>
                    </Column>

                    <!-- Other Columns -->
                    <Column field="orgName" header="Organization" sortable style="min-width: 12rem" />
                    <Column field="details" header="Details" sortable style="min-width: 16rem" />
                    <Column filterField="tags" header="Tags" style="min-width: 16rem">
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
