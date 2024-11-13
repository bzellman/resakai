//SkillDetails.vue

<script setup lang="ts">
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Tag from 'primevue/tag';
import { onMounted, ref, watch } from 'vue';
import { useSkillsStore, useSkillTypesStore, useTagsStore } from '../../stores/resumeDataStore';
import { useEntity } from '../composables/useEntity';

// Stores
const skillStore = useSkillsStore();
const skillTypesStore = useSkillTypesStore();
const tagsStore = useTagsStore();

const props = defineProps({
    filters: {
        type: Object,
        required: true
    }
});

watch(props.filters, (newFilters) => {
    console.log('skillStore', skillStore.items);
    console.log('new Filters Recieved:', newFilters);
});

// State variables
const {
    entityDialog: skillDialog,
    entity: skill,
    submitted,
    includedEntities: includedSkills,
    filters: filterFromEntity,
    allTags,
    relatedTags,
    searchTags,
    handleTagInput,
    getTagNameById,
    saveEntity: saveSkill,
    editEntity: editSkill,
    deleteEntity: deleteSkill,
    toggleIncludeEntity: toggleIncludeSkill,
    filteredEntities: filteredSkills
} = useEntity(skillStore);

// For skill types (allowing multiple selection)
const filteredSkillTypes = ref<string[]>([]);
const selectedSkillTypes = ref<string[]>([]);

onMounted(async () => {
    await Promise.all([skillStore.loadItems(), tagsStore.loadItems(), skillTypesStore.loadItems()]);
    // Initialize included skills
    includedSkills.value = skillStore.items.filter((skill) => skill.included).map((skill) => skill.id);
});

const showAddSkillDialog = () => {
    skillDialog.value = true;
    skill.value = {};
    submitted.value = false;
};
</script>

<template>
    <div class="card">
        <DataTable :value="skillStore.items" :filters="filters" paginator :rows="10" dataKey="id">
            <!-- Table Header -->
            <template #header>
                <div class="flex justify-between">
                    <h4>Skill Details</h4>
                    <Button label="Add Skill" icon="pi pi-plus" @click="showAddSkillDialog" />
                </div>
            </template>
            <!-- Columns -->
            <Column field="skillName" header="Skill Name" Placeholder="Search by name" />
            <Column header="Skill Types">
                <template #body="slotProps">
                    {{ slotProps.data.associatedSkillTypeNames.join(', ') || '' }}
                </template>
            </Column>
            <Column header="Tags" filterField="tags">
                <template #body="slotProps">
                    <div class="flex flex-wrap gap-1">
                        <Tag v-for="tagId in slotProps.data.tags" :key="tagId" :value="getTagNameById(tagId)" :rounded="true" />
                    </div>
                </template>
            </Column>
            <Column field="included" header="Included">
                <template #body="slotProps">
                    <Checkbox :value="slotProps.data.id" v-model="includedSkills" @change="() => toggleIncludeSkill(slotProps.data.id)" />
                </template>
            </Column>
            <!-- Actions Column -->
            <Column header="Actions">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editSkill(slotProps.data)" />
                    <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="deleteSkill(slotProps.data.id)" />
                </template>
            </Column>
        </DataTable>
    </div>
</template>
