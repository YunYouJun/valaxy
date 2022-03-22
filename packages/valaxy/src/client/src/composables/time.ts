import dayjs from 'dayjs'

export function formatDate(date: string | number | Date) {
  const today = dayjs(date)
  return today.format('YYYY-MM-DD')
}
