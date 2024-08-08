---
title: Date test
date: 2023-07-19 18:55:53
# updated: 2023-07-19 18:55:53
toc: false
---

<FormatDate format="MMM d" />

<FormatDate format="MMM d, yyyy" />

<FormatDate date="2023-07-19T00:00:00+08:00" format="d MMM yyyy" />

<FormatDate date="1847-05-16T00:01:15.000Z" format="yyyy-MM-dd HH:mm:ss" />

<FormatDate format="EEEE, MMMM d, yyyy" />

<FormatDate format="EEEE, d MMMM yyyy" />

<FormatDate format="yyyyMMdd" />

<FormatDate format="yy/MM/dd" />

<FormatDate format="HH:mm:ss" />

<FormatDate format="h:mm a" />

<FormatDate format="hh 'o''clock' a, zzzz" />

<FormatDate format="K:mm a, z" />

<FormatDate date="2023-07-19T00:00:00+08:00" format="EEEE, d MMMM yyyy" />

<FormatDate date="2023-07-19T00:00:00+08:00" format="yyyyMMdd" />

<FormatDate :date="1722589089" format="yyyyMMdd" />

<FormatDate data="2021.3.1 12:00" format="yyyyMMddHHmmss" />

<FormatDate format="yyMMdd" />

<FormatDate format="yyyy/MM/dd" />

<FormatDate format="yyyy/MM/dd HH:mm" />

<FormatDate format="X" />

<FormatDate format="x" />

<FormatDate format="yyyy-MM-dd'T'HH:mm:ssXXX" />

<FormatDate format="yyyy-MM-dd'T'HH:mm:ss.SSSXXX" />

<FormatDate :date="1722589089" format="T" />

<FormatDate format="R" />

<FormatDate format="do" />

<FormatDate date="2004-06-16T00:00:00+08:00" format="yyyy-MM-dd HH:mm:ssxxx zzz" :options="{ timeZone: 'Europe/Berlin'  }" />

<FormatDate date="2004-06-16 00:00:00" format="yyyy-MM-dd HH:mm:ssxxx zzz" :options="{ timeZone: 'Europe/Berlin'  }" />

<FormatDate date="2004-06-16 00:00:00" format="yyyy-MM-dd HH:mm:ssxxx zzz" :options="{ timeZone: 'Asia/Shanghai'  }" />

<FormatDate date="2004-06-16T00:00:00Z" format="yyyy-MM-dd HH:mm:ssxxx zzz" :options="{ timeZone: 'Europe/Paris'  }" />

<FormatDate date="2004-06-16 00:00:00" format="yyyy-MM-dd HH:mm:ssxxx zzz" :options="{ timeZone: 'Asia/Bangkok'  }" />

<FormatDate date="2004-06-16 00:00:00" format="yyyy-MM-dd HH:mm:ssxxx zzz" timezone="Europe/Paris" />

<FormatDate date="2004-06-16 00:00:00" format="yyyy-MM-dd HH:mm:ssxxx zzz" timezone="Europe/Paris" :options="{ timeZone: 'Europe/Paris'  }" />

<FormatDate date="2004-06-16T00:00:00Z" format="yyyy-MM-dd HH:mm:ssxxx zzz" timezone="Europe/Paris" />
