import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { hasDatabase, prisma } from "@/lib/prisma";
import { buildGeneratedResumeText, generateResumeDocument, validateResumeInput } from "@/lib/resume-generation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = validateResumeInput(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Please fix the highlighted resume fields.",
          issues: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const resume = await generateResumeDocument(parsed.data);
    const resumeText = buildGeneratedResumeText(resume);

    let savedId: string | null = null;

    if (hasDatabase && prisma) {
      try {
        const saved = await prisma.resume.create({
          data: {
            fullName: parsed.data.fullName,
            email: parsed.data.email,
            phone: parsed.data.phone || null,
            location: parsed.data.location || null,
            linkedin: parsed.data.linkedin || null,
            website: parsed.data.website || null,
            targetJobTitle: parsed.data.targetJobTitle,
            background: parsed.data.background || null,
            jobDescription: parsed.data.jobDescription || null,
            sourceData: parsed.data as unknown as Prisma.InputJsonValue,
            generatedResume: resume as unknown as Prisma.InputJsonValue,
            generatedResumeText: resumeText,
          },
          select: {
            id: true,
          },
        });

        savedId = saved.id;
      } catch (storageError) {
        console.error("Resume persistence failed:", storageError);
      }
    }

    return NextResponse.json({
      id: savedId,
      resume,
      resumeText,
    });
  } catch (error) {
    console.error("POST /api/generate-resume failed:", error);

    const message = error instanceof Error ? error.message : "Failed to generate resume.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
