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

        addJobDescription(jobId, description) {
            if (!this.jobDescriptions[jobId]) {
                this.jobDescriptions[jobId] = [];
            }
            this.jobDescriptions[jobId].push({ description, id: this.createId(), checked: false });
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
