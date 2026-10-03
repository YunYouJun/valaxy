import { t as normalizeLayoutName } from "./layoutName-DVkP7Qpo.mjs";
import { posix, resolve } from "node:path";
import process from "node:process";
import { glob, globSync } from "tinyglobby";
import Debug from "debug";
//#region src/RouteLayout.ts
const RUNTIME_ID = "valaxy/vendor/layouts/runtime.mjs";
function getClientCode(importCode, options) {
	const inheritDefaultLayout = options.inheritDefaultLayout ?? true;
	const fallbackArg = options.fallbackLayout ? `, '${options.fallbackLayout}'` : "";
	return `
import { createGetRoutes, createLayoutWrapper, createSetupLayouts, lazyLayout, setPageLayout, useLayout } from '${RUNTIME_ID}'
export { createGetRoutes, setPageLayout, useLayout }
${importCode}
const LayoutWrapper = createLayoutWrapper(layouts, '${options.defaultLayout}'${fallbackArg})
export const setupLayouts = createSetupLayouts(LayoutWrapper, { inheritDefaultLayout: ${inheritDefaultLayout} })
`;
}
//#endregion
//#region src/clientSide.ts
function normalizePath$1(path) {
	path = path.startsWith("/") ? path : `/${path}`;
	return posix.normalize(path);
}
async function createVirtualModuleCode(options) {
	const { layoutDir, defaultLayout, fallbackLayout, importMode, inheritDefaultLayout = true } = options;
	const normalizedTarget = normalizePath$1(layoutDir);
	const isSync = importMode === "sync";
	const fallbackArg = fallbackLayout ? `, '${fallbackLayout}'` : "";
	return `
import { createGetRoutes, createLayoutWrapper, createSetupLayouts, lazyLayout, normalizeLayoutName, setPageLayout, useLayout } from '${RUNTIME_ID}'
export { createGetRoutes, setPageLayout, useLayout }

const modules = import.meta.glob("${normalizedTarget}/**/*.vue", { eager: ${isSync} })

export const layouts = {}
Object.entries(modules).forEach(([name, module]) => {
  const key = normalizeLayoutName(name.replace("${normalizedTarget}/", ''))
  layouts[key] = ${isSync ? "module.default" : "lazyLayout(module)"}
})

const LayoutWrapper = createLayoutWrapper(layouts, '${defaultLayout}'${fallbackArg})
export const setupLayouts = createSetupLayouts(LayoutWrapper, { inheritDefaultLayout: ${inheritDefaultLayout} })
`;
}
//#endregion
//#region src/utils.ts
const REGEX_BACKSLASH = /\\/g;
function extensionsToGlob(extensions) {
	return extensions.length > 1 ? `{${extensions.join(",")}}` : extensions[0] || "";
}
function normalizePath(str) {
	return str.replace(REGEX_BACKSLASH, "/");
}
const debug = Debug("vite-plugin-layouts-next");
function resolveDirs(dirs, root) {
	if (dirs === null) return [];
	const dirsArray = Array.isArray(dirs) ? dirs : [dirs];
	const dirsResolved = [];
	for (const dir of dirsArray) if (dir.includes("**")) {
		const matches = globSync(dir, { cwd: root, onlyDirectories: true });
		for (const match of matches) dirsResolved.push(normalizePath(resolve(root, match)));
	} else dirsResolved.push(normalizePath(resolve(root, dir)));
	return dirsResolved;
}
//#endregion
//#region src/files.ts
async function getFilesFromPath(path, options) {
	const { exclude, extensions } = options;
	const ext = extensionsToGlob(extensions);
	debug(extensions);
	return await glob(`**/*.${ext}`, {
		ignore: [
			"node_modules",
			".git",
			"**/__*__/*",
			...exclude
		],
		onlyFiles: true,
		cwd: path
	});
}
//#endregion
//#region src/importCode.ts
function getImportCode(files, options) {
	const imports = [];
	const head = [];
	let id = 0;
	for (const __ of files) for (const file of __.files) {
		const path = __.path.startsWith("/") ? `${__.path}/${file}` : `/${__.path}/${file}`;
		const name = normalizeLayoutName(file);
		if (options.importMode(name) === "sync") {
			const variable = `__layout_${id}`;
			head.push(`import ${variable} from '${path}'`);
			imports.push(`'${name}': ${variable},`);
			id += 1;
		} else imports.push(`'${name}': lazyLayout(() => import('${path}')),`);
	}
	return `
${head.join("\n")}
export const layouts = {
${imports.join("\n")}
}`;
}
//#endregion
//#region src/index.ts
const MODULE_ID = "virtual:generated-layouts";
const MODULE_ID_VIRTUAL = "/@vite-plugin-vue-layouts-next/generated-layouts";
function defaultImportMode(name) {
	if (process.env.VITE_SSG) return "sync";
	return name === "default" ? "sync" : "async";
}
function resolveOptions(userOptions) {
	return {
		defaultLayout: "default",
		layoutsDirs: "src/layouts",
		extensions: ["vue"],
		exclude: [],
		importMode: defaultImportMode,
		inheritDefaultLayout: true,
		...userOptions
	};
}
function Layout(userOptions = {}) {
	if (canEnableClientLayout(userOptions)) return ClientSideLayout({
		defaultLayout: userOptions.defaultLayout,
		fallbackLayout: userOptions.fallbackLayout,
		layoutsDirs: userOptions.layoutsDirs,
		inheritDefaultLayout: userOptions.inheritDefaultLayout
	});
	let config;
	const options = resolveOptions(userOptions);
	let layoutsDirs;
	return {
		name: "vite-plugin-vue-layouts-next",
		enforce: "pre",
		config() {
			return { optimizeDeps: { include: [RUNTIME_ID] } };
		},
		configResolved(_config) {
			config = _config;
			layoutsDirs = resolveDirs(options.layoutsDirs, config.root);
		},
		configureServer({ moduleGraph, watcher, ws }) {
			watcher.add(options.layoutsDirs);
			const reloadModule = (module, path = "*") => {
				if (module) {
					moduleGraph.invalidateModule(module);
					if (ws) ws.send({
						path,
						type: "full-reload"
					});
				}
			};
			const updateVirtualModule = (path) => {
				path = normalizePath(path);
				if (layoutsDirs.some((dir) => path.startsWith(dir))) {
					debug("reload", path);
					const module = moduleGraph.getModuleById(MODULE_ID_VIRTUAL);
					reloadModule(module);
				}
			};
			watcher.on("add", (path) => {
				updateVirtualModule(path);
			});
			watcher.on("unlink", (path) => {
				updateVirtualModule(path);
			});
			watcher.on("change", async (path) => {
				updateVirtualModule(path);
			});
		},
		resolveId(id) {
			return id === MODULE_ID || id.startsWith(MODULE_ID) ? MODULE_ID_VIRTUAL : null;
		},
		async load(id) {
			if (id === MODULE_ID_VIRTUAL) {
				const container = [];
				for (const dir of layoutsDirs) {
					const layoutsDirPath = dir.startsWith("/") ? normalizePath(dir) : normalizePath(resolve(config.root, dir));
					debug("Loading Layout Dir: %O", layoutsDirPath);
					const _f = await getFilesFromPath(layoutsDirPath, options);
					container.push({
						path: layoutsDirPath,
						files: _f
					});
				}
				const clientCode = getClientCode(getImportCode(container, options), options);
				debug("Client code: %O", clientCode);
				return {
					code: clientCode,
					moduleType: "js"
				};
			}
		}
	};
}
function ClientSideLayout(options) {
	const { layoutsDirs, layoutDir: legacyLayoutDir, defaultLayout = "default", fallbackLayout, importMode = process.env.VITE_SSG ? "sync" : "async", inheritDefaultLayout = true } = options || {};
	const layoutDir = layoutsDirs ?? legacyLayoutDir ?? "src/layouts";
	return {
		name: "vite-plugin-vue-layouts-next",
		config() {
			return { optimizeDeps: { include: [RUNTIME_ID] } };
		},
		resolveId(id) {
			if (id === MODULE_ID) return `\0${MODULE_ID}`;
		},
		async load(id) {
			if (id === `\0${MODULE_ID}`) return {
				code: await createVirtualModuleCode({
					layoutDir,
					importMode,
					defaultLayout,
					fallbackLayout,
					inheritDefaultLayout
				}),
				moduleType: "js"
			};
		}
	};
}
function canEnableClientLayout(options) {
	const keys = Object.keys(options);
	if (keys.length > 4 || keys.some((key) => ![
		"layoutsDirs",
		"defaultLayout",
		"fallbackLayout",
		"inheritDefaultLayout"
	].includes(key))) return false;
	if (options.layoutsDirs && (Array.isArray(options.layoutsDirs) || options.layoutsDirs.includes("*"))) return false;
	return true;
}
//#endregion
export { ClientSideLayout, Layout as default, defaultImportMode };
