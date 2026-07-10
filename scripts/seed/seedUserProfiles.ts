import { getFirebaseAdmin } from "./firebaseAdmin.js";
import { config } from "./config.js";

const admin = getFirebaseAdmin();
const auth = admin.auth();
const db = admin.database();

export async function seedUserProfiles(adminUidParam: string, studentUidParam: string): Promise<Record<string, any>> {
  console.log("=========================================");
  console.log(`🔥 Starting Realtime DB Seeder Profiles Payload Builder`);
  console.log("=========================================\n");

  let adminUid: string | null = adminUidParam;
  let studentUid: string | null = studentUidParam;

  if (!adminUid && !studentUid) {
    console.error("❌ ERROR: Neither Admin nor Student auth users exist. Aborting.");
    throw new Error("No Auth UIDs provided.");
  }

  const updates: Record<string, any> = {};
  const timestamp = new Date().toISOString(); // Predictable cross-platform timestamp

  // 2. Admin Profile
  if (adminUid) {
    updates[`users/${adminUid}/profile`] = {
      uid: adminUid,
      email: config.SEED_ADMIN_EMAIL,
      displayName: config.SEED_ADMIN_DISPLAY_NAME,
      name: config.SEED_ADMIN_DISPLAY_NAME,
      major: "Computer Science",
      seededBy: "beacon-seeder",
    };
    updates[`user_admin_meta/${adminUid}`] = {
      role: "admin",
      accountStatus: "active",
      emailVerified: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }

  // 3. Student Profile
  if (studentUid) {
    updates[`users/${studentUid}/profile`] = {
      uid: studentUid,
      email: config.SEED_STUDENT_EMAIL,
      displayName: config.SEED_STUDENT_DISPLAY_NAME,
      name: config.SEED_STUDENT_DISPLAY_NAME,
      major: "Computer Science",
      careerLevel: "Undergraduate",
      academicLevel: "Undergraduate",
      preferredCareerPathId: "path_fullstack_developer",
      createdAt: timestamp,
      updatedAt: timestamp,
      seededBy: "beacon-seeder",
    };
    updates[`user_admin_meta/${studentUid}`] = {
      role: "student",
      accountStatus: "active",
      emailVerified: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // 4. Starter Tasks
    const starterTasks = [
      { id: "seed_task_1", title: "Complete Data Structures Practice", category: "Algorithms & Data Structures", priority: "High" },
      { id: "seed_task_2", title: "Prepare Database Systems Quiz", category: "Exam Preparation", priority: "Medium" },
      { id: "seed_task_3", title: "Review React and Next.js Components", category: "Course Project", priority: "High" },
      { id: "seed_task_4", title: "Update GitHub Portfolio", category: "Uncategorized", priority: "Medium" },
      { id: "seed_task_5", title: "Explore Career Path Resources", category: "Research/Reading", priority: "Low" },
    ];

    starterTasks.forEach((task) => {
      updates[`user_private/${studentUid}/tasks/${task.id}`] = {
        id: task.id,
        title: task.title,
        description: "Seeded task for quick start.",
        dueDate: timestamp, // Using current time for simplicity
        priority: task.priority,
        status: "Pending",
        courseName: "General CS",
        category: task.category,
        estimatedHours: 2,
        progress: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
    });

    // 5. Starter Notes
    const starterNotes = [
      { id: "seed_note_1", title: "Study Plan for This Week", category: "Planning" },
      { id: "seed_note_2", title: "Career Preparation Notes", category: "Career" },
      { id: "seed_note_3", title: "Graduation Project Ideas", category: "Project" },
    ];

    starterNotes.forEach((note) => {
      updates[`user_private/${studentUid}/notes/${note.id}`] = {
        id: note.id,
        title: note.title,
        content: `This is a seeded note: ${note.title}. Start organizing your thoughts here!`,
        isPinned: false,
        category: note.category,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
    });

    // 6. Starter Skills
    const starterSkills = [
      { id: "seed_skill_1", name: "Python", category: "Languages", proficiency: "Intermediate" },
      { id: "seed_skill_2", name: "JavaScript", category: "Languages", proficiency: "Advanced" },
      { id: "seed_skill_3", name: "SQL", category: "Backend & Databases", proficiency: "Intermediate" },
      { id: "seed_skill_4", name: "Git & GitHub", category: "DevOps & Cloud", proficiency: "Advanced" },
      { id: "seed_skill_5", name: "React", category: "Frontend & UI", proficiency: "Intermediate" },
      { id: "seed_skill_6", name: "Data Structures", category: "CS Fundamentals", proficiency: "Advanced" },
    ];

    starterSkills.forEach((skill) => {
      updates[`user_private/${studentUid}/user_skills/${skill.id}`] = {
        id: skill.id,
        name: skill.name,
        category: skill.category,
        proficiency: skill.proficiency,
        progress: 50,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
    });

    // 7. Starter Recommendations
    const starterRecs = [
      {
        id: "seed_rec_1",
        title: "Focus on System Design",
        description: "To transition from Intermediate to Advanced Backend skills, practice system design interviews.",
        type: "Career",
        actionText: "View Paths",
        actionLink: "/career",
      },
      {
        id: "seed_rec_2",
        title: "Complete Advanced Data Structures",
        description: "Your priority is high for Data Structures. Finish the priority tasks.",
        type: "Skill",
        actionText: "View Tasks",
        actionLink: "/dashboard",
      }
    ];

    starterRecs.forEach((rec) => {
      updates[`user_private/${studentUid}/recommendations/${rec.id}`] = {
        ...rec,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
    });
    // 8. Comprehensive CV Data
    updates[`user_private/${studentUid}/cv_profile`] = {
      uid: studentUid,
      personalInfo: {
        fullName: config.SEED_STUDENT_DISPLAY_NAME,
        email: config.SEED_STUDENT_EMAIL,
        phone: "+1 234 567 8900",
        city: "San Francisco, CA",
        githubUrl: "https://github.com",
        linkedinUrl: "https://linkedin.com",
      },
      summary: "Passionate Computer Science student with a strong foundation in software engineering, algorithms, and full-stack development. Experienced in building scalable web applications using modern technologies like React, Next.js, and Node.js. Seeking a challenging Software Engineering Internship to leverage my problem-solving skills and contribute to impactful projects.",
      education: [
        {
          university: "State University of Technology",
          degree: "Bachelor of Science",
          major: "Computer Science",
          startYear: 2022,
          graduationYear: 2026,
          gpa: 3.8,
        }
      ],
      skills: {
        programmingLanguages: ["TypeScript", "JavaScript", "Python", "Java", "C++"],
        frameworks: ["React", "Next.js", "Node.js", "Express", "Tailwind CSS"],
        databases: ["PostgreSQL", "MongoDB", "Firebase"],
        tools: ["Git", "Docker", "AWS", "Figma"],
        softSkills: ["Leadership", "Problem Solving", "Team Collaboration", "Communication"],
      },
      projects: [
        {
          title: "Beacon Academic Platform",
          description: "Developed a comprehensive platform for CS students to track tasks, skills, and career paths. Built with Next.js, Tailwind CSS, and Firebase. Implemented real-time database sync and robust authentication.",
          technologies: ["Next.js", "React", "Firebase", "Tailwind CSS"],
          githubUrl: "https://github.com",
        },
        {
          title: "Algorithmic Trading Bot",
          description: "Engineered a high-frequency trading bot using Python and Pandas. Backtested strategies over 5 years of historical data achieving a 12% annualized return.",
          technologies: ["Python", "Pandas", "NumPy", "Alpaca API"],
          role: "Backend Engineer",
          githubUrl: "https://github.com",
        }
      ],
      experience: [
        {
          role: "Software Engineering Intern",
          organization: "Tech Solutions Inc.",
          startDate: "May 2024",
          endDate: "August 2024",
          responsibilities: [
            "Optimized backend REST APIs, reducing average response time by 30%.",
            "Collaborated with the design team to implement responsive frontend components.",
            "Wrote comprehensive unit tests using Jest, achieving 90% code coverage."
          ]
        },
        {
          role: "Computer Science Teaching Assistant",
          organization: "State University",
          startDate: "January 2024",
          endDate: "Present",
          responsibilities: [
            "Mentored 50+ students in introductory data structures and algorithms.",
            "Graded programming assignments and provided constructive code reviews.",
            "Hosted weekly office hours to clarify complex computer science concepts."
          ]
        }
      ],
      certifications: [
        {
          title: "AWS Certified Developer - Associate",
          provider: "Amazon Web Services",
          date: "August 2024",
          url: "https://aws.amazon.com/verification"
        }
      ],
      languages: [
        {
          language: "English",
          proficiency: "Native"
        },
        {
          language: "Spanish",
          proficiency: "Intermediate"
        }
      ],
      links: {
        github: "https://github.com",
        linkedin: "https://linkedin.com",
      },
      targetCareerPathId: "path_fullstack_developer",
      atsScore: 85,
      lastAnalyzedAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    updates[`user_private/${studentUid}/cv_analysis`] = {
      uid: studentUid,
      atsScore: 85,
      careerMatchScore: 90,
      strengths: [
        "Strong academic background with a high GPA.",
        "Excellent match for Full Stack Developer roles with React and Node.js skills.",
        "Good mix of academic and internship experience."
      ],
      weaknesses: [
        "Missing some cloud infrastructure skills like Kubernetes or CI/CD pipelines.",
        "Summary could be more quantifiable."
      ],
      missingSkills: ["Kubernetes", "CI/CD", "GraphQL"],
      sectionFeedback: {
        summary: "Consider adding specific metrics to your summary to highlight impact.",
        experience: "Great use of action verbs. Try to quantify the business impact of your API optimizations.",
      },
      suggestedSummary: "Results-driven Computer Science student with a 3.8 GPA and proven experience in full-stack development. Proficient in React, Node.js, and Python. Demonstrated ability to optimize backend systems and build scalable web applications. Seeking a Software Engineering Internship to leverage technical expertise and drive innovation.",
      projectSuggestions: [
        "Build a CI/CD pipeline for your existing Beacon project using GitHub Actions.",
        "Create a microservices-based application using Docker and Kubernetes to fill skill gaps."
      ],
      recommendedResourceIds: [],
      nextSteps: [
        "Take a course on CI/CD pipelines and DevOps basics.",
        "Apply to at least 10 Software Engineering Internships this week.",
        "Update your summary with the suggested AI revisions."
      ],
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }

  return updates;
}
