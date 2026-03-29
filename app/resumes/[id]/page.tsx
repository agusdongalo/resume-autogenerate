import { notFound } from "next/navigation";
import { hasDatabase, prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type ResumePageProps = {
  params: Promise<{ id: string }>;
};

export default async function SavedResumePage({ params }: ResumePageProps) {
  const { id } = await params;

  if (!hasDatabase || !prisma) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-[28px] border border-slate-200/10 bg-white p-8 text-slate-950 shadow-[0_30px_80px_rgba(0,0,0,0.25)]">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Saved resume
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Database not enabled
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Resume generation is still available, but saved resume links need a MySQL database.
            Set <code>ENABLE_DATABASE=true</code> and provide <code>DATABASE_URL</code> when you
            are ready to store resumes.
          </p>
        </div>
      </main>
    );
  }

  const resume = await prisma.resume.findUnique({
    where: { id },
    select: {
      fullName: true,
      targetJobTitle: true,
      generatedResumeText: true,
    },
  });

  if (!resume) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-slate-200/10 bg-white p-8 text-slate-950 shadow-[0_30px_80px_rgba(0,0,0,0.25)]">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          Saved resume
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          {resume.fullName}
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-600">
          {resume.targetJobTitle}
        </p>
        <div className="mt-8 rounded-[24px] border border-slate-200 bg-white p-6">
          <pre className="whitespace-pre-wrap font-sans text-[0.95rem] leading-7 text-slate-950">
            {resume.generatedResumeText}
          </pre>
        </div>
      </div>
    </main>
  );
}
