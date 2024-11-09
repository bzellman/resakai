// src/composables/useEntity.ts
import { ref, onMounted } from 'vue';
import { useTagsStore } from '@/stores/resumeDataStore';
import { TagEntity } from '@/types/interfaceTypes';

export function useEntity(entityStore: any) {
    const entityDialog = ref(false);
    const entity = ref<any>({});
    const submitted = ref(false);
    const includedEntities = ref<string[]>([]);
    const filters = ref({ global: { value: '' } });

    const tagsStore = useTagsStore();
    const filteredTags = ref<string[]>([]);
    const selectedTags = ref<string[]>([]);

    onMounted(() => {
        entityStore.loadItems();
        tagsStore.loadItems();
        includedEntities.value = entityStore.items.filter((item: any) => item.included).map((item: any) => item.id);
    });

    function searchTags(event: { query: string }) {
        const query = event.query ? event.query.toLowerCase() : '';
        filteredTags.value = tagsStore.items.map((tag) => tag.tagName || '').filter((tagName) => tagName.toLowerCase().includes(query));
    }

    function handleTagInput(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            const input = (event.target as HTMLInputElement).value.trim();
            if (input && !selectedTags.value.includes(input)) {
                selectedTags.value.push(input);
                (event.target as HTMLInputElement).value = '';
            }
        }
    }

    function saveEntity() {
        submitted.value = true;
        if (entity.value && Object.keys(entity.value).length > 0) {
            // Handle tags
            entity.value.tags = selectedTags.value.map((tagName: string) => {
                let tag = tagsStore.items.find((t: TagEntity) => t.tagName === tagName);
                if (!tag) {
                    tag = { id: tagsStore.createId(), tagName };
                    tagsStore.addItem(tag);
                }
                return tag;
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
            // For example, display a notification or highlight invalid fields
        }
    }

    function editEntity(itemToEdit: any) {
        entity.value = { ...itemToEdit };
        selectedTags.value = itemToEdit.tags.map((tag: TagEntity) => tag.tagName);
        entityDialog.value = true;
    }

    function deleteEntity(itemId: string) {
        entityStore.deleteItem(itemId);
        // Show toast notification if needed
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

    return {
        entityDialog,
        entity,
        submitted,
        includedEntities,
        filters,
        filteredTags,
        selectedTags,
        searchTags,
        handleTagInput,
        saveEntity,
        editEntity,
        deleteEntity,
        toggleIncludeEntity
    };
}
