import type { LlmModelId } from "./types";

const requireEnvModel = (key: string): LlmModelId => {
  const value: string | undefined = process.env[key]?.trim();

  if (!value) {
    throw new Error(
      `Missing ${key}. Set it in apps/agent/.env (see .env.example).`,
    );
  }

  return value;
};

export const chatModel: LlmModelId = requireEnvModel("LLM_MODEL");

export const judgeModel: LlmModelId =
  process.env.JUDGE_MODEL?.trim() || chatModel;
