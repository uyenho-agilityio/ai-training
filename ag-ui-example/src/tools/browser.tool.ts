import { createTool } from "@mastra/core/tools"
import { z } from "zod"
import open from "open"

const recentlyOpened = new Map<string, number>()
const DEDUPE_MS = 5000

function normalizeUrl(url: string): string {
  const trimmed = url.trim()
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }
  return `https://${trimmed}`
}

export const browserTool = createTool({
  id: "open-browser",
  description: "Open a URL in the default web browser",
  inputSchema: z.object({
    url: z
      .string()
      .min(1)
      .describe("The URL to open (e.g. https://www.google.com or google.com)"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async (inputData) => {
    const url = normalizeUrl(inputData.url)
    const now = Date.now()
    const lastOpened = recentlyOpened.get(url)
    if (lastOpened !== undefined && now - lastOpened < DEDUPE_MS) {
      return {
        success: true,
        message: `Already opened ${url} (skipped duplicate)`,
      }
    }
    recentlyOpened.set(url, now)

    try {
      await open(url)
      return {
        success: true,
        message: `Opened ${url} in your default browser`,
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to open browser: ${error}`,
      }
    }
  },
})
