//Todo: Updae this so all items have an OwnerId and allow for filtering by OwnerId

import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { Certification, Education, Job, JobDescription, Person, ProfessionalSummary, Project, SkillName, SkillType, TagEntity, Volunteer } from '../types/interfaceTypes';

function createStore<T extends { id: string }>(storeName: string) {
    return defineStore(storeName, {
        state: () => ({
            items: [] as T[],
            loading: false
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
                            ...(item.hasOwnProperty('tags') && {
                                // Ensure tags are arrays of plain strings
                                tags: (item as any).tags.map((tagId: string | TagEntity) => (typeof tagId === 'object' && tagId !== null ? tagId.id : tagId))
                            })
                        }));
                    } else {
                        this.items = [];
                    }
                } catch (error) {
                    // console.error(`Failed to load ${storeName}:`, error);
                    this.items = [];
                } finally {
                    // console.log(this.items);
                    this.loading = false;
                }
            },

            addItem(item: T) {
                console.log('Adding item:', item);
                this.items.push(item);
                this.saveToStorage();
            },

            updateItem(updatedItem: T) {
                console.log('Updating item:', updatedItem);

                const index = this.items.findIndex((item) => item.id === updatedItem.id);
                if (index !== -1) {
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
                        tags: item.tags.map((tagId: string) => tagId) // Ensure tags are plain strings
                    })
                }));
                console.log('Saving items to storage:', itemsToStore);
                localStorage.setItem(storeName, JSON.stringify(itemsToStore));
            },

            createId(): string {
                return uuidv4();
            }
        }
    });
}

export const usePersonsStore = defineStore('persons', {
    state: () => ({
        users: [] as Person[],
        loading: false
    }),
    actions: {
        async loadItems() {
            this.loading = true;
            try {
                const savedUsers = localStorage.getItem('users');
                if (savedUsers) {
                    this.users = JSON.parse(savedUsers) as Person[];
                } else {
                    this.users = [];
                }
            } catch (error) {
                console.error('Failed to load users:', error);
                this.users = [];
            } finally {
                this.loading = false;
            }
        },
        saveUser(user: Person) {
            const index = this.users.findIndex((u) => u.id === user.id);
            if (index !== -1) {
                this.users[index] = user;
            } else {
                this.users.push(user);
            }
            localStorage.setItem('users', JSON.stringify(this.users));
        },
        createUser(): Person {
            const newUser: Person = {
                id: uuidv4(),
                name: '',
                email: '',
                phone: '',
                city: '',
                state: '',
                github: '',
                linkedin: '',
                portfolio: '',
                tags: [],
                createDate: new Date(),
                included: false
            };
            this.saveUser(newUser);
            return newUser;
        }
    }
});

// Existing stores
export const useJobsStore = createStore<Job>('jobs');
export const useJobDescriptionsStore = createStore<JobDescription>('jobDescriptions');
// export const usePersonsStore = createStore<Person>('persons');
export const useSummaryStore = createStore<ProfessionalSummary>('professionalSummaries');
export const useSkillTypesStore = createStore<SkillType>('skillTypes');
export const useSkillsStore = createStore<SkillName>('skillNames');
export const useVolunteerStore = createStore<Volunteer>('volunteers');
export const useProjectsStore = createStore<Project>('projects');
export const useCertificationsStore = createStore<Certification>('certifications');
export const useTagsStore = createStore<TagEntity>('tags');
export const useEducationStore = createStore<Education>('education');
