import { spawnSync } from "node:child_process";
import { getCurrentReleaseVersion, incrementVersion, repoRoot } from "./shared.mjs";

const args = process.argv.slice(2);
const bump = args.find(arg => !arg.startsWith("--"));

if (!bump) {
    throw new Error("Usage: node ./scripts/release/ship.mjs <patch|minor|major|x.y.z> [--dry-run] [--tag latest] [--skip-npm] [--skip-extension] [--no-push] [--remotes github,origin]");
}

const dryRun = args.includes("--dry-run");
const skipNpm = args.includes("--skip-npm");
const skipExtension = args.includes("--skip-extension");
const noPush = args.includes("--no-push");
const npmTag = readFlag("--tag") || "latest";

const currentVersion = await getCurrentReleaseVersion();
const nextVersion = incrementVersion(currentVersion, bump);
const releaseCommitMessage = `chore: release v${nextVersion}`;
const releaseTag = `v${nextVersion}`;
const branch = getCurrentBranch();
const remotes = parseRemotes(readFlag("--remotes")) || getGitRemotes();

runNode("./scripts/release/version.mjs", [bump, ...(dryRun ? ["--dry-run"] : [])]);
run("npm", ["run", "release:check"]);

if (dryRun) {
    console.log(`Dry run complete. Next release would be ${releaseTag}.`);
    process.exit(0);
}

run("git", ["add", "-A"]);

if (!hasStagedChanges()) {
    console.log("No staged changes detected after release preparation.");
} else {
    run("git", ["commit", "-m", releaseCommitMessage]);
}

if (!tagExists(releaseTag)) {
    run("git", ["tag", "-a", releaseTag, "-m", releaseCommitMessage]);
}

if (!skipNpm) {
    runNode("./scripts/release/publish.mjs", ["--tag", npmTag]);
}

if (!skipExtension) {
    run("npm", ["run", "publish:extension"]);
}

if (!noPush) {
    for (const remote of remotes) {
        run("git", ["push", remote, `HEAD:${branch}`]);
        run("git", ["push", remote, releaseTag]);
    }
}

console.log(`Release ${releaseTag} completed.`);

function readFlag(flag) {
    const index = args.indexOf(flag);
    return index === -1 ? undefined : args[index + 1];
}

function runNode(script, runArgs = []) {
    run(process.execPath, [script, ...runArgs]);
}

function run(command, runArgs) {
    const result = spawnSync(command, runArgs, {
        cwd: repoRoot,
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

function runCapture(command, runArgs) {
    const result = spawnSync(command, runArgs, {
        cwd: repoRoot,
        encoding: "utf8",
        shell: process.platform === "win32"
    });

    if (result.error) {
        throw result.error;
    }
    if (result.status !== 0) {
        return "";
    }
    return (result.stdout || "").trim();
}

function hasStagedChanges() {
    const result = spawnSync("git", ["diff", "--cached", "--quiet"], {
        cwd: repoRoot,
        shell: process.platform === "win32"
    });
    return result.status === 1;
}

function tagExists(tagName) {
    const output = runCapture("git", ["tag", "--list", tagName]);
    return output === tagName;
}

function getCurrentBranch() {
    return runCapture("git", ["rev-parse", "--abbrev-ref", "HEAD"]) || "main";
}

function getGitRemotes() {
    const output = runCapture("git", ["remote"]);
    return output
        .split(/\r?\n/)
        .map(item => item.trim())
        .filter(Boolean);
}

function parseRemotes(value) {
    if (!value) {
        return null;
    }
    return value
        .split(",")
        .map(item => item.trim())
        .filter(Boolean);
}
