import fs from "node:fs/promises";
import path from "node:path";

await fs.rm(path.resolve(process.cwd(), "dist"), {
    force: true,
    recursive: true
});
