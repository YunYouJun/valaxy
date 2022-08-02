export type AtWillNumber = string | number

export const atWillToUnit = (value: AtWillNumber, unit = 'px') => {
  return typeof value === 'string' && /\D/g.test(value) ? value : value + unit
}
