#!/usr/bin/env node
import path from "node:path";
import { compileFile, defaultOutFile } from "../src/index.js";

const args = process.argv.slice(2);

if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printHelp();
    process.exit(0);
}

const inputFile = path.resolve(args[0]);
const outIndex = args.findIndex(arg => arg === "--out");
const importIndex = args.findIndex(arg => arg === "--import-source");

const outFile = outIndex !== -1 ? path.resolve(args[outIndex + 1]) : defaultOutFile(inputFile);
const importSource = importIndex !== -1 ? args[importIndex + 1] : undefined;

if (outIndex !== -1 && !args[outIndex + 1]) {
    throw new Error("Missing value for --out.");
}
if (importIndex !== -1 && !args[importIndex + 1]) {
    throw new Error("Missing value for --import-source.");
}

const result = await compileFile(inputFile, {
    outFile,
    importSource
});

console.log(`Compiled ${inputFile}`);
console.log(`Output: ${result.outputFile}`);
console.log(`Import source: ${result.importSource}`);

function printHelp() {
    console.log("Usage: ndc <input.nd> [--out output-file] [--import-source nodom3]");
}
