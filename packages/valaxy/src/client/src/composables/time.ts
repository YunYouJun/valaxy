import dayjs from 'dayjs'

export function formatDate(date: string | number | Date, template = 'YYYY-MM-DD') {
  const today = dayjs(date)
  return today.format(template)
}
