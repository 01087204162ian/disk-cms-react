export const dayNamesShort = ['일', '월', '화', '수', '목', '금', '토'] as const

export function pad2(n: number) {
  return String(n).padStart(2, '0')
}

export function formatYmd(year: number, month: number, day: number) {
  return `${year}-${pad2(month)}-${pad2(day)}`
}

