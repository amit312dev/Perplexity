import "dotenv/config";

import {
  generateAIResponseWithWeb,
} from "./src/services/ai.service.js";

const result = await generateAIResponseWithWeb(
  "What are the latest technology news today?"
);

console.log("\n==============================");
console.log("FINAL TEST RESULT");
console.log("==============================\n");

console.log(
  JSON.stringify(result, null, 2)
);