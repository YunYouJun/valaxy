export const dateExamples: {
  date: string
  format: string
  timezone: string
  keepLocalTime?: boolean
  expected: string
}[] = [
  // simple
  {
    date: '2023-07-19',
    format: 'YYYYMMDD',
    timezone: 'Asia/Shanghai',
    expected: '20230719',
  },
  {
    date: '2021-03-01T12:00:00',
    format: 'YYYYMMDDHHmmss',
    timezone: 'Asia/Shanghai',
    expected: '20210301120000',
  },
  {
    date: '2021-12-03T01:07:00',
    format: 'YYYY/MM/DD HH:mm',
    timezone: 'Asia/Shanghai',
    expected: '2021/12/03 01:07',
  },

  // timezone
  {
    date: '2004-06-16 00:00:00',
    format: 'YYYY-MM-DD HH:mm:ssZ',
    timezone: 'Asia/Shanghai',
    expected: '2004-06-16 00:00:00+08:00',
  },
  {
    date: '2004-06-16 00:00:00',
    format: 'YYYY-MM-DD HH:mm:ssZ',
    timezone: 'Asia/Shanghai',
    keepLocalTime: true,
    expected: '2004-06-16 00:00:00+08:00',
  },

  {
    date: '2004-06-16T00:00:00Z',
    format: 'YYYY-MM-DD HH:mm:ssZ',
    timezone: 'Asia/Shanghai',
    expected: '2004-06-16 08:00:00+08:00',
  },
  {
    date: '2004-06-16T00:00:00Z',
    format: 'YYYY-MM-DD HH:mm:ssZ',
    timezone: 'Asia/Shanghai',
    keepLocalTime: true,
    expected: '2004-06-16 08:00:00+08:00',
  },

  {
    date: '2004-06-16 00:00:00',
    format: 'YYYY-MM-DD HH:mm:ssZ',
    timezone: 'Europe/Berlin',
    expected: '2004-06-15 18:00:00+02:00',
  },
  {
    date: '2004-06-16 00:00:00',
    format: 'YYYY-MM-DD HH:mm:ssZ',
    timezone: 'Europe/Berlin',
    keepLocalTime: true,
    expected: '2004-06-16 00:00:00+02:00',
  },

  {
    date: '2004-06-16T00:00:00',
    format: 'YYYY-MM-DD HH:mm:ssZ',
    timezone: 'Europe/Berlin',
    expected: '2004-06-15 18:00:00+02:00',
  },
  {
    date: '2004-06-16T00:00:00',
    format: 'YYYY-MM-DD HH:mm:ssZ',
    timezone: 'Europe/Berlin',
    keepLocalTime: true,
    expected: '2004-06-16 00:00:00+02:00',
  },
]
