import { GoogleGenerativeAI } from "@google/generative-ai";

// ==========================================
// GEMINI SETUP
// ==========================================

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

const model = genAI.getGenerativeModel({
  model: "gemini-3.6-flash",
});

// ==========================================
// CONFIGURATION
// ==========================================

const MAX_RETRIES = 2;
const REQUEST_TIMEOUT = 15000;

// ==========================================
// HELPER: WAIT
// ==========================================

const wait = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

// ==========================================
// HELPER: RETRYABLE ERROR
// ==========================================

const isRetryableError = (error) => {
  return (
    error?.status === 500 ||
    error?.status === 502 ||
    error?.status === 503 ||
    error?.status === 504
  );
};

// ==========================================
// GENERATE AI RESPONSE
// ==========================================

export const generateAIResponse = async (
  message,
  messageHistory = []
) => {
  try {
    console.log("\n==============================");
    console.log("GEMINI AI RESPONSE");
    console.log("==============================");

    console.log("Message:", message);
    console.log(
      "History messages:",
      messageHistory.length
    );

    const chat = model.startChat({
      history: messageHistory,
    });

    let lastError;

    for (
      let attempt = 1;
      attempt <= MAX_RETRIES;
      attempt++
    ) {
      try {
        console.log(
          `Gemini request attempt ${attempt}/${MAX_RETRIES}`
        );

        const result = await chat.sendMessage(
          message
        );

        const text = result.response
          .text()
          .trim();

        if (!text) {
          throw new Error(
            "Gemini returned an empty response."
          );
        }

        console.log(
          "Gemini response received successfully."
        );

        console.log("==============================\n");

        return text;
      } catch (error) {
        lastError = error;

        console.error(
          `Gemini attempt ${attempt} failed.`
        );

        console.error(
          "Status:",
          error?.status || "N/A"
        );

        console.error(
          "Message:",
          error?.message || "Unknown error"
        );

        // --------------------------------------
        // Don't retry non-temporary errors
        // --------------------------------------

        if (!isRetryableError(error)) {
          throw error;
        }

        // --------------------------------------
        // Stop after final attempt
        // --------------------------------------

        if (attempt === MAX_RETRIES) {
          break;
        }

        const delay =
          2000 * Math.pow(2, attempt - 1);

        console.log(
          `Retrying Gemini in ${
            delay / 1000
          } seconds...`
        );

        await wait(delay);
      }
    }

    throw lastError;
  } catch (error) {
    console.error(
      "Gemini API Error:",
      error
    );

    throw error;
  }
};

// ==========================================
// GENERATE CHAT TITLE
// ==========================================

export const generateChatTitle = async (
  message
) => {
  try {
    console.log(
      "Generating chat title..."
    );

    const prompt = `
Generate a short title for the following user message.

Rules:
- 3 to 6 words only
- Do not use quotation marks
- Do not add explanation
- Return only the title

User message:
${message}
`;

    const result = await model.generateContent(
      prompt
    );

    const text = result.response
      .text()
      .trim()
      .replace(/^["']|["']$/g, "");

    if (!text) {
      return "New Chat";
    }

    console.log(
      "Chat title generated:",
      text
    );

    return text;
  } catch (error) {
    console.error(
      "Gemini Chat Title Error:",
      error
    );

    // Controller already has fallback
    throw error;
  }
};