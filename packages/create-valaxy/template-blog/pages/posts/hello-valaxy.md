---
title: Hello, Valaxy!
coverComponent: HelloValaxyCover
date: 2022-04-01
updated: 2022-04-01
categories: Valaxy 笔记
tags:
  - valaxy
  - 笔记
top: 1
---

## Valaxy

Next Generation Static Blog Framework.

Write your first post!

## Vue in Markdown

Components in `components/` can be used directly in Markdown. This cover uses Vue and inline SVG without image assets. Click to light up the constellation; click again to pause:

<HelloValaxyCover subtitle="The same component, inside your story." />

## Usage

Edit `site.config.ts` for your site title, author, description, and production URL. Edit `valaxy.config.ts` for theme and framework options.

Add Markdown posts to `pages/posts/`, then run `pnpm build` to generate your site in `dist/`. Preview the result with `pnpm serve`.
