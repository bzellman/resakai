import Anthropic from '@anthropic-ai/sdk';
import { CLAUDE_API_KEY } from '../config/config';

import { useCertificationsStore, useEducationStore, useJobDescriptionsStore, useJobsStore, usePersonsStore, useProjectsStore, useSkillsStore, useSkillTypesStore, useSummaryStore, useVolunteerStore } from '../stores/resumeDataStore';
import { Certification, Education, Job, Person, ProfessionalSummary, Project, SkillName, Volunteer } from '../types/interfaceTypes';

interface ParsedResumeData {
    person: Partial<Person>;
    jobs: Array<{
        job: Partial<Job>;
        descriptions: string[];
    }>;
    skills: Partial<SkillName>[];
    education: Partial<Education>[];
    certifications: Partial<Certification>[];
    volunteer: Partial<Volunteer>[];
    projects: Partial<Project>[];
    summary: Partial<ProfessionalSummary>;
}

const anthropic = new Anthropic({ apiKey: CLAUDE_API_KEY, dangerouslyAllowBrowser: true });

export async function processResumeFiles(files: File[]): Promise<void> {
    for (const file of files) {
        try {
            // const pdfData = await readPdfFile(file);
            const parsedData = await sendToClaudAPI(file);
            await updateStores(parsedData);
        } catch (error) {
            console.error(`Failed to process file ${file.name}:`, error);
        }
    }
}

async function sendToClaudAPI(pdfFile: File): Promise<ParsedResumeData> {
    const base64Pdf = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // Remove data URL prefix if present
            const result = reader.result as string;
            const base64 = result.replace(/^data:.+;base64,/, '');
            resolve(base64);
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(pdfFile);
    });
    const systemPrompt = `You are a resume parser that extracts structured information from resumes into specific JSON format.
    Always return valid JSON. 
    Format dates as YYYY-MM-DD strings. 
    If there are page breaks, ensure to parse the entire resume gets parsed and the data is mapped correctly.
    Always ensure you look at the complete resume and do not skip anything that can be valid data. 
    Preserve formatting when possible. Do not take liberties in phrasing. 
    Extract text verbatim.
    Ensure that Skills are grouped as they are listed in the resume.
    Ensure all text fields are properly escaped and non-null fields are always included.
    Ensure Valid JSON and Correct any errors before Sending.`;

    const userPrompt = `Analyze this resume and return a JSON object with the following structure:
    {
        "person": {
            "name": "string",
            "email": "string",
            "phone": "string",
            "city": "string",
            "state": "string",
            "github": "string?",
            "linkedin": "string?",
            "portfolio": "string?"
        },
        "jobs": [{
            "job": {
                "jobTitle": "string",
                "companyName": "string",
                "startDate": "YYYY-MM-DD",
                "endDate": "YYYY-MM-DD",
                "location": "string"
            },
            "descriptions": ["string"]
        }],
        "education": [{
            "schoolName": "string",
            "degreeName": "string",
            "startDate": "YYYY-MM-DD",
            "endDate": "YYYY-MM-DD",
            "location": "string"
        }],
        "skills": [{
            "skillName": "string",
            "associatedSkillTypeNames": ["string"]
        }],
        "certifications": [{
            "orgName": "string",
            "certName": "string",
            "details": "string"
        }],
        "volunteer": [{
            "orgName": "string",
            "details": "string"
        }],
        "projects": [{
            "projectName": "string",
            "projectDetails": "string"
        }],
        "summaries": [{
            "summary": "string"
        }]
    }

    Instructions:
    1. Group similar skills under associatedSkillTypeNames (e.g., "Programming Languages", "Frameworks", "Tools")
    2. Convert all dates to YYYY-MM-DD format
    3. Include full job descriptions as bullet points in the descriptions array
    4. Ensure company names don't include legal entities (LLC, Inc, etc)
    5. Extract GitHub/LinkedIn URLs from the document if present`;

    const message = await anthropic.beta.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        betas: ['pdfs-2024-09-25'],
        max_tokens: 5000,
        system: systemPrompt,
        messages: [
            {
                content: [
                    {
                        type: 'document',
                        source: {
                            media_type: 'application/pdf',
                            type: 'base64',
                            data: base64Pdf
                        }
                    },
                    {
                        type: 'text',
                        text: userPrompt
                    }
                ],
                role: 'user'
            }
        ]
    });

    const content = message.content.map((block: any) => block.text).join('');
    if (message.stop_reason === 'end_turn') {
        console.log('Content:', content);
        console.log('Message:', JSON.parse(content));
        return JSON.parse(content) as ParsedResumeData;
    } else {
        console.log('Stop reason:', message.stop_reason);
        return {
            person: {},
            jobs: [],
            skills: [],
            education: [],
            certifications: [],
            volunteer: [],
            projects: [],
            summary: {}
        };
    }
}

async function updateStores(data: ParsedResumeData): Promise<void> {
    const personsStore = usePersonsStore();
    const jobsStore = useJobsStore();
    const jobDescriptionsStore = useJobDescriptionsStore();
    const skillsStore = useSkillsStore();
    const skillTypesStore = useSkillTypesStore();
    const educationStore = useEducationStore();
    const certStore = useCertificationsStore();
    const volunteerStore = useVolunteerStore();
    const projectStore = useProjectsStore();
    const summaryStore = useSummaryStore();

    const baseProps = {
        createDate: new Date(),
        tags: [],
        included: true
    };

    try {
        // Check if person exists before adding
        const existingPerson = personsStore.users.find((p) => p.email === data.person.email);
        if (!existingPerson && data.person.email) {
            await personsStore.saveUser({
                ...baseProps,
                ...data.person,
                name: data.person.name || '',
                email: data.person.email || '',
                phone: data.person.phone || '',
                city: data.person.city || '',
                state: data.person.state || '',
                github: data.person.github || '',
                linkedin: data.person.linkedin || '',
                portfolio: data.person.portfolio || '',
                id: data.person.id || personsStore.createUser().id
            });
        }

        // Process jobs and descriptions
        for (const jobData of data.jobs) {
            const jobDetails = jobData.job;
            // Normalize dates for comparison
            const startDate = jobDetails.startDate ? new Date(jobDetails.startDate) : undefined;
            const endDate = jobDetails.endDate ? new Date(jobDetails.endDate) : undefined;

            // Find matching job using compound key
            const existingJob = jobsStore.items.find((job) => job.companyName === jobDetails.companyName && job.startDate?.getTime() === startDate?.getTime() && job.endDate?.getTime() === endDate?.getTime());

            if (!existingJob) {
                // Create new job
                const newJobId = jobsStore.createId();
                await jobsStore.addItem({
                    ...baseProps,
                    ...jobDetails,
                    startDate: startDate || new Date(),
                    endDate: endDate || new Date(),
                    jobTitle: jobDetails.jobTitle || '',
                    companyName: jobDetails.companyName || '',
                    location: jobDetails.location || '',
                    id: newJobId
                });

                // Add job descriptions
                for (const description of jobData.descriptions) {
                    await jobDescriptionsStore.addItem({
                        ...baseProps,
                        description,
                        jobId: newJobId,
                        id: jobDescriptionsStore.createId()
                    });
                }
            }
        }

        // Process skills with skill type associations
        for (const skill of data.skills) {
            // Check if skill already exists
            const existingSkill = skillsStore.items.find((s) => s.skillName === skill.skillName);

            if (!existingSkill) {
                // Add new skill with existing associations
                await skillsStore.addItem({
                    ...baseProps,
                    ...skill,
                    skillName: skill.skillName || '',
                    associatedSkillTypeNames: skill.associatedSkillTypeNames || [],
                    id: skillsStore.createId()
                });

                // Process skill type associations if they don't exist
                for (const typeName of skill.associatedSkillTypeNames || []) {
                    const existingType = skillTypesStore.items.find((t) => t.skillTypeName === typeName);

                    if (!existingType) {
                        await skillTypesStore.addItem({
                            ...baseProps,
                            skillTypeName: typeName,
                            associatedSkillNames: [skill.skillName || ''],
                            id: skillTypesStore.createId()
                        });
                    }
                }
            }
        }

        // Process education
        for (const edu of data.education || []) {
            const startDate = edu.startDate ? new Date(edu.startDate) : undefined;
            const endDate = edu.endDate ? new Date(edu.endDate) : undefined;
            const existingEdu = educationStore.items.find((e) => e.schoolName === edu.schoolName && e.degreeName === edu.degreeName && e.startDate?.getTime() === startDate?.getTime());

            if (!existingEdu) {
                await educationStore.addItem({
                    ...baseProps,
                    ...edu,
                    startDate: startDate || new Date(),
                    endDate: endDate || new Date(),
                    schoolName: edu.schoolName || '',
                    degreeName: edu.degreeName || '',
                    location: edu.location || '',
                    id: edu.id || educationStore.createId()
                });
            }
        }

        // Process certifications
        for (const cert of data.certifications || []) {
            const existingCert = certStore.items.find((c) => c.certName === cert.certName && c.orgName === cert.orgName);

            if (!existingCert) {
                await certStore.addItem({
                    ...baseProps,
                    ...cert,
                    orgName: cert.orgName || '',
                    certName: cert.certName || '',
                    details: cert.details || '',
                    id: certStore.createId()
                });
            }
        }

        // Process volunteer work
        for (const vol of data.volunteer || []) {
            const existingVol = volunteerStore.items.find((v) => v.orgName === vol.orgName && v.details === vol.details);

            if (!existingVol) {
                await volunteerStore.addItem({
                    ...baseProps,
                    ...vol,
                    orgName: vol.orgName || '',
                    details: vol.details || '',
                    id: volunteerStore.createId()
                });
            }
        }

        // Process projects
        for (const proj of data.projects || []) {
            const existingProj = projectStore.items.find((p) => p.projectName === proj.projectName);

            if (!existingProj) {
                await projectStore.addItem({
                    ...baseProps,
                    ...proj,
                    projectName: proj.projectName || '',
                    projectDetails: proj.projectDetails || '',
                    id: proj.id || projectStore.createId()
                });
            }
        }
    } catch (error) {
        console.error('Error updating stores:', error);
        throw new Error('Failed to update stores with parsed resume data');
    }
}
