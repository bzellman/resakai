//Todo - allow for CRUD functions by object ID
import { onMounted, ref } from 'vue';

import { useTagsStore } from '../../stores/resumeDataStore';
import { TagEntity } from '../../types/interfaceTypes';

export function useEntity(entityStore: any) {
    const entityDialog = ref(false);
    const entity = ref<any>({});
    const submitted = ref(false);
    const includedEntities = ref<string[]>([]);
    const filters = ref({ global: { value: '' } });

    const tagsStore = useTagsStore();

    const relatedTags = ref<string[]>([]);
    const allTags = ref<string[]>([]);

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
        // Debug log
        if (event.key === 'Enter') {
            const input = (event.target as HTMLInputElement).value.trim();
            if (input && !relatedTags.value.includes(input)) {
                relatedTags.value.push(input);
                (event.target as HTMLInputElement).value = '';
            }
            console.log('relatedTags', relatedTags.value);
        }
    }

    function saveEntity() {
        submitted.value = true;
        console.log('saved', entity); // Debug log

        if (entity.value && Object.keys(entity.value).length > 0) {
            // Map tag names to tag IDs
            entity.value.tags = relatedTags.value.map((tagName: string) => {
                let tag = tagsStore.items.find((t) => t.tagName === tagName);
                if (!tag) {
                    tag = { id: tagsStore.createId(), tagName };
                    tagsStore.addItem(tag);
                }
                return tag.id; // Ensure you return tag.id, a string
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
            console.log('saved', entity); // Debug log

            entityDialog.value = false;
            entity.value = {};
            relatedTags.value = [];
            submitted.value = false;
        } else {
            // Handle validation errors
        }
    }

    function editEntity(itemToEdit: any) {
        entity.value = { ...itemToEdit };
        // Map tag IDs to tag names for display
        relatedTags.value = itemToEdit.tags.map((tagId: string) => {
            const tag = tagsStore.items.find((t) => t.id === tagId);
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

    function getTagNameById(tagId: any): string {
        // console.log('getTagNameById', tagId, typeof tagId);
        let actualTagId = '';

        if (typeof tagId === 'string') {
            actualTagId = tagId;
        } else if (typeof tagId === 'object' && tagId !== null) {
            // Check if tagId is a TagEntity object
            if ('id' in tagId) {
                actualTagId = tagId.id;
            } else {
                // Handle unexpected object structure
                console.warn('Unexpected tagId object structure:', tagId);
                return '';
            }
        } else {
            console.warn('Invalid tagId type:', typeof tagId, tagId);
            return '';
        }

        const tag = tagsStore.items.find((t: TagEntity) => t.id === actualTagId);
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
