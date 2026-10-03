//#region src/layoutName.ts
const REGEX_BACKSLASH = /\\/g;
const REGEX_SEPARATORS = /[-_/.\s]+/g;
const REGEX_NON_ALPHANUMERIC = /[^a-z0-9-]+/gi;
const REGEX_REPEATED_DASH = /-+/g;
const REGEX_EDGE_DASH = /^-|-$/g;
const REGEX_NUMBER = /\d/;
function isUppercase(char = "") {
	if (REGEX_NUMBER.test(char)) return void 0;
	return char !== char.toLowerCase();
}
/**
* Where a word boundary falls when `char` follows `buffer` with no separator:
* `before` for `aB`, `after` for `ABc` (the last upper starts the next word).
*/
function caseBoundary(previousUpper, isUpper, buffer) {
	if (previousUpper === false && isUpper === true) return "before";
	if (previousUpper === true && isUpper === false && buffer.length > 1) return "after";
}
function splitByCase(value) {
	const parts = [];
	let buffer = "";
	let previousUpper;
	let previousSplitter;
	const flush = () => {
		if (buffer) parts.push(buffer);
	};
	for (const char of value) {
		const isSplitter = REGEX_SEPARATORS.test(char);
		REGEX_SEPARATORS.lastIndex = 0;
		if (isSplitter) {
			flush();
			buffer = "";
			previousUpper = void 0;
			previousSplitter = true;
			continue;
		}
		const isUpper = isUppercase(char);
		const boundary = previousSplitter === false ? caseBoundary(previousUpper, isUpper, buffer) : void 0;
		if (boundary === "before") {
			flush();
			buffer = char;
		} else if (boundary === "after") {
			parts.push(buffer.slice(0, -1));
			buffer = buffer.at(-1) + char;
		} else buffer += char;
		previousUpper = isUpper;
		previousSplitter = false;
	}
	flush();
	return parts;
}
function kebabCaseSegments(segments) {
	return segments.map((segment) => segment.toLowerCase()).join("-").replace(REGEX_NON_ALPHANUMERIC, "-").replace(REGEX_REPEATED_DASH, "-").replace(REGEX_EDGE_DASH, "");
}
function resolveLayoutNameSegments(fileName, prefixParts) {
	const fileNameParts = splitByCase(fileName);
	const fileNamePartsContent = fileNameParts.join("/").toLowerCase();
	const layoutNameParts = prefixParts.flatMap((part) => splitByCase(part));
	const matchedSuffix = [];
	let index = prefixParts.length - 1;
	while (index >= 0) {
		const prefixPart = prefixParts[index];
		matchedSuffix.unshift(...splitByCase(prefixPart).map((part) => part.toLowerCase()));
		const matchedSuffixContent = matchedSuffix.join("/");
		if (fileNamePartsContent === matchedSuffixContent || fileNamePartsContent.startsWith(`${matchedSuffixContent}/`) || prefixPart.toLowerCase() === fileNamePartsContent && prefixParts[index + 1] && prefixParts[index] === prefixParts[index + 1]) layoutNameParts.length = index;
		index -= 1;
	}
	return [...layoutNameParts, ...fileNameParts];
}
function normalizeLayoutName(file) {
	const normalizedFile = file.replace(REGEX_BACKSLASH, "/");
	const slashIndex = normalizedFile.lastIndexOf("/");
	const dir = slashIndex === -1 ? "" : normalizedFile.slice(0, slashIndex);
	const basename = slashIndex === -1 ? normalizedFile : normalizedFile.slice(slashIndex + 1);
	const dotIndex = basename.lastIndexOf(".");
	const name = dotIndex <= 0 ? basename : basename.slice(0, dotIndex);
	const prefixParts = splitByCase(dir);
	return kebabCaseSegments(resolveLayoutNameSegments(dir && name.toLowerCase() === "index" ? "" : name, prefixParts).filter(Boolean));
}
//#endregion
export { normalizeLayoutName as t };
