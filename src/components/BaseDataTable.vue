<!-- src/components/BaseDataTable.vue -->
<template>
    <DataTable
        :value="value"
        :paginator="paginator"
        :rows="rows"
        :rowsPerPageOptions="rowsPerPageOptions"
        :filters="filters"
        dataKey="id"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
        tableStyle="min-width: 60rem"
        resizableColumns
        columnResizeMode="fit"
    >
        <template #header>
            <div class="flex flex-wrap gap-2 items-center justify-between">
                <h4 class="m-0">{{ title }}</h4>
                <span class="p-input-icon-left">
                    <i class="pi pi-search" />
                    <InputText v-model="filters.global.value" placeholder="Search..." />
                </span>
            </div>
        </template>
        <slot></slot>
    </DataTable>
</template>

<script setup lang="ts">
import { DataTable } from 'primevue/datatable';
import InputText from 'primevue/inputtext';

defineProps({
    value: Array,
    title: {
        type: String,
        required: true
    },
    filters: Object,
    paginator: {
        type: Boolean,
        default: true
    },
    rows: {
        type: Number,
        default: 10
    },
    rowsPerPageOptions: {
        type: Array,
        default: () => [5, 10, 25]
    }
});
</script>
