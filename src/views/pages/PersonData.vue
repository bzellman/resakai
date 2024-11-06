<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { usePersonsStore } from '../../stores/resumeDataStore';
import { Person } from '../../types/interfaceTypes';

const personsStore = usePersonsStore();
const toast = useToast();
const persons = ref<Person[]>([]);

// Initialize `person` with default values
const person = ref<Person>({
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
});

const submitted = ref(false);

onMounted(async () => {
    await personsStore.loadItems(); // Correct method name
    persons.value = personsStore.items;
    if (personsStore.items.length > 0) {
        person.value = { ...personsStore.items[0] }; // Assume only one entry per user
    }
});

function createId(): string {
    let id = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

function handleSavePerson() {
    submitted.value = true;

    if (person.value.name.trim()) {
        if (person.value.id) {
            personsStore.updateItem(person.value);
            toast.add({
                severity: 'success',
                summary: 'Successful',
                detail: 'Person Updated',
                life: 3000
            });
        } else {
            person.value.id = createId();
            personsStore.addItem(person.value);
            toast.add({
                severity: 'success',
                summary: 'Successful',
                detail: 'Person Created',
                life: 3000
            });
        }
    }
}
</script>

<template>
    <div>
        <div class="card">
            <Fluid>
                <div class="flex mt-8">
                    <div class="card flex flex-col gap-4 w-full">
                        <div class="font-semibold text-xl">User Information</div>

                        <div class="flex flex-col md:flex-row gap-4">
                            <div class="flex flex-wrap gap-2 w-full md:w-full">
                                <label for="name">Name</label>
                                <InputText id="name" v-model="person.name" type="text" />
                            </div>
                        </div>

                        <div class="flex flex-col md:flex-row gap-4">
                            <div class="flex flex-wrap gap-2 w-full md:w-full">
                                <label for="email" class="block">Email</label>
                                <InputText id="email" v-model="person.email" type="text" class="w-full" />
                            </div>
                        </div>

                        <div class="flex flex-col md:flex-row gap-4">
                            <div class="flex flex-wrap gap-2 w-full md:w-full">
                                <label for="phone">Phone</label>
                                <InputText id="phone" v-model="person.phone" type="text" />
                            </div>
                        </div>

                        <div class="flex flex-col md:flex-row gap-4">
                            <div class="flex flex-wrap gap-2 w-full md:w-full">
                                <label for="city">City</label>
                                <InputText id="city" v-model="person.city" type="text" />
                            </div>
                        </div>

                        <div class="flex flex-col md:flex-row gap-4">
                            <div class="flex flex-wrap gap-2 w-full md:w-full">
                                <label for="state">State</label>
                                <InputText id="state" v-model="person.state" type="text" />
                            </div>
                        </div>

                        <div class="flex flex-col md:flex-row gap-4">
                            <div class="flex flex-wrap gap-2 w-full md:w-full">
                                <label for="github">Github</label>
                                <InputText id="github" v-model="person.github" type="text" />
                            </div>
                        </div>

                        <div class="flex flex-col md:flex-row gap-4">
                            <div class="flex flex-wrap gap-2 w-full md:w-full">
                                <label for="linkedin">LinkedIn</label>
                                <InputText id="linkedin" v-model="person.linkedin" type="text" />
                            </div>
                        </div>

                        <div class="flex flex-col md:flex-row gap-4">
                            <div class="flex flex-wrap gap-2 w-full md:w-full">
                                <label for="portfolio">Portfolio</label>
                                <InputText id="portfolio" v-model="person.portfolio" type="text" />
                            </div>
                        </div>

                        <Button label="Save" icon="pi pi-save" severity="secondary" @click="handleSavePerson" />
                    </div>
                </div>
            </Fluid>

            <div v-if="personsStore.loading" class="flex justify-center items-center">
                <p>Loading...</p>
            </div>
            <div v-else-if="personsStore.items.length === 0" class="flex flex-col items-center">
                <p>No user data available. Please add a new user.</p>
            </div>
        </div>
    </div>
</template>
