<script setup>
import { usePersonsStore } from '@/stores/resumeDataStore';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const personsStore = usePersonsStore();
const toast = useToast();
const persons = ref([]);
const person = ref({});
const submitted = ref(false);

onMounted(async () => {
    await personsStore.loadPersons();
    persons.value = personsStore.persons;
    if (personsStore.persons.length > 0) {
        person.value = personsStore.persons[0]; // Assume only one entry per user
    }
});

function savePerson() {
    submitted.value = true;

    if (person.value?.name?.trim()) {
        if (person.value.id) {
            personsStore.updatePerson(person.value);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Person Updated', life: 3000 });
        } else {
            person.value.id = createId();
            personsStore.addPerson(person.value);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Person Created', life: 3000 });
        }
    }
}

// function deletePerson(personId) {
//     personsStore.deletePerson(personId);
//     toast.add({ severity: 'success', summary: 'Successful', detail: 'Person Deleted', life: 3000 });
// }

function createId() {
    let id = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
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
                        <div class="flex flex-col md:flex-3row gap-4">
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
                        <Button label="Save" icon="pi pi-save" severity="secondary" @click="savePerson" />
                    </div>
                </div>
            </Fluid>

            <div v-if="personsStore.loading" class="flex justify-center items-center">
                <p>Loading...</p>
            </div>
        </div>
    </div>
</template>
