"use client";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { sampleResumeFormData } from "@/lib/resume-mock";
import { buildResumeText } from "@/lib/resume-format";
import type {
  GeneratedResume,
  ResumeEducationInput,
  ResumeExperienceInput,
  ResumeFormData,
  ResumeProjectInput,
} from "@/lib/resume-types";

const emptyExperience = (): ResumeExperienceInput => ({
  jobTitle: "",
  company: "",
  location: "",
  startDate: "",
  endDate: "",
  notes: "",
});

const emptyEducation = (): ResumeEducationInput => ({
  degree: "",
  school: "",
  graduationYear: "",
});

const emptyProject = (): ResumeProjectInput => ({
  name: "",
  description: "",
});

const emptyForm = (): ResumeFormData => ({
  fullName: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  website: "",
  targetJobTitle: "",
  background: "",
  jobDescription: "",
  skills: "",
  certifications: "",
  experiences: [emptyExperience()],
  education: [emptyEducation()],
  projects: [emptyProject()],
});

function isFilled(value: string) {
  return value.trim().length > 0;
}

function hasExperienceContent(item: ResumeExperienceInput) {
  return Object.values(item).some(isFilled);
}

function hasEducationContent(item: ResumeEducationInput) {
  return Object.values(item).some(isFilled);
}

function hasProjectContent(item: ResumeProjectInput) {
  return Object.values(item).some(isFilled);
}

function buildDownloadFileName(fullName: string, targetJobTitle: string) {
  const base = `${fullName || "resume"}-${targetJobTitle || "ats"}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${base || "ats-resume"}.txt`;
}

export default function ResumeBuilder() {
  const [form, setForm] = useState<ResumeFormData>(emptyForm);
  const [generatedResume, setGeneratedResume] = useState<GeneratedResume | null>(null);
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const previewText = useMemo(() => {
    if (resumeText) {
      return resumeText;
    }

    if (generatedResume) {
      return buildResumeText(generatedResume);
    }

    return "";
  }, [generatedResume, resumeText]);

  function updateField<K extends keyof ResumeFormData>(field: K, value: ResumeFormData[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateExperience(index: number, field: keyof ResumeExperienceInput, value: string) {
    setForm((current) => ({
      ...current,
      experiences: current.experiences.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  function updateEducation(index: number, field: keyof ResumeEducationInput, value: string) {
    setForm((current) => ({
      ...current,
      education: current.education.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  function updateProject(index: number, field: keyof ResumeProjectInput, value: string) {
    setForm((current) => ({
      ...current,
      projects: current.projects.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  function addExperience() {
    setForm((current) => ({ ...current, experiences: [...current.experiences, emptyExperience()] }));
  }

  function removeExperience(index: number) {
    setForm((current) => ({
      ...current,
      experiences: current.experiences.length === 1
        ? current.experiences
        : current.experiences.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function addEducation() {
    setForm((current) => ({ ...current, education: [...current.education, emptyEducation()] }));
  }

  function removeEducation(index: number) {
    setForm((current) => ({
      ...current,
      education: current.education.length === 1
        ? current.education
        : current.education.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function addProject() {
    setForm((current) => ({ ...current, projects: [...current.projects, emptyProject()] }));
  }

  function removeProject(index: number) {
    setForm((current) => ({
      ...current,
      projects: current.projects.length === 1
        ? current.projects
        : current.projects.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function loadSample() {
    setForm(sampleResumeFormData);
    setError("");
    setGeneratedResume(null);
    setGeneratedId(null);
    setResumeText("");
    setCopied(false);
  }

  function clearGeneratedOutput() {
    setGeneratedResume(null);
    setGeneratedId(null);
    setResumeText("");
    setCopied(false);
  }

  function normalizePayload() {
    return {
      ...form,
      phone: form.phone.trim(),
      location: form.location.trim(),
      linkedin: form.linkedin.trim(),
      website: form.website.trim(),
      background: form.background.trim(),
      jobDescription: form.jobDescription.trim(),
      skills: form.skills.trim(),
      certifications: form.certifications.trim(),
      experiences: form.experiences.filter(hasExperienceContent),
      education: form.education.filter(hasEducationContent),
      projects: form.projects.filter(hasProjectContent),
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setCopied(false);

    const payload = normalizePayload();

    if (!isFilled(payload.fullName)) {
      setError("Full name is required.");
      return;
    }

    if (!isFilled(payload.email)) {
      setError("Email is required.");
      return;
    }

    if (!isFilled(payload.targetJobTitle)) {
      setError("Target job title is required.");
      return;
    }

    if (!payload.experiences.length) {
      setError("Add at least one work experience entry.");
      return;
    }

    if (!payload.education.length) {
      setError("Add at least one education entry.");
      return;
    }

    if (payload.experiences.some((item) => !item.jobTitle || !item.company || !item.notes)) {
      setError("Fill in each work experience with a title, company, and responsibilities.");
      return;
    }

    setLoading(true);
    clearGeneratedOutput();

    try {
      const response = await fetch("/api/generate-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        id?: string | null;
        resume?: GeneratedResume;
        resumeText?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to generate resume.");
      }

      if (!data.resume || !data.resumeText) {
        throw new Error("The API returned an incomplete resume.");
      }

      setGeneratedResume(data.resume);
      setGeneratedId(data.id ?? null);
      setResumeText(data.resumeText);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Something went wrong while generating the resume."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!previewText) return;
    await navigator.clipboard.writeText(previewText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function handleDownload() {
    if (!previewText) return;

    const blob = new Blob([previewText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = buildDownloadFileName(form.fullName, form.targetJobTitle);
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function handlePrint() {
    window.print();
  }

  const inputClass =
    "mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20";
  const textareaClass = `${inputClass} min-h-[120px] resize-y`;
  const cardClass = "rounded-[28px] border border-slate-200/10 bg-slate-950/70 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.14),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.18),_transparent_32%),linear-gradient(180deg,#020617_0%,#06101f_55%,#081426_100%)] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-[1600px] gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(420px,0.85fr)]">
        <section className={`${cardClass} overflow-hidden`}>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-400">
                ATS Resume Generator
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Build a complete ATS-friendly resume from structured input
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                Enter your background, work history, education, and target role.
                The app rewrites everything into a recruiter-friendly resume with
                standard section headings and simple formatting.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={loadSample}
                className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
              >
                Load sample
              </button>
              <button
                type="button"
                onClick={clearGeneratedOutput}
                className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
              >
                Clear preview
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-200">
                Full name
                <input
                  className={inputClass}
                  value={form.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                  placeholder="Your full name"
                />
              </label>
              <label className="text-sm font-medium text-slate-200">
                Email
                <input
                  className={inputClass}
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="you@example.com"
                  type="email"
                />
              </label>
              <label className="text-sm font-medium text-slate-200">
                Phone
                <input
                  className={inputClass}
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </label>
              <label className="text-sm font-medium text-slate-200">
                Location
                <input
                  className={inputClass}
                  value={form.location}
                  onChange={(event) => updateField("location", event.target.value)}
                  placeholder="City, State"
                />
              </label>
              <label className="text-sm font-medium text-slate-200">
                LinkedIn
                <input
                  className={inputClass}
                  value={form.linkedin}
                  onChange={(event) => updateField("linkedin", event.target.value)}
                  placeholder="linkedin.com/in/yourname"
                />
              </label>
              <label className="text-sm font-medium text-slate-200">
                Portfolio / Website
                <input
                  className={inputClass}
                  value={form.website}
                  onChange={(event) => updateField("website", event.target.value)}
                  placeholder="yourwebsite.com"
                />
              </label>
              <label className="text-sm font-medium text-slate-200 md:col-span-2">
                Target job title
                <input
                  className={inputClass}
                  value={form.targetJobTitle}
                  onChange={(event) => updateField("targetJobTitle", event.target.value)}
                  placeholder="Full Stack Developer"
                />
              </label>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <label className="text-sm font-medium text-slate-200">
                Professional summary or background
                <textarea
                  className={textareaClass}
                  value={form.background}
                  onChange={(event) => updateField("background", event.target.value)}
                  placeholder="Short background about your experience and strengths"
                />
              </label>
              <label className="text-sm font-medium text-slate-200">
                Optional job description for tailoring
                <textarea
                  className={textareaClass}
                  value={form.jobDescription}
                  onChange={(event) => updateField("jobDescription", event.target.value)}
                  placeholder="Paste the target job description here"
                />
              </label>
            </div>

            <label className="block text-sm font-medium text-slate-200">
              Skills
              <textarea
                className={textareaClass}
                value={form.skills}
                onChange={(event) => updateField("skills", event.target.value)}
                placeholder="TypeScript, Next.js, Prisma, MySQL, Git, problem solving"
              />
            </label>

            <label className="block text-sm font-medium text-slate-200">
              Certifications
              <textarea
                className={textareaClass}
                value={form.certifications}
                onChange={(event) => updateField("certifications", event.target.value)}
                placeholder="AWS Certified Developer, Google Analytics Certification"
              />
            </label>

            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-white">Work experience</h2>
                <button
                  type="button"
                  onClick={addExperience}
                  className="rounded-full border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
                >
                  Add experience
                </button>
              </div>
              <div className="space-y-4">
                {form.experiences.map((experience, index) => (
                  <div key={`experience-${index}`} className="rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-100">Experience {index + 1}</p>
                      <button
                        type="button"
                        onClick={() => removeExperience(index)}
                        className="text-xs font-semibold text-slate-400 transition hover:text-rose-300"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="text-sm font-medium text-slate-200">
                        Job title
                        <input
                          className={inputClass}
                          value={experience.jobTitle}
                          onChange={(event) => updateExperience(index, "jobTitle", event.target.value)}
                          placeholder="Senior Developer"
                        />
                      </label>
                      <label className="text-sm font-medium text-slate-200">
                        Company
                        <input
                          className={inputClass}
                          value={experience.company}
                          onChange={(event) => updateExperience(index, "company", event.target.value)}
                          placeholder="Company name"
                        />
                      </label>
                      <label className="text-sm font-medium text-slate-200">
                        Location
                        <input
                          className={inputClass}
                          value={experience.location}
                          onChange={(event) => updateExperience(index, "location", event.target.value)}
                          placeholder="City, State"
                        />
                      </label>
                      <label className="text-sm font-medium text-slate-200">
                        Start date
                        <input
                          className={inputClass}
                          value={experience.startDate}
                          onChange={(event) => updateExperience(index, "startDate", event.target.value)}
                          placeholder="Jan 2022"
                        />
                      </label>
                      <label className="text-sm font-medium text-slate-200 md:col-span-2">
                        End date
                        <input
                          className={inputClass}
                          value={experience.endDate}
                          onChange={(event) => updateExperience(index, "endDate", event.target.value)}
                          placeholder="Present"
                        />
                      </label>
                    </div>
                    <label className="mt-4 block text-sm font-medium text-slate-200">
                      Responsibilities, achievements, notes
                      <textarea
                        className={textareaClass}
                        value={experience.notes}
                        onChange={(event) => updateExperience(index, "notes", event.target.value)}
                        placeholder="Describe what you did, impact, tools, metrics, and outcomes"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-white">Education</h2>
                <button
                  type="button"
                  onClick={addEducation}
                  className="rounded-full border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
                >
                  Add education
                </button>
              </div>
              <div className="space-y-4">
                {form.education.map((education, index) => (
                  <div key={`education-${index}`} className="rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-100">Education {index + 1}</p>
                      <button
                        type="button"
                        onClick={() => removeEducation(index)}
                        className="text-xs font-semibold text-slate-400 transition hover:text-rose-300"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="text-sm font-medium text-slate-200">
                        Degree
                        <input
                          className={inputClass}
                          value={education.degree}
                          onChange={(event) => updateEducation(index, "degree", event.target.value)}
                          placeholder="Bachelor of Science in Computer Science"
                        />
                      </label>
                      <label className="text-sm font-medium text-slate-200">
                        School
                        <input
                          className={inputClass}
                          value={education.school}
                          onChange={(event) => updateEducation(index, "school", event.target.value)}
                          placeholder="School name"
                        />
                      </label>
                      <label className="text-sm font-medium text-slate-200 md:col-span-2">
                        Graduation year
                        <input
                          className={inputClass}
                          value={education.graduationYear}
                          onChange={(event) => updateEducation(index, "graduationYear", event.target.value)}
                          placeholder="2024"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-white">Projects</h2>
                <button
                  type="button"
                  onClick={addProject}
                  className="rounded-full border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
                >
                  Add project
                </button>
              </div>
              <div className="space-y-4">
                {form.projects.map((project, index) => (
                  <div key={`project-${index}`} className="rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-100">Project {index + 1}</p>
                      <button
                        type="button"
                        onClick={() => removeProject(index)}
                        className="text-xs font-semibold text-slate-400 transition hover:text-rose-300"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="text-sm font-medium text-slate-200">
                        Project name
                        <input
                          className={inputClass}
                          value={project.name}
                          onChange={(event) => updateProject(index, "name", event.target.value)}
                          placeholder="Resume Builder"
                        />
                      </label>
                      <label className="text-sm font-medium text-slate-200 md:col-span-2">
                        Description
                        <textarea
                          className={textareaClass}
                          value={project.description}
                          onChange={(event) => updateProject(index, "description", event.target.value)}
                          placeholder="Describe the project, stack, and impact"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {error ? (
              <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Generating resume..." : "Generate resume"}
              </button>
              <p className="text-sm text-slate-400">
                The AI rewrites your content into a clean ATS-ready resume.
              </p>
            </div>
          </form>
        </section>

        <aside className={`${cardClass} relative flex flex-col overflow-hidden bg-white text-slate-950`}>
          <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-2 pb-4 pt-1 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Resume preview
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  ATS-friendly output
                </h2>
              </div>
              {generatedId ? (
                <Link
                  href={`/resumes/${generatedId}`}
                  className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                >
                  Open saved copy
                </Link>
              ) : (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  Not saved yet
                </span>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!previewText}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copied ? "Copied" : "Copy text"}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={!previewText}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Download TXT
              </button>
              <button
                type="button"
                onClick={handlePrint}
                disabled={!previewText}
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Print / PDF
              </button>
            </div>
          </div>

          <div className="flex-1 px-2 py-4">
            {previewText ? (
              <div className="resume-preview rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
                <pre className="whitespace-pre-wrap font-sans text-[0.95rem] leading-7 text-slate-950">{previewText}</pre>
              </div>
            ) : (
              <div className="flex h-full min-h-[540px] items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
                <div className="max-w-md">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Preview placeholder
                  </p>
                  <h3 className="mt-3 text-xl font-semibold text-slate-950">
                    Your generated resume will appear here
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Fill in the form on the left, then generate a full ATS-friendly
                    resume. The preview updates with a plain-text version that is
                    easy to copy, download, and print.
                  </p>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
