export const dateExamples: {
  date: string
  template: string
  timezone?: string
  keepLocalTime?: boolean
  expected: string
}[] = [
  // simple
  {
    date: '2023-07-19',
    template: 'YYYYMMDD',
    timezone: 'Asia/Shanghai',
    keepLocalTime: true,
    expected: '20230719',
  },
  // 只有 T 没有 Z 代表使用本地时间
  {
    date: '2021-03-01T12:00:00',
    template: 'YYYYMMDDHHmmss',
    timezone: 'Asia/Shanghai',
    keepLocalTime: true,
    expected: '20210301120000',
  },
  {
    date: '2021-12-03T01:07:00',
    template: 'YYYY/MM/DD HH:mm',
    timezone: 'Asia/Shanghai',
    keepLocalTime: true,
    expected: '2021/12/03 01:07',
  },

  // timezone
  {
    date: '2004-06-16 00:00:00',
    template: 'YYYY-MM-DD HH:mm:ssZ',
    timezone: 'Asia/Shanghai',
    expected: '2004-06-16 00:00:00+08:00',
  },
  {
    date: '2004-06-16 00:00:00',
    template: 'YYYY-MM-DD HH:mm:ssZ',
    timezone: 'Asia/Shanghai',
    keepLocalTime: true,
    expected: '2004-06-16 00:00:00+08:00',
  },

  // 默认时区是 Asia/Shanghai，允许转换时区
  {
    date: '2004-06-16 00:00:00',
    template: 'YYYY-MM-DDTHH:mm:ssZ',
    timezone: 'Asia/Shanghai',
    expected: '2004-06-16T00:00:00+08:00',
  },
  {
    date: '2004-06-16 00:00:00',
    template: 'YYYY-MM-DDTHH:mm:ssZ',
    timezone: 'Europe/Berlin',
    expected: '2004-06-15T18:00:00+02:00',
  },

  // 使用 Z 时，不再使用偏移
  {
    date: '2004-06-16T00:00:00Z',
    template: 'YYYY-MM-DDTHH:mm:ssZ',
    timezone: 'Asia/Shanghai',
    expected: '2004-06-16T08:00:00+08:00',
  },
  {
    date: '2004-06-16T00:00:00Z',
    template: 'YYYY-MM-DDTHH:mm:ssZ',
    timezone: 'Europe/Berlin',
    expected: '2004-06-16T02:00:00+02:00',
  },
  {
    date: '2004-06-16T00:00:00+08:00',
    template: 'YYYY-MM-DDTHH:mm:ssZ',
    timezone: 'Asia/Shanghai',
    expected: '2004-06-16T00:00:00+08:00',
  },
  {
    date: '2004-06-16T00:00:00+08:00',
    template: 'YYYY-MM-DDTHH:mm:ssZ',
    timezone: 'Europe/Berlin',
    expected: '2004-06-15T18:00:00+02:00',
  },
]
