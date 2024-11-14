<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useCertificationsStore, useEducationStore, useJobsStore, usePersonsStore, useProjectsStore, useSkillsStore, useVolunteerStore } from '../../stores/resumeDataStore';
import { Certification, Education, Job, Person, Project, SkillName, Volunteer } from '../../types/interfaceTypes';

// Stores
const personsStore = usePersonsStore();
const jobsStore = useJobsStore();
const skillsStore = useSkillsStore();
const volunteerStore = useVolunteerStore();
const projectsStore = useProjectsStore();
const certificationsStore = useCertificationsStore();
const educationStore = useEducationStore();

// State variables
const person = ref<Person | null>(null);
const jobs = ref<Job[]>([]);
const skills = ref<SkillName[]>([]);
const volunteers = ref<Volunteer[]>([]);
const projects = ref<Project[]>([]);
const certifications = ref<Certification[]>([]);
const education = ref<Education[]>([]);

// Load data on mounted
onMounted(async () => {
    await Promise.all([personsStore.loadItems(), jobsStore.loadItems(), skillsStore.loadItems(), volunteerStore.loadItems(), projectsStore.loadItems(), certificationsStore.loadItems(), educationStore.loadItems()]);

    person.value = personsStore.users.length > 0 ? personsStore.users[0] : null;
    jobs.value = jobsStore.items.filter((job) => job.included);
    skills.value = skillsStore.items.filter((skill) => skill.included);
    volunteers.value = volunteerStore.items.filter((volunteer) => volunteer.included);
    projects.value = projectsStore.items.filter((project) => project.included);
    certifications.value = certificationsStore.items.filter((cert) => cert.included);
    education.value = educationStore.items.filter((edu) => edu.included);
});

// Group skills by skill type
const groupedSkills = computed(() => {
    return skills.value.reduce((acc: Record<string, SkillName[]>, skill: SkillName) => {
        const skillType = skill.associatedSkillTypeNames[0] || 'Other';
        if (!acc[skillType]) {
            acc[skillType] = [];
        }
        acc[skillType].push(skill);
        return acc;
    }, {});
});
</script>

<template>
    <div class="card">
        <h2>Resume</h2>

        <!-- Person Details -->
        <div v-if="person">
            <h3>Person Details</h3>
            <p><strong>Name:</strong> {{ person.name }}</p>
            <p><strong>Email:</strong> {{ person.email }}</p>
            <p><strong>Phone:</strong> {{ person.phone }}</p>
            <p><strong>City:</strong> {{ person.city }}</p>
            <p><strong>State:</strong> {{ person.state }}</p>
            <p><strong>Github:</strong> {{ person.github }}</p>
            <p><strong>LinkedIn:</strong> {{ person.linkedin }}</p>
            <p><strong>Portfolio:</strong> {{ person.portfolio }}</p>
        </div>

        <!-- Job History -->
        <div v-if="jobs.length">
            <h3>Job History</h3>
            <div v-for="job in jobs" :key="job.id">
                <h4>{{ job.jobTitle }} at {{ job.companyName }}</h4>
                <p>{{ job.location }}</p>
                <div v-if="job.descriptions && job.descriptions.length">
                    <h5>Job Descriptions</h5>
                    <ul>
                        <li v-for="desc in job.descriptions" :key="desc.id">{{ desc.description }}</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Skills -->
        <div v-if="Object.keys(groupedSkills).length">
            <h3>Skills</h3>
            <div v-for="(skills, skillType) in groupedSkills" :key="skillType">
                <h4>{{ skillType }}</h4>
                <ul>
                    <li v-for="skill in skills" :key="skill.id">{{ skill.skillName }}</li>
                </ul>
            </div>
        </div>

        <!-- Volunteer Work -->
        <div v-if="volunteers.length">
            <h3>Volunteer Work</h3>
            <div v-for="volunteer in volunteers" :key="volunteer.id">
                <h4>{{ volunteer.orgName }}</h4>
                <p>{{ volunteer.details }}</p>
            </div>
        </div>

        <!-- Projects -->
        <div v-if="projects.length">
            <h3>Projects</h3>
            <div v-for="project in projects" :key="project.id">
                <h4>{{ project.projectName }}</h4>
                <p>{{ project.projectDetails }}</p>
            </div>
        </div>

        <!-- Certifications -->
        <div v-if="certifications.length">
            <h3>Certifications</h3>
            <div v-for="cert in certifications" :key="cert.id">
                <h4>{{ cert.certName }}</h4>
                <p>{{ cert.details }}</p>
            </div>
        </div>

        <!-- Education -->
        <div v-if="education.length">
            <h3>Education</h3>
            <div v-for="edu in education" :key="edu.id">
                <h4>{{ edu.degreeName }} at {{ edu.schoolName }}</h4>
                <p>{{ edu.location }}</p>
            </div>
        </div>
    </div>
</template>
