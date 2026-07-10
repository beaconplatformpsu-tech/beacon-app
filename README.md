# Beacon Platform

Beacon is a comprehensive academic and career development platform built to empower Computer Science students and professionals. It provides a structured environment to track academic tasks, explore career paths, analyze CVs using Artificial Intelligence, and access a curated library of professional resources.

## Platform Scenario

The Beacon platform is designed to seamlessly bridge the gap between academic learning and professional readiness. A typical user journey involves:

1. Exploration: A student logs in and explores various tech career paths (e.g., Full Stack Engineer, AI Specialist), reviewing the industry domains and required skills.
2. Skill Gap Analysis: The student uploads their current CV for an instant AI-powered analysis, which evaluates their existing skills against the requirements of their target career path.
3. Personalized Recommendations: Based on the CV analysis, the student receives an ATS (Applicant Tracking System) score, targeted feedback on missing skills, and AI-generated recommended actions.
4. Action and Growth: The student utilizes the platform's curated academic and career resources to close their skill gaps, track their learning progress, and prepare effectively for internships and job placements.

## Core Features

- AI-Powered CV Analysis: Students can upload their resumes (PDF format) to be evaluated by the Google Gemini API. The AI engine extracts skills, computes an ATS score, highlights profile strengths, and pinpoints critical missing skills.
- Intelligent Recommendations: Based on the CV analysis, the platform automatically recommends specific educational resources and actionable next steps tailored to the user's career goals.
- Academic and Task Management: Track courses, organize notes, and manage daily academic tasks with visual progress indicators.
- Career Pathways: Detailed roadmaps for tech careers, defining core and supplemental skills required to succeed.
- Curated Resources: Access a strictly categorized library of courses, documentation, and tools filtered by difficulty and resource type.
- Role-Based Access Control: Distinct interfaces for Students and Administrators, secured via Firebase Custom Claims.
- Admin Dashboard: Manage platform content, moderate support messages, and monitor platform statistics in real-time.

## Technology Stack

- Framework: Next.js 15 (App Router, React 19)
- Language: TypeScript
- Styling: Tailwind CSS, Shadcn UI, Radix UI
- Database: Firebase Realtime Database
- Authentication: Firebase Auth
- Storage: Supabase Storage (for CV and document uploads)
- AI Integration: Google Gemini API (@google/genai)
- State Management: Zustand
- Forms & Validation: React Hook Form, Zod

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/beaconplatformpsu-tech/beacon.git
cd beacon
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy .env.example to .env.local and fill in your credentials for Firebase, Supabase, and the Gemini API:
```bash
cp .env.example .env.local
```

### 4. Run the development server
```bash
npm run dev
```
The application will be available at http://localhost:3000.

---

## Database Management and Seeding

The platform uses a heavily structured Firebase Realtime Database. We provide robust seeding scripts to populate the database with professional starter content, manage indexes, and run strict validations.

Note: Before running any seeder, you must configure a .env.seeder file with your Firebase Admin credentials.

Useful Seed Commands:
- npm run seed:dry - Validate the seed payload in memory (safe, no database writes).
- npm run seed:dev - Backup the database, then write the full payload to Firebase.
- npm run seed:indexes - Dynamically rebuild all database indexes from live data.
- npm run seed:verify - Run a rigorous post-seed validation suite against the live database.

For a complete map of the database structure, rules, and security policies, please read:
doc/DATABASE.md

---

## Architecture Overview

The project follows a standard Next.js App Router architecture, optimized for performance and scalability:

- src/app/: Route definitions. Protected user routes under (app)/, admin routes under (app)/admin/, and public auth routes in auth/.
- src/features/: Domain-specific logic grouped by feature (e.g., resources, skills, cv-analysis). Contains feature-specific hooks, schemas, and UI components.
- src/components/ui/: Reusable generic UI components powered by Shadcn and Radix UI.
- src/lib/: Core utilities, including the central validation schema file and shared generic types.
- src/hooks/: Custom React hooks for global state management and Firebase listeners.
- scripts/seed/: The complete orchestration pipeline for validating, writing, and indexing the database.
- src/i18n/: Localization strings and language configurations (Supports English and Arabic).

## License
Proprietary / Closed Source. Developed for Beacon Platform PSU.
