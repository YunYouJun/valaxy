---
layout: post
title: 代码块图标测试
date: 2025-11-02 13:34:07
---

## 内置图标

使用方式参考[添加代码块标题与图标](https://valaxy.site/guide/markdown#%E6%B7%BB%E5%8A%A0%E4%BB%A3%E7%A0%81%E5%9D%97%E6%A0%87%E9%A2%98%E4%B8%8E%E5%9B%BE%E6%A0%87)

`vitepress-plugin-group-icons`的内置图标

```typescript [builtin.ts]
const builtinIcons = {
  'pnpm': 'vscode-icons:file-type-light-pnpm',
  'npm': 'vscode-icons:file-type-npm',
  'yarn': 'vscode-icons:file-type-yarn',
  'bun': 'vscode-icons:file-type-bun',
  'deno': 'vscode-icons:file-type-deno',
  'vue': 'vscode-icons:file-type-vue',
  'svelte': 'vscode-icons:file-type-svelte',
  'angular': 'vscode-icons:file-type-angular',
  'react': 'vscode-icons:file-type-reactjs',
  'next': 'vscode-icons:file-type-light-next',
  'nuxt': 'vscode-icons:file-type-nuxt',
  'solid': 'logos:solidjs-icon',
  'astro': 'vscode-icons:file-type-light-astro',
  'qwik': 'logos:qwik-icon',
  'ember': 'vscode-icons:file-type-ember',
  'rollup': 'vscode-icons:file-type-rollup',
  'webpack': 'vscode-icons:file-type-webpack',
  'vite': 'vscode-icons:file-type-vite',
  'esbuild': 'vscode-icons:file-type-esbuild',
  'package.json': 'vscode-icons:file-type-node',
  'tsconfig.json': 'vscode-icons:file-type-tsconfig',
  '.npmrc': 'vscode-icons:file-type-npm',
  '.editorconfig': 'vscode-icons:file-type-editorconfig',
  '.eslintrc': 'vscode-icons:file-type-eslint',
  '.eslintignore': 'vscode-icons:file-type-eslint',
  'eslint.config': 'vscode-icons:file-type-eslint',
  '.gitignore': 'vscode-icons:file-type-git',
  '.gitattributes': 'vscode-icons:file-type-git',
  '.env': 'vscode-icons:file-type-dotenv',
  '.env.example': 'vscode-icons:file-type-dotenv',
  '.vscode': 'vscode-icons:file-type-vscode',
  'tailwind.config': 'vscode-icons:file-type-tailwind',
  'uno.config': 'vscode-icons:file-type-unocss',
  'unocss.config': 'vscode-icons:file-type-unocss',
  '.oxlintrc': 'vscode-icons:file-type-oxlint',
  'vue.config': 'vscode-icons:file-type-vueconfig',
  '.mts': 'vscode-icons:file-type-typescript',
  '.cts': 'vscode-icons:file-type-typescript',
  '.ts': 'vscode-icons:file-type-typescript',
  '.tsx': 'vscode-icons:file-type-typescript',
  '.mjs': 'vscode-icons:file-type-js',
  '.cjs': 'vscode-icons:file-type-js',
  '.json': 'vscode-icons:file-type-json',
  '.js': 'vscode-icons:file-type-js',
  '.jsx': 'vscode-icons:file-type-js',
  '.md': 'vscode-icons:file-type-markdown',
  '.py': 'vscode-icons:file-type-python',
  '.ico': 'vscode-icons:file-type-favicon',
  '.html': 'vscode-icons:file-type-html',
  '.css': 'vscode-icons:file-type-css',
  '.scss': 'vscode-icons:file-type-scss',
  '.yml': 'vscode-icons:file-type-light-yaml',
  '.yaml': 'vscode-icons:file-type-light-yaml',
  '.php': 'vscode-icons:file-type-php',
  '.gjs': 'vscode-icons:file-type-glimmer',
  '.gts': 'vscode-icons:file-type-glimmer'
}
```

::: code-group
```sh [pnpm]
pnpm install
```
```sh [npm]
npm install
```
:::

## Valaxy内置图标

```typescript [preset.ts]
const builtinCustomIcon = {
  nodejs: 'vscode-icons:file-type-node',
  playwright: 'vscode-icons:file-type-playwright',
  typedoc: 'vscode-icons:file-type-typedoc',
  eslint: 'vscode-icons:file-type-eslint',
}
```

```typescript [valaxy]
export default defineValaxyConfig<ThemeConfig>({
  // ...
})
```

## 自定义图标

部分代码块未配置图标，需手动添加图标，修改valaxy配置文件。

参考`vitepress-plugin-group-icons`配置[Custom Icons](https://vp.yuy1n.io/features.html#custom-icons)

```typescript [valaxy.config.ts]
export default defineValaxyConfig<ThemeConfig>({
  // ...省略无关代码
  groupIcons: {
    customIcon: {
      // valaxy: 'https://valaxy.site/favicon.svg',
      'valaxy': localIconLoader(import.meta.url, '../../docs/public/favicon.svg'),
      'valaxy.config': localIconLoader(import.meta.url, '../../docs/public/favicon.svg'),
      'dockerfile': 'vscode-icons:file-type-docker',
      'java': 'vscode-icons:file-type-java',
      'xml': 'vscode-icons:file-type-xml',
      'yml': 'vscode-icons:file-type-yaml',
      'ahk': 'vscode-icons:file-type-autohotkey',
    },
  },
})
```

::: code-group
```java [HelloWorld.java]
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println('Hello, World!');
    }
}
```
```xml [pom.xml]
<?xml version='1.0' encoding='UTF-8'?>
<project xmlns='http://maven.apache.org/POM/4.0.0'
         xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'
         xsi:schemaLocation='http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd'>
    <modelVersion>4.0.0</modelVersion>

    <groupId>cn.montaro</groupId>
    <artifactId>font-secret</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <!-- https://mvnrepository.com/artifact/org.apache.pdfbox/pdfbox -->
        <dependency>
            <groupId>org.apache.pdfbox</groupId>
            <artifactId>pdfbox</artifactId>
            <version>3.0.2</version>
        </dependency>

        <!-- https://mvnrepository.com/artifact/cn.hutool/hutool-all -->
        <dependency>
            <groupId>cn.hutool</groupId>
            <artifactId>hutool-all</artifactId>
            <version>5.8.27</version>
        </dependency>
    </dependencies>

</project>
```
```yml [application.yml]
spring:
  profiles:
    active: dev
server:
  port: 11451
```
```dockerfile [Sample.dockerfile]
FROM ubuntu

ENV PATH /opt/conda/bin:$PATH
```

```ahk [tools.ahk]
; InputTip

/**
 * 防抖函数
 * @param {Func} fn 要执行的函数
 * @param {Number} delay 延迟时间(ms)
 * @returns {Func} 函数
 */
debounce(fn, delay := 1000) {
    params := []
    timerFunc := (*) => fn.Call(params*)

    return (args*) => (
        params := args,
        SetTimer(timerFunc, 0),
        SetTimer(timerFunc, -delay)
    )
}
```
:::
