import process from "node:process";
import { parse } from "node:path";
import { getPackageInfo, isPackageExists } from "local-pkg";
import picomatch from "picomatch";
//#region node_modules/.pnpm/@antfu+utils@9.3.0/node_modules/@antfu/utils/dist/index.mjs
function toArray(array) {
	array = array ?? [];
	return Array.isArray(array) ? array : [array];
}
function notNullish(v) {
	return v != null;
}
function slash(str) {
	return str.replace(/\\/g, "/");
}
/**
* Throttle execution of a function. Especially useful for rate limiting
* execution of handlers on events like resize and scroll.
*
* @param {number} delay -                  A zero-or-greater delay in milliseconds. For event callbacks, values around 100 or 250 (or even higher)
*                                            are most useful.
* @param {Function} callback -               A function to be executed after delay milliseconds. The `this` context and all arguments are passed through,
*                                            as-is, to `callback` when the throttled-function is executed.
* @param {object} [options] -              An object to configure options.
* @param {boolean} [options.noTrailing] -   Optional, defaults to false. If noTrailing is true, callback will only execute every `delay` milliseconds
*                                            while the throttled-function is being called. If noTrailing is false or unspecified, callback will be executed
*                                            one final time after the last throttled-function call. (After the throttled-function has not been called for
*                                            `delay` milliseconds, the internal counter is reset).
* @param {boolean} [options.noLeading] -   Optional, defaults to false. If noLeading is false, the first throttled-function call will execute callback
*                                            immediately. If noLeading is true, the first the callback execution will be skipped. It should be noted that
*                                            callback will never executed if both noLeading = true and noTrailing = true.
* @param {boolean} [options.debounceMode] - If `debounceMode` is true (at begin), schedule `clear` to execute after `delay` ms. If `debounceMode` is
*                                            false (at end), schedule `callback` to execute after `delay` ms.
*
* @returns {Function} A new, throttled, function.
*/
function throttle$1(delay, callback, options) {
	var _ref = options || {}, _ref$noTrailing = _ref.noTrailing, noTrailing = _ref$noTrailing === void 0 ? false : _ref$noTrailing, _ref$noLeading = _ref.noLeading, noLeading = _ref$noLeading === void 0 ? false : _ref$noLeading, _ref$debounceMode = _ref.debounceMode, debounceMode = _ref$debounceMode === void 0 ? void 0 : _ref$debounceMode;
	var timeoutID;
	var cancelled = false;
	var lastExec = 0;
	function clearExistingTimeout() {
		if (timeoutID) clearTimeout(timeoutID);
	}
	function cancel(options) {
		var _ref2$upcomingOnly = (options || {}).upcomingOnly, upcomingOnly = _ref2$upcomingOnly === void 0 ? false : _ref2$upcomingOnly;
		clearExistingTimeout();
		cancelled = !upcomingOnly;
	}
	function wrapper() {
		for (var _len = arguments.length, arguments_ = new Array(_len), _key = 0; _key < _len; _key++) arguments_[_key] = arguments[_key];
		var self = this;
		var elapsed = Date.now() - lastExec;
		if (cancelled) return;
		function exec() {
			lastExec = Date.now();
			callback.apply(self, arguments_);
		}
		function clear() {
			timeoutID = void 0;
		}
		if (!noLeading && debounceMode && !timeoutID) exec();
		clearExistingTimeout();
		if (debounceMode === void 0 && elapsed > delay) if (noLeading) {
			lastExec = Date.now();
			if (!noTrailing) timeoutID = setTimeout(debounceMode ? clear : exec, delay);
		} else exec();
		else if (noTrailing !== true) timeoutID = setTimeout(debounceMode ? clear : exec, debounceMode === void 0 ? delay - elapsed : delay);
	}
	wrapper.cancel = cancel;
	return wrapper;
}
function throttle(...args) {
	return throttle$1(...args);
}
//#endregion
//#region src/core/constants.ts
const DISABLE_COMMENT = "/* unplugin-vue-components disabled */";
//#endregion
//#region src/core/utils.ts
const isSSR = Boolean(process.env.SSR || process.env.SSG || process.env.VITE_SSR || process.env.VITE_SSG);
function pascalCase(str) {
	return capitalize(camelCase(str));
}
function camelCase(str) {
	return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : "");
}
function kebabCase(key) {
	return key.replace(/([A-Z])/g, " $1").trim().split(" ").join("-").toLowerCase();
}
function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}
function parseId(id) {
	const index = id.indexOf("?");
	if (index < 0) return {
		path: id,
		query: {}
	};
	else {
		const query = Object.fromEntries(new URLSearchParams(id.slice(index)));
		return {
			path: id.slice(0, index),
			query
		};
	}
}
function isEmpty(value) {
	if (!value || value === null || value === void 0 || Array.isArray(value) && Object.keys(value).length <= 0) return true;
	else return false;
}
function matchGlobs(filepath, globs) {
	for (const glob of globs) {
		const isNegated = glob[0] === "!";
		if (picomatch(isNegated ? glob.slice(1) : glob)(slash(filepath))) return !isNegated;
	}
	return false;
}
function getTransformedPath(path, importPathTransform) {
	if (importPathTransform) {
		const result = importPathTransform(path);
		if (result != null) path = result;
	}
	return path;
}
function stringifyImport(info) {
	if (typeof info === "string") return `import '${info}'`;
	if (!info.as) return `import '${info.from}'`;
	else if (info.name) return `import { ${info.name} as ${info.as} } from '${info.from}'`;
	else return `import ${info.as} from '${info.from}'`;
}
function normalizeComponentInfo(info) {
	if ("path" in info) return {
		from: info.path,
		as: info.name,
		name: info.importName,
		sideEffects: info.sideEffects
	};
	return info;
}
function stringifyComponentImport({ as: name, from: path, name: importName, sideEffects }, ctx) {
	path = getTransformedPath(path, ctx.options.importPathTransform);
	const imports = [stringifyImport({
		as: name,
		from: path,
		name: importName
	})];
	if (sideEffects) toArray(sideEffects).forEach((i) => imports.push(stringifyImport(i)));
	return imports.join(";");
}
function getNameFromFilePath(filePath, options) {
	const { resolvedDirs, directoryAsNamespace, globalNamespaces, collapseSamePrefixes, root } = options;
	const parsedFilePath = parse(slash(filePath));
	let strippedPath = "";
	for (const dir of resolvedDirs) if (parsedFilePath.dir.startsWith(dir)) {
		strippedPath = parsedFilePath.dir.slice(dir.length);
		break;
	}
	let folders = strippedPath.slice(1).split("/").filter(Boolean);
	let filename = parsedFilePath.name;
	if (filename === "index" && !directoryAsNamespace) {
		if (isEmpty(folders)) folders = parsedFilePath.dir.slice(root.length + 1).split("/").filter(Boolean);
		filename = `${folders.slice(-1)[0]}`;
		return filename;
	}
	if (directoryAsNamespace) {
		if (globalNamespaces.some((name) => folders.includes(name))) folders = folders.filter((f) => !globalNamespaces.includes(f));
		folders = folders.map((f) => f.replace(/[^a-z0-9\-]/gi, ""));
		if (filename.toLowerCase() === "index") filename = "";
		if (!isEmpty(folders)) {
			let namespaced = [...folders, filename];
			if (collapseSamePrefixes) {
				const collapsed = [];
				for (const fileOrFolderName of namespaced) {
					let cumulativePrefix = "";
					let didCollapse = false;
					const pascalCasedName = pascalCase(fileOrFolderName);
					for (const parentFolder of [...collapsed].reverse()) {
						cumulativePrefix = `${parentFolder}${cumulativePrefix}`;
						if (pascalCasedName.startsWith(cumulativePrefix)) {
							const collapseSamePrefix = pascalCasedName.slice(cumulativePrefix.length);
							collapsed.push(collapseSamePrefix);
							didCollapse = true;
							break;
						}
					}
					if (!didCollapse) collapsed.push(pascalCasedName);
				}
				namespaced = collapsed;
			}
			filename = namespaced.filter(Boolean).join("-");
		}
		return filename;
	}
	return filename;
}
function resolveAlias(filepath, alias) {
	const result = filepath;
	if (Array.isArray(alias)) for (const { find, replacement } of alias) result.replace(find, replacement);
	return result;
}
async function getPkgVersion(pkgName, defaultVersion) {
	try {
		if (isPackageExists(pkgName)) return (await getPackageInfo(pkgName))?.version ?? defaultVersion;
		else return defaultVersion;
	} catch (err) {
		console.error(err);
		return defaultVersion;
	}
}
function shouldTransform(code) {
	if (code.includes("/* unplugin-vue-components disabled */")) return false;
	return true;
}
function isExclude(name, exclude) {
	if (!exclude) return false;
	if (typeof exclude === "string") return name === exclude;
	if (exclude instanceof RegExp) return !!name.match(exclude);
	if (Array.isArray(exclude)) {
		for (const item of exclude) if (name === item || name.match(item)) return true;
	}
	return false;
}
const ESCAPE_PARENTHESES_REGEX = /[()]/g;
function escapeSpecialChars(str) {
	return str.replace(ESCAPE_PARENTHESES_REGEX, "\\$&");
}
//#endregion
export { notNullish as _, getTransformedPath as a, toArray as b, kebabCase as c, parseId as d, pascalCase as f, DISABLE_COMMENT as g, stringifyComponentImport as h, getPkgVersion as i, matchGlobs as l, shouldTransform as m, escapeSpecialChars as n, isExclude as o, resolveAlias as p, getNameFromFilePath as r, isSSR as s, camelCase as t, normalizeComponentInfo as u, slash as v, throttle as y };
