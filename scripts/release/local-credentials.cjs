const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const credentialsDir = path.join(os.homedir(), ".nodomx");
const credentialsFile = path.join(credentialsDir, "credentials.json");

function readLocalCredentialsSync() {
    try {
        const raw = fs.readFileSync(credentialsFile, "utf8");
        return JSON.parse(raw);
    } catch {
        return {};
    }
}

function resolveCredential(name, env = process.env) {
    const envValue = env?.[name];
    if (typeof envValue === "string" && envValue.trim()) {
        return envValue.trim();
    }

    const localValue = readLocalCredentialsSync()[name];
    if (typeof localValue === "string" && localValue.trim()) {
        return localValue.trim();
    }

    return undefined;
}

function saveLocalCredentialsSync(entries) {
    const current = readLocalCredentialsSync();
    const next = { ...current };

    for (const [key, value] of Object.entries(entries || {})) {
        if (value === undefined) {
            continue;
        }
        if (value === null) {
            delete next[key];
            continue;
        }
        next[key] = String(value).trim();
    }

    fs.mkdirSync(credentialsDir, { recursive: true });
    fs.writeFileSync(credentialsFile, `${JSON.stringify(next, null, 2)}\n`, "utf8");

    if (process.platform !== "win32") {
        try {
            fs.chmodSync(credentialsFile, 0o600);
        } catch {
            // Ignore permission errors on platforms that do not support chmod.
        }
    }

    return credentialsFile;
}

module.exports = {
    credentialsDir,
    credentialsFile,
    readLocalCredentialsSync,
    resolveCredential,
    saveLocalCredentialsSync
};
