<script setup lang="ts">
import { computed, ref } from 'vue';
import { processResumeFiles } from '../service/resumeParser';

const props = defineProps<{
    visible: boolean;
}>();

const emit = defineEmits(['update:visible', 'upload-complete']);

const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
});

const uploading = ref(false);
const uploadedFiles = ref<File[]>([]);

const onUpload = async (event: any) => {
    uploading.value = true;
    try {
        const files = event.files;
        await processResumeFiles(files);
        emit('upload-complete');
    } catch (error) {
        console.error('Upload failed:', error);
    } finally {
        uploading.value = false;
        emit('update:visible', false);
    }
};
</script>

<template>
    <Dialog :visible="dialogVisible" @update:visible="(value) => emit('update:visible', value)" modal header="Upload Resumes" :style="{ width: '50vw' }">
        <div class="card">
            <FileUpload mode="advanced" multiple accept="application/pdf" :maxFileSize="1000000" @upload="onUpload" :auto="true">
                <template #header="{ chooseCallback }">
                    <div class="flex flex-wrap justify-content-between align-items-center gap-2">
                        <div class="flex align-items-center gap-2">
                            <Button @click="chooseCallback" icon="pi pi-images" rounded />
                        </div>
                    </div>
                </template>
            </FileUpload>
        </div>
    </Dialog>
</template>
