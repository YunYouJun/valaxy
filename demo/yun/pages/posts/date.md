---
title: Date test
date: 2023-07-19 18:55:53
# updated: 2023-07-19 18:55:53
toc: false
---

<TestFormatDate format="MMM d" />

<TestFormatDate format="MMM d, yyyy" />

<TestFormatDate date="2023-07-19T00:00:00+08:00" format="d MMM yyyy" />

<TestFormatDate date="1847-05-16T00:01:15.000Z" format="yyyy-MM-dd HH:mm:ss" />

<TestFormatDate format="EEEE, MMMM d, yyyy" />

<TestFormatDate format="EEEE, d MMMM yyyy" />

<TestFormatDate format="yyyyMMdd" />

<TestFormatDate format="yy/MM/dd" />

<TestFormatDate format="HH:mm:ss" />

<TestFormatDate format="h:mm a" />

<TestFormatDate format="hh 'o''clock' a, zzzz" />

<TestFormatDate format="K:mm a, z" />

<TestFormatDate date="2023-07-19T00:00:00+08:00" format="EEEE, d MMMM yyyy" />

<TestFormatDate id="text-time-format-1" date="2023-07-19T00:00:00+08:00" format="yyyyMMdd" timezone="Asia/Shanghai" />

<TestFormatDate :date="1722589089" format="yyyyMMdd" />

<TestFormatDate id="text-time-format-2" date="2021.3.1 12:00" format="yyyyMMddHHmmss" timezone="Asia/Shanghai" />

<TestFormatDate format="yyMMdd" />

<TestFormatDate date="2021/3/1 12:00" format="yyyy/MM/dd" />

<TestFormatDate id="text-time-format-3" date="2021-12-03 1:07:23" format="yyyy/MM/dd HH:mm" timezone="Asia/Shanghai" />

<TestFormatDate format="X" />

<TestFormatDate format="x" />

<TestFormatDate date="2023-07-19 10:55:53Z" format="yyyy-MM-dd'T'HH:mm:ssXXX" />

<TestFormatDate format="yyyy-MM-dd'T'HH:mm:ss.SSSXXX" />

<TestFormatDate :date="1722589089" format="T" />

<TestFormatDate format="R" />

<TestFormatDate format="do" />

<TestFormatDate id="text-time-zone-1" date="2004-06-16T00:00:00+08:00" format="yyyy-MM-dd HH:mm:ssxxx zzz" timezone="Europe/Berlin" :options="{ timeZone: 'Europe/Berlin'  }" />

<TestFormatDate id="text-time-zone-2" date="2004-06-16 00:00:00" format="yyyy-MM-dd HH:mm:ssxxx zzz" timezone="Asia/Shanghai" :options="{ timeZone: 'Europe/Berlin'  }" />

<TestFormatDate id="text-time-zone-3" date="2004-06-16 00:00:00" format="yyyy-MM-dd HH:mm:ssxxx zzz" timezone="Asia/Shanghai" :options="{ timeZone: 'Asia/Shanghai'  }" />

<TestFormatDate id="text-time-zone-4" date="2004-06-16T00:00:00Z" format="yyyy-MM-dd HH:mm:ssxxx zzz" timezone="Asia/Shanghai" :options="{ timeZone: 'Europe/Berlin'  }" />

<TestFormatDate id="text-time-zone-5" date="2004-06-16 00:00:00" format="yyyy-MM-dd HH:mm:ssxxx zzz" timezone="Asia/Shanghai" :options="{ timeZone: 'Asia/Bangkok'  }" />

<TestFormatDate id="text-time-zone-6" date="2004-06-16 00:00:00" format="yyyy-MM-dd HH:mm:ssxxx zzz" timezone="Europe/Berlin" :options="{ timeZone: 'Asia/Shanghai'  }" />

<TestFormatDate id="text-time-zone-7" date="2004-06-16 00:00:00" format="yyyy-MM-dd HH:mm:ssxxx zzz" timezone="Europe/Berlin" :options="{ timeZone: 'Europe/Berlin'  }" />

<TestFormatDate id="text-time-zone-8" date="2004-06-16T00:00:00Z" format="yyyy-MM-dd HH:mm:ssxxx zzz" timezone="Europe/Berlin" :options="{ timeZone: 'Asia/Shanghai'  }" />
