# Beacon Platform

Beacon is a high-level educational and professional platform built to empower students and professionals to manage academic tasks, track career goals, and receive personalized recommendations.

## Core Technologies
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS & Radix UI (shadcn/ui)
- **Authentication & Database**: Firebase
- **Storage**: Supabase Storage

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/beaconplatformpsu-tech/beacon.git
   cd beacon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Copy `.env.example` to `.env` and fill in your Firebase and Supabase credentials:
   ```bash
   cp .env.example .env
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   The application will be available at [http://localhost:3000](http://localhost:3000).

## Architecture Overview

The project follows a standard Next.js App Router architecture, optimized for performance and scalability:

- **`src/app/`**: Contains all route definitions. Protected routes are housed under `(app)/` and `admin/`, while public routes reside in `auth/`.
- **`src/components/`**: Reusable UI components. Core building blocks are found in `ui/`, with complex, feature-specific components residing at the root of the directory.
- **`src/hooks/`**: Custom React hooks for global state management, such as user session data (`useCurrentUserRole`) and notifications (`useCustomToast`).
- **`src/integrations/`**: Initialization logic and client configuration for third-party services (Firebase, Supabase).
- **`src/lib/`**: Core utilities, including shared helpers and the global Supabase file upload service.
- **`src/i18n/`**: Localization strings and language configurations.

