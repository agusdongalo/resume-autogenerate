export type ResumeExperienceInput = {
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  notes: string;
};

export type ResumeEducationInput = {
  degree: string;
  school: string;
  graduationYear: string;
};

export type ResumeProjectInput = {
  name: string;
  description: string;
};

export type ResumeFormData = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  targetJobTitle: string;
  background: string;
  jobDescription: string;
  skills: string;
  certifications: string;
  experiences: ResumeExperienceInput[];
  education: ResumeEducationInput[];
  projects: ResumeProjectInput[];
};

export type ResumeFormInput = ResumeFormData;

export type ResumeSkillGroups = {
  technical: string[];
  tools: string[];
  soft: string[];
};

export type GeneratedResumeExperience = {
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
};

export type GeneratedResumeEducation = {
  degree: string;
  school: string;
  graduationYear: string;
};

export type GeneratedResumeProject = {
  name: string;
  description: string;
  bullets: string[];
};

export type GeneratedResume = {
  fullName: string;
  professionalTitle: string;
  contact: {
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
  };
  summary: string;
  skills: ResumeSkillGroups;
  experience: GeneratedResumeExperience[];
  education: GeneratedResumeEducation[];
  certifications: string[];
  projects: GeneratedResumeProject[];
};

export type GeneratedResumeResponse = {
  id: string | null;
  resume: GeneratedResume;
  resumeText: string;
};