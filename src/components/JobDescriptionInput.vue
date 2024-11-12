// I think I just need better filtering for the id
<script setup lang="ts">
// import { useToast } from 'primevue/usetoast';

import AutoComplete from 'primevue/autocomplete';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';

import { computed, onMounted } from 'vue';
import { useJobDescriptionsStore } from '../stores/resumeDataStore';
import { Job } from '../types/interfaceTypes';
import { useEntity } from '../views/composables/useEntity';

const props = defineProps<{
    parentJob: Job;
}>();

const entityStore = useJobDescriptionsStore();
const filteredItems = computed(() => {
    return entityStore.items.filter((item) => item.jobId === props.parentJob.id);
});
const { entityDialog: projectDialog, entity, submitted, includedEntities, filters, allTags, relatedTags, searchTags, handleTagInput, getTagNameById, saveEntity, editEntity, deleteEntity, toggleIncludeEntity } = useEntity(entityStore);

onMounted(async () => {
    console.log('rrr: onMounted', props.parentJob.companyName);
    console.log('rrr: onMounted', props.parentJob.id);
});

function saveWithParentId() {
    entity.value.jobId = props.parentJob.id;
    saveEntity();
}
// **Use the useEntity composable**
</script>

<template>
    <div>
        <div class="card">
            <!-- Details Table -->
            <div v-if="entityStore.loading" class="flex justify-center items-center">
                <p>Loading...</p>
            </div>

            <DataTable :value="filteredItems" dataKey="id" :paginator="false" :rows="10" :rowsPerPageOptions="[5, 10, 25]" tableStyle="min-width: 60rem" resizableColumns columnResizeMode="fit">
                <!-- Included Checkbox Column -->
                <Column field="included" header="Included" style="min-width: 8rem">
                    <template #body="slotProps">
                        <Checkbox :value="slotProps.data.id" v-model="includedEntities" @change="toggleIncludeEntity(slotProps.data.id)" />
                    </template>
                </Column>
                <!-- Other Columns -->
                <Column field="description" header="Description Details" sortable style="min-width: 12rem" />
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
            <!-- Job Description Form -->
            <div class="flex mt-8">
                <div class="card flex flex-col gap-4 w-full">
                    <!-- Project Name -->
                    <div class="flex flex-col gap-4 w-full">
                        <label for="Description">Description</label>
                        <InputText id="Description" v-model="entity.description" placeholder="Enter Description" />
                    </div>
                    <!-- Project Details -->
                    <div class="flex flex-col gap-4 w-full">
                        <label for="tags">Tags</label>
                        <AutoComplete id="tags" v-model="relatedTags" :suggestions="allTags" placeholder="Add tags" @complete="searchTags" multiple :force-selection="false" @keydown="handleTagInput" class="w-full" />
                    </div>
                    <!-- Include in Resume Checkbox -->
                    <Button label="Add Description" icon="pi pi-save" @click="saveWithParentId()" />
                </div>
            </div>
        </div>
    </div>
</template>
