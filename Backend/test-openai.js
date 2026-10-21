import "dotenv/config";

import {
  generateAIResponse,
} from "./src/services/ai.service.js";

try {
  const result = await generateAIResponse(
    "Say hello in one short sentence."
  );

  console.log("\n==============================");
  console.log("OPENAI TEST SUCCESS");
  console.log("==============================\n");

  console.log(result);
} catch (error) {
  console.log("\n==============================");
  console.log("OPENAI TEST FAILED");
  console.log("==============================\n");

  console.error(
    "Status:",
    error?.status
  );

  console.error(
    "Code:",
    error?.code
  );

  console.error(
    "Message:",
    error?.message
  );
}