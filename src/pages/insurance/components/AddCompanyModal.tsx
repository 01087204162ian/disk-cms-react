import { useState, useEffect } from 'react'
import { Modal, useToastHelpers } from '../../../components'
import api from '../../../lib/api'
import {
  addPhoneHyphen,
  addBusinessNumberHyphen,
  addCorporateNumberHyphen,
} from '../constants'

interface AddCompanyModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (companyNum: number, companyName: string) => void
}

interface JuminCheckResult {
  checked: boolean
  isValid: boolean
}

export default function AddCompanyModal({
  isOpen,
  onClose,
  onSuccess,
}: AddCompanyModalProps) {
  const toast = useToastHelpers()
  const [saving, setSaving] = useState(false)
  
  // 입력 필드 상태
  const [jumin, setJumin] = useState('')
  const [company, setCompany] = useState('')
  const [pname, setPname] = useState('')
  const [hphone, setHphone] = useState('')
  const [cphone, setCphone] = useState('')
  const [cNumber, setCNumber] = useState('')
  const [lNumber, setLNumber] = useState('')
  
  // 주민번호 검증 결과 (13자리 숫자인지만 확인)
  const [juminCheckResult, setJuminCheckResult] = useState<JuminCheckResult>({
    checked: false,
    isValid: false,
  })

  // 모달이 닫힐 때 초기화
  useEffect(() => {
    if (!isOpen) {
      setJumin('')
      setCompany('')
      setPname('')
      setHphone('')
      setCphone('')
      setCNumber('')
      setLNumber('')
      setJuminCheckResult({
        checked: false,
        isValid: false,
      })
    }
  }, [isOpen])

  // 주민번호 포맷팅 (660327-1069017 형식)
  const formatJumin = (value: string): string => {
    const cleaned = value.replace(/[^0-9]/g, '')
    if (cleaned.length > 6) {
      return cleaned.substring(0, 6) + '-' + cleaned.substring(6, 13)
    }
    return cleaned
  }

  // 주민번호 입력 핸들러
  const handleJuminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const formatted = formatJumin(value)
    setJumin(formatted)
    
    // 검증 결과 초기화
    if (juminCheckResult.checked) {
      setJuminCheckResult({
        checked: false,
        isValid: false,
      })
    }
  }

  // 주민번호 검증 (엔터키) - 13자리 숫자인지만 확인
  const handleJuminKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    
    e.preventDefault()
    
    const juminValue = jumin.trim()
    const juminDigits = juminValue.replace(/[^0-9]/g, '')
    
    if (juminDigits.length !== 13) {
      toast.error('주민번호는 13자리 숫자여야 합니다. 예: 660327-1069017')
      setJuminCheckResult({
        checked: true,
        isValid: false,
      })
      return
    }

    // 13자리 숫자 확인 완료
    setJuminCheckResult({
      checked: true,
      isValid: true,
    })
    
    toast.success('주민번호 형식이 올바릅니다.')
  }

  // 핸드폰번호 포맷팅
  const handleHphoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setHphone(addPhoneHyphen(value))
  }

  // 전화번호 포맷팅
  const handleCphoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    let formatted = value
    if (value.length > 9) {
      // 02-1234-5678 형식 (2자리-4자리-4자리)
      formatted = value.substring(0, 2) + '-' + value.substring(2, 6) + '-' + value.substring(6, 10)
    } else if (value.length > 6) {
      formatted = value.substring(0, 2) + '-' + value.substring(2, 6) + '-' + value.substring(6)
    } else if (value.length > 2) {
      formatted = value.substring(0, 2) + '-' + value.substring(2)
    }
    setCphone(formatted)
  }

  // 사업자번호 포맷팅
  const handleCNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCNumber(addBusinessNumberHyphen(value))
  }

  // 법인번호 포맷팅
  const handleLNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLNumber(addCorporateNumberHyphen(value))
  }

  // 저장
  const handleSave = async () => {
    // 주민번호 13자리 확인
    const juminValue = jumin.trim()
    const juminDigits = juminValue.replace(/[^0-9]/g, '')
    
    if (juminDigits.length !== 13) {
      toast.error('주민번호는 13자리 숫자여야 합니다. (주민번호 입력 후 엔터키로 확인)')
      return
    }

    // 필수 입력 필드 검증
    const companyValue = company.trim()
    const pnameValue = pname.trim()
    const hphoneValue = hphone.trim()
    const cphoneValue = cphone.trim()
    const cNumberValue = cNumber.trim()
    const lNumberValue = lNumber.trim()

    if (!companyValue) {
      toast.error('대리운전회사명은 필수 입력 항목입니다.')
      return
    }

    if (!pnameValue) {
      toast.error('대표자는 필수 입력 항목입니다.')
      return
    }

    // 저장 확인
    if (!confirm('대리운전회사를 신규로 등록하시겠습니까?')) {
      return
    }

    try {
      setSaving(true)
      const response = await api.post('/api/insurance/kj-company/store', {
        jumin: juminValue,
        company: companyValue,
        Pname: pnameValue,
        hphone: hphoneValue,
        cphone: cphoneValue,
        cNumber: cNumberValue,
        lNumber: lNumberValue,
      })

      if (response.data.success) {
        toast.success('대리운전회사가 등록되었습니다.')
        
        // 저장된 회사 정보로 상세 모달 열기
        if (response.data.dNum && onSuccess) {
          onSuccess(response.data.dNum, companyValue)
        }
        
        onClose()
      } else {
        throw new Error(response.data.error || '저장에 실패했습니다.')
      }
    } catch (error: any) {
      console.error('신규 회사 저장 오류:', error)
      toast.error(error.response?.data?.error || error.message || '저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="대리운전회사 신규 등록"
      maxWidth="4xl"
    >
      <div className="space-y-4">
        {/* 기본 정보 테이블 */}
        <div>
          <h6 className="text-sm font-medium mb-2">기본 정보</h6>
          <div className="border border-border rounded">
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr>
                  <th className="bg-gray-200 px-3 py-2 text-center font-medium border border-border" style={{ width: '15%' }}>
                    주민번호 <span className="text-red-500">*</span>
                  </th>
                  <td className="px-3 py-2 border border-border" style={{ width: '20%' }}>
                    <input
                      type="text"
                      className="w-full px-2 py-1 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="660327-1069017"
                      maxLength={14}
                      value={jumin}
                      onChange={handleJuminChange}
                      onKeyPress={handleJuminKeyPress}
                    />
                    <small className="text-muted-foreground text-xs">
                      주민번호 입력 후 엔터키를 눌러주세요.
                    </small>
                  </td>
                  <th className="bg-gray-200 px-3 py-2 text-center font-medium border border-border" style={{ width: '15%' }}>
                    대리운전회사 <span className="text-red-500">*</span>
                  </th>
                  <td className="px-3 py-2 border border-border" style={{ width: '20%' }}>
                    <input
                      type="text"
                      className="w-full px-2 py-1 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="회사명"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </td>
                  <th className="bg-gray-200 px-3 py-2 text-center font-medium border border-border" style={{ width: '15%' }}>
                    성명 <span className="text-red-500">*</span>
                  </th>
                  <td className="px-3 py-2 border border-border" style={{ width: '15%' }}>
                    <input
                      type="text"
                      className="w-full px-2 py-1 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="대표자명"
                      value={pname}
                      onChange={(e) => setPname(e.target.value)}
                    />
                  </td>
                </tr>
                <tr>
                  <th className="bg-gray-200 px-3 py-2 text-center font-medium border border-border">
                    핸드폰번호
                  </th>
                  <td className="px-3 py-2 border border-border">
                    <input
                      type="text"
                      className="w-full px-2 py-1 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="010-1234-5678"
                      value={hphone}
                      onChange={handleHphoneChange}
                    />
                  </td>
                  <th className="bg-gray-200 px-3 py-2 text-center font-medium border border-border">
                    전화번호
                  </th>
                  <td className="px-3 py-2 border border-border">
                    <input
                      type="text"
                      className="w-full px-2 py-1 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="02-1234-5678"
                      value={cphone}
                      onChange={handleCphoneChange}
                    />
                  </td>
                  <th className="bg-gray-200 px-3 py-2 text-center font-medium border border-border">
                    사업자번호
                  </th>
                  <td className="px-3 py-2 border border-border">
                    <input
                      type="text"
                      className="w-full px-2 py-1 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="사업자번호"
                      value={cNumber}
                      onChange={handleCNumberChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th className="bg-gray-200 px-3 py-2 text-center font-medium border border-border">
                    법인번호
                  </th>
                  <td className="px-3 py-2 border border-border" colSpan={5}>
                    <input
                      type="text"
                      className="w-full px-2 py-1 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="법인번호"
                      value={lNumber}
                      onChange={handleLNumberChange}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 주민번호 검증 결과 */}
        {juminCheckResult.checked && (
          <div
            className={`p-3 rounded ${
              juminCheckResult.isValid
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <span className="text-sm">
              {juminCheckResult.isValid
                ? '주민번호 형식이 올바릅니다.'
                : '주민번호는 13자리 숫자여야 합니다.'}
            </span>
          </div>
        )}

        {/* 안내 메시지 */}
        <div className="bg-gray-50 p-3 rounded border border-gray-200">
          <span className="text-sm text-muted-foreground">
            저장 후 증권 정보를 입력할 수 있습니다.
          </span>
        </div>

        {/* 저장 버튼 */}
        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
