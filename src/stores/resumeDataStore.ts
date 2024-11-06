import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { BaseEntity, Certification, Job, JobDescription, Person, ProfessionalSummary, Project, SkillName, SkillType, Volunteer } from '../types/interfaceTypes';

function createStore<T extends BaseEntity>(storeName: string) {
    return defineStore(storeName, {
        state: () => ({
            items: useStorage<T[]>(storeName, []),
            loading: false,
            error: null
        }),

        actions: {
            async loadItems() {
                this.loading = true;
                try {
                    const savedItems = localStorage.getItem(storeName);
                    if (savedItems) {
                        this.items = JSON.parse(savedItems);
                    }
                } catch (error) {
                    console.error(`Failed to load ${storeName}:`, error);
                    this.items = [];
                } finally {
                    this.loading = false;
                }
            },

            addItem(item: T) {
                this.items.push(item);
                this.saveToStorage();
            },

            updateItem(updatedItem: T) {
                const index = this.items.findIndex((item) => item.id === updatedItem.id);
                if (index !== -1) {
                    this.items[index] = updatedItem;
                    this.saveToStorage();
                }
            },

            deleteItem(itemId: string) {
                this.items = this.items.filter((item) => item.id !== itemId);
                this.saveToStorage();
            },

            saveToStorage() {
                localStorage.setItem(storeName, JSON.stringify(this.items));
            },

            createId(): string {
                return uuidv4();
            }
        }
    });
}

export const useJobsStore = createStore<Job>('jobs');
export const useJobDescriptionsStore = createStore<JobDescription>('jobDescriptions');
export const usePersonsStore = createStore<Person>('persons');
export const useSummaryStore = createStore<ProfessionalSummary>('professionalSummaries');
export const useSkillsStore = createStore<SkillType>('skillTypes');
export const useSkillNamesStore = createStore<SkillName>('skillNames');
export const useVolunteerStore = createStore<Volunteer>('volunteers');
export const useProjectsStore = createStore<Project>('projects');
export const useCertificationsStore = createStore<Certification>('certifications');
