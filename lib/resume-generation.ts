import { getOpenAIClient, getOpenAIModel } from "@/lib/openai";
import { buildResumePrompt, RESUME_RESPONSE_JSON_SCHEMA, RESUME_SYSTEM_PROMPT } from "@/lib/resume-prompt";
import { buildResumeText } from "@/lib/resume-format";
import { generatedResumeSchema, resumeFormSchema } from "@/lib/resume-schemas";
import type { GeneratedResume, ResumeFormInput } from "@/lib/resume-types";

export async function generateResumeDocument(input: ResumeFormInput): Promise<GeneratedResume> {
  const client = getOpenAIClient();
  const prompt = buildResumePrompt(input);

  const response = await client.responses.create({
    model: getOpenAIModel(),
    instructions: RESUME_SYSTEM_PROMPT,
    input: prompt,
    temperature: 0.2,
    max_output_tokens: 2200,
    text: {
      format: {
        type: "json_schema",
        name: "ats_resume",
        description: "Structured ATS-friendly resume output",
        schema: RESUME_RESPONSE_JSON_SCHEMA,
        strict: true,
      },
    },
  });

  const raw = response.output_text?.trim();
  if (!raw) {
    throw new Error("OpenAI returned an empty response.");
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    throw new Error("OpenAI returned invalid JSON.");
  }

  const parsed = generatedResumeSchema.safeParse(parsedJson);
  if (!parsed.success) {
    throw new Error("OpenAI response did not match the expected resume format.");
  }

  return parsed.data;
}

export function buildGeneratedResumeText(resume: GeneratedResume) {
  return buildResumeText(resume);
}

export function validateResumeInput(input: unknown) {
  return resumeFormSchema.safeParse(input);
}