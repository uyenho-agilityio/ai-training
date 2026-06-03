import type { LlmModelId } from "./types";

/** Production default — direct OpenAI. */
export const PROD_CHAT_MODEL: LlmModelId = "openai/gpt-4o-mini";

/** Dev default — OpenRouter free tier (override via DEV_LLM_MODEL). */
export const DEV_CHAT_MODEL_DEFAULT: LlmModelId =
  "openrouter/google/gemini-2.0-flash-exp:free";
