import createDebug from 'debug';
import { createUnplugin } from 'unplugin';
import { isArray, isString, isBoolean, assign, isEmptyObject, isNumber, generateCodeFrame } from '@intlify/shared';
import { normalize, parse, resolve, dirname } from 'pathe';
import { generateJSON, generateYAML, generateJavaScript, generateTypescript } from '@intlify/bundle-utils';
import { createFilter } from '@rollup/pluginutils';
import { glob as fg } from 'tinyglobby';
import { promises } from 'node:fs';
import { parse as parse$1 } from 'vue/compiler-sfc';
import pc from 'picocolors';
import path from 'node:path';
import eslintUitls from '@eslint-community/eslint-utils';
import { transformVTDirective } from '@intlify/vue-i18n-extensions';
import { analyze } from '@typescript-eslint/scope-manager';

function normalizeGlobOption(val) {
  if (!val) return void 0;
  return isString(val) ? [normalize(val)] : val.map(normalize);
}
function resolveOptions(options) {
  const moduleType = options.module || "vue-i18n";
  let onlyLocales = [];
  if (options.onlyLocales) {
    onlyLocales = isArray(options.onlyLocales) ? options.onlyLocales : [options.onlyLocales];
  }
  const forceStringify = !!options.forceStringify;
  const defaultSFCLang = isString(options.defaultSFCLang) ? options.defaultSFCLang : "json";
  const globalSFCScope = !!options.globalSFCScope;
  const runtimeOnly = isBoolean(options.runtimeOnly) ? options.runtimeOnly : true;
  const dropMessageCompiler = !!options.dropMessageCompiler;
  const compositionOnly = moduleType === "vue-i18n" ? isBoolean(options.compositionOnly) ? options.compositionOnly : true : true;
  const fullInstall = moduleType === "vue-i18n" ? isBoolean(options.fullInstall) ? options.fullInstall : true : false;
  const ssrBuild = !!options.ssr;
  const allowDynamic = !!options.allowDynamic;
  const strictMessage = isBoolean(options.strictMessage) ? options.strictMessage : true;
  const escapeHtml = !!options.escapeHtml;
  const optimizeTranslationDirective = isString(options.optimizeTranslationDirective) || isArray(options.optimizeTranslationDirective) ? options.optimizeTranslationDirective : !!options.optimizeTranslationDirective;
  const translationIdentifiers = /* @__PURE__ */ new Map();
  const transformI18nBlock = typeof options.transformI18nBlock === "function" ? options.transformI18nBlock : null;
  const treeShaking = options.treeShaking ? typeof options.treeShaking === "object" ? {
    safelist: options.treeShaking.safelist || [],
    dynamicKeyStrategy: options.treeShaking.dynamicKeyStrategy || "keep-all",
    scanPatterns: options.treeShaking.scanPatterns
  } : { safelist: [], dynamicKeyStrategy: "keep-all" } : null;
  return {
    include: normalizeGlobOption(options.include || []),
    exclude: normalizeGlobOption(options.exclude),
    module: moduleType,
    onlyLocales,
    forceStringify,
    defaultSFCLang,
    globalSFCScope,
    runtimeOnly,
    dropMessageCompiler,
    compositionOnly,
    fullInstall,
    ssrBuild,
    allowDynamic,
    strictMessage,
    escapeHtml,
    optimizeTranslationDirective,
    translationIdentifiers,
    transformI18nBlock,
    treeShaking
  };
}

const PKG_NAME = "unplugin-vue-i18n";

function warn(...args) {
  console.warn(pc.yellow(pc.bold(`[${PKG_NAME}] `)), ...args);
}
function error(...args) {
  console.error(pc.red(pc.bold(`[${PKG_NAME}] `)), ...args);
}
function raiseError(message) {
  throw new Error(`[${PKG_NAME}] ${message}`);
}

function resolveNamespace(name) {
  return `${PKG_NAME}:${name}`;
}
function getVitePlugin(config, name) {
  return config.plugins.find((p) => p.name === name);
}
function checkVuePlugin(vuePlugin) {
  if (vuePlugin == null || !vuePlugin.api) {
    error(
      "`@vitejs/plugin-vue` plugin is not found or invalid version. Please install `@vitejs/plugin-vue` v4.3.4 or later version."
    );
    return false;
  }
  return true;
}
const isWindows = typeof process !== "undefined" && process.platform === "win32";
const windowsSlashRE = /\\/g;
function slash(p) {
  return p.replace(windowsSlashRE, "/");
}
function normalizePath(id) {
  return path.posix.normalize(isWindows ? slash(id) : id);
}

function parseVueRequest(id) {
  const [filename, rawQuery] = id.split(`?`, 2);
  const params = new URLSearchParams(rawQuery);
  const ret = {};
  const langPart = Object.keys(Object.fromEntries(params)).find((key) => /lang\./i.test(key));
  ret.vue = params.has("vue");
  ret.global = params.has("global");
  ret.src = params.has("src");
  ret.raw = params.has("raw");
  if (params.has("type")) {
    ret.type = params.get("type");
  }
  if (params.has("blockType")) {
    ret.blockType = params.get("blockType");
  }
  if (params.has("index")) {
    ret.index = Number(params.get("index"));
  }
  if (params.has("locale")) {
    ret.locale = params.get("locale");
  }
  if (langPart) {
    const [, lang] = langPart.split(".");
    ret.lang = lang;
  } else if (params.has("lang")) {
    ret.lang = params.get("lang");
  }
  if (params.has("issuerPath")) {
    ret.issuerPath = params.get("issuerPath");
  }
  return {
    filename,
    query: ret
  };
}

function getVueCompiler(vuePlugin) {
  return vuePlugin?.api?.options.compiler;
}
function getVuePluginOptions(vuePlugin) {
  return {
    isProduction: vuePlugin?.api?.options.isProduction,
    root: vuePlugin?.api?.options.root,
    template: vuePlugin?.api?.options.template,
    compiler: vuePlugin?.api?.options.compiler
  };
}

function createDescriptor(filename, source, { template, compiler }) {
  const { descriptor, errors } = compiler.parse(source, {
    filename,
    templateParseOptions: template?.compilerOptions
  });
  return { descriptor, errors };
}
function getDescriptor(filename, code, options) {
  const { descriptor, errors } = createDescriptor(filename, code, options);
  if (errors.length) {
    throw errors[0];
  }
  return descriptor;
}

const INTLIFY_BUNDLE_IMPORT_ID = "@intlify/unplugin-vue-i18n/messages";
const VIRTUAL_PREFIX = "virtual:";
const RE_RESOURCE_FORMAT = /\.(json5?|ya?ml|[c|m]?[j|t]s)$/;
const RE_SFC_I18N_CUSTOM_BLOCK = /\?vue&type=i18n/;
const RE_SFC_I18N_WEBPACK_CUSTOM_BLOCK = /blockType=i18n/;
const VITE_VIRTUAL_PREFIX = "virtual:intlify-i18n-";
const debug$3 = createDebug(resolveNamespace("resource"));
function resourcePlugin({
  onlyLocales,
  include,
  exclude,
  module,
  forceStringify,
  defaultSFCLang,
  globalSFCScope,
  runtimeOnly,
  dropMessageCompiler,
  compositionOnly,
  fullInstall,
  ssrBuild,
  strictMessage,
  allowDynamic,
  escapeHtml,
  transformI18nBlock
}, meta, collector) {
  function resolveIncludeExclude() {
    const customBlockInclude = meta.framework === "vite" ? RE_SFC_I18N_CUSTOM_BLOCK : RE_SFC_I18N_WEBPACK_CUSTOM_BLOCK;
    return include ? [[...include, customBlockInclude], exclude] : [[RE_RESOURCE_FORMAT, customBlockInclude], exclude];
  }
  function resolveIncludeExcludeForLegacy() {
    const customBlockInclude = meta.framework === "vite" ? RE_SFC_I18N_CUSTOM_BLOCK : RE_SFC_I18N_WEBPACK_CUSTOM_BLOCK;
    return include ? [[...include, customBlockInclude], void 0] : [void 0, ["**/**"]];
  }
  let _filter = null;
  async function getFilter() {
    if (_filter != null) {
      return _filter;
    }
    if (meta.framework == "webpack") {
      debug$3("Using filter for webpack");
      _filter = createFilter(...resolveIncludeExclude());
    } else if (hasViteJsonPlugin) {
      debug$3("Using filter for rollup-vite");
      _filter = createFilter(...resolveIncludeExcludeForLegacy());
    } else {
      debug$3("Using filter for rolldown-vite");
      _filter = createFilter(...resolveIncludeExclude());
    }
    return _filter;
  }
  const getVueI18nAliasPath = ({ ssr = false, runtimeOnly: runtimeOnly2 = false }) => {
    return `${module}/dist/${module}${runtimeOnly2 ? ".runtime" : ""}.${!ssr ? "esm-bundler.js" : "node.mjs"}`;
  };
  let isProduction = false;
  let sourceMap = false;
  let hasViteJsonPlugin = false;
  const vueI18nAliasName = module;
  debug$3(`vue-i18n alias name: ${vueI18nAliasName}`);
  let vuePlugin = null;
  const getSfcParser = () => {
    return vuePlugin ? getVueCompiler(vuePlugin).parse : parse$1;
  };
  const virtualIdToRealPath = /* @__PURE__ */ new Map();
  const realPathToVirtualId = /* @__PURE__ */ new Map();
  let virtualCounter = 0;
  function intlifyVirtualize(realPath) {
    const normalized = normalize(realPath);
    let virtualId = realPathToVirtualId.get(normalized);
    if (!virtualId) {
      virtualId = `${VITE_VIRTUAL_PREFIX}${virtualCounter++}`;
      virtualIdToRealPath.set(virtualId, normalized);
      realPathToVirtualId.set(normalized, virtualId);
    }
    return virtualId;
  }
  function isIntlifyVirtualId(id) {
    return virtualIdToRealPath.has(id);
  }
  return {
    name: resolveNamespace("resource"),
    /**
     * NOTE:
     *
     * For vite, If we have json (including SFC's custom block),
     * transform it first because it will be transformed into javascript code by `vite:json` plugin.
     *
     * For webpack, This plugin will handle with 'post', because vue-loader generate the request query.
     */
    enforce: meta.framework === "vite" ? "pre" : "post",
    vite: {
      config() {
        const defineConfig = {
          define: {
            __VUE_I18N_LEGACY_API__: !compositionOnly,
            __VUE_I18N_FULL_INSTALL__: fullInstall,
            __INTLIFY_DROP_MESSAGE_COMPILER__: dropMessageCompiler,
            __VUE_I18N_PROD_DEVTOOLS__: false
          }
        };
        debug$3("define Config:", defineConfig);
        const aliasConfig = {
          resolve: {
            alias: {
              [vueI18nAliasName]: getVueI18nAliasPath({
                ssr: ssrBuild,
                runtimeOnly
              })
            }
          }
        };
        debug$3("alias Config:", aliasConfig);
        return assign(defineConfig, aliasConfig);
      },
      async configResolved(config) {
        vuePlugin = getVitePlugin(config, "vite:vue");
        if (!checkVuePlugin(vuePlugin)) {
          return;
        }
        isProduction = config.isProduction;
        sourceMap = config.command === "build" ? !!config.build.sourcemap : false;
        debug$3(`configResolved: isProduction = ${isProduction}, sourceMap = ${sourceMap}`);
        const jsonPlugin = getVitePlugin(config, "vite:json");
        hasViteJsonPlugin = !!jsonPlugin;
        if (jsonPlugin && jsonPlugin.transform) {
          const transform = jsonPlugin.transform;
          const isObjectHook = typeof transform !== "function" && "handler" in transform;
          const orgTransform = isObjectHook ? transform.handler : transform;
          async function overrideJson(code, id) {
            const filter = await getFilter();
            if (!/\.json$/.test(id) || filter(id)) {
              return;
            }
            const { query } = parseVueRequest(id);
            if (query.vue) {
              return;
            }
            debug$3("org json plugin");
            return orgTransform.apply(this, [code, id]);
          }
          if (isObjectHook) {
            transform.handler = overrideJson;
          } else {
            jsonPlugin.transform = overrideJson;
          }
        }
      },
      handleHotUpdate({ file, modules, server }) {
        const key = normalize(file);
        const virtualId = realPathToVirtualId.get(key);
        const inBundle = !!(include && createFilter(include, exclude)(key));
        if (!virtualId && !inBundle) return;
        const affected = new Set(modules);
        const addById = (id) => {
          const mod = id && server.moduleGraph.getModuleById(id);
          if (mod) affected.add(mod);
        };
        addById(virtualId);
        if (inBundle) {
          addById(asVirtualId(INTLIFY_BUNDLE_IMPORT_ID, meta.framework));
        }
        if (affected.size === modules.length) return;
        return [...affected];
      }
    },
    webpack(compiler) {
      isProduction = compiler.options.mode !== "development";
      sourceMap = !!compiler.options.devtool;
      debug$3(`webpack: isProduction = ${isProduction}, sourceMap = ${sourceMap}`);
      compiler.options.resolve = normalizeConfigResolveAlias(
        compiler.options.resolve,
        meta.framework
      );
      compiler.options.resolve.alias[vueI18nAliasName] = getVueI18nAliasPath({
        ssr: ssrBuild,
        runtimeOnly
      });
      debug$3(
        `set ${vueI18nAliasName}: ${getVueI18nAliasPath({
          ssr: ssrBuild,
          runtimeOnly
        })}`
      );
      compiler.options.plugins.push(
        new compiler.webpack.DefinePlugin({
          __VUE_I18N_LEGACY_API__: JSON.stringify(compositionOnly),
          __VUE_I18N_FULL_INSTALL__: JSON.stringify(fullInstall),
          __INTLIFY_PROD_DEVTOOLS__: "false"
        })
      );
      debug$3(`set __VUE_I18N_LEGACY_API__ is '${compositionOnly}'`);
      debug$3(`set __VUE_I18N_FULL_INSTALL__ is '${fullInstall}'`);
      const filter = createFilter(...resolveIncludeExclude());
      if (compiler.options.module) {
        compiler.options.module.rules.push({
          test: RE_RESOURCE_FORMAT,
          type: "javascript/auto",
          include(resource) {
            debug$3("webpack resource include", resource);
            return filter(resource);
          }
        });
      }
    },
    resolveId: {
      async handler(id, importer) {
        if (id === INTLIFY_BUNDLE_IMPORT_ID) {
          return asVirtualId(id, meta.framework);
        }
        if (meta.framework === "vite" && !hasViteJsonPlugin) {
          if (id.includes("?vue&type=i18n") && /[?&]lang\.(?:json|json5)(?:$|&)/.test(id)) {
            const { filename, query } = parseVueRequest(id);
            let virtualKey = id;
            if (query.src && importer) {
              const importerPath = (isIntlifyVirtualId(importer) ? virtualIdToRealPath.get(importer) : importer).split("?")[0];
              if (importerPath.endsWith(".vue")) {
                const resolvedSidecar = resolve(dirname(importerPath), filename);
                virtualKey = id.replace(filename, resolvedSidecar);
              }
            }
            return intlifyVirtualize(virtualKey);
          }
          const idPath = id.split("?")[0];
          if (!RE_RESOURCE_FORMAT.test(idPath)) return;
          let resolvedPath;
          if (idPath.startsWith(".")) {
            const realImporter = importer && isIntlifyVirtualId(importer) ? virtualIdToRealPath.get(importer) : importer;
            if (!realImporter) return;
            resolvedPath = resolve(dirname(realImporter), idPath);
          } else if (idPath.startsWith("/") || /^[a-z]:[/\\]/i.test(idPath)) {
            resolvedPath = idPath;
          } else {
            return;
          }
          const filter = await getFilter();
          if (!filter(resolvedPath)) return;
          return intlifyVirtualize(resolvedPath);
        }
      }
    },
    load: {
      async handler(id) {
        debug$3("load", id);
        if (INTLIFY_BUNDLE_IMPORT_ID === getVirtualId(id, meta.framework) && include) {
          let resourcePaths = [];
          for (const inc of include) {
            resourcePaths = [...resourcePaths, ...await fg(inc)];
          }
          resourcePaths = resourcePaths.filter((el, pos) => resourcePaths.indexOf(el) === pos);
          const code = await generateBundleResources(resourcePaths, isProduction, {
            forceStringify,
            strictMessage,
            escapeHtml,
            usedKeyFilter: collector ? (keyPath) => collector.shouldKeepKey(keyPath) : void 0
          });
          return {
            moduleType: "js",
            code,
            map: { mappings: "" }
          };
        }
        if (isIntlifyVirtualId(id)) {
          const realId = virtualIdToRealPath.get(id);
          if (realId.includes("?vue&type=i18n")) {
            const { filename, query } = parseVueRequest(realId);
            let source;
            if (query.src) {
              this.addWatchFile(filename);
              source = await promises.readFile(filename, "utf-8");
            } else {
              this.addWatchFile(filename);
              const sfcSource = await promises.readFile(filename, "utf-8");
              const { descriptor } = getSfcParser()(sfcSource, {
                sourceMap,
                filename
              });
              const block = descriptor.customBlocks[query.index];
              if (!block) return;
              source = block.content;
            }
            if (typeof transformI18nBlock === "function") {
              const modifiedSource = transformI18nBlock(source);
              if (modifiedSource && typeof modifiedSource === "string") {
                source = modifiedSource;
              } else {
                warn("transformI18nBlock should return a string");
              }
            }
            let langInfo2 = defaultSFCLang;
            if (isString(query.lang)) {
              langInfo2 = query.src ? query.lang === "i18n" ? defaultSFCLang : query.lang : query.lang;
            }
            if (/\.?[cm]?[jt]s$/.test(langInfo2)) {
              source = `export default ${source.replace(/^[\s;]+/, "")}`;
            }
            const generate2 = getGenerator(langInfo2, generateYAML);
            const isGlobalBlock = globalSFCScope || !!query.global;
            const parseOptions2 = getOptions(
              filename,
              isProduction,
              query,
              sourceMap,
              {
                isGlobal: globalSFCScope,
                allowDynamic,
                jit: true,
                strictMessage,
                escapeHtml,
                onlyLocales,
                forceStringify,
                usedKeyFilter: collector && isGlobalBlock ? (keyPath) => collector.shouldKeepKey(keyPath) : void 0
              }
            );
            const { code: generatedCode2 } = await generate2(source, parseOptions2);
            return {
              moduleType: "js",
              code: generatedCode2,
              map: { mappings: "" }
            };
          }
          this.addWatchFile(realId);
          const code = await promises.readFile(realId, "utf-8");
          const langInfo = parse(realId).ext;
          const generate = getGenerator(langInfo);
          const parseOptions = getOptions(
            realId,
            isProduction,
            {},
            sourceMap,
            {
              isGlobal: globalSFCScope,
              allowDynamic,
              strictMessage,
              escapeHtml,
              jit: true,
              onlyLocales,
              forceStringify,
              usedKeyFilter: collector ? (keyPath) => collector.shouldKeepKey(keyPath) : void 0
            }
          );
          const { code: generatedCode } = await generate(code, parseOptions);
          return {
            moduleType: "js",
            code: generatedCode,
            map: { mappings: "" }
          };
        }
      }
    },
    transform: {
      async handler(code, id) {
        if (isIntlifyVirtualId(id)) return;
        const filter = await getFilter();
        if (!filter(id)) {
          return;
        }
        const { filename, query } = parseVueRequest(id);
        debug$3("transform", id, JSON.stringify(query), filename);
        let langInfo = defaultSFCLang;
        let inSourceMap;
        if (!query.vue) {
          langInfo = parse(filename).ext;
          const generate = getGenerator(langInfo);
          const parseOptions = getOptions(
            filename,
            isProduction,
            query,
            sourceMap,
            {
              inSourceMap,
              isGlobal: globalSFCScope,
              allowDynamic,
              strictMessage,
              escapeHtml,
              jit: true,
              onlyLocales,
              forceStringify,
              usedKeyFilter: collector ? (keyPath) => collector.shouldKeepKey(keyPath) : void 0
            }
          );
          debug$3("parseOptions", parseOptions);
          const { code: generatedCode, map } = await generate(code, parseOptions);
          debug$3("generated code", generatedCode);
          debug$3("sourcemap", map, sourceMap);
          if (code === generatedCode) return;
          return {
            moduleType: "js",
            code: generatedCode,
            // prettier-ignore
            map: { mappings: "" }
          };
        } else {
          if (isCustomBlock(query)) {
            if (isString(query.lang)) {
              langInfo = query.src ? query.lang === "i18n" ? defaultSFCLang : query.lang : query.lang;
            } else if (defaultSFCLang) {
              langInfo = defaultSFCLang;
            }
            debug$3("langInfo", langInfo);
            const generate = getGenerator(langInfo, generateYAML);
            const isGlobalBlock = globalSFCScope || !!query.global;
            const parseOptions = getOptions(
              filename,
              isProduction,
              query,
              sourceMap,
              {
                inSourceMap,
                isGlobal: globalSFCScope,
                allowDynamic,
                jit: true,
                strictMessage,
                escapeHtml,
                onlyLocales,
                forceStringify,
                usedKeyFilter: collector && isGlobalBlock ? (keyPath) => collector.shouldKeepKey(keyPath) : void 0
              }
            );
            debug$3("parseOptions", parseOptions);
            let source = await getCode(
              code,
              filename,
              sourceMap,
              query,
              getSfcParser(),
              meta.framework
            );
            if (typeof transformI18nBlock === "function") {
              const modifiedSource = transformI18nBlock(source);
              if (modifiedSource && typeof modifiedSource === "string") {
                source = modifiedSource;
              } else {
                warn("transformI18nBlock should return a string");
              }
            }
            if (/\.?[cm]?[jt]s$/.test(langInfo)) {
              source = `export default ${source.replace(/^[\s;]+/, "")}`;
            }
            const { code: generatedCode, map } = await generate(source, parseOptions);
            debug$3("generated code", generatedCode);
            debug$3("sourcemap", map, sourceMap);
            if (code === generatedCode) return;
            return {
              moduleType: "js",
              code: generatedCode,
              // prettier-ignore
              map: { mappings: "" }
            };
          }
        }
      }
    }
  };
}
function getGenerator(ext, fallback = generateJSON) {
  if (/\.?json5?$/.test(ext)) {
    return generateJSON;
  }
  if (/\.?ya?ml$/.test(ext)) {
    return generateYAML;
  }
  if (/\.?[cm]?js$/.test(ext)) {
    return generateJavaScript;
  }
  if (/\.?[cm]?ts$/.test(ext)) {
    return generateTypescript;
  }
  return fallback;
}
function normalizeConfigResolveAlias(resolve2, framework) {
  if (resolve2 && resolve2.alias) {
    return resolve2;
  }
  if (!resolve2) {
    if (framework === "vite") {
      return { alias: [] };
    } else if (framework === "webpack") {
      return { alias: {} };
    }
  } else if (!resolve2.alias) {
    if (framework === "vite") {
      resolve2.alias = [];
      return resolve2;
    } else if (framework === "webpack") {
      resolve2.alias = {};
      return resolve2;
    }
  }
}
async function generateBundleResources(resources, isProduction, {
  forceStringify = false,
  isGlobal = false,
  onlyLocales = [],
  strictMessage = true,
  escapeHtml = false,
  jit = true,
  transformI18nBlock = void 0,
  usedKeyFilter = void 0
}) {
  const codes = [];
  for (const res of resources) {
    debug$3(`${res} bundle loading ...`);
    if (/\.(json5?|ya?ml)$/.test(res)) {
      const { ext, name } = parse(res);
      const source = await getRaw(res);
      const generate = /json5?/.test(ext) ? generateJSON : generateYAML;
      const parseOptions = getOptions(res, isProduction, {}, false, {
        isGlobal,
        jit,
        onlyLocales,
        strictMessage,
        escapeHtml,
        forceStringify,
        transformI18nBlock,
        usedKeyFilter
      });
      parseOptions.type = "bare";
      const { code } = generate(source, parseOptions);
      debug$3("generated code", code);
      codes.push(`${JSON.stringify(name)}: ${code}`);
    }
  }
  return `const isObject = (item) => item && typeof item === 'object' && !Array.isArray(item);

const mergeDeep = (target, ...sources) => {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

export default mergeDeep({},
  ${codes.map((code) => `{${code}}`).join(",\n")}
);`;
}
async function getCode(source, filename, sourceMap, query, parser, framework = "vite") {
  const { index, issuerPath } = query;
  if (!isNumber(index)) {
    raiseError(`unexpected index: ${index}`);
  }
  if (framework === "webpack") {
    if (issuerPath) {
      debug$3(`getCode (webpack) ${index} via issuerPath`, issuerPath);
      return await getRaw(filename);
    } else {
      const result = parser(await getRaw(filename), {
        sourceMap,
        filename
      });
      const block = result.descriptor.customBlocks[index];
      if (block) {
        const code = block.src ? await getRaw(resolveBlockSrc(block.src, filename)) : block.content;
        debug$3(`getCode (webpack) ${index} from SFC`, code);
        return code;
      } else {
        return source;
      }
    }
  } else {
    return source;
  }
}
function isCustomBlock(query) {
  return !isEmptyObject(query) && "vue" in query && (query["type"] === "custom" || // for webpack (vue-loader)
  query["type"] === "i18n" || // for vite (@vite/plugin-vue)
  query["blockType"] === "i18n");
}
function getOptions(filename, isProduction, query, sourceMap, {
  inSourceMap = void 0,
  forceStringify = false,
  isGlobal = false,
  onlyLocales = [],
  allowDynamic = false,
  strictMessage = true,
  escapeHtml = false,
  jit = true,
  transformI18nBlock = null,
  usedKeyFilter = void 0
}) {
  const mode = isProduction ? "production" : "development";
  const baseOptions = {
    filename,
    sourceMap,
    inSourceMap,
    forceStringify,
    allowDynamic,
    strictMessage,
    escapeHtml,
    jit,
    onlyLocales,
    usedKeyFilter,
    env: mode,
    transformI18nBlock,
    onWarn: (msg) => {
      warn(`${filename} ${msg}`);
    },
    onError: (msg, extra) => {
      const codeFrame = generateCodeFrame(
        extra?.source || extra?.location?.source || "",
        extra?.location?.start.column,
        extra?.location?.end.column
      );
      const errMssage = `${msg} (error code: ${extra?.code}) in ${filename}
  target message: ${extra?.source}
  target message path: ${extra?.path}

  ${codeFrame}
`;
      error(errMssage);
      throw new Error(errMssage);
    }
  };
  if (isCustomBlock(query)) {
    return assign(baseOptions, {
      type: "sfc",
      locale: isString(query.locale) ? query.locale : "",
      isGlobal: isGlobal || !!query.global
    });
  } else {
    return assign(baseOptions, {
      type: "plain",
      isGlobal: false
    });
  }
}
function resolveBlockSrc(src, sfcFilename) {
  if (src.startsWith(".") || !src.startsWith("/") && !/^[a-z]:[/\\]/i.test(src)) {
    return resolve(dirname(sfcFilename), src);
  }
  return src;
}
function getVirtualId(id, framework = "vite") {
  return framework === "vite" ? id.startsWith(VIRTUAL_PREFIX) ? id.slice(VIRTUAL_PREFIX.length) : "" : id;
}
function asVirtualId(id, framework = "vite") {
  return framework === "vite" ? VIRTUAL_PREFIX + id : id;
}
async function getRaw(path) {
  return promises.readFile(path, { encoding: "utf-8" });
}

const debug$2 = createDebug(resolveNamespace("directive"));
const tsEstree = {
  parse: void 0,
  simpleTraverse: void 0,
  AST_NODE_TYPES: void 0
};
function directivePlugin({
  optimizeTranslationDirective,
  translationIdentifiers
}) {
  let vuePlugin = null;
  let vuePluginOptions = null;
  const excludeLangs = ["pug", "jsx", "tsx"];
  return {
    name: resolveNamespace("directive"),
    enforce: "pre",
    vite: {
      async config(config) {
        await import('@typescript-eslint/typescript-estree').then((r) => {
          tsEstree.parse = r.parse;
          tsEstree.simpleTraverse = r.simpleTraverse;
          tsEstree.AST_NODE_TYPES = r.AST_NODE_TYPES;
          return;
        });
        vuePlugin = getVitePlugin(config, "vite:vue");
        if (!checkVuePlugin(vuePlugin)) {
          return;
        }
        if (optimizeTranslationDirective) {
          vuePlugin.api.options = resolveVueOptions(
            vuePlugin,
            optimizeTranslationDirective,
            translationIdentifiers
          );
          debug$2(`vite:vue options['template']:`, vuePlugin.api.options);
        }
      },
      configResolved(config) {
        vuePlugin = getVitePlugin(config, "vite:vue");
        if (!checkVuePlugin(vuePlugin)) {
          return;
        }
      }
    },
    async transform(code, id) {
      if (id.endsWith(".vue")) {
        const { filename, query } = parseVueRequest(id);
        if (!excludeLangs.includes(query.lang ?? "")) {
          if (vuePluginOptions == null) {
            vuePluginOptions = getVuePluginOptions(vuePlugin);
          }
          if (vuePluginOptions?.compiler) {
            analyzeIdentifiers(
              getDescriptor(filename, code, vuePluginOptions),
              vuePluginOptions,
              translationIdentifiers
            );
            return {
              code,
              map: { version: 3, mappings: "", sources: [] }
            };
          }
        }
      }
    }
  };
}
function resolveVueOptions(vuePlugin, optimizeTranslationDirective, translationIdentifiers) {
  const vueOptions = vuePlugin.api.options;
  vueOptions.template ||= {};
  vueOptions.template.compilerOptions ||= {};
  vueOptions.template.compilerOptions.directiveTransforms ||= {};
  const translationSignatureResolver = (context, baseResolver) => {
    const { filename } = context;
    const vuePluginOptions = getVuePluginOptions(vuePlugin);
    const normalizedFilename = normalizePath(path.relative(vuePluginOptions.root, filename));
    const resolveIdentifier2 = translationIdentifiers.get(normalizedFilename);
    debug$2("resolved vue-i18n Identifier", resolveIdentifier2);
    if (resolveIdentifier2 == null) {
      return void 0;
    }
    if (resolveIdentifier2.type === "identifier") {
      return baseResolver(context, resolveIdentifier2.key);
    } else {
      const resolvedSignature = baseResolver(context, resolveIdentifier2.key);
      return resolveIdentifier2?.style === "script-setup" ? `${resolvedSignature}.t` : resolvedSignature;
    }
  };
  vueOptions.template.compilerOptions.directiveTransforms.t = transformVTDirective({
    translationSignatures: isBoolean(optimizeTranslationDirective) ? translationSignatureResolver : optimizeTranslationDirective
  });
  return vueOptions;
}
function analyzeIdentifiers(descriptor, { root }, translationIdentifiers) {
  const source = descriptor.scriptSetup?.content || descriptor.script?.content;
  debug$2("getDescriptor content", source);
  if (!source) {
    return;
  }
  const ast = tsEstree.parse(source, { range: true });
  tsEstree.simpleTraverse(ast, {
    enter(node, parent) {
      if (parent) {
        node.parent = parent;
      }
    }
  });
  const scopeManager = analyze(ast, { sourceType: "module" });
  const scope = getScope(scopeManager, ast);
  const importLocalName = getImportLocalName(scope, "vue-i18n", "useI18n");
  if (importLocalName == null) {
    return;
  }
  debug$2("importLocalName", importLocalName);
  const resolvedIdentifier = getVueI18nIdentifier(scope, importLocalName);
  if (resolvedIdentifier) {
    const normalizedFilename = normalizePath(path.relative(root, descriptor.filename));
    debug$2("set vue-i18n resolved identifier: ", resolvedIdentifier);
    translationIdentifiers.set(normalizedFilename, resolvedIdentifier);
  }
}
function getScope(manager, node) {
  const scope = manager.acquire(node, true);
  if (scope) {
    if (scope.type === "function-expression-name") {
      return scope.childScopes[0];
    }
    return scope;
  }
  return manager.scopes[0];
}
function getImportLocalName(scope, source, imported) {
  const importDecl = getImportDeclaration(scope, source);
  if (importDecl) {
    const specifierNode = importDecl.specifiers.find(
      (specifierNode2) => isImportedIdentifierInImportClause(specifierNode2) && specifierNode2.imported.name === imported
    );
    return specifierNode ? specifierNode.local.name : null;
  }
  return null;
}
function getImportDeclaration(scope, source) {
  const tracker = new eslintUitls.ReferenceTracker(scope);
  const traceMap = {
    [source]: {
      [eslintUitls.ReferenceTracker.ESM]: true,
      [eslintUitls.ReferenceTracker.READ]: true
    }
  };
  const refs = Array.from(tracker.iterateEsmReferences(traceMap));
  return refs.length ? refs[0].node : null;
}
function isImportedIdentifierInImportClause(node) {
  return "imported" in node;
}
function getVueI18nIdentifier(scope, local) {
  const { callExpression, returnStatement } = getCallExpressionAndReturnStatement(scope, local);
  if (callExpression == null) {
    return null;
  }
  const id = getVariableDeclarationIdFrom(callExpression);
  if (id == null) {
    return null;
  }
  const variableIdPairs = parseVariableId(id);
  debug$2("variableIdPairs:", variableIdPairs);
  const returnVariableIdPairs = parseReturnStatement(returnStatement);
  debug$2("returnVariableIdPairs:", returnVariableIdPairs);
  return resolveIdentifier(variableIdPairs, returnVariableIdPairs);
}
const EMPTY_NODE_RETURN = {
  callExpression: null,
  returnStatement: null
};
function getCallExpressionAndReturnStatement(scope, local) {
  const variable = eslintUitls.findVariable(scope, local);
  if (variable == null) {
    return EMPTY_NODE_RETURN;
  }
  const callExpressionRef = variable.references.find((ref) => {
    return ref.identifier.parent?.type === tsEstree.AST_NODE_TYPES.CallExpression;
  });
  if (callExpressionRef == null) {
    return EMPTY_NODE_RETURN;
  }
  let returnStatement = null;
  if (callExpressionRef.from.type === "function" && callExpressionRef.from.block.type === tsEstree.AST_NODE_TYPES.FunctionExpression && // @ts-expect-error -- FIXME: type error
  callExpressionRef.from.block.parent.type === tsEstree.AST_NODE_TYPES.Property && // @ts-expect-error -- FIXME: type error
  callExpressionRef.from.block.parent.key.type === tsEstree.AST_NODE_TYPES.Identifier && // @ts-expect-error -- FIXME: type error
  callExpressionRef.from.block.parent.key.name === "setup") {
    returnStatement = callExpressionRef.from.block.body.body.find((statement) => {
      return statement.type === tsEstree.AST_NODE_TYPES.ReturnStatement;
    });
  }
  return {
    // @ts-expect-error -- FIXME: type error
    callExpression: callExpressionRef.identifier.parent,
    returnStatement
  };
}
function getVariableDeclarationIdFrom(node) {
  if (node.parent?.type !== tsEstree.AST_NODE_TYPES.VariableDeclarator) {
    return null;
  }
  return node.parent.id;
}
function parseVariableId(node) {
  if (node.type === tsEstree.AST_NODE_TYPES.Identifier) {
    return [{ key: node.name, value: null }];
  } else {
    const props = node.properties.filter(
      // ignore RestElement
      (prop) => prop.type === tsEstree.AST_NODE_TYPES.Property
    );
    const pairs = [];
    for (const prop of props) {
      if (prop?.key.type === tsEstree.AST_NODE_TYPES.Identifier && prop?.value.type === tsEstree.AST_NODE_TYPES.Identifier) {
        pairs.push({ key: prop.key.name, value: prop.value.name });
      }
    }
    return pairs;
  }
}
function parseReturnStatement(node) {
  const pairs = [];
  if (node == null || node.argument == null) {
    return pairs;
  }
  if (node.argument.type === tsEstree.AST_NODE_TYPES.ObjectExpression) {
    for (const prop of node.argument.properties) {
      if (prop.type === tsEstree.AST_NODE_TYPES.Property) {
        if (prop.key.type === tsEstree.AST_NODE_TYPES.Identifier && prop.value.type === tsEstree.AST_NODE_TYPES.Identifier) {
          pairs.push({ key: prop.key.name, value: prop.value.name });
        } else if (prop.key.type === tsEstree.AST_NODE_TYPES.Identifier && prop.value.type === tsEstree.AST_NODE_TYPES.MemberExpression && prop.value.object.type === tsEstree.AST_NODE_TYPES.Identifier && prop.value.property.type === tsEstree.AST_NODE_TYPES.Identifier) {
          pairs.push({
            key: prop.key.name,
            value: `${prop.value.object.name}.${prop.value.property.name}`
          });
        }
      }
    }
    return pairs;
  } else if (node.argument.type === tsEstree.AST_NODE_TYPES.Identifier) {
    return pairs;
  } else {
    return pairs;
  }
}
function resolveIdentifier(localVariables, returnVariable) {
  if (returnVariable.length === 0) {
    const variable = localVariables.find((pair) => pair.key === "t");
    if (variable && variable.value) {
      return { type: "identifier", key: variable.value };
    }
    const identifierOnly = localVariables.find((pair) => pair.value === null);
    if (identifierOnly && identifierOnly.key) {
      return { type: "object", key: identifierOnly.key, style: "script-setup" };
    }
    return null;
  } else {
    const variable = localVariables.find((pair) => pair.key === "t");
    if (variable && variable.value) {
      const returnVar = returnVariable.find((pair) => pair.value === variable.value);
      if (returnVar && returnVar.key) {
        return { type: "identifier", key: returnVar.key };
      }
    }
    const identifierOnly = localVariables.find((pair) => pair.value === null);
    if (identifierOnly && identifierOnly.key) {
      const targetKey = identifierOnly.key;
      const returnVar = returnVariable.find((pair) => pair.value?.startsWith(targetKey));
      if (returnVar && returnVar.key) {
        return { type: "object", key: returnVar.key, style: "setup-hook" };
      }
    }
    return null;
  }
}

function matchSafelistPattern(keyPath, pattern) {
  const regexStr = pattern.replace(/\./g, "\\.").replace(/\*\*/g, "{{GLOBSTAR}}").replace(/\*/g, "[^.]*").replace(/\{\{GLOBSTAR\}\}/g, ".*");
  return new RegExp(`^${regexStr}$`).test(keyPath);
}
function createUsedKeysCollector(options) {
  const usedKeys = /* @__PURE__ */ new Set();
  const safelistPatterns = options.safelist || [];
  const dynamicKeyStrategy = options.dynamicKeyStrategy || "keep-all";
  const removedKeys = /* @__PURE__ */ new Map();
  let dynamicKeysDetected = false;
  return {
    get usedKeys() {
      return usedKeys;
    },
    get dynamicKeysDetected() {
      return dynamicKeysDetected;
    },
    set dynamicKeysDetected(val) {
      dynamicKeysDetected = val;
    },
    safelistPatterns,
    removedKeys,
    addKey(key) {
      usedKeys.add(key);
    },
    markDynamic() {
      dynamicKeysDetected = true;
    },
    shouldKeepKey(keyPath) {
      if (dynamicKeysDetected && dynamicKeyStrategy === "keep-all") {
        return true;
      }
      if (safelistPatterns.some((pattern) => matchSafelistPattern(keyPath, pattern))) {
        return true;
      }
      if (usedKeys.has(keyPath)) {
        return true;
      }
      for (const key of usedKeys) {
        if (key.startsWith(keyPath + ".")) {
          return true;
        }
      }
      return false;
    },
    reportRemoved(filename, keyPath) {
      const existing = removedKeys.get(filename);
      if (existing) {
        existing.push(keyPath);
      } else {
        removedKeys.set(filename, [keyPath]);
      }
    },
    getDiagnostics() {
      let totalRemoved = 0;
      for (const keys of removedKeys.values()) {
        totalRemoved += keys.length;
      }
      return { totalRemoved, byFile: removedKeys };
    }
  };
}

const I18N_FUNCTIONS = /* @__PURE__ */ new Set(["t", "$t", "tc", "$tc", "te", "$te", "d", "$d", "n", "$n"]);
const TEMPLATE_T_REGEX = /\$?t\s*\(\s*['"]([^'"]+)['"]/g;
const VT_DIRECTIVE_STRING_REGEX = /v-t\s*=\s*"'([^']+)'"/g;
const VT_DIRECTIVE_PATH_REGEX = /v-t\s*=\s*"\{[^}]*path\s*:\s*'([^']+)'/g;
const TEMPLATE_DYNAMIC_T_REGEX = /\$?t\s*\(\s*[a-zA-Z_$]/g;
async function extractKeysFromScript(source) {
  const keys = [];
  let hasDynamic = false;
  let tsEstree;
  try {
    tsEstree = await import('@typescript-eslint/typescript-estree');
  } catch {
    return extractKeysFromScriptRegex(source);
  }
  try {
    const ast = tsEstree.parse(source, {
      range: true,
      jsx: true,
      allowInvalidAST: true,
      suppressDeprecatedPropertyWarnings: true
    });
    tsEstree.simpleTraverse(ast, {
      enter(node) {
        if (node.type !== tsEstree.AST_NODE_TYPES.CallExpression) {
          return;
        }
        const calleeName = getCalleeName(node, tsEstree.AST_NODE_TYPES);
        if (!calleeName || !I18N_FUNCTIONS.has(calleeName)) {
          return;
        }
        const firstArg = node.arguments[0];
        if (!firstArg) {
          return;
        }
        if (firstArg.type === tsEstree.AST_NODE_TYPES.Literal && typeof firstArg.value === "string") {
          keys.push(firstArg.value);
        } else if (firstArg.type === tsEstree.AST_NODE_TYPES.TemplateLiteral && firstArg.expressions.length === 0 && firstArg.quasis.length === 1) {
          const value = firstArg.quasis[0].value.cooked;
          if (value) {
            keys.push(value);
          }
        } else {
          hasDynamic = true;
        }
      }
    });
  } catch {
    return extractKeysFromScriptRegex(source);
  }
  return { keys, hasDynamic };
}
function getCalleeName(node, AST_NODE_TYPES) {
  const callee = node.callee;
  if (callee.type === AST_NODE_TYPES.Identifier) {
    return callee.name;
  }
  if (callee.type === AST_NODE_TYPES.MemberExpression && callee.property.type === AST_NODE_TYPES.Identifier) {
    return callee.property.name;
  }
  return null;
}
function extractKeysFromScriptRegex(source) {
  const keys = [];
  let match;
  const regex = /\b(?:\$?t|tc|\$tc|te|\$te|d|\$d|n|\$n)\s*\(\s*['"]([^'"]+)['"]/g;
  while ((match = regex.exec(source)) !== null) {
    keys.push(match[1]);
  }
  return { keys, hasDynamic: false };
}
function extractKeysFromTemplate(templateContent) {
  const keys = [];
  let hasDynamic = false;
  let match;
  TEMPLATE_T_REGEX.lastIndex = 0;
  VT_DIRECTIVE_STRING_REGEX.lastIndex = 0;
  VT_DIRECTIVE_PATH_REGEX.lastIndex = 0;
  TEMPLATE_DYNAMIC_T_REGEX.lastIndex = 0;
  while ((match = TEMPLATE_T_REGEX.exec(templateContent)) !== null) {
    keys.push(match[1]);
  }
  while ((match = VT_DIRECTIVE_STRING_REGEX.exec(templateContent)) !== null) {
    keys.push(match[1]);
  }
  while ((match = VT_DIRECTIVE_PATH_REGEX.exec(templateContent)) !== null) {
    keys.push(match[1]);
  }
  if (TEMPLATE_DYNAMIC_T_REGEX.test(templateContent)) {
    hasDynamic = true;
  }
  return { keys, hasDynamic };
}
async function analyzeVueSFC(content) {
  const keys = [];
  let hasDynamic = false;
  let parse;
  try {
    const compilerSfc = await import('vue/compiler-sfc');
    parse = compilerSfc.parse;
  } catch {
    const templateResult = extractKeysFromTemplate(content);
    const scriptResult = await extractKeysFromScript(content);
    return {
      keys: [...templateResult.keys, ...scriptResult.keys],
      hasDynamic: templateResult.hasDynamic || scriptResult.hasDynamic
    };
  }
  const { descriptor } = parse(content);
  if (descriptor.template?.content) {
    const templateResult = extractKeysFromTemplate(descriptor.template.content);
    keys.push(...templateResult.keys);
    if (templateResult.hasDynamic) {
      hasDynamic = true;
    }
  }
  const scriptContent = descriptor.scriptSetup?.content || descriptor.script?.content;
  if (scriptContent) {
    const scriptResult = await extractKeysFromScript(scriptContent);
    keys.push(...scriptResult.keys);
    if (scriptResult.hasDynamic) {
      hasDynamic = true;
    }
  }
  return { keys, hasDynamic };
}
async function analyzeFile(content, filePath, collector) {
  let result;
  if (filePath.endsWith(".vue")) {
    result = await analyzeVueSFC(content);
  } else {
    result = await extractKeysFromScript(content);
  }
  for (const key of result.keys) {
    collector.addKey(key);
  }
  if (result.hasDynamic) {
    collector.markDynamic();
  }
}

const debug$1 = createDebug(resolveNamespace("tree-shaking"));
function treeShakingPlugin(resolvedOptions, collector) {
  let projectRoot = "";
  return {
    name: resolveNamespace("tree-shaking"),
    enforce: "pre",
    vite: {
      configResolved(config) {
        projectRoot = config.root;
      }
    },
    webpack(compiler) {
      projectRoot = compiler.options.context || process.cwd();
    },
    async buildStart() {
      const treeShaking = resolvedOptions.treeShaking;
      const patterns = treeShaking?.scanPatterns || [`${projectRoot}/src/**/*.{vue,ts,js,tsx,jsx}`];
      debug$1("scanning patterns:", patterns);
      const files = await fg(patterns, {
        ignore: ["**/node_modules/**"],
        absolute: true
      });
      debug$1(`found ${files.length} source files to scan`);
      for (const file of files) {
        try {
          const content = await promises.readFile(file, "utf-8");
          await analyzeFile(content, file, collector);
        } catch (err) {
          debug$1(`failed to analyze file: ${file}`, err);
        }
      }
      debug$1(
        `scan complete: ${collector.usedKeys.size} used keys found, dynamic: ${collector.dynamicKeysDetected}`
      );
      if (collector.dynamicKeysDetected) {
        const strategy = treeShaking?.dynamicKeyStrategy || "keep-all";
        if (strategy === "keep-all") {
          warn(
            "Tree-shaking: dynamic key usage detected. All keys will be preserved (dynamicKeyStrategy: keep-all)."
          );
        } else {
          warn(
            "Tree-shaking: dynamic key usage detected. Unused keys will still be removed (dynamicKeyStrategy: ignore)."
          );
        }
      }
    },
    buildEnd() {
      const diagnostics = collector.getDiagnostics();
      if (diagnostics.totalRemoved > 0) {
        debug$1(`tree-shaking: removed ${diagnostics.totalRemoved} unused message keys`);
        for (const [file, keys] of diagnostics.byFile) {
          debug$1(`  ${file}: removed ${keys.length} keys (${keys.join(", ")})`);
        }
      } else {
        debug$1("tree-shaking: no keys removed");
      }
    }
  };
}

const debug = createDebug(resolveNamespace("root"));
const unpluginFactory = (options = {}, meta) => {
  debug("meta framework", meta.framework);
  if (!["vite", "webpack"].includes(meta.framework)) {
    raiseError(`This plugin is supported 'vite' and 'webpack' only`);
  }
  debug("plugin options (resolving):", options);
  const resolvedOptions = resolveOptions(options);
  debug("plugin options (resolved):", resolvedOptions);
  const collector = resolvedOptions.treeShaking ? createUsedKeysCollector(resolvedOptions.treeShaking) : null;
  const plugins = [];
  if (resolvedOptions.treeShaking && collector) {
    plugins.push(treeShakingPlugin(resolvedOptions, collector));
  }
  plugins.push(resourcePlugin(resolvedOptions, meta, collector));
  if (resolvedOptions.optimizeTranslationDirective) {
    if (meta.framework === "webpack") {
      raiseError(
        `The 'optimizeTranslationDirective' option still is not supported for webpack.
We are waiting for your Pull Request \u{1F642}.`
      );
    }
    plugins.push(directivePlugin(resolvedOptions));
  }
  return plugins;
};
const unplugin = /* @__PURE__ */ createUnplugin(unpluginFactory);

export { unplugin as default, unplugin, unpluginFactory };
