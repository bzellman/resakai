<script setup lang="ts">
import SkillDetails from './SkillDetails.vue';
import ProjectDetails from './ProjectDetails.vue';
import PersonDetails from './PersonData.vue';
import EducationDetails from './EducationDetails.vue';
import VolunteerDetails from './VolunteerDetails.vue';
import ProfessionalSummaries from './ProfessionalSummaries.vue';
import CertificationDetails from './CertificationsDetails.vue';

// Import PrimeVue components
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
</script>
<!-- src/views/pages/ResumeDetails.vue -->

<template>
    <div class="card">
        <TabView>
            <TabPanel header="My Info">
                <PersonDetails />
            </TabPanel>
            <TabPanel header="Summaries">
                <ProfessionalSummaries />
            </TabPanel>
            <TabPanel header="Skills">
                <SkillDetails />
            </TabPanel>
            <TabPanel header="Education">
                <EducationDetails />
            </TabPanel>
            <TabPanel header="Certifications">
                <CertificationDetails />
            </TabPanel>
            <TabPanel header="Project Details">
                <ProjectDetails />
            </TabPanel>
            <TabPanel header="Volunteer Work">
                <VolunteerDetails />
            </TabPanel>
            <!-- Add more tabs as needed -->
        </TabView>
    </div>
</template>

// Import the individual components
