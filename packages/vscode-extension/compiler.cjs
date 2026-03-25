const fs = require("node:fs/promises");
const path = require("node:path");

const BLOCK_RE = /<(template|script|style)(\s[^>]*)?>([\s\S]*?)<\/\1>/gi;

async function compileFile(inputFile, options = {}) {
    const source = await fs.readFile(inputFile, "utf8");
    const outputFile = options.outFile || defaultOutFile(inputFile);
    const importSource = options.importSource || await inferImportSource(inputFile);
    const code = compileNd(source, {
        filename: inputFile,
        importSource
    });
    await fs.mkdir(path.dirname(outputFile), { recursive: true });
    await fs.writeFile(outputFile, code, "utf8");
    return {
        code,
        outputFile,
        importSource
    };
}

function compileNd(source, options = {}) {
    const descriptor = parseNd(source, options);
    const filename = descriptor.filename;
    const importSource = options.importSource || "nodom3";
    const className = createClassName(filename);
    const scopeId = createScopeId(filename);
    const template = buildTemplate(descriptor, scopeId);
    const scriptCode = buildScript(descriptor.script ? descriptor.script.content : "");

    return [
        `import { Module } from ${JSON.stringify(importSource)};`,
        "",
        scriptCode,
        "",
        `class ${className} extends Module {}`,
        `Object.assign(${className}.prototype, __nd_component__);`,
        `${className}.prototype.template = function template(props) {`,
        `    return ${JSON.stringify(template)};`,
        "};",
        `${className}.prototype.__ndFile = ${JSON.stringify(filename)};`,
        "",
        `export default ${className};`,
        `export { ${className} };`
    ].join("\n");
}

function parseNd(source, options = {}) {
    const descriptor = {
        filename: options.filename || "anonymous.nd",
        template: null,
        script: null,
        styles: []
    };

    for (const match of source.matchAll(BLOCK_RE)) {
        const tag = match[1];
        const attrs = match[2] || "";
        const content = match[3] || "";
        if (tag === "template") {
            descriptor.template = {
                content: content.trim()
            };
        } else if (tag === "script") {
            descriptor.script = {
                content: content.trim()
            };
        } else {
            descriptor.styles.push({
                content: content.trim(),
                scoped: /\bscoped\b/i.test(attrs)
            });
        }
    }

    if (!descriptor.template) {
        throw new Error(`Missing <template> block in ${descriptor.filename}.`);
    }
    return descriptor;
}

function buildScript(scriptContent) {
    if (!scriptContent) {
        return "const __nd_component__ = {};";
    }
    if (!/\bexport\s+default\b/.test(scriptContent)) {
        throw new Error("The <script> block must contain `export default { ... }`.");
    }
    return scriptContent.replace(/\bexport\s+default\b/, "const __nd_component__ =");
}

function buildTemplate(descriptor, scopeId) {
    let template = descriptor.template.content;
    const styleContent = descriptor.styles
        .map(style => style.scoped ? scopeCss(style.content, scopeId) : style.content)
        .filter(Boolean)
        .join("\n\n")
        .trim();

    if (descriptor.styles.some(style => style.scoped)) {
        template = injectScopedAttribute(template, scopeId);
    }
    if (styleContent) {
        template = injectStyleTag(template, styleContent);
    }
    return template;
}

function injectScopedAttribute(template, scopeId) {
    const match = /^\s*<([a-zA-Z][\w:-]*)([^>]*)>/m.exec(template);
    if (!match) {
        return template;
    }
    const tag = match[0];
    const attr = ` data-nd-scope="${scopeId}"`;
    const injected = tag.endsWith("/>")
        ? tag.slice(0, -2) + attr + " />"
        : tag.slice(0, -1) + attr + ">";
    return template.replace(tag, injected);
}

function injectStyleTag(template, css) {
    const match = /^\s*<([a-zA-Z][\w:-]*)([^>]*)>/m.exec(template);
    if (!match) {
        return template;
    }
    const tag = match[0];
    const styleTag = `\n<style>\n${css}\n</style>\n`;
    return template.replace(tag, `${tag}${styleTag}`);
}

function scopeCss(css, scopeId) {
    const prefix = `[data-nd-scope="${scopeId}"]`;
    return css.replace(/(^|})\s*([^@}{][^{]+)\{/g, (full, brace, selector) => {
        const scopedSelector = selector
            .split(",")
            .map(item => `${prefix} ${item.trim()}`)
            .join(", ");
        return `${brace}\n${scopedSelector}{`;
    }).trim();
}

function createClassName(filename) {
    const base = path.basename(filename, path.extname(filename)).replace(/\.nd$/i, "");
    const normalized = base
        .replace(/[^a-zA-Z0-9]+/g, " ")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map(part => part[0].toUpperCase() + part.slice(1))
        .join("");
    return `${normalized || "Nd"}Component`;
}

function createScopeId(filename) {
    const seed = path.basename(filename).toLowerCase();
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash + seed.charCodeAt(i)) >>> 0;
    }
    return `nd-${hash.toString(16)}`;
}

function defaultOutFile(inputFile) {
    const ext = path.extname(inputFile);
    const base = inputFile.slice(0, -ext.length);
    return `${base}.nd.gen.mjs`;
}

async function inferImportSource(inputFile) {
    let current = path.dirname(path.resolve(inputFile));
    while (true) {
        const pkgFile = path.join(current, "package.json");
        try {
            const pkg = JSON.parse(await fs.readFile(pkgFile, "utf8"));
            if (pkg.name) {
                return pkg.name;
            }
        } catch {
            // ignore
        }
        const parent = path.dirname(current);
        if (parent === current) {
            return "nodom3";
        }
        current = parent;
    }
}

module.exports = {
    compileFile
};
