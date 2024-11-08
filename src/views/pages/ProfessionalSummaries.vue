<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { useSummaryStore, useTagsStore } from '../../stores/resumeDataStore';
import { ProfessionalSummary, TagEntity } from '../../types/interfaceTypes';

// Stores
const summaryStore = useSummaryStore();
const tagsStore = useTagsStore();
const toast = useToast();

// State variables
const summaryDialog = ref(false);
const summary = ref<ProfessionalSummary>({
    id: '',
    createDate: new Date(),
    included: false,
    tags: [],
    summary: ''
});
const submitted = ref(false);

// For tag suggestions and selection
const filteredTags = ref<string[]>([]);
const selectedTags = ref<string[]>([]);

onMounted(async () => {
    await summaryStore.loadItems();
    await tagsStore.loadItems();
    // Initialize selectedTags when editing
    if (summary.value.tags.length > 0) {
        selectedTags.value = summary.value.tags.map((tag) => tag.tagName);
    }
});

function searchTags(event: { query: string }) {
    const query = event.query.toLowerCase();
    filteredTags.value = tagsStore.items.map((tag) => tag.tagName).filter((tagName) => tagName && tagName.toLowerCase().includes(query));
}

function handleTagInput(event: KeyboardEvent) {
    if (event.key === 'Enter') {
        const input = (event.target as HTMLInputElement).value.trim();
        if (input && !filteredTags.value.includes(input.toLowerCase())) {
            selectedTags.value.push(input);
            (event.target as HTMLInputElement).value = ''; // Clear the input field
        }
    }
}

function saveSummary() {
    submitted.value = true;

    if (summary.value.summary.trim()) {
        // Handle tags
        summary.value.tags = selectedTags.value.map((tagName) => {
            const existingTag = tagsStore.items.find((tag) => tag.tagName.toLowerCase() === tagName.toLowerCase());
            if (existingTag) {
                return existingTag;
            } else {
                const newTag: TagEntity = {
                    id: tagsStore.createId(),
                    tagName
                };
                tagsStore.addItem(newTag);
                return newTag;
            }
        });

        if (summary.value.id) {
            summaryStore.updateItem(summary.value);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Summary Updated', life: 3000 });
        } else {
            summary.value.id = summaryStore.createId();
            summaryStore.addItem(summary.value);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Summary Created', life: 3000 });
        }

        resetForm();
    }
}

function editSummary(summaryToEdit: ProfessionalSummary) {
    summary.value = { ...summaryToEdit };
    selectedTags.value = summaryToEdit.tags.map((tag) => tag.tagName);
    summaryDialog.value = true;
}

function deleteSummary(summaryId: string) {
    summaryStore.deleteItem(summaryId);
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Summary Deleted', life: 3000 });
}

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
                            <Checkbox v-model="slotProps.data.included" disabled />
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
