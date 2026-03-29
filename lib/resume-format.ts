import type { GeneratedResume } from "@/lib/resume-types";

function joinContactParts(parts: string[]) {
  return parts.filter(Boolean).join(" | ");
}

export function buildResumeText(resume: GeneratedResume) {
  const lines: string[] = [];

  lines.push(resume.fullName);
  lines.push(resume.professionalTitle);
  lines.push(
    joinContactParts([
      resume.contact.email,
      resume.contact.phone,
      resume.contact.location,
      resume.contact.linkedin,
      resume.contact.website,
    ])
  );
  lines.push("");

  lines.push("SUMMARY");
  lines.push(resume.summary);
  lines.push("");

  lines.push("SKILLS");
  if (resume.skills.technical.length) {
    lines.push(`Technical: ${resume.skills.technical.join(", ")}`);
  }
  if (resume.skills.tools.length) {
    lines.push(`Tools: ${resume.skills.tools.join(", ")}`);
  }
  if (resume.skills.soft.length) {
    lines.push(`Soft Skills: ${resume.skills.soft.join(", ")}`);
  }
  lines.push("");

  lines.push("EXPERIENCE");
  for (const experience of resume.experience) {
    lines.push(
      `${experience.jobTitle} - ${experience.company} - ${joinContactParts([
        experience.location,
        `${experience.startDate} - ${experience.endDate}`,
      ])}`.trim()
    );
    for (const bullet of experience.bullets) {
      lines.push(`- ${bullet}`);
    }
    lines.push("");
  }

  lines.push("EDUCATION");
  for (const education of resume.education) {
    lines.push(
      `${education.degree} - ${education.school} - ${education.graduationYear}`
    );
  }
  lines.push("");

  if (resume.certifications.length) {
    lines.push("CERTIFICATIONS");
    for (const certification of resume.certifications) {
      lines.push(`- ${certification}`);
    }
    lines.push("");
  }

  if (resume.projects.length) {
    lines.push("PROJECTS");
    for (const project of resume.projects) {
      lines.push(`${project.name} - ${project.description}`);
      for (const bullet of project.bullets) {
        lines.push(`- ${bullet}`);
      }
      lines.push("");
    }
  }

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}