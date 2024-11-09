//TODO: Refactor with useEntity.ts

<script setup lang="ts">
import AutoComplete from 'primevue/autocomplete';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import Checkbox from 'primevue/checkbox';

import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

import { useSkillsStore, useSkillTypesStore, useTagsStore } from '../../stores/resumeDataStore';
import { SkillName } from '../../types/interfaceTypes';

// Stores
const skillStore = useSkillsStore();
const skillTypesStore = useSkillTypesStore();
const tagsStore = useTagsStore();
const toast = useToast();

// State variables
const skillDialog = ref(false);
const skill = ref<SkillName>({
    id: '',
    createDate: new Date(),
    included: false,
    tags: [],
    skillName: '',
    associatedSkillTypeNames: []
});
const submitted = ref(false);

// For tag suggestions and selection
const filteredTags = ref<string[]>([]);
const selectedTags = ref<string[]>([]);

// For skill types (allowing multiple selection)
const filteredSkillTypes = ref<string[]>([]);
const selectedSkillTypes = ref<string[]>([]);

// For included skills
const includedSkills = ref<string[]>([]);

onMounted(async () => {
    await Promise.all([skillStore.loadItems(), tagsStore.loadItems(), skillTypesStore.loadItems()]);

    // Initialize selectedTags and selectedSkillTypes when editing
    if (skill.value.tags.length > 0) {
        selectedTags.value = skill.value.tags.map((tag) => tag.tagName);
    }
    if (skill.value.associatedSkillTypeNames.length > 0) {
        selectedSkillTypes.value = [...skill.value.associatedSkillTypeNames];
    }

    // Initialize includedSkills
    includedSkills.value = skillStore.items.filter((skill) => skill.included).map((skill) => skill.id);
});

// Function to search and filter tags
function searchTags(event: { query: string }) {
    const query = event.query.toLowerCase();
    filteredTags.value = tagsStore.items.map((tag) => tag.tagName).filter((tagName) => tagName && tagName.toLowerCase().includes(query));
}

// Function to search and filter skill types
function searchSkillTypes(event: { query: string }) {
    const query = event.query.toLowerCase();
    filteredSkillTypes.value = skillTypesStore.items.map((type) => type.skillTypeName).filter((typeName) => typeName && typeName.toLowerCase().includes(query));
}

// Function to handle tag input
function handleTagInput(event: KeyboardEvent) {
    if (event.key === 'Enter') {
        const input = (event.target as HTMLInputElement).value.trim();
        if (input && !selectedTags.value.includes(input)) {
            selectedTags.value.push(input);
            (event.target as HTMLInputElement).value = ''; // Clear the input field
        }
    }
}

// Function to handle skill type input
function handleSkillTypeInput(event: KeyboardEvent) {
    if (event.key === 'Enter') {
        const input = (event.target as HTMLInputElement).value.trim();
        if (input && !selectedSkillTypes.value.includes(input)) {
            selectedSkillTypes.value.push(input);
            (event.target as HTMLInputElement).value = ''; // Clear the input field
        }
    }
}

// Function to toggle included property
function toggleIncludeSkill(skillId: string) {
    const skillItem = skillStore.items.find((skill) => skill.id === skillId);
    if (skillItem) {
        skillItem.included = !skillItem.included;
        skillStore.updateItem(skillItem);
        if (skillItem.included) {
            includedSkills.value.push(skillId);
        } else {
            const index = includedSkills.value.indexOf(skillId);
            if (index !== -1) {
                includedSkills.value.splice(index, 1);
            }
        }
    }
}

// Save skill
function saveSkill() {
    submitted.value = true;
    if (skill.value.skillName.trim()) {
        // Handle tags
        skill.value.tags = selectedTags.value.map((tagName) => {
            let tag = tagsStore.items.find((t) => t.tagName === tagName);
            if (!tag) {
                tag = { id: tagsStore.createId(), tagName };
                tagsStore.addItem(tag);
            }
            return tag;
        });

        // Handle skill types
        skill.value.associatedSkillTypeNames = selectedSkillTypes.value.map((typeName) => {
            let skillType = skillTypesStore.items.find((t) => t.skillTypeName === typeName);
            if (!skillType) {
                skillType = {
                    id: skillTypesStore.createId(),
                    skillTypeName: typeName,
                    associatedSkillNames: [],
                    createDate: new Date(),
                    included: false,
                    tags: []
                };
                skillTypesStore.addItem(skillType);
            }

            // Update associated skill names in SkillType
            if (!skillType.associatedSkillNames.includes(skill.value.skillName)) {
                skillType.associatedSkillNames.push(skill.value.skillName);
                skillTypesStore.updateItem(skillType);
            }

            return skillType.skillTypeName;
        });

        // Save or update skill
        if (skill.value.id) {
            skillStore.updateItem(skill.value);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Skill Updated', life: 3000 });
        } else {
            skill.value.id = skillStore.createId();
            skillStore.addItem(skill.value);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Skill Created', life: 3000 });
        }

        // Reset form
        resetForm();
    }
}

// Reset form
function resetForm() {
    skill.value = {
        id: '',
        createDate: new Date(),
        included: false,
        tags: [],
        skillName: '',
        associatedSkillTypeNames: []
    };
    selectedTags.value = [];
    selectedSkillTypes.value = [];
    submitted.value = false;
}

// Edit skill
function editSkill(skillToEdit: SkillName) {
    skill.value = { ...skillToEdit };
    selectedTags.value = skillToEdit.tags.map((tag) => tag.tagName);
    if (skillToEdit.associatedSkillTypeNames.length > 0) {
        selectedSkillTypes.value = [...skillToEdit.associatedSkillTypeNames];
    }
    skillDialog.value = true;
}

// Delete skill
function deleteSkill(skillId: string) {
    const skillToDelete = skillStore.items.find((s) => s.id === skillId);
    if (skillToDelete) {
        // Remove skill name from associated skill types
        skillToDelete.associatedSkillTypeNames.forEach((typeName) => {
            const type = skillTypesStore.items.find((t) => t.skillTypeName === typeName);
            if (type) {
                type.associatedSkillNames = type.associatedSkillNames.filter((name) => name !== skillToDelete.skillName);
                skillTypesStore.updateItem(type);
            }
        });
        skillStore.deleteItem(skillId);
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Skill Deleted', life: 3000 });
    }
}
</script>

<template>
    <div>
        <div class="card">
            <Fluid>
                <Accordion value="0">
                    <AccordionPanel value="0">
                        <AccordionHeader>Add Skill</AccordionHeader>
                        <AccordionContent>
                            <div class="flex mt-8">
                                <div class="card flex flex-col gap-4 w-full">
                                    <!-- Skill Name -->
                                    <div class="flex flex-col gap-4 w-full">
                                        <label for="skillName">Skill Name</label>
                                        <InputText id="skillName" v-model="skill.skillName" placeholder="Enter skill name" />
                                    </div>
                                    <!-- Skill Type AutoComplete -->
                                    <div class="flex flex-col gap-4 w-full">
                                        <label for="skillType">Skill Type</label>
                                        <AutoComplete
                                            id="skillType"
                                            v-model="selectedSkillTypes"
                                            :suggestions="filteredSkillTypes"
                                            placeholder="Select or add a skill type"
                                            @complete="searchSkillTypes"
                                            :force-selection="false"
                                            @keydown="handleSkillTypeInput"
                                            class="w-full"
                                            multiple
                                        />
                                    </div>
                                    <!-- Tags AutoComplete -->
                                    <div class="flex flex-col gap-4 w-full">
                                        <label for="tags">Tags</label>
                                        <AutoComplete id="tags" v-model="selectedTags" :suggestions="filteredTags" placeholder="Add tags" @complete="searchTags" multiple :force-selection="false" @keydown="handleTagInput" class="w-full" />
                                    </div>
                                    <div class="flex flex-wrap gap-2">
                                        <label for="included" class="mr-2">Include in Resume</label>
                                        <Checkbox id="included" v-model="skill.included" :binary="true" />
                                    </div>
                                    <Button label="Save Skill" icon="pi pi-save" @click="saveSkill" />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionPanel>
                </Accordion>
            </Fluid>

            <div v-if="skillStore.loading" class="flex justify-center items-center">
                <p>Loading...</p>
            </div>
            <div v-else-if="skillStore.items.length === 0" class="flex flex-col items-center">
                <p>No skills available. Please add a new skill.</p>
            </div>
            <div v-else>
                <DataTable
                    :value="skillStore.items"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} skills"
                    :rowsPerPageOptions="[5, 10, 25]"
                    tableStyle="min-width: 60rem"
                    resizableColumns
                    columnResizeMode="fit"
                >
                    <!-- Table columns -->
                    <Column field="skillName" header="Skill Name" sortable style="min-width: 12rem"></Column>
                    <Column field="associatedSkillTypeNames" header="Skill Type" style="min-width: 12rem">
                        <template #body="slotProps">
                            {{ slotProps.data.associatedSkillTypeNames.join(', ') || '' }}
                        </template>
                    </Column>
                    <Column field="tags" header="Tags" style="min-width: 16rem">
                        <template #body="slotProps">
                            <div class="flex flex-wrap gap-1">
                                <Tag v-for="tag in slotProps.data.tags" :key="tag.id" :value="tag.tagName" :rounded="true" />
                            </div>
                        </template>
                    </Column>
                    <Column field="included" header="Included" style="min-width: 8rem">
                        <template #body="slotProps">
                            <Checkbox :value="slotProps.data.id" v-model="includedSkills" @change="() => toggleIncludeSkill(slotProps.data.id)" />
                        </template>
                    </Column>
                    <!-- Actions column -->
                    <Column header="Actions" style="min-width: 8rem">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editSkill(slotProps.data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="deleteSkill(slotProps.data.id)" />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>
