<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import AutoComplete from 'primevue/autocomplete';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import InputText from 'primevue/inputtext';

import { usePersonsStore } from '../../stores/resumeDataStore';
import { useEntity } from '../composables/useEntity';
import { Person } from '../../types/interfaceTypes';

// Stores
const personsStore = usePersonsStore();
const toast = useToast();
// onMounted(async () => {
//     await personsStore.loadItems();
//     await tagsStore.loadItems();

//     // Initialize selectedTags when editing
//     // if (person.value.tags && person.value.tags.length > 0) {
//         // selectedTags.value = person.value.tags.map((tag: TagEntity) => tag.tagName);
//     // }
// });
// State variables from useEntity
// const { entityDialog: personDialog, entity: person, submitted, filteredTags, selectedTags, searchTags, handleTagInput, saveEntity: savePerson } = useEntity(personsStore);

const { entityDialog: personDialog, entity: person, submitted, filteredTags, selectedTags, searchTags, handleTagInput, saveEntity: savePerson } = useEntity(personsStore);
// Reset form
function resetForm() {
    person.value = {
        id: '',
        name: '',
        email: '',
        phone: '',
        city: '',
        state: '',
        github: '',
        linkedin: '',
        portfolio: '',
        createDate: new Date(),
        tags: [],
        included: false
    };
    selectedTags.value = [];
    submitted.value = false;
}
</script>

<template>
    <div>
        <div class="card">
            <!-- Person Form -->
            <div class="flex mt-8">
                <div class="card flex flex-col gap-4 w-full">
                    <div class="font-semibold text-xl">User Information</div>
                    <!-- Name -->
                    <div class="flex flex-col gap-4 w-full">
                        <label for="name">Name</label>
                        <InputText id="name" v-model="person.name" placeholder="Enter name" />
                    </div>
                    <!-- Email -->
                    <div class="flex flex-col gap-4 w-full">
                        <label for="email">Email</label>
                        <InputText id="email" v-model="person.email" placeholder="Enter email" />
                    </div>
                    <!-- Phone -->
                    <div class="flex flex-col gap-4 w-full">
                        <label for="phone">Phone</label>
                        <InputText id="phone" v-model="person.phone" placeholder="Enter phone" />
                    </div>
                    <!-- City -->
                    <div class="flex flex-col gap-4 w-full">
                        <label for="city">City</label>
                        <InputText id="city" v-model="person.city" placeholder="Enter city" />
                    </div>
                    <!-- State -->
                    <div class="flex flex-col gap-4 w-full">
                        <label for="state">State</label>
                        <InputText id="state" v-model="person.state" placeholder="Enter state" />
                    </div>
                    <!-- Github -->
                    <div class="flex flex-col gap-4 w-full">
                        <label for="github">Github</label>
                        <InputText id="github" v-model="person.github" placeholder="Enter Github" />
                    </div>
                    <!-- LinkedIn -->
                    <div class="flex flex-col gap-4 w-full">
                        <label for="linkedin">LinkedIn</label>
                        <InputText id="linkedin" v-model="person.linkedin" placeholder="Enter LinkedIn" />
                    </div>
                    <!-- Portfolio -->
                    <div class="flex flex-col gap-4 w-full">
                        <label for="portfolio">Portfolio</label>
                        <InputText id="portfolio" v-model="person.portfolio" placeholder="Enter portfolio" />
                    </div>
                    <!-- Tags AutoComplete -->
                    <div class="flex flex-col gap-4 w-full">
                        <label for="tags">Tags</label>
                        <AutoComplete id="tags" v-model="selectedTags" :suggestions="filteredTags" placeholder="Add tags" @complete="searchTags" multiple :force-selection="false" @keydown="handleTagInput" class="w-full" />
                    </div>
                    <!-- Include in Resume Checkbox -->
                    <Button label="Save Person" icon="pi pi-save" @click="savePerson" />
                </div>
            </div>
        </div>
    </div>
</template>
