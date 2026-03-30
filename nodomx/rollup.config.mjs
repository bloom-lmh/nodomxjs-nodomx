import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import { fileURLToPath } from "url";
import path from "path";
import nodomNd from "@nodomx/rollup-plugin-nd";
import ts from "rollup-plugin-typescript2";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localEntries = new Map([
	["@nodomx/core", path.join(__dirname, "packages", "core", "src", "index.ts")],
	["@nodomx/reactivity", path.join(__dirname, "packages", "reactivity", "src", "index.ts")],
	["@nodomx/shared", path.join(__dirname, "packages", "shared", "src", "index.ts")],
	["@nodomx/runtime-registry", path.join(__dirname, "packages", "runtime-registry", "src", "index.ts")],
	["@nodomx/runtime-template", path.join(__dirname, "packages", "runtime-template", "src", "index.ts")],
	["@nodomx/runtime-optimize", path.join(__dirname, "packages", "runtime-optimize", "src", "index.ts")],
	["@nodomx/runtime-module", path.join(__dirname, "packages", "runtime-module", "src", "index.ts")],
	["@nodomx/runtime-view", path.join(__dirname, "packages", "runtime-view", "src", "index.ts")],
	["@nodomx/runtime-router", path.join(__dirname, "packages", "runtime-router", "src", "index.ts")],
	["@nodomx/runtime-scheduler", path.join(__dirname, "packages", "runtime-scheduler", "src", "index.ts")],
	["@nodomx/runtime-app", path.join(__dirname, "packages", "runtime-app", "src", "index.ts")],
	["@nodomx/runtime-core", path.join(__dirname, "packages", "runtime-core", "src", "index.ts")]
]);

const commonOpt = {
	name: "nodom",
	sourcemap: true
};

const pluginOpt = {
	...commonOpt,
	plugins: [terser({
		keep_classnames: true
	})]
};

export default {
	input: path.join(__dirname, "/index.ts"),
	output: [
		{
			file: resolve("nodom.esm.js"),
			format: "esm",
			...commonOpt
		},
		{
			file: resolve("nodom.esm.min.js"),
			format: "esm",
			...pluginOpt
		}
	],
	plugins: [
		resolveLocalCore(),
		nodomNd({
			importSource: "nodomx"
		}),
		nodeResolve({
			extensions: [".js", ".ts", ".nd"]
		}),
		ts({
			tsconfigOverride: {
				compilerOptions: {
					baseUrl: __dirname,
					paths: Object.fromEntries(Array.from(localEntries.entries()).map(([key, value]) => [key, [value]]))
				}
			}
		}),
		commonjs()
	]
};

function resolve(name) {
	return path.resolve(`dist/${name}`);
}

function resolveLocalCore() {
	return {
		name: "resolve-local-nodomx-core",
		resolveId(source) {
			return localEntries.get(source) || null;
		}
	};
}
