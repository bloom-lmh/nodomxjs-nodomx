import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
    credentialsFile,
    saveLocalCredentialsSync
} = require("./local-credentials.cjs");

const args = process.argv.slice(2);

if (args.includes("--print-path")) {
    console.log(credentialsFile);
    process.exit(0);
}

const updates = {};
const vscePat = readFlag("--vsce-pat");
const npmToken = readFlag("--npm-token");

if (vscePat) {
    updates.VSCE_PAT = vscePat;
}
if (npmToken) {
    updates.NPM_TOKEN = npmToken;
}
if (args.includes("--clear-vsce-pat")) {
    updates.VSCE_PAT = null;
}
if (args.includes("--clear-npm-token")) {
    updates.NPM_TOKEN = null;
}

if (Object.keys(updates).length === 0) {
    throw new Error("Usage: node ./scripts/release/save-local-credentials.mjs [--vsce-pat <token>] [--npm-token <token>] [--clear-vsce-pat] [--clear-npm-token] [--print-path]");
}

saveLocalCredentialsSync(updates);
console.log(`Saved local credentials to ${credentialsFile}`);

function readFlag(flag) {
    const index = args.indexOf(flag);
    return index === -1 ? undefined : args[index + 1];
}
