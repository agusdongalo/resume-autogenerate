import type { ResumeFormInput } from "@/lib/resume-types";

export const RESUME_SYSTEM_PROMPT = [
  "You are an expert ATS resume writer.",
  "Your job is to turn structured candidate data into a complete, polished, ATS-friendly resume.",
  "Rules:",
  "- Use only the facts provided in the input.",
  "- Do not invent employers, degrees, dates, certifications, tools, or metrics.",
  "- Rewrite responsibilities as achievement-driven bullets with action verbs.",
  "- Use the target role and job description to tailor summary, skills, and bullets.",
  "- Keep language concise, professional, and recruiter-friendly.",
  "- Use standard section headings only.",
  "- Output JSON only. No markdown, no code fences, no extra explanation.",
].join("\n");

export const RESUME_RESPONSE_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    fullName: { type: "string" },
    professionalTitle: { type: "string" },
    contact: {
      type: "object",
      additionalProperties: false,
      properties: {
        email: { type: "string" },
        phone: { type: "string" },
        location: { type: "string" },
        linkedin: { type: "string" },
        website: { type: "string" },
      },
      required: ["email", "phone", "location", "linkedin", "website"],
    },
    summary: { type: "string" },
    skills: {
      type: "object",
      additionalProperties: false,
      properties: {
        technical: { type: "array", items: { type: "string" } },
        tools: { type: "array", items: { type: "string" } },
        soft: { type: "array", items: { type: "string" } },
      },
      required: ["technical", "tools", "soft"],
    },
    experience: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          jobTitle: { type: "string" },
          company: { type: "string" },
          location: { type: "string" },
          startDate: { type: "string" },
          endDate: { type: "string" },
          bullets: { type: "array", items: { type: "string" } },
        },
        required: ["jobTitle", "company", "location", "startDate", "endDate", "bullets"],
      },
    },
    education: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          degree: { type: "string" },
          school: { type: "string" },
          graduationYear: { type: "string" },
        },
        required: ["degree", "school", "graduationYear"],
      },
    },
    certifications: { type: "array", items: { type: "string" } },
    projects: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          bullets: { type: "array", items: { type: "string" } },
        },
        required: ["name", "description", "bullets"],
      },
    },
  },
  required: [
    "fullName",
    "professionalTitle",
    "contact",
    "summary",
    "skills",
    "experience",
    "education",
    "certifications",
    "projects",
  ],
} as const;

export function buildResumePrompt(input: ResumeFormInput) {
  return [
    "Generate a complete ATS-friendly resume tailored to the target role and optional job description.",
    "Use standard section headings and simple recruiter-friendly formatting.",
    "Prioritize keywords from the target job title and job description.",
    "If a metric is not provided, do not fabricate one.",
    "Create 2-4 bullets per experience entry unless the source data is very light.",
    "Create 1-3 bullets per project if projects are provided.",
    "Group skills into technical, tools, and soft skills.",
    "Return JSON only and follow the schema exactly.",
    "Candidate profile JSON:",
    JSON.stringify(input, null, 2),
  ].join("\n\n");
}