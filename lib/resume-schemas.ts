import { z } from "zod";

const experienceInputSchema = z.object({
  jobTitle: z.string().trim().default(""),
  company: z.string().trim().default(""),
  location: z.string().trim().default(""),
  startDate: z.string().trim().default(""),
  endDate: z.string().trim().default(""),
  notes: z.string().trim().default(""),
});

const educationInputSchema = z.object({
  degree: z.string().trim().default(""),
  school: z.string().trim().default(""),
  graduationYear: z.string().trim().default(""),
});

const projectInputSchema = z.object({
  name: z.string().trim().default(""),
  description: z.string().trim().default(""),
});

export const resumeFormSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().default(""),
  location: z.string().trim().default(""),
  linkedin: z.string().trim().default(""),
  website: z.string().trim().default(""),
  targetJobTitle: z.string().trim().min(1, "Target job title is required."),
  background: z.string().trim().default(""),
  jobDescription: z.string().trim().default(""),
  skills: z.string().trim().default(""),
  certifications: z.string().trim().default(""),
  experiences: z
    .array(experienceInputSchema)
    .min(1, "Add at least one work experience."),
  education: z.array(educationInputSchema).min(1, "Add at least one education entry."),
  projects: z.array(projectInputSchema).default([]),
});

export const generatedSkillGroupsSchema = z.object({
  technical: z.array(z.string().trim()).default([]),
  tools: z.array(z.string().trim()).default([]),
  soft: z.array(z.string().trim()).default([]),
});

const generatedExperienceSchema = z.object({
  jobTitle: z.string().trim(),
  company: z.string().trim(),
  location: z.string().trim(),
  startDate: z.string().trim(),
  endDate: z.string().trim(),
  bullets: z.array(z.string().trim()).min(2).max(5),
});

const generatedEducationSchema = z.object({
  degree: z.string().trim(),
  school: z.string().trim(),
  graduationYear: z.string().trim(),
});

const generatedProjectSchema = z.object({
  name: z.string().trim(),
  description: z.string().trim(),
  bullets: z.array(z.string().trim()).min(1).max(4),
});

export const generatedResumeSchema = z.object({
  fullName: z.string().trim(),
  professionalTitle: z.string().trim(),
  contact: z.object({
    email: z.string().trim(),
    phone: z.string().trim(),
    location: z.string().trim(),
    linkedin: z.string().trim(),
    website: z.string().trim(),
  }),
  summary: z.string().trim(),
  skills: generatedSkillGroupsSchema,
  experience: z.array(generatedExperienceSchema),
  education: z.array(generatedEducationSchema),
  certifications: z.array(z.string().trim()),
  projects: z.array(generatedProjectSchema),
});

export const generatedResumeResponseSchema = z.object({
  id: z.string().nullable(),
  resume: generatedResumeSchema,
  resumeText: z.string().trim(),
});

export type ResumeFormInput = z.infer<typeof resumeFormSchema>;
export type GeneratedResumeInput = z.infer<typeof generatedResumeSchema>;