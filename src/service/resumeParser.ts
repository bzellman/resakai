import { useJobDescriptionsStore, useJobsStore, usePersonsStore, useSkillTypesStore, useSkillsStore } from '../stores/resumeDataStore';

interface ParsedResumeData {
    person: any;
    jobs: any[];
    skills: any[];
    // Add other relevant data structures
}

export async function processResumeFiles(files: File[]): Promise<void> {
    for (const file of files) {
        const pdfData = await readPdfFile(file);
        const parsedData = await sendToClaudAPI(pdfData);
        await updateStores(parsedData);
    }
}

async function readPdfFile(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

async function sendToClaudAPI(pdfData: ArrayBuffer): Promise<ParsedResumeData> {
    // TODO: Implement Claude API integration
    // This should send the PDF data to Claude and receive structured JSON data
    throw new Error('Claude API integration not implemented');
}

async function updateStores(data: ParsedResumeData): Promise<void> {
    const personsStore = usePersonsStore();
    const jobsStore = useJobsStore();
    const jobDescriptionsStore = useJobDescriptionsStore();
    const skillTypesStore = useSkillTypesStore();
    const skillsStore = useSkillsStore();

    // Update person if doesn't exist
    if (!personsStore.users.find((p) => p.email === data.person.email)) {
        personsStore.saveUser(data.person);
    }

    // Process jobs and job descriptions
    for (const job of data.jobs) {
        const existingJob = findMatchingJob(job, jobsStore.items);
        if (!existingJob) {
            const newJob = await jobsStore.addItem(job);
            // Add job descriptions
            job.descriptions.forEach((desc: any) => {
                jobDescriptionsStore.addItem({
                    ...desc,
                    jobId: newJob.id
                });
            });
        }
    }

    // Process skills and skill types
    // ... implement skill processing logic
}

function findMatchingJob(newJob: any, existingJobs: any[]): any {
    return existingJobs.find((job) => job.companyName === newJob.companyName && job.startDate?.getTime() === new Date(newJob.startDate).getTime() && job.endDate?.getTime() === new Date(newJob.endDate).getTime());
}
