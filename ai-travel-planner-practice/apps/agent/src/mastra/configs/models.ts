import { DEFAULT_LLM_MODEL } from "./constants";

export const chatModel: string = process.env.LLM_MODEL ?? DEFAULT_LLM_MODEL;

export const judgeModel: string =
  process.env.JUDGE_MODEL ?? process.env.LLM_MODEL ?? DEFAULT_LLM_MODEL;
