// src/composables/useEntity.ts
import { ref, onMounted, computed } from 'vue';
import { useTagsStore } from '@/stores/resumeDataStore';
import { TagEntity } from '@/types/interfaceTypes';

export function useEntity(entityStore: any) {
    const entityDialog = ref(false);
    const entity = ref<any>({});
    const submitted = ref(false);
    const includedEntities = ref<string[]>([]);
    const filters = ref({ global: { value: '' } });

    const tagsStore = useTagsStore();

    const relatedTags = ref<string[]>([]); // Define relatedTags as a reactive array
    const allTags = ref<string[]>([]);
    const associatedTags = computed(() => relatedTags.value); // Tags associated with the entity being edited

    onMounted(async () => {
        await entityStore.loadItems();
        await tagsStore.loadItems();
        includedEntities.value = entityStore.items.filter((item: any) => item.included).map((item: any) => item.id);
    });

    function searchTags(event: { query: string }) {
        const query = event.query.toLowerCase();
        allTags.value = tagsStore.items.filter((tag: TagEntity) => tag.tagName.toLowerCase().includes(query)).map((tag: TagEntity) => tag.tagName); // Return an array of tag names
    }

    function handleTagInput(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            const input = (event.target as HTMLInputElement).value.trim();
            if (input && !relatedTags.value.includes(input)) {
                relatedTags.value.push(input);
                (event.target as HTMLInputElement).value = '';
            }
        }
    }

    function saveEntity() {
        submitted.value = true;
        if (entity.value && Object.keys(entity.value).length > 0) {
            // Handle tags: save tagName to tag IDs
            entity.value.tags = relatedTags.value.map((tagName: string) => {
                let tag = tagsStore.items.find((t: TagEntity) => t.tagName === tagName);
                if (!tag) {
                    tag = { id: tagsStore.createId(), tagName };
                    tagsStore.addItem(tag);
                }
                return tag.id; // Store the tag ID instead of the entire tag object
            });

            if (entity.value.id) {
                // Update existing entity
                entityStore.updateItem(entity.value);
            } else {
                // Add new entity
                entity.value.id = entityStore.createId();
                entity.value.createDate = new Date();
                entityStore.addItem(entity.value);
            }
            entityDialog.value = false;
            entity.value = {};
            submitted.value = false;
        } else {
            // Handle validation errors
        }
    }

    function editEntity(itemToEdit: any) {
        entity.value = { ...itemToEdit };
        // Map tag IDs to tag names for display
        relatedTags.value = itemToEdit.tags.map((tagId: string) => {
            const tag = tagsStore.items.find((t: TagEntity) => t.id === tagId);
            return tag ? tag.tagName : '';
        });
        entityDialog.value = true;
    }

    function deleteEntity(itemId: string) {
        entityStore.deleteItem(itemId);
    }

    function toggleIncludeEntity(itemId: string) {
        const item = entityStore.items.find((item: any) => item.id === itemId);
        if (item) {
            item.included = !item.included;
            entityStore.updateItem(item);
            if (item.included) {
                includedEntities.value.push(itemId);
            } else {
                const index = includedEntities.value.indexOf(itemId);
                if (index !== -1) {
                    includedEntities.value.splice(index, 1);
                }
            }
        }
    }

    function getTagNameById(tagId: string): string {
        const tag = tagsStore.items.find((t: TagEntity) => t.id === tagId);
        return tag ? tag.tagName : '';
    }

    return {
        entityDialog,
        entity,
        submitted,
        includedEntities,
        filters,
        allTags,
        relatedTags,
        getTagNameById,
        searchTags,
        handleTagInput,
        saveEntity,
        editEntity,
        deleteEntity,
        toggleIncludeEntity
    };
}
