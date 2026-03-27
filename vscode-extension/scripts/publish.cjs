const { spawnSync } = require("node:child_process");
const path = require("node:path");
const {
    outputFile,
    packageDir,
    packageJson,
    resolveVsceBinary
} = require("./shared.cjs");

async function main() {
    runPackaging();
    const args = process.argv.slice(2);
    const token = readFlag(args, "--pat") || process.env.VSCE_PAT;
    if (!token) {
        throw new Error("VSCE_PAT is required. Pass --pat <token> or set VSCE_PAT.");
    }

    const version = readFlag(args, "--version") || packageJson.version;
    const message = `Publishing ${packageJson.name}@${version} from ${path.basename(outputFile)}`;
    console.log(message);

    if (process.platform === "win32") {
        const command = resolveVsceBinary("vsce.cmd");
        runShell(`"${command}" publish --allow-star-activation --packagePath "${outputFile}" -p "${token}"`);
        return;
    }

    const command = resolveVsceBinary("vsce");
    const result = spawnSync(
        command,
        ["publish", "--allow-star-activation", "--packagePath", outputFile, "-p", token],
        {
            cwd: packageDir,
            stdio: "inherit"
        }
    );
    handleResult(result);
}

function runPackaging() {
    const result = spawnSync(
        process.execPath,
        [path.join(packageDir, "scripts", "package.cjs")],
        {
            cwd: packageDir,
            stdio: "inherit"
        }
    );
    handleResult(result);
}

function runShell(command) {
    const result = spawnSync(command, {
        cwd: packageDir,
        stdio: "inherit",
        shell: true
    });
    handleResult(result);
}

function handleResult(result) {
    if (result.error) {
        throw result.error;
    }
    if (result.status !== 0) {
        process.exit(result.status || 1);
    }
}

function readFlag(args, name) {
    const index = args.indexOf(name);
    if (index === -1) {
        return undefined;
    }
    return args[index + 1];
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
