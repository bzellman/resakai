import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { Certification, EntityBase, Job, JobDescription, Person, ProfessionalSummary, Project, SkillName, SkillType, TagEntity, Volunteer } from '../types/interfaceTypes';

function createStore<T extends EntityBase>(storeName: string) {
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
                        const parsedItems = JSON.parse(savedItems) as T[];

                        this.items = parsedItems.map((item) => ({
                            ...item,
                            ...(item.hasOwnProperty('createDate') && {
                                createDate: new Date((item as any).createDate)
                            }),
                            ...('tags' in item && {
                                tags: (item as any).tags.map((tag: TagEntity) => ({
                                    ...tag
                                    // If TagEntity has properties needing reconstruction, handle them here
                                }))
                            })
                        }));
                    } else {
                        this.items = [];
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
                    // Update the existing item properties
                    Object.assign(this.items[index], updatedItem);
                    this.saveToStorage();
                }
            },

            deleteItem(itemId: string) {
                this.items = this.items.filter((item) => item.id !== itemId);
                this.saveToStorage();
            },

            saveToStorage() {
                const itemsToStore = this.items.map((item) => ({
                    ...item,
                    ...(item.hasOwnProperty('createDate') && {
                        createDate: (item as any).createDate.toISOString()
                    }),
                    ...(item.hasOwnProperty('tags') && {
                        tags: item.tags.map((tag: TagEntity) => ({
                            ...tag
                            // Include other properties of TagEntity as needed
                        }))
                    })
                }));
                localStorage.setItem(storeName, JSON.stringify(itemsToStore));
            },

            createId(): string {
                return uuidv4();
            }
        }
    });
}

// Existing stores
export const useJobsStore = createStore<Job>('jobs');
export const useJobDescriptionsStore = createStore<JobDescription>('jobDescriptions');
export const usePersonsStore = createStore<Person>('persons');
export const useSummaryStore = createStore<ProfessionalSummary>('professionalSummaries');
export const useSkillsStore = createStore<SkillType>('skillTypes');
export const useSkillNamesStore = createStore<SkillName>('skillNames');
export const useVolunteerStore = createStore<Volunteer>('volunteers');
export const useProjectsStore = createStore<Project>('projects');
export const useCertificationsStore = createStore<Certification>('certifications');
export const useTagsStore = createStore<TagEntity>('tags');
