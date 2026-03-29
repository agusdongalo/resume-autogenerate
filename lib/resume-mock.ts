import { ResumeFormInput } from "@/lib/resume-types";

export const sampleResumeFormData: ResumeFormInput = {
  fullName: "Jordan Reyes",
  email: "jordan.reyes@example.com",
  phone: "+1 (555) 321-9876",
  location: "Austin, TX",
  linkedin: "linkedin.com/in/jordanreyes",
  website: "jordanreyes.dev",
  targetJobTitle: "Full Stack Developer",
  background:
    "Full stack developer with experience building scalable web apps, integrating APIs, and improving user workflows across product and operations teams.",
  jobDescription:
    "Build and maintain responsive web applications, collaborate with product and design, optimize performance, and ship reliable features in a fast-paced environment.",
  skills:
    "TypeScript, Next.js, React, Node.js, Prisma, MySQL, REST APIs, Tailwind CSS, Git, Agile collaboration",
  certifications: "AWS Certified Developer Associate, Scrum Fundamentals",
  experiences: [
    {
      jobTitle: "Full Stack Developer",
      company: "Northstar Digital",
      location: "Austin, TX",
      startDate: "Jan 2022",
      endDate: "Present",
      notes:
        "Built customer-facing product features in Next.js and TypeScript, reduced support tickets by improving UI flows, and worked with product teams to ship releases faster.",
    },
    {
      jobTitle: "Frontend Developer",
      company: "Bright Labs",
      location: "Austin, TX",
      startDate: "Jun 2019",
      endDate: "Dec 2021",
      notes:
        "Developed responsive interfaces, improved page performance, and collaborated with designers and backend engineers to launch multiple web products.",
    },
  ],
  education: [
    {
      degree: "Bachelor of Science in Computer Science",
      school: "University of Texas at Austin",
      graduationYear: "2019",
    },
  ],
  projects: [
    {
      name: "ATS Resume Builder",
      description:
        "Built a resume generation workflow that turns structured user input into recruiter-friendly output.",
    },
    {
      name: "Client Portal Dashboard",
      description:
        "Created a secure portal for tracking requests, automating updates, and improving visibility for support teams.",
    },
  ],
};