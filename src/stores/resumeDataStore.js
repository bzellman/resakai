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

export const useSkillsStore = defineStore('skills', {
    state: () => ({
        skillTypes: useStorage('skillTypes', []), // Automatically handles persistence
        skillNames: useStorage('skillNames', []), // Automatically handles persistence
        loading: false,
        error: null
    }),

    actions: {
        async loadSkills() {
            this.loading = true;
            try {
                const savedSkillTypes = localStorage.getItem('skillTypes');
                if (savedSkillTypes) {
                    this.skillTypes = JSON.parse(savedSkillTypes);
                }
                const savedSkillNames = localStorage.getItem('skillNames');
                if (savedSkillNames) {
                    this.skillNames = JSON.parse(savedSkillNames);
                }
            } catch (error) {
                console.error('Failed to load skills:', error);
                this.skillTypes = [];
                this.skillNames = [];
            } finally {
                this.loading = false;
            }
        },

        addSkillType(skillType) {
            this.skillTypes.push(skillType);
            this.saveToStorage();
        },

        updateSkillType(updatedSkillType) {
            const index = this.skillTypes.findIndex((s) => s.id === updatedSkillType.id);
            if (index !== -1) {
                this.skillTypes[index] = updatedSkillType;
                this.saveToStorage();
            }
        },

        deleteSkillType(skillTypeId) {
            this.skillTypes = this.skillTypes.filter((skillType) => skillType.id !== skillTypeId);
            this.saveToStorage();
        },

        addSkillName(skillName) {
            this.skillNames.push(skillName);
            this.saveToStorage();
        },

        updateSkillName(updatedSkillName) {
            const index = this.skillNames.findIndex((s) => s.id === updatedSkillName.id);
            if (index !== -1) {
                this.skillNames[index] = updatedSkillName;
                this.saveToStorage();
            }
        },

        deleteSkillName(skillNameId) {
            this.skillNames = this.skillNames.filter((skillName) => skillName.id !== skillNameId);
            this.saveToStorage();
        },

        saveToStorage() {
            localStorage.setItem('skillTypes', JSON.stringify(this.skillTypes));
            localStorage.setItem('skillNames', JSON.stringify(this.skillNames));
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

export const useVolunteerStore = defineStore('volunteer', {
    state: () => ({
        volunteers: useStorage('volunteers', []), // Automatically handles persistence
        loading: false,
        error: null
    }),

    actions: {
        async loadVolunteers() {
            this.loading = true;
            try {
                const savedVolunteers = localStorage.getItem('volunteers');
                if (savedVolunteers) {
                    this.volunteers = JSON.parse(savedVolunteers);
                }
            } catch (error) {
                console.error('Failed to load volunteers:', error);
                this.volunteers = [];
            } finally {
                this.loading = false;
            }
        },

        addVolunteer(volunteer) {
            this.volunteers.push(volunteer);
            this.saveToStorage();
        },

        updateVolunteer(updatedVolunteer) {
            const index = this.volunteers.findIndex((v) => v.id === updatedVolunteer.id);
            if (index !== -1) {
                this.volunteers[index] = updatedVolunteer;
                this.saveToStorage();
            }
        },

        deleteVolunteer(volunteerId) {
            this.volunteers = this.volunteers.filter((volunteer) => volunteer.id !== volunteerId);
            this.saveToStorage();
        },

        saveToStorage() {
            localStorage.setItem('volunteers', JSON.stringify(this.volunteers));
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

export const useProjectsStore = defineStore('projects', {
    state: () => ({
        projects: useStorage('projects', []), // Automatically handles persistence
        loading: false,
        error: null
    }),

    actions: {
        async loadProjects() {
            this.loading = true;
            try {
                const savedProjects = localStorage.getItem('projects');
                if (savedProjects) {
                    this.projects = JSON.parse(savedProjects);
                }
            } catch (error) {
                console.error('Failed to load projects:', error);
                this.projects = [];
            } finally {
                this.loading = false;
            }
        },

        addProject(project) {
            this.projects.push(project);
            this.saveToStorage();
        },

        updateProject(updatedProject) {
            const index = this.projects.findIndex((p) => p.id === updatedProject.id);
            if (index !== -1) {
                this.projects[index] = updatedProject;
                this.saveToStorage();
            }
        },

        deleteProject(projectId) {
            this.projects = this.projects.filter((project) => project.id !== projectId);
            this.saveToStorage();
        },

        saveToStorage() {
            localStorage.setItem('projects', JSON.stringify(this.projects));
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

export const useCertificationsStore = defineStore('certifications', {
    state: () => ({
        certifications: useStorage('certifications', []), // Automatically handles persistence
        loading: false,
        error: null
    }),

    actions: {
        async loadCertifications() {
            this.loading = true;
            try {
                const savedCertifications = localStorage.getItem('certifications');
                if (savedCertifications) {
                    this.certifications = JSON.parse(savedCertifications);
                }
            } catch (error) {
                console.error('Failed to load certifications:', error);
                this.certifications = [];
            } finally {
                this.loading = false;
            }
        },

        addCertification(certification) {
            this.certifications.push(certification);
            this.saveToStorage();
        },

        updateCertification(updatedCertification) {
            const index = this.certifications.findIndex((c) => c.id === updatedCertification.id);
            if (index !== -1) {
                this.certifications[index] = updatedCertification;
                this.saveToStorage();
            }
        },

        deleteCertification(certificationId) {
            this.certifications = this.certifications.filter((certification) => certification.id !== certificationId);
            this.saveToStorage();
        },

        saveToStorage() {
            localStorage.setItem('certifications', JSON.stringify(this.certifications));
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
