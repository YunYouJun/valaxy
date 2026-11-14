---
title: Schema.org And OPG for SEO
categories:
  - third
top: 0
---

::: tip
[OpenGraph or Scheme.org](https://stackoverflow.com/questions/6402528/opengraph-or-schema-org)

- [The Open Graph protocol](https://ogp.me/)
- [Schema.org](https://schema.org/)
:::

By adopting the [Schema.org](https://schema.org/) standard, search engines can better understand your website content, thereby improving your website's ranking in search results.

Implemented based on [@unhead/schema-org](https://unhead.unjs.io/docs/typescript/schema-org/guides/get-started/overview).

- Identity uses Person (Personal Website or Blog)

> [Person | @unhead/schema.org](https://unhead.unjs.io/docs/typescript/schema-org/guides/recipes/identity#person)

The person URL is `author.link` when that is an absolute URL. Otherwise it is the site `url`. If set, `author.email` is public in RSS and in the structured data for the author. Valaxy does not supply a default email.

`WebSite.name` is the site title. `WebPage.url` is the current page. A post's Open Graph type is `article`; other pages use `website`. Share text uses frontmatter `description`, or a plain excerpt when that field is empty. See [Descriptions and share cards](/guide/post#share).

## Validators

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
