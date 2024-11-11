<script setup lang="ts">
import AutoComplete from 'primevue/autocomplete';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Tag from 'primevue/tag';
import Textarea from 'primevue/textarea';
import { useToast } from 'primevue/usetoast';
import { onMounted } from 'vue';

import { useSummaryStore } from '../../stores/resumeDataStore';
import { useEntity } from '../composables/useEntity';

// Stores
const entityStore = useSummaryStore();
const toast = useToast();

// Use the useEntity composable
const { entityDialog: summaryDialog, entity: summary, submitted, includedEntities, filters, allTags, relatedTags, searchTags, handleTagInput, getTagNameById, saveEntity, editEntity, deleteEntity, toggleIncludeEntity } = useEntity(entityStore);

// Reset form
function resetForm() {
    summary.value = {
        id: '',
        createDate: new Date(),
        included: false,
        tags: [],
        summary: ''
    };
    relatedTags.value = [];
    submitted.value = false;
}

// Load initial data
onMounted(async () => {
    await entityStore.loadItems();
});
</script>

<template>
    <div>
        <div class="card">
            <!-- **Summary Form** -->
            <div class="flex mt-8">
                <div class="card flex flex-col gap-4 w-full">
                    <!-- **Summary Textarea** -->
                    <div class="flex flex-col gap-4 w-full">
                        <label for="summary">Summary</label>
                        <Textarea id="summary" v-model="summary.summary" rows="5" cols="30" placeholder="Enter your professional summary here" />
                    </div>
                    <!-- **Tags AutoComplete** -->
                    <div class="flex flex-col gap-4 w-full">
                        <label for="tags">Tags</label>
                        <AutoComplete id="tags" v-model="relatedTags" :suggestions="allTags" placeholder="Add tags" @complete="searchTags" multiple :force-selection="false" @keydown="handleTagInput" class="w-full" />
                    </div>
                    <!-- **Save Button** -->
                    <Button label="Save Summary" icon="pi pi-save" @click="saveEntity" />
                </div>
            </div>
            <!-- **Summaries Table** -->
            <div v-if="entityStore.loading" class="flex justify-center items-center">
                <p>Loading...</p>
            </div>
            <div v-else-if="entityStore.items.length === 0" class="flex flex-col items-center">
                <p>No professional summaries available. Please add a new summary.</p>
            </div>
            <div v-else>
                <DataTable :value="entityStore.items" dataKey="id" :paginator="true" :rows="10">
                    <!-- **Table Header** -->
                    <template #header>
                        <div class="flex flex-wrap gap-2 items-center justify-between">
                            <h4 class="m-0">Professional Summaries</h4>
                            <span class="p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters.global.value" placeholder="Search..." />
                            </span>
                        </div>
                    </template>
                    <!-- **Summary Column** -->
                    <Column field="summary" header="Summary" sortable style="min-width: 12rem"></Column>
                    <!-- **Tags Column** -->
                    <Column field="tags" header="Tags" style="min-width: 16rem">
                        <template #body="slotProps">
                            <div class="flex flex-wrap gap-1">
                                <Tag v-for="tagId in slotProps.data.tags" :key="tagId" :value="getTagNameById(tagId)" :rounded="true" />
                            </div>
                        </template>
                    </Column>
                    <!-- **Included Column** -->
                    <Column field="included" header="Included" sortable style="min-width: 12rem">
                        <template #body="slotProps">
                            <Checkbox :value="slotProps.data.id" v-model="includedEntities" @change="toggleIncludeEntity(slotProps.data.id)" />
                        </template>
                    </Column>
                    <!-- **Actions Column** -->
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
