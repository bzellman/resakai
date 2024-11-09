<script setup lang="ts">
import { onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import AutoComplete from 'primevue/autocomplete';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import DataTable from 'primevue/datatable';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Column from 'primevue/column';
import Tag from 'primevue/tag';

import { useSummaryStore } from '../../stores/resumeDataStore';
import { useEntity } from '../composables/useEntity';
import { ProfessionalSummary, TagEntity } from '../../types/interfaceTypes';

// Stores
const summaryStore = useSummaryStore();
const toast = useToast();

// Use the useEntity composable
const {
    entityDialog: summaryDialog,
    entity: summary,
    submitted,
    includedEntities: includedSummaries,
    filters,
    filteredTags,
    selectedTags,
    searchTags,
    handleTagInput,
    saveEntity,
    editEntity,
    deleteEntity,
    toggleIncludeEntity
} = useEntity(summaryStore);

// Alias methods for clarity
const saveSummary = () => {
    if (summary.value.summary.trim()) {
        saveEntity();

        // Show toast notification
        toast.add({
            severity: 'success',
            summary: 'Successful',
            detail: summary.value.id ? 'Summary Updated' : 'Summary Created',
            life: 3000
        });

        // Reset form
        resetForm();
    } else {
        // Handle validation errors
        toast.add({
            severity: 'error',
            summary: 'Validation Error',
            detail: 'Please fill in all required fields.',
            life: 3000
        });
    }
};

const editSummary = (item: ProfessionalSummary) => {
    editEntity(item);
};

const deleteSummary = (id: string) => {
    deleteEntity(id);

    // Show toast notification
    toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Summary Deleted',
        life: 3000
    });
};

const toggleIncludeSummary = (id: string) => {
    toggleIncludeEntity(id);
};

// Reset form
function resetForm() {
    summary.value = {
        id: '',
        createDate: new Date(),
        included: false,
        tags: [],
        summary: ''
    };
    selectedTags.value = [];
    submitted.value = false;
}

// Load initial data
onMounted(async () => {
    await summaryStore.loadItems();
    // Initialize selectedTags when editing
    if (summary.value.tags && summary.value.tags.length > 0) {
        selectedTags.value = summary.value.tags.map((tag: TagEntity) => tag.tagName);
    }
});
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
                                    <!-- Other form fields -->
                                    <div class="flex flex-col md:flex-row gap-4">
                                        <div class="flex flex-wrap gap-2 w-full md:w-full">
                                            <label for="summary">Summary</label>
                                            <Textarea id="summary" v-model="summary.summary" rows="5" cols="30" placeholder="Enter your professional summary here" />
                                        </div>
                                    </div>
                                    <!-- Tags AutoComplete -->
                                    <div class="flex flex-col gap-4 w-full">
                                        <label for="tags">Tags</label>
                                        <AutoComplete
                                            id="tags"
                                            v-model="selectedTags"
                                            :suggestions="filteredTags"
                                            placeholder="Add tags"
                                            @complete="searchTags"
                                            multiple
                                            :force-selection="false"
                                            :field="null"
                                            @keydown="handleTagInput"
                                            class="w-full"
                                        />
                                    </div>
                                    <div class="flex flex-wrap gap-2">
                                        <label for="included" class="mr-2">Include in Resume</label>
                                        <Checkbox id="included" v-model="summary.included" :binary="true" />
                                    </div>
                                    <Button label="Save Summary" icon="pi pi-save" @click="saveSummary" />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionPanel>
                </Accordion>
            </Fluid>

            <div v-if="summaryStore.loading" class="flex justify-center items-center">
                <p>Loading...</p>
            </div>
            <div v-else-if="summaryStore.items.length === 0" class="flex flex-col items-center">
                <p>No professional summaries available. Please add a new summary.</p>
            </div>
            <div v-else>
                <DataTable :value="summaryStore.items" dataKey="id" :paginator="true" :rows="10">
                    <!-- Table headers and other columns -->
                    <Column field="summary" header="Summary" sortable style="min-width: 12rem"></Column>
                    <Column field="tags" header="Tags" style="min-width: 16rem">
                        <template #body="slotProps">
                            <div class="flex flex-wrap gap-1">
                                <Tag v-for="tag in slotProps.data.tags" :key="tag.id" :value="tag.tagName" :rounded="true" />
                            </div>
                        </template>
                    </Column>
                    <Column field="included" header="Included" sortable style="min-width: 12rem">
                        <template #body="slotProps">
                            <Checkbox id="included" v-model="slotProps.data.included" :binary="true" />

                            <!-- <Checkbox v-model="slotProps.data.included" disabled /> -->
                        </template>
                    </Column>
                    <!-- Actions column -->
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
