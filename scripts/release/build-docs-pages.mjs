import { spawnSync } from "node:child_process";

const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] || "nodomx";
const base = normalizeBase(process.env.DOCS_BASE || `/${repoName}/`);

const result = spawnSync(
    "npm",
    ["run", "docs:build", "-w", "nodomx-docs"],
    {
        cwd: process.cwd(),
        env: {
            ...process.env,
            DOCS_BASE: base
        },
        stdio: "inherit",
        shell: process.platform === "win32"
    }
);

if (result.error) {
    throw result.error;
}
if (result.status !== 0) {
    process.exit(result.status || 1);
}

function normalizeBase(basePath) {
    if (!basePath) {
        return "/";
    }
    if (basePath === "/") {
        return "/";
    }
    const withLeading = basePath.startsWith("/") ? basePath : `/${basePath}`;
    return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}
