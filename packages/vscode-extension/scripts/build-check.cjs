const fs = require("node:fs");
const path = require("node:path");

const requiredFiles = [
    "../extension.js",
    "../compiler.cjs",
    "../language-configuration.json",
    "../syntaxes/nd.tmLanguage.json",
    "../snippets/nd.json",
    "../LICENSE",
    "../package.json"
];

for (const file of requiredFiles) {
    const fullPath = path.resolve(__dirname, file);
    if (!fs.existsSync(fullPath)) {
        throw new Error(`Missing required extension file: ${fullPath}`);
    }
}

console.log("vscode extension build check passed");
