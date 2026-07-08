# Environment Setup & Security

This document explains how the Beacon platform manages environment variables and the critical security rules that must be followed.

## Types of Environment Variables

In Next.js, environment variables are classified into two categories:

### 1. Frontend-Safe Variables (`NEXT_PUBLIC_`)
Variables prefixed with `NEXT_PUBLIC_` are safely embedded into the client-side JavaScript bundle and sent to users' browsers. 
These should **only** be used for non-sensitive public identifiers (like project IDs or publishable anonymous keys).

**Examples:**
- `NEXT_PUBLIC_FIREBASE_API_KEY` (Safe to expose because Firebase uses Security Rules for protection)
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Anon key)

### 2. Server-Only Variables
Variables **without** the `NEXT_PUBLIC_` prefix are kept strictly on the server (Node.js/Next.js API routes, Server Actions, Edge Functions). They are **never** sent to the client.

**Examples:**
- `GEMINI_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SEED_ADMIN_PASSWORD`

---

## Critical Security Warnings

> [!CAUTION]
> **Never Expose the Gemini API Key!**
> The `GEMINI_API_KEY` must never be prefixed with `NEXT_PUBLIC_` or accessed from client components. If exposed, malicious users can extract it from the browser and consume your entire API quota, resulting in massive billing charges. All AI generation must happen on the server (via `src/actions/ai.ts`).

> [!CAUTION]
> **Never Expose the Supabase Service Role Key!**
> The `SUPABASE_SERVICE_ROLE_KEY` is a superuser key that bypasses all Row Level Security (RLS) rules. If this key is exposed to the frontend, an attacker has full read, write, and delete permissions over your entire Supabase database and storage buckets.

## Handling Leaked Secrets
Because some real API keys (including the Gemini Key and Supabase Service Role Key) were accidentally committed to Git history in `env.example` in the past, **they must be manually rotated**.

If a key is compromised:
1. Go to the respective dashboard (Google AI Studio or Supabase Settings).
2. Delete/Revoke the compromised key.
3. Generate a new key.
4. Update your local `.env.local` (and your production environment variables like Vercel).
5. Never commit the new key to `env.example`.

## Local Development
To develop locally:
1. Copy `.env.seeder.example` to `.env.seeder`
2. Fill in the missing keys.
3. These files are safely ignored by Git via `.gitignore`.
