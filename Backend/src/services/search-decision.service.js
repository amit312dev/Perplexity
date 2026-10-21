import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

const model = genAI.getGenerativeModel({
  model: "gemini-3.6-flash",
});

// ==================================================
// Search Decision Schema
// ==================================================

const searchDecisionSchema = z.object({
  needsInternet: z.boolean(),
  searchQuery: z.string(),
});

// ==================================================
// Decide Whether Internet Search Is Required
// ==================================================

export async function decideSearch(message) {
  try {
    const prompt = `
You are a search decision system.

Determine whether the user's question requires
current or live internet information.

Return ONLY valid JSON.

The JSON must have exactly these fields:

{
  "needsInternet": true or false,
  "searchQuery": "..."
}

Rules:

- needsInternet = true when the question requires
  current, latest, today's, recent, live, real-time,
  changing, or web-specific information.

- needsInternet = false for general knowledge,
  programming concepts, explanations, mathematics,
  writing, casual conversation, and questions that
  do not require current information.

- If needsInternet is false, searchQuery should be
  an empty string.

- If needsInternet is true, searchQuery should be
  a concise search query suitable for an internet
  search engine.

User question:
${message}
`;

    const result = await model.generateContent(prompt);

    const text = result.response.text().trim();

    // Remove markdown code fences if Gemini returns them
    const cleanedText = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleanedText);

    const validated =
      searchDecisionSchema.parse(parsed);

    return validated;
  } catch (error) {
    console.error(
      "Search Decision Error:",
      error
    );

    throw error;
  }
}