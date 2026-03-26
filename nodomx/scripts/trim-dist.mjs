import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const generatedCoreTypesDir = path.resolve(__dirname, "..", "dist", "packages");

await fs.rm(generatedCoreTypesDir, {
    force: true,
    recursive: true
});
