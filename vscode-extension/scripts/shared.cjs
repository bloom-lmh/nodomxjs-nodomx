const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const packageDir = path.resolve(__dirname, "..");
const packageJson = JSON.parse(fs.readFileSync(path.join(packageDir, "package.json"), "utf8"));
const stageDir = path.join(packageDir, ".vsix-stage");
const outputFile = path.join(packageDir, `${packageJson.name}-${packageJson.version}.vsix`);

const includeEntries = [
    "dist",
    "icons",
    "language-configuration.json",
    "syntaxes",
    "snippets",
    "README.md",
    "LICENSE",
    "package.json"
];

function resolveVsceBinary(binaryName) {
    const candidates = [
        path.join(packageDir, "node_modules", ".bin", binaryName),
        path.join(packageDir, "..", "node_modules", ".bin", binaryName)
    ];

    for (const file of candidates) {
        try {
            fs.accessSync(file);
            return file;
        } catch {
            continue;
        }
    }

    throw new Error(`Unable to locate ${binaryName}. Expected it in ${candidates.join(" or ")}`);
}

function runBuild() {
    const result = spawnSync(
        process.execPath,
        [path.join(packageDir, "scripts", "build.cjs")],
        {
            cwd: packageDir,
            stdio: "inherit"
        }
    );

    if (result.error) {
        throw result.error;
    }
    if (result.status !== 0) {
        process.exit(result.status || 1);
    }
}

module.exports = {
    includeEntries,
    outputFile,
    packageDir,
    packageJson,
    resolveVsceBinary,
    runBuild,
    stageDir
};
