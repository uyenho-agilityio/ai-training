import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { evaluate } from "mathjs";

const SAFE_REGEX = /^[\d\s+\-*/().]+$/;

const doMath = (expression: string): number => {
  // Clean data
  const exp = expression.trim();

  // Validation
  if (!SAFE_REGEX.test(exp)) {
    throw new Error("Only numbers and + - * / ( ) are allowed");
  }

  // Evaluation
  try {
    const result = evaluate(exp);
    if (typeof result !== "number" || !Number.isFinite(result)) {
      throw new Error("Could not evaluate expression");
    }
    return result;
  } catch (error) {
    throw new Error("Invalid mathematical expression");
  }
};

export const calculatorTool = createTool({
  id: "calculator",
  description: "Math: pass expression (e.g. 2+2).",
  inputSchema: z.object({
    expression: z
      .string()
      .optional()
      .describe("Math expression, e.g. (30+5)*2"),
  }),
  outputSchema: z.object({
    result: z.union([z.number(), z.string()]),
  }),
  execute: async (input) => {
    if (input.expression) {
      return { result: doMath(input.expression) };
    }

    return { result: "No expression provided" };
  },
});
