import { CLAUDE_API_KEY, CLAUDE_API_URL } from '../config/config';
import { useJobDescriptionsStore, useJobsStore, usePersonsStore, useSkillsStore } from '../stores/resumeDataStore';
import { Job, Person, SkillName } from '../types/interfaceTypes';

interface ParsedResumeData {
    person: Partial<Person>;
    jobs: Array<{
        job: Partial<Job>;
        descriptions: string[];
    }>;
    skills: Partial<SkillName>[];
}

export async function processResumeFiles(files: File[]): Promise<void> {
    for (const file of files) {
        try {
            const pdfData = await readPdfFile(file);
            const parsedData = await sendToClaudAPI(pdfData);
            await updateStores(parsedData);
        } catch (error) {
            console.error(`Failed to process file ${file.name}:`, error);
        }
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
    const base64Pdf = Buffer.from(pdfData).toString('base64');

    const prompt = `Please analyze this resume and extract the following information in JSON format:
    - Personal information (name, email, phone, location, social links)
    - Work experience (company names, job titles, dates, locations)
    - Job descriptions for each role
    - Skills
    
    Format the response as a JSON object matching this structure:
    {
        "person": { /* personal details */ },
        "jobs": [{ 
            "job": { /* job details */ },
            "descriptions": [ /* array of bullet points */ ]
        }],
        "skills": [{ "skillName": "", "associatedSkillTypeNames": [] }]
    }`;

    const response = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': CLAUDE_API_KEY,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 4096,
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: prompt
                        },
                        {
                            type: 'image',
                            source: {
                                type: 'base64',
                                media_type: 'application/pdf',
                                data: base64Pdf
                            }
                        }
                    ]
                }
            ]
        })
    });

    if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`);
    }

    const result = await response.json();
    const parsedContent = JSON.parse(result.content[0].text);
    return parsedContent as ParsedResumeData;
}

async function updateStores(data: ParsedResumeData): Promise<void> {
    const personsStore = usePersonsStore();
    const jobsStore = useJobsStore();
    const jobDescriptionsStore = useJobDescriptionsStore();
    const skillsStore = useSkillsStore();

    // Add base properties
    const baseProps = {
        createDate: new Date(),
        tags: [],
        included: true
    };

    // Update person
    const person = { ...baseProps, ...data.person };
    if (!personsStore.users.find((p) => p.email === person.email)) {
        await personsStore.saveUser(person);
    }

    // Process jobs and descriptions
    for (const jobData of data.jobs) {
        const job = { ...baseProps, ...jobData.job };
        const existingJob = findMatchingJob(job, jobsStore.items);

        if (!existingJob) {
            const newJob = await jobsStore.addItem(job);
            // Add job descriptions
            for (const desc of jobData.descriptions) {
                await jobDescriptionsStore.addItem({
                    ...baseProps,
                    description: desc,
                    jobId: newJob.id
                });
            }
        }
    }

    // Process skills
    for (const skill of data.skills) {
        const existingSkill = skillsStore.items.find((s) => s.skillName === skill.skillName);
        if (!existingSkill) {
            await skillsStore.addItem({ ...baseProps, ...skill });
        }
    }
}

function findMatchingJob(newJob: any, existingJobs: any[]): any {
    return existingJobs.find((job) => job.companyName === newJob.companyName && job.startDate?.getTime() === new Date(newJob.startDate).getTime() && job.endDate?.getTime() === new Date(newJob.endDate).getTime());
}
