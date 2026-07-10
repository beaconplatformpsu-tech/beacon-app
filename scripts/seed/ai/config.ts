import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.seeder" });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is required for AI seed utilities. Public seed commands do not need this file.");
}

export const ai = new GoogleGenAI({ apiKey });
export const MODEL = "gemini-2.5-flash";
