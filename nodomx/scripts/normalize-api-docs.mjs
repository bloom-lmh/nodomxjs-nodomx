import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(__dirname, "..");
const apiDir = path.join(packageDir, "api");
const targetFiles = [
    path.join(packageDir, "README.md"),
    path.join(packageDir, "update.md")
];

await renameApiFiles();
await normalizeApiContents();
await normalizePackageDocs();

async function renameApiFiles() {
    const entries = await fs.readdir(apiDir, { withFileTypes: true });
    for (const entry of entries) {
        if (!entry.isFile() || !entry.name.includes("nodom3")) {
            continue;
        }
        const nextName = entry.name.replaceAll("nodom3", "nodomx");
        await fs.rename(path.join(apiDir, entry.name), path.join(apiDir, nextName));
    }
}

async function normalizeApiContents() {
    const entries = await fs.readdir(apiDir, { withFileTypes: true });
    for (const entry of entries) {
        if (!entry.isFile() || path.extname(entry.name) !== ".md") {
            continue;
        }
        const filePath = path.join(apiDir, entry.name);
        const content = await fs.readFile(filePath, "utf8");
        const normalized = normalizeText(content);
        if (normalized !== content) {
            await fs.writeFile(filePath, normalized, "utf8");
        }
    }
}

async function normalizePackageDocs() {
    for (const filePath of targetFiles) {
        try {
            const content = await fs.readFile(filePath, "utf8");
            const normalized = normalizeText(content);
            if (normalized !== content) {
                await fs.writeFile(filePath, normalized, "utf8");
            }
        } catch {
            // Ignore missing optional files.
        }
    }
}

function normalizeText(content) {
    return content
        .replaceAll("Nodom3", "NodomX")
        .replaceAll("nodom3", "nodomx");
}
