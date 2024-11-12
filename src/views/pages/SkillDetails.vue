//TODO: Refactor with useEntity.ts

<script setup lang="ts">
import AutoComplete from 'primevue/autocomplete';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import { onMounted, ref } from 'vue';
import { useSkillsStore, useSkillTypesStore, useTagsStore } from '../../stores/resumeDataStore';
import { useEntity } from '../composables/useEntity';

// Stores
const skillStore = useSkillsStore();
const skillTypesStore = useSkillTypesStore();
const tagsStore = useTagsStore();
// const toast = useToast();

// State variables

const {
    entityDialog: skillDialog,
    entity: skill,
    submitted,
    includedEntities: includedSkills,
    filters,
    allTags,
    relatedTags,
    searchTags,
    handleTagInput,
    getTagNameById,
    saveEntity: saveSkill,
    editEntity: editSkill,
    deleteEntity: deleteSkill,
    toggleIncludeEntity: toggleIncludeSkill
} = useEntity(skillStore);

// For skill types (allowing multiple selection)
const filteredSkillTypes = ref<string[]>([]);
const selectedSkillTypes = ref<string[]>([]);

onMounted(async () => {
    await Promise.all([skillStore.loadItems(), tagsStore.loadItems(), skillTypesStore.loadItems()]);

    // Initialize included skills
    includedSkills.value = skillStore.items.filter((skill) => skill.included).map((skill) => skill.id);
});

// Function to search and filter skill types
function searchSkillTypes(event: { query: string }) {
    const query = event.query.toLowerCase();
    filteredSkillTypes.value = skillTypesStore.items.map((type) => type.skillTypeName).filter((typeName) => typeName && typeName.toLowerCase().includes(query));
}

function handleSkillTypeInput(event: KeyboardEvent) {
    if (event.key === 'Enter' && (event.target as HTMLInputElement).value) {
        const inputValue = (event.target as HTMLInputElement).value.trim();
        if (inputValue && !selectedSkillTypes.value.includes(inputValue)) {
            selectedSkillTypes.value.push(inputValue);
        }
        (event.target as HTMLInputElement).value = '';
    }
}

function saveSkillFlow() {
    submitted.value = true;
    if (skill.value.skillName.trim()) {
        // Assign selected tags
        skill.value.tags = relatedTags.value;

        // Assign selected skill types
        skill.value.associatedSkillTypeNames = selectedSkillTypes.value;

        // Save or update skill types
        saveSkillTypes();

        // Save the skill
        saveSkill();

        // Reset the form
        resetForm();
        skillDialog.value = false;
    }
}

function exitFlow() {
    resetForm();
    skillDialog.value = false;
}

function showAddSkillDialog() {
    resetForm();
    skillDialog.value = true;
}

// Function to save or update skill types
function saveSkillTypes() {
    skill.value.associatedSkillTypeNames.forEach((typeName) => {
        let skillType = skillTypesStore.items.find((t) => t.skillTypeName === typeName);
        if (!skillType) {
            skillType = {
                id: skillTypesStore.createId(),
                skillTypeName: typeName,
                associatedSkillNames: [skill.value.skillName],
                createDate: new Date(),
                included: false,
                tags: []
            };
            skillTypesStore.addItem(skillType);
        } else if (!skillType.associatedSkillNames.includes(skill.value.skillName)) {
            skillType.associatedSkillNames.push(skill.value.skillName);
            skillTypesStore.updateItem(skillType);
        }
    });
}

function editSkillFlow(skillToEdit) {
    skill.value = { ...skillToEdit };
    // Load tags and skill types
    relatedTags.value = skillToEdit.tags;
    selectedSkillTypes.value = skillToEdit.associatedSkillTypeNames;
    skillDialog.value = true;
}

function resetForm() {
    skill.value = {
        id: '',
        createDate: new Date(),
        included: false,
        tags: [],
        skillName: '',
        associatedSkillTypeNames: []
    };
    relatedTags.value = [];
    selectedSkillTypes.value = [];
}
</script>

<template>
    <div>
        <div class="card">
            <DataTable :value="skillStore.items" dataKey="id" :paginator="true" :rows="10" :filters="filters" :filter-display="'menu'">
                <!-- Table Header -->
                <template #header>
                    <div class="flex justify-between">
                        <h4>Skill Details</h4>
                        <Button label="Add Skill" icon="pi pi-plus" @click="showAddSkillDialog" />
                    </div>
                </template>

                <!-- Columns -->
                <Column field="skillName" header="Skill Name" sortable filter filterPlaceholder="Search by name" />
                <Column header="Skill Types">
                    <template #body="slotProps">
                        {{ slotProps.data.associatedSkillTypeNames.join(', ') || '' }}
                    </template>
                </Column>
                <Column header="Tags">
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
                        <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editSkillFlow(slotProps.data)" />
                        <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="deleteSkill(slotProps.data.id)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- Skill Dialog -->
        <Dialog header="Skill Details" :visible="skillDialog" :modal="true" :closable="false" :style="{ width: '500px' }" :breakpoints="{ '960px': '75vw', '640px': '100vw' }">
            <div class="flex flex-col gap-4">
                <!-- Skill Name -->
                <div class="field">
                    <label for="skillName">Skill Name</label>
                    <InputText id="skillName" v-model="skill.skillName" required autofocus class="w-full" :class="{ 'p-invalid': submitted && !skill.skillName }" />
                    <small v-if="submitted && !skill.skillName" class="p-error">Skill Name is required.</small>
                </div>

                <!-- Skill Types -->
                <div class="field">
                    <label for="skillTypes">Skill Types</label>
                    <AutoComplete
                        id="skillTypes"
                        v-model="selectedSkillTypes"
                        :suggestions="filteredSkillTypes"
                        placeholder="Select Skill Types"
                        @complete="searchSkillTypes"
                        multiple
                        @keydown="handleSkillTypeInput"
                        :force-selection="false"
                        class="w-full"
                    />
                </div>

                <!-- Tags -->
                <div class="field">
                    <label for="tags">Tags</label>
                    <AutoComplete id="tags" v-model="relatedTags" :suggestions="allTags" placeholder="Add tags" @complete="searchTags" multiple @keydown="handleTagInput" :force-selection="false" class="w-full" />
                </div>
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="exitFlow" />
                <Button label="Save" icon="pi pi-check" @click="saveSkillFlow" />
            </template>
        </Dialog>
    </div>
</template>
