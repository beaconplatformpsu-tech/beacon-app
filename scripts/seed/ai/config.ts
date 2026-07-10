import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.seeder" });

if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️ Warning: GEMINI_API_KEY not found in .env.seeder. AI features will fail or use fallbacks.");
}

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "dummy-key-to-prevent-crash"
});

export const MODEL = "gemini-2.5-flash";
