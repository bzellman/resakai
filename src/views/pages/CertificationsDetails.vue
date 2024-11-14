<script setup lang="ts">
import AutoComplete from 'primevue/autocomplete';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
// import { useToast } from 'primevue/usetoast';
import { onMounted } from 'vue';
import { useCertificationsStore } from '../../stores/resumeDataStore';
import { useEntity } from '../composables/useEntity';

// Stores
const entityStore = useCertificationsStore();
// const toast = useToast();

// State variables from useEntity
const {
    entityDialog: certificationDialog,
    entity: certification,
    submitted,
    includedEntities,
    filters: filterFromEntity,
    allTags,
    relatedTags,
    searchTags,
    handleTagInput,
    getTagNameById,
    saveEntity,
    editEntity,
    deleteEntity,
    toggleIncludeEntity
} = useEntity(entityStore);

const props = defineProps({
    filters: {
        type: Object,
        required: true
    }
});

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
            <Fluid>
                <Accordion value="0">
                    <AccordionPanel value="0">
                        <AccordionHeader>Add Certification</AccordionHeader>
                        <AccordionContent>
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
                                        <AutoComplete id="tags" v-model="relatedTags" :suggestions="allTags" placeholder="Add tags" @complete="searchTags" multiple :force-selection="false" @keydown="handleTagInput" class="w-full" />
                                    </div>
                                    <Button label="Save Certification" icon="pi pi-save" @click="saveEntity" />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionPanel>
                </Accordion>
            </Fluid>
            <div v-if="entityStore.loading" class="flex justify-center items-center">
                <p>Loading...</p>
            </div>
            <div v-else-if="entityStore.items.length === 0" class="flex flex-col items-center">
                <p>No certifications available. Please add a new certification.</p>
            </div>
            <div v-else>
                <DataTable :value="entityStore.items" :filters="filters" paginator :rows="10" dataKey="id">
                    <!-- Other Columns -->
                    <Column filterField="included" header="Included" style="min-width: 12rem">
                        <template #body="slotProps">
                            <Checkbox :value="slotProps.data.id" v-model="includedEntities" @change="toggleIncludeEntity(slotProps.data.id)" />
                        </template>
                    </Column>
                    <Column field="orgName" header="Organization" sortable style="min-width: 12rem"></Column>
                    <Column field="certName" header="Certification" sortable style="min-width: 12rem"></Column>
                    <Column field="details" header="Details" style="min-width: 16rem"></Column>
                    <Column header="Tags" filterField="tags" style="min-width: 16rem">
                        <template #body="slotProps">
                            <div class="flex flex-wrap gap-1">
                                <Tag v-for="tagId in slotProps.data.tags" :key="tagId" :value="getTagNameById(tagId)" :rounded="true" />
                            </div>
                        </template>
                    </Column>
                    <!-- Actions column -->
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
