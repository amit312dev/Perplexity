import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-3.6-flash",
});

// ==================================================
// Generate AI Response
// ==================================================

export async function generateAIResponse(message, messageHistory = []) {
  try {
    const chat = model.startChat({
      history: messageHistory,
    });

    const result = await chat.sendMessage(message);

    const response = result.response;

    const text = response.text();

    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);

    throw error;
  }
}

// ==================================================
// Generate Chat Title
// ==================================================

export async function generateChatTitle(message) {
  try {
    const titlePrompt = `
You are a chat title generator.

Create a short and meaningful title based on the user's
first message.

Rules:
- Generate only the title.
- Do not provide any explanation.
- Do not use quotation marks.
- Keep the title between 3 and 6 words.
- The title should describe the main topic.
- Use the same language as the user's message when possible.
- Do not use emojis.
- Do not start with "Title:" or "Chat:".

User message:
${message}
`;

    const result = await model.generateContent(titlePrompt);

    const response = result.response;

    const title = response.text().trim();

    return title;
  } catch (error) {
    console.error("Gemini Chat Title Error:", error);

    throw error;
  }
}