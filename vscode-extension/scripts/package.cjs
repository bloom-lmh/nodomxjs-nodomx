const fs = require("node:fs/promises");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const {
    includeEntries,
    outputFile,
    packageDir,
    resolveVsceBinary,
    runBuild,
    stageDir
} = require("./shared.cjs");

async function main() {
    runBuild();
    await fs.rm(stageDir, { recursive: true, force: true });
    await fs.mkdir(stageDir, { recursive: true });

    for (const entry of includeEntries) {
        const from = path.join(packageDir, entry);
        const to = path.join(stageDir, entry);
        await fs.cp(from, to, { recursive: true });
    }

    let result;
    if (process.platform === "win32") {
        const command = resolveVsceBinary("vsce.cmd");
        result = spawnSync(
            `"${command}" package --allow-star-activation --out "${outputFile}"`,
            {
                cwd: stageDir,
                stdio: "inherit",
                shell: true
            }
        );
    } else {
        const command = resolveVsceBinary("vsce");
        result = spawnSync(
            command,
            ["package", "--allow-star-activation", "--out", outputFile],
            {
                cwd: stageDir,
                stdio: "inherit"
            }
        );
    }

    if (result.error) {
        console.error(result.error);
        process.exit(1);
    }
    if (result.status !== 0) {
        process.exit(result.status || 1);
    }

    console.log(`VSIX created at ${outputFile}`);
}
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
