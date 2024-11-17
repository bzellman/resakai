<script setup lang="ts">
import { computed, ref } from 'vue';
import { MAX_PDF_SIZE_MB } from '../config/config';
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
const error = ref<string>('');

const onSelect = (event: any) => {
    error.value = '';
    const files = event.files;
    const invalidFiles = files.filter((f: File) => f.size > MAX_PDF_SIZE_MB * 1024 * 1024);

    if (invalidFiles.length > 0) {
        error.value = `Some files exceed the ${MAX_PDF_SIZE_MB}MB limit`;
        return;
    }

    uploadedFiles.value = files;
};

const onUpload = async () => {
    if (!uploadedFiles.value.length) return;

    uploading.value = true;
    error.value = '';

    try {
        await processResumeFiles(uploadedFiles.value);
        emit('upload-complete');
        emit('update:visible', false);
    } catch (err) {
        error.value = 'Failed to process resume(s). Please try again.';
        console.error('Upload failed:', err);
    } finally {
        uploading.value = false;
    }
};
</script>

<template>
    <Dialog :visible="dialogVisible" @update:visible="(value) => emit('update:visible', value)" modal header="Upload Resumes" :style="{ width: '50vw' }">
        <div class="card">
            <FileUpload mode="advanced" multiple accept="application/pdf" :maxFileSize="1000000" @select="onSelect" :auto="false">
                <template #header="{ chooseCallback }">
                    <div class="flex flex-wrap justify-content-between align-items-center gap-2">
                        <div class="flex align-items-center gap-2">
                            <Button @click="chooseCallback" icon="pi pi-images" rounded />
                        </div>
                    </div>
                </template>
            </FileUpload>

            <small class="text-red-500" v-if="error">{{ error }}</small>

            <Button label="Upload" @click="onUpload" :disabled="uploading || uploadedFiles.length === 0" :loading="uploading" />
        </div>
    </Dialog>
</template>
