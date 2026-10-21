import { tavily } from "@tavily/core";

const tavilyClient = tavily({
  apiKey: process.env.TAVILY_API_KEY,
});

export const searchInternet = async (query) => {
  return await tavilyClient.search(query, {
    maxResults: 5,
    searchDepth: "basic",
  });
};