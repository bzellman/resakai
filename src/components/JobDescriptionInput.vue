<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { JobDescription } from '../types/interfaceTypes';

const props = defineProps<{
    jobId: string;
    allTags: string[];
    onSave: (jobDescription: JobDescription) => void;
    onSearchTags: (event: any) => void;
    onTagInput: (event: any) => void;
}>();

const containerRef = ref<HTMLDivElement | null>(null);
const description = ref('');
const relatedTags = ref<string[]>([]);
const isActive = ref(false);

// Handle focus for the entire container
const handleContainerFocus = (event: FocusEvent) => {
    if (containerRef.value?.contains(event.target as Node)) {
        isActive.value = true;
    }
};

// Handle blur for the entire container
const handleContainerBlur = (event: FocusEvent) => {
    // Check if the new focus target is outside our container
    if (!containerRef.value?.contains(event.relatedTarget as Node)) {
        if (!description.value && relatedTags.value.length === 0) {
            isActive.value = false;
        }
    }
};

onMounted(() => {
    document.addEventListener('focusin', handleContainerFocus);
    document.addEventListener('focusout', handleContainerBlur);
});

onUnmounted(() => {
    document.removeEventListener('focusin', handleContainerFocus);
    document.removeEventListener('focusout', handleContainerBlur);
});

const handleSave = () => {
    if (description.value.trim()) {
        console.log('Saving with:', {
            jobId: props.jobId,
            description: description.value,
            tags: relatedTags.value
        });

        const newJobDescription: JobDescription = {
            description: description.value,
            tags: relatedTags.value,
            jobId: props.jobId,
            checked: false,
            createDate: new Date(),
            included: false,
            id: ''
        };

        props.onSave(newJobDescription);

        // Only reset after successful save
        description.value = '';
        relatedTags.value = [];
        isActive.value = false;
    }
};

const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSave();
    }
};

const handleClick = () => {
    isActive.value = true;
};
</script>

<template>
    <div ref="containerRef" class="flex items-center gap-2 w-full" @click="handleClick" tabindex="0">
        <div class="flex-grow" style="flex-basis: 75%">
            <div v-if="!isActive" class="cursor-text p-2 border border-gray-200 rounded">Add new description...</div>
            <InputText v-else v-model="description" placeholder="Add description" class="w-full" @keydown="handleKeyDown" autofocus />
        </div>
        <AutoComplete v-if="isActive" v-model="relatedTags" :suggestions="allTags" placeholder="Add tags" @complete="onSearchTags" multiple :force-selection="false" @keydown="onTagInput" class="w-full" />
        <div class="flex gap-2" v-if="isActive">
            <Button label="Add" icon="pi pi-plus" @click="handleSave" :disabled="!description.trim()" />
        </div>
    </div>
</template>
