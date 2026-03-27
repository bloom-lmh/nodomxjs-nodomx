import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { officialNpmRegistry, publishablePackages, repoRoot } from "./shared.mjs";

const require = createRequire(import.meta.url);
const { resolveCredential } = require("./local-credentials.cjs");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const tag = readFlag("--tag");
const otp = readFlag("--otp");
const registry = readFlag("--registry") || officialNpmRegistry;
const npmToken = resolveCredential("NPM_TOKEN");
const tempConfig = npmToken ? await createTempNpmrc(registry, npmToken) : null;

try {
    for (const pkg of publishablePackages) {
        const publishArgs = ["publish", "--workspace", pkg.name, "--access", "public", "--registry", registry];
        if (dryRun) {
            publishArgs.push("--dry-run");
        }
        if (tag) {
            publishArgs.push("--tag", tag);
        }
        if (otp) {
            publishArgs.push("--otp", otp);
        }
        run("npm", publishArgs, createPublishEnv(tempConfig, npmToken));
    }
} finally {
    if (tempConfig) {
        await fs.rm(path.dirname(tempConfig), { recursive: true, force: true });
    }
}

function readFlag(flag) {
    const index = args.indexOf(flag);
    return index === -1 ? undefined : args[index + 1];
}

function run(command, runArgs, env = process.env) {
    const result = spawnSync(command, runArgs, {
        cwd: repoRoot,
        env,
        stdio: "inherit",
        shell: process.platform === "win32"
    });
    if (result.error) {
        throw result.error;
    }
    if (result.status !== 0) {
        process.exit(result.status || 1);
    }
}

function createPublishEnv(tempConfig, npmToken) {
    if (!tempConfig || !npmToken) {
        return process.env;
    }
    return {
        ...process.env,
        NODE_AUTH_TOKEN: npmToken,
        NPM_CONFIG_USERCONFIG: tempConfig,
        NPM_TOKEN: npmToken
    };
}

async function createTempNpmrc(registry, npmToken) {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "nodomx-release-"));
    const file = path.join(tempDir, ".npmrc");
    const authTarget = createAuthTarget(registry);
    const contents = [
        `registry=${registry}`,
        `@nodomx:registry=${registry}`,
        "always-auth=true",
        `${authTarget}:_authToken=${npmToken}`
    ].join("\n");
    await fs.writeFile(file, `${contents}\n`, "utf8");
    return file;
}

function createAuthTarget(registry) {
    const url = new URL(registry);
    const pathname = url.pathname && url.pathname !== "/" ? url.pathname.replace(/\/?$/, "/") : "/";
    return `//${url.host}${pathname}`;
}
