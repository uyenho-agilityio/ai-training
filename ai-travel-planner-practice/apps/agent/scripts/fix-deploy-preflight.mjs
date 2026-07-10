import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const metadataPath = join(
  process.cwd(),
  ".mastra",
  "output",
  "preflight-local-paths.json"
);

const fixDeployPreflight = async () => {
  try {
    const raw = await readFile(metadataPath, "utf8");
    const detections = JSON.parse(raw);

    if (!Array.isArray(detections)) {
      return;
    }

    const filtered = detections.filter(
      (entry) =>
        typeof entry?.module === "string" &&
        !entry.module.includes("@mastra__core") &&
        !entry.module.includes("node_modules")
    );

    await writeFile(metadataPath, `${JSON.stringify(filtered)}\n`);
  } catch {
    // Build may not emit preflight metadata in all modes.
  }
};

await fixDeployPreflight();
