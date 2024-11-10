export interface EntityBase {
    id: string;
}

export interface TagEntity extends EntityBase {
    tagName: string;
}

export interface BaseEntity extends EntityBase {
    createDate: Date;
    tags: string[];
    included: boolean;
}

export interface Person extends BaseEntity {
    name: string;
    email?: string;
    phone?: string;
    city?: string;
    state?: string;
    github?: string;
    linkedin?: string;
    portfolio?: string;
}

export interface Job extends BaseEntity {
    jobTitle: string;
    companyName: string;
    startDate?: Date;
    endDate?: Date;
    location: string;
    descriptions: { description: string; tags: TagEntity[]; id: string; checked: boolean }[];
}

export interface JobDescription extends BaseEntity {
    description: string;
    jobId: string;
    checked: boolean;
}

export interface ProfessionalSummary extends BaseEntity {
    summary: string;
}

export interface SkillType extends BaseEntity {
    skillTypeName: string;
    associatedSkillNames: string[];
}

export interface SkillName extends BaseEntity {
    skillName: string;
    associatedSkillTypeNames: string[];
}

export interface Volunteer extends BaseEntity {
    orgName: string;
    details: string;
}

export interface Project extends BaseEntity {
    projectName: string;
    projectDetails: string;
}

export interface Certification extends BaseEntity {
    orgName: string;
    certName: string;
    details: string;
}

export interface Education extends BaseEntity {
    schoolName: string;
    degreeName: string;
    startDate: Date;
    endDate: Date;
    location: string;
}
