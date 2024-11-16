<script setup lang="ts">
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { computed, onMounted, ref } from 'vue';
import { useCertificationsStore, useEducationStore, useJobDescriptionsStore, useJobsStore, usePersonsStore, useProjectsStore, useSkillsStore, useSummaryStore, useVolunteerStore } from '../../stores/resumeDataStore';
import { Certification, Education, Job, JobDescription, Person, ProfessionalSummary, Project, SkillName, Volunteer } from '../../types/interfaceTypes';

// Stores
const personsStore = usePersonsStore();
const jobsStore = useJobsStore();
const skillsStore = useSkillsStore();
const volunteerStore = useVolunteerStore();
const projectsStore = useProjectsStore();
const certificationsStore = useCertificationsStore();
const educationStore = useEducationStore();
const professionalSummaryStore = useSummaryStore();
const jobDescriptionsStore = useJobDescriptionsStore();

// State variables
const person = ref<Person | null>(null);
const jobs = ref<Job[]>([]);
const skills = ref<SkillName[]>([]);
const volunteers = ref<Volunteer[]>([]);
const projects = ref<Project[]>([]);
const certifications = ref<Certification[]>([]);
const education = ref<Education[]>([]);
const professionalSummary = ref<ProfessionalSummary | null>(null);
const jobDescriptions = ref<JobDescription[]>([]);

const _pdf = jsPDF;
const _canvas = html2canvas;

// Load data on mounted
onMounted(async () => {
    await Promise.all([
        personsStore.loadItems(),
        jobsStore.loadItems(),
        skillsStore.loadItems(),
        volunteerStore.loadItems(),
        projectsStore.loadItems(),
        certificationsStore.loadItems(),
        educationStore.loadItems(),
        professionalSummaryStore.loadItems(),
        jobDescriptionsStore.loadItems()
    ]);

    person.value = personsStore.users.length > 0 ? personsStore.users[0] : null;
    jobs.value = jobsStore.items.filter((job) => job.included);
    jobDescriptions.value = jobDescriptionsStore.items.filter((desc) => desc.included);
    skills.value = skillsStore.items.filter((skill) => skill.included);
    volunteers.value = volunteerStore.items.filter((volunteer) => volunteer.included);
    projects.value = projectsStore.items.filter((project) => project.included);
    certifications.value = certificationsStore.items.filter((cert) => cert.included);
    education.value = educationStore.items.filter((edu) => edu.included);
    professionalSummary.value = professionalSummaryStore.items.length > 0 ? professionalSummaryStore.items[0] : null;
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

// Format date helper
const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);
};

// Compute full location
const getFullLocation = computed(() => {
    if (!person.value) return '';
    return `${person.value.city}, ${person.value.state}`.trim();
});

// Compute descriptions for each job
const getJobDescriptions = (jobId: string) => {
    return jobDescriptions.value.filter((desc) => desc.jobId === jobId);
};

const exportToPDF = async (): Promise<void> => {
    try {
        const element = document.querySelector('.resume-container');
        if (!element) {
            throw new Error('Resume container element not found');
        }

        // Generate high-quality canvas
        const canvas = await html2canvas(element as HTMLElement, {
            scale: 2,
            useCORS: true,
            logging: true,
            backgroundColor: '#ffffff'
        });

        // PDF Configuration
        const pdf = new jsPDF({
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait'
        });

        // A4 dimensions and margins (in mm)
        const margin = 10;
        const pageWidth = 210; // A4 width
        const pageHeight = 297; // A4 height
        const contentWidth = pageWidth - 2 * margin;

        // Calculate dimensions preserving aspect ratio
        const aspectRatio = canvas.width / canvas.height;
        const imgWidth = contentWidth;
        const imgHeight = imgWidth / aspectRatio;

        // Calculate how many pixels of the canvas can fit on one page
        const pageContentHeight = pageHeight - 2 * margin;
        const pixelsPerPage = (pageContentHeight * canvas.height) / imgHeight;
        const totalPages = Math.ceil(canvas.height / pixelsPerPage);

        for (let i = 0; i < totalPages; i++) {
            if (i > 0) {
                pdf.addPage();
            }

            // Calculate the source region from the canvas
            const sourceHeight = Math.min(pixelsPerPage, canvas.height - i * pixelsPerPage);
            const sourceY = i * pixelsPerPage;

            // Calculate the height to render on this page (preserving aspect ratio)
            const renderHeight = (sourceHeight * imgWidth) / canvas.width;

            // Extract the portion of the canvas for this page
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = sourceHeight;
            const ctx = tempCanvas.getContext('2d');

            if (ctx) {
                ctx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, tempCanvas.width, tempCanvas.height);

                // Add to PDF with preserved aspect ratio
                const imgData = tempCanvas.toDataURL('image/jpeg', 1.0);
                pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, renderHeight);
            }
        }

        pdf.save('resume.pdf');
    } catch (error) {
        console.error('PDF generation failed:', error);
        throw error;
    }
};
</script>

<template>
    <div>
        <!-- Add Export Button -->
        <div class="export-container"></div>
        <button @click="exportToPDF">Generate PDF</button>

        <div class="resume-container">
            <!-- Person Details -->
            <header v-if="person" class="header-section">
                <h1 class="name-heading">{{ person.name }}</h1>
                <div class="contact-row">
                    <div v-if="getFullLocation" class="contact-item">
                        <!-- <span class="contact-label">Location:</span> -->
                        <span>{{ getFullLocation }}</span>
                    </div>
                    <div v-if="person.email" class="contact-item">
                        <!-- <span class="contact-label">Email:</span> -->
                        <a :href="`mailto:${person.email}`" class="contact-link">{{ person.email }}</a>
                    </div>
                    <div v-if="person.phone" class="contact-item">
                        <!-- <span class="contact-label">Phone:</span> -->
                        <span>{{ person.phone }}</span>
                    </div>
                    <div v-if="person.linkedin" class="contact-item">
                        <!-- <span class="contact-label">LinkedIn:</span> -->
                        <a :href="person.linkedin" target="_blank" rel="noopener noreferrer" class="contact-link">{{ person.linkedin }}</a>
                    </div>
                    <div v-if="person.github" class="contact-item">
                        <!-- <span class="contact-label">GitHub:</span> -->
                        <a :href="person.github" target="_blank" rel="noopener noreferrer" class="contact-link">{{ person.github }}</a>
                    </div>
                    <div v-if="person.portfolio" class="contact-item">
                        <!-- <span class="contact-label">Portfolio:</span> -->
                        <a :href="person.portfolio" target="_blank" rel="noopener noreferrer" class="contact-link">{{ person.portfolio }}</a>
                    </div>
                </div>
            </header>

            <!-- Professional Summary -->
            <section v-if="professionalSummary" class="section">
                <h2 class="section-heading">Professional Summary</h2>
                <p class="summary-text">{{ professionalSummary.summary }}</p>
            </section>

            <!-- Professional Experience -->
            <section v-if="jobs.length" class="section">
                <h2 class="section-heading">Professional Experience</h2>
                <div v-for="job in jobs" :key="job.id" class="job-item">
                    <div class="job-header">
                        <div class="job-title-company">
                            <h3 class="job-title">{{ job.jobTitle }}</h3>
                            <div class="company-name">{{ job.companyName }}</div>
                            <div class="job-location">{{ job.location }}</div>
                        </div>
                    </div>
                    <ul v-if="getJobDescriptions(job.id).length" class="job-descriptions">
                        <li v-for="desc in getJobDescriptions(job.id)" :key="desc.id" class="job-description">
                            {{ desc.description }}
                        </li>
                    </ul>
                </div>
            </section>

            <!-- Skills -->
            <section v-if="Object.keys(groupedSkills).length" class="section">
                <h2 class="section-heading">Technical Skills</h2>
                <div v-for="(skills, skillType) in groupedSkills" :key="skillType" class="skill-group">
                    <h3 class="skill-type">{{ skillType }}:</h3>
                    <div class="skill-list">
                        {{ skills.map((skill) => skill.skillName).join(' • ') }}
                    </div>
                </div>
            </section>

            <!-- Projects -->
            <section v-if="projects.length" class="section">
                <h2 class="section-heading">Projects</h2>
                <div v-for="project in projects" :key="project.id" class="project-item">
                    <h3 class="project-name">{{ project.projectName }}</h3>
                    <p class="project-details">{{ project.projectDetails }}</p>
                </div>
            </section>

            <!-- Education -->
            <section v-if="education.length" class="section">
                <h2 class="section-heading">Education</h2>
                <div v-for="edu in education" :key="edu.id" class="education-item">
                    <div class="education-header">
                        <div>
                            <h3 class="degree-name">{{ edu.degreeName }}</h3>
                            <div class="school-name">{{ edu.schoolName }}</div>
                            <div class="education-location">{{ edu.location }}</div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Certifications -->
            <section v-if="certifications.length" class="section">
                <h2 class="section-heading">Certifications</h2>
                <div v-for="cert in certifications" :key="cert.id" class="certification-item">
                    <h3 class="cert-name">{{ cert.certName }}</h3>
                    <p class="cert-details">{{ cert.details }}</p>
                </div>
            </section>

            <!-- Volunteer Work -->
            <section v-if="volunteers.length" class="section">
                <h2 class="section-heading">Volunteer Experience</h2>
                <div v-for="volunteer in volunteers" :key="volunteer.id" class="volunteer-item">
                    <h3 class="org-name">{{ volunteer.orgName }}</h3>
                    <p class="volunteer-details">{{ volunteer.details }}</p>
                </div>
            </section>
        </div>
    </div>
</template>

<style scoped>
/* Base styles */
.resume-container {
    max-width: 8.5in;
    margin: 0 auto;
    padding: 1.5rem;
    font-family: Arial, sans-serif;
    line-height: 1.5;
    color: #333;
    word-break: keep-all;
    overflow-wrap: break-word;
}

/* Header styles */
.header-section {
    margin-bottom: 2rem;
    border-bottom: 2px solid #2c3e50;
    padding-bottom: 1rem;
}

.name-heading {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 1rem;
    color: #2c3e50;
}

.contact-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.5rem;
}

.contact-item {
    font-size: 0.9rem;
}

.contact-label {
    font-weight: 600;
    margin-right: 0.5rem;
}

.contact-link {
    color: #2c3e50;
    text-decoration: none;
}

.contact-link:hover {
    text-decoration: underline;
}

/* Section styles */
.section {
    margin-bottom: 2rem;
    break-inside: avoid;
}

.section-heading {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 1rem;
    color: #2c3e50;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 0.5rem;
}

/* Job styles */
.job-item {
    margin-bottom: 1.5rem;
    break-inside: avoid;
}

.job-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;
}

.job-title {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
}

.company-name {
    font-weight: 500;
}

.job-location,
.job-dates {
    color: #666;
    font-size: 0.9rem;
}

.job-descriptions {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
}

.job-description {
    margin-bottom: 0.5rem;
    line-height: 1.4;
}

/* Skills styles */
.skill-group {
    margin-bottom: 1rem;
}

.skill-type {
    font-weight: 600;
    display: inline;
    margin-right: 0.5rem;
}

.skill-list {
    display: inline;
}

/* Professional Summary styles */
.summary-text {
    line-height: 1.6;
    margin-bottom: 1rem;
    text-align: justify;
}

/* Add new styles */
.export-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 1000;
}

@media print {
    .export-container {
        display: none;
    }
    /* // ...existing print styles... */
}

.section {
    margin-bottom: 2rem;
    break-inside: avoid-page;
    page-break-inside: avoid;
}

.job-item,
.project-item,
.education-item,
.certification-item,
.volunteer-item {
    break-inside: avoid-page;
    page-break-inside: avoid;
}

.header-section {
    break-after: avoid-page;
    page-break-after: avoid;
}

/* Update the print media query */
@media print {
    .resume-container {
        padding: 0;
        font-size: 11pt;
        max-width: none;
        width: 100%;
    }

    /* Ensure proper page breaks */
    p,
    h2,
    h3 {
        orphans: 3;
        widows: 3;
    }

    h2,
    h3 {
        break-after: avoid-page;
        page-break-after: avoid;
    }
}

.job-item {
    break-inside: avoid;
    page-break-inside: avoid;
    margin-bottom: 1.5rem;
}

.job-header,
.job-title,
.company-name {
    break-after: avoid;
    page-break-after: avoid;
}

.job-descriptions {
    break-before: avoid;
    page-break-before: avoid;
}

/* Prevent page breaks inside elements */
.contact-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-start; /* Left-align items */
}

.contact-item {
    display: flex;
    align-items: center;
    margin-right: 8px; /* 8px space between items */
    position: relative;
}

.contact-item::after {
    content: ' |'; /* Add a space before the separator */
    margin-left: 8px;
}

.contact-item:last-child::after {
    content: ''; /* Remove the separator from the last item */
    margin: 0;
}

.contact-item i {
    margin-right: 5px; /* Space between icon and text */
}
</style>
