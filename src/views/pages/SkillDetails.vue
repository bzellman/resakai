//SkillDetails.vue

<script setup lang="ts">
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Tag from 'primevue/tag';
import { onMounted, ref } from 'vue';
import { useSkillsStore, useSkillTypesStore, useTagsStore } from '../../stores/resumeDataStore';
import { useEntity } from '../composables/useEntity';

const skillStore = useSkillsStore();
const skillTypesStore = useSkillTypesStore();
const tagsStore = useTagsStore();
const selectedSkillTypes = ref<string[]>([]);
const filteredSkillTypes = ref<string[]>([]);

const props = defineProps({
    filters: {
        type: Object,
        required: true
    }
});

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

onMounted(async () => {
    await Promise.all([skillStore.loadItems(), tagsStore.loadItems(), skillTypesStore.loadItems()]);
    // Initialize included skills
    includedSkills.value = skillStore.items.filter((skill) => skill.included).map((skill) => skill.id);
});

const showAddSkillDialog = () => {
    skillDialog.value = true;
    skill.value = {};
};

function saveSkillFlow() {
    submitted.value = true;
    if (skill.value.skillName.trim()) {
        skill.value.tags = relatedTags.value;
        skill.value.associatedSkillTypeNames = selectedSkillTypes.value;
        saveSkillTypes();
        saveSkill();
        resetForm();
        skillDialog.value = false;
    }
}

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

function exitFlow() {
    resetForm();
    skillDialog.value = false;
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
            <Column filterField="included" header="Included">
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
</template>
