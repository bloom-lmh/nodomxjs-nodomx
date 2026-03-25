const path = require("path");
const vscode = require("vscode");
const { compileFile } = require("./compiler.cjs");

function activate(context) {
    const compileCommand = vscode.commands.registerCommand(
        "nodomx.compileCurrentNdFile",
        async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage("Open a .nd file first.");
                return;
            }
            const document = editor.document;
            if (document.languageId !== "nd" && !document.fileName.endsWith(".nd")) {
                vscode.window.showWarningMessage("The active file is not a .nd file.");
                return;
            }

            await document.save();

            const config = vscode.workspace.getConfiguration("nodomx.nd");
            const outputSuffix = config.get("outputSuffix") || ".nd.gen.mjs";
            const importSource = config.get("importSource") || undefined;
            const outFile = toOutFile(document.fileName, outputSuffix);

            try {
                const result = await compileFile(document.fileName, {
                    outFile,
                    importSource
                });

                const compiledDoc = await vscode.workspace.openTextDocument(result.outputFile);
                await vscode.window.showTextDocument(compiledDoc, { preview: false });
                vscode.window.showInformationMessage(`Compiled ${path.basename(document.fileName)} -> ${path.basename(result.outputFile)}`);
            } catch (error) {
                const message = error && error.message ? error.message : String(error);
                vscode.window.showErrorMessage(`NodomX ND compile failed: ${message}`);
            }
        }
    );

    context.subscriptions.push(compileCommand);
}

function deactivate() {
    // noop
}

function toOutFile(fileName, outputSuffix) {
    const parsed = path.parse(fileName);
    const suffix = outputSuffix.startsWith(".") ? outputSuffix : `.${outputSuffix}`;
    return path.join(parsed.dir, `${parsed.name}${suffix}`);
}

module.exports = {
    activate,
    deactivate
};
