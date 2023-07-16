import process from 'node:process'

export const userRoot = process.cwd()

export const defaultPostTemplate = `---
layout: <%=layout%>
title: <%=title%>
date: <%=date%>
---
`
