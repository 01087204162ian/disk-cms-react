/**
 * KJ 대리운전 공통 상수
 * 모든 kj 관련 파일에서 공통으로 사용하는 상수 정의
 */

// 보험회사 옵션
export const INSURER_OPTIONS = [
  { value: 0, label: '=선택=' },
  { value: 1, label: '흥국' },
  { value: 2, label: 'DB' },
  { value: 3, label: 'KB' },
  { value: 4, label: '현대' },
  { value: 5, label: '롯데' },
  { value: 6, label: '하나' },
  { value: 7, label: '한화' },
  { value: 8, label: '삼성' },
  { value: 9, label: '메리츠' },
]

// 증권성격 옵션
export const GITA_OPTIONS = [
  { value: 1, label: '일반' },
  { value: 2, label: '탁송' },
  { value: 3, label: '일반/렌트' },
  { value: 4, label: '탁송/렌트' },
  { value: 5, label: '확대탁송' },
]

// 결제방식 옵션
export const DIVI_OPTIONS = [
  { value: 1, label: '정상납' },
  { value: 2, label: '월납' },
]

// 할인할증 요율 옵션
export const RATE_OPTIONS = [
  { value: '-1', label: '선택' },
  { value: '1', label: '1', rate: 1.000, name: '기본' },
  { value: '2', label: '0.9', rate: 0.900, name: '할인' },
  { value: '3', label: '0.925', rate: 0.925, name: '3년간 사고건수 0건 1년간 사고건수 0건 무사고 1년 이상' },
  { value: '4', label: '0.898', rate: 0.898, name: '3년간 사고건수 0건 1년간 사고건수 0건 무사고 2년 이상' },
  { value: '5', label: '0.889', rate: 0.889, name: '3년간 사고건수 0건 1년간 사고건수 0건 무사고 3년 이상' },
  { value: '6', label: '1.074', rate: 1.074, name: '3년간 사고건수 1건 1년간 사고건수 0건' },
  { value: '7', label: '1.085', rate: 1.085, name: '3년간 사고건수 1건 1년간 사고건수 1' },
  { value: '8', label: '1.242', rate: 1.242, name: '3년간 사고건수 2건 1년간 사고건수 0' },
  { value: '9', label: '1.253', rate: 1.253, name: '3년간 사고건수 2건 1년간 사고건수 1' },
  { value: '10', label: '1.314', rate: 1.314, name: '3년간 사고건수 2건 1년간 사고건수 2' },
  { value: '11', label: '1.428', rate: 1.428, name: '3년간 사고건수 3건이상 1년간 사고건수 0' },
  { value: '12', label: '1.435', rate: 1.435, name: '3년간 사고건수 3건이상 1년간 사고건수 1' },
  { value: '13', label: '1.447', rate: 1.447, name: '3년간 사고건수 3건이상 1년간 사고건수 2' },
  { value: '14', label: '1.459', rate: 1.459, name: '3년간 사고건수 3건이상 1년간 사고건수 3건이상' },
]

// 매핑 객체
export const INSURER_MAP: Record<number, string> = {
  1: '흥국',
  2: 'DB',
  3: 'KB',
  4: '현대',
  5: '롯데',
  6: '하나',
  7: '한화',
  8: '삼성',
  9: '메리츠',
}

export const GITA_MAP: Record<number, string> = {
  1: '일반',
  2: '탁송',
  3: '일반/렌트',
  4: '탁송/렌트',
  5: '확대탁송',
}

export const RATE_MAP: Record<number, number> = {
  1: 1.000,
  2: 0.900,
  3: 0.925,
  4: 0.898,
  5: 0.889,
  6: 1.074,
  7: 1.085,
  8: 1.242,
  9: 1.253,
  10: 1.314,
  11: 1.428,
  12: 1.435,
  13: 1.447,
  14: 1.459,
}

export const RATE_NAME_MAP: Record<number, string> = {
  1: '기본',
  2: '할인',
  3: '3년간 사고건수 0건 1년간 사고건수 0건 무사고 1년 이상',
  4: '3년간 사고건수 0건 1년간 사고건수 0건 무사고 2년 이상',
  5: '3년간 사고건수 0건 1년간 사고건수 0건 무사고 3년 이상',
  6: '3년간 사고건수 1건 1년간 사고건수 0건',
  7: '3년간 사고건수 1건 1년간 사고건수 1',
  8: '3년간 사고건수 2건 1년간 사고건수 0',
  9: '3년간 사고건수 2건 1년간 사고건수 1',
  10: '3년간 사고건수 2건 1년간 사고건수 2',
  11: '3년간 사고건수 3건이상 1년간 사고건수 0',
  12: '3년간 사고건수 3건이상 1년간 사고건수 1',
  13: '3년간 사고건수 3건이상 1년간 사고건수 2',
  14: '3년간 사고건수 3건이상 1년간 사고건수 3건이상',
}

// 유틸리티 함수
export const getInsurerName = (code: number | string): string => {
  return INSURER_MAP[Number(code)] || '=선택='
}

export const getGitaName = (code: number | string): string => {
  return GITA_MAP[Number(code)] || '알 수 없음'
}

export const getRateValue = (code: number | string): number => {
  return RATE_MAP[Number(code)] || 1.000
}

export const getRateName = (code: number | string): string => {
  return RATE_NAME_MAP[Number(code)] || '기본'
}

// 상태(push) → 라벨
export const mapPushLabel = (push: number | string): string => {
  const v = Number(push)
  switch (v) {
    case 1: return '청약중'
    case 2: return '해지'
    case 4: return '정상'
    case 5: return '거절'
    case 6: return '취소'
    case 7: return '실효'
    default: return '기타'
  }
}

// 사고(sago) → 텍스트
export const mapSagoLabel = (sago: number | string): string => {
  const v = Number(sago)
  switch (v) {
    case 1: return '사고없음'
    case 2: return '사고있음'
    default: return ''
  }
}

// 핸드폰 번호 하이픈 추가 함수 (010-1234-5678 형식)
export const addPhoneHyphen = (phone: string): string => {
  const cleaned = phone.replace(/-/g, '')
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
  }
  return cleaned
}

// 핸드폰 번호 하이픈 제거 함수
export const removePhoneHyphen = (phone: string): string => {
  return phone.replace(/-/g, '')
}
