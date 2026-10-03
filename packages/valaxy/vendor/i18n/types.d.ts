type SFCLangFormat = 'json' | 'json5' | 'yml' | 'yaml';
type VueI18nModule = 'vue-i18n' | 'petite-vue-i18n';
interface TreeShakingOptions {
    /**
     * Message key patterns to always keep (never tree-shake).
     * Supports glob-like patterns (e.g., `'errors.*'`, `'validation.**'`).
     */
    safelist?: string[];
    /**
     * Strategy when dynamic key usage (e.g., `t(variable)`) is detected.
     * - `'keep-all'`: Disable tree-shaking and keep all keys (safe default).
     * - `'ignore'`: Continue tree-shaking despite dynamic keys (risky, use with `safelist`).
     * @default 'keep-all'
     */
    dynamicKeyStrategy?: 'keep-all' | 'ignore';
    /**
     * Glob patterns for source files to scan for used message keys.
     * Defaults to `${projectRoot}/src/**\/*.{vue,ts,js,tsx,jsx}` when not specified.
     */
    scanPatterns?: string[];
}
interface PluginOptions {
    include?: string | string[];
    exclude?: string | string[];
    onlyLocales?: string | string[];
    allowDynamic?: boolean;
    module?: VueI18nModule;
    dropMessageCompiler?: boolean;
    runtimeOnly?: boolean;
    compositionOnly?: boolean;
    ssr?: boolean;
    fullInstall?: boolean;
    forceStringify?: boolean;
    defaultSFCLang?: SFCLangFormat;
    globalSFCScope?: boolean;
    strictMessage?: boolean;
    escapeHtml?: boolean;
    optimizeTranslationDirective?: boolean | string | string[];
    transformI18nBlock?: (src: string | Buffer) => string;
    /**
     * Enable message key tree-shaking to remove unused locale message keys.
     * Only effective in production builds.
     * @default false
     */
    treeShaking?: boolean | TreeShakingOptions;
}

export type { PluginOptions, SFCLangFormat, TreeShakingOptions, VueI18nModule };
