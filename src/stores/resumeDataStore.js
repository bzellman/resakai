import { useStorage } from '@vueuse/core'; // Optional for better storage handling
import { defineStore } from 'pinia';

export const useJobsStore = defineStore('jobs', {
    state: () => ({
        jobs: useStorage('jobs', []), // This automatically handles persistence
        jobDescriptions: useStorage('jobDescriptions', {}), // Add state for job descriptions
        loading: false,
        error: null
    }),

    actions: {
        async loadJobs() {
            this.loading = true;
            try {
                // Load from storage if exists
                const savedJobs = localStorage.getItem('jobs');
                if (savedJobs) {
                    this.jobs = JSON.parse(savedJobs);
                }
                const savedDescriptions = localStorage.getItem('jobDescriptions');
                if (savedDescriptions) {
                    this.jobDescriptions = JSON.parse(savedDescriptions);
                }
            } catch (error) {
                console.error('Failed to load jobs:', error);
                this.jobs = [];
                this.jobDescriptions = {};
            } finally {
                this.loading = false;
            }
        },

        addJob(job) {
            this.jobs.push(job);
            this.saveToStorage();
        },

        updateJob(updatedJob) {
            const index = this.jobs.findIndex((j) => j.id === updatedJob.id);
            if (index !== -1) {
                this.jobs[index] = updatedJob;
                this.saveToStorage();
            }
        },

        deleteJob(jobId) {
            this.jobs = this.jobs.filter((job) => job.id !== jobId);
            delete this.jobDescriptions[jobId]; // Remove associated job descriptions
            this.saveToStorage();
        },

        addJobDescription(jobId, description, tags = []) {
            if (!this.jobDescriptions[jobId]) {
                this.jobDescriptions[jobId] = [];
            }
            this.jobDescriptions[jobId].push({ description, tags, id: this.createId(), checked: false });
            this.saveDescriptionsToStorage();
        },

        updateJobDescription(jobId, updatedDescription) {
            if (this.jobDescriptions[jobId]) {
                const index = this.jobDescriptions[jobId].findIndex((desc) => desc.id === updatedDescription.id);
                if (index !== -1) {
                    this.jobDescriptions[jobId][index] = updatedDescription;
                    this.saveDescriptionsToStorage();
                }
            }
        },

        deleteJobDescription(jobId, descriptionId) {
            if (this.jobDescriptions[jobId]) {
                this.jobDescriptions[jobId] = this.jobDescriptions[jobId].filter((desc) => desc.id !== descriptionId);
                this.saveDescriptionsToStorage();
            }
        },

        updateJobDescriptions(jobId, descriptions) {
            this.jobDescriptions[jobId] = descriptions;
            this.saveDescriptionsToStorage();
        },

        saveToStorage() {
            localStorage.setItem('jobs', JSON.stringify(this.jobs));
            localStorage.setItem('jobDescriptions', JSON.stringify(this.jobDescriptions));
        },

        saveDescriptionsToStorage() {
            localStorage.setItem('jobDescriptions', JSON.stringify(this.jobDescriptions));
        },

        createId() {
            let id = '';
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            for (let i = 0; i < 5; i++) {
                id += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return id;
        }
    },

    persist: true // Enable Pinia persistence
});

export const usePersonsStore = defineStore('persons', {
    state: () => ({
        persons: useStorage('persons', []), // Automatically handles persistence
        loading: false,
        error: null
    }),

    actions: {
        async loadPersons() {
            this.loading = true;
            try {
                const savedPersons = localStorage.getItem('persons');
                if (savedPersons) {
                    this.persons = JSON.parse(savedPersons);
                }
            } catch (error) {
                console.error('Failed to load persons:', error);
                this.persons = [];
            } finally {
                this.loading = false;
            }
        },

        addPerson(person) {
            this.persons.push(person);
            this.saveToStorage();
        },

        updatePerson(updatedPerson) {
            const index = this.persons.findIndex((p) => p.id === updatedPerson.id);
            if (index !== -1) {
                this.persons[index] = updatedPerson;
                this.saveToStorage();
            }
        },

        deletePerson(personId) {
            this.persons = this.persons.filter((person) => person.id !== personId);
            this.saveToStorage();
        },

        saveToStorage() {
            localStorage.setItem('persons', JSON.stringify(this.persons));
        },

        createId() {
            let id = '';
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            for (let i = 0; i < 5; i++) {
                id += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return id;
        }
    },

    persist: true // Enable Pinia persistence
});

export const useSummaryStore = defineStore('summary', {
    state: () => ({
        professionalSummaries: useStorage('professionalSummaries', []), // Automatically handles persistence
        loading: false,
        error: null
    }),

    actions: {
        async loadProfessionalSummaries() {
            this.loading = true;
            try {
                const savedSummaries = localStorage.getItem('professionalSummaries');
                if (savedSummaries) {
                    console.log('savedSummaries:', savedSummaries);
                    this.professionalSummaries = JSON.parse(savedSummaries);
                }
            } catch (error) {
                console.error('Failed to load professional summaries:', error);
                this.professionalSummaries = [];
            } finally {
                this.loading = false;
            }
        },

        addProfessionalSummary(summary) {
            this.professionalSummaries.push(summary);
            this.saveToStorage();
        },

        updateProfessionalSummary(updatedSummary) {
            const index = this.professionalSummaries.findIndex((s) => s.id === updatedSummary.id);
            if (index !== -1) {
                this.professionalSummaries[index] = updatedSummary;
                this.saveToStorage();
            }
        },

        deleteAllProfessionalSummaries() {
            this.professionalSummaries = [];
            this.saveToStorage();
        },

        deleteProfessionalSummary(summaryId) {
            this.professionalSummaries = this.professionalSummaries.filter((summary) => summary.id !== summaryId);
            this.saveToStorage();
        },

        saveToStorage() {
            localStorage.setItem('professionalSummaries', JSON.stringify(this.professionalSummaries));
        },

        createId() {
            let id = '';
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            for (let i = 0; i < 5; i++) {
                id += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return id;
        }
    },

    persist: true // Enable Pinia persistence
});
