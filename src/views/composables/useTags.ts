import { ref, onMounted } from 'vue';
import { useTagsStore } from '@/stores/resumeDataStore';

export function useTags() {
    const tagsStore = useTagsStore();
    const filteredTags = ref<string[]>([]);
    const selectedTags = ref<string[]>([]);

    function searchTags(event: { query: string }) {
        const query = event.query.toLowerCase();
        filteredTags.value = tagsStore.items.map((tag) => tag.tagName).filter((tagName) => tagName && tagName.toLowerCase().includes(query));
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

    onMounted(() => {
        tagsStore.loadItems();
    });

    return {
        filteredTags,
        selectedTags,
        searchTags,
        handleTagInput
    };
}
