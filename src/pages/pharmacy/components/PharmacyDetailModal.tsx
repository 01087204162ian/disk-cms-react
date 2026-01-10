import { useEffect, useState } from 'react'
import { CheckCircle, Upload } from 'lucide-react'
import { Modal, LoadingSpinner, useToastHelpers } from '../../../components'
import api from '../../../lib/api'
import { useAuthStore } from '../../../store/authStore'

interface PharmacyDetailModalProps {
  isOpen: boolean
  onClose: () => void
  pharmacyId: number | null
  onUpdate?: () => void
}

interface PharmacyDetail {
  num: number
  company: string
  business_number: string
  application_date: string
  general_phone: string
  applicant_name: string
  resident_number: string
  email: string
  mobile_phone: string
  address: string
  expert_count: string | number
  coverage_limit: string | number
  business_area: string | number
  inventory_value: string | number
  premium: string | number
  expert_design_number: string
  expert_certificate_number: string
  fire_design_number: string
  fire_certificate_number: string
  insurance_start_date: string
  insurance_end_date: string
  message: string
  memo: string
  account: string | number
  account_directory: string
  status: string | number
  images?: Array<{ kind: string; description2?: string }>
}

export default function PharmacyDetailModal({ isOpen, onClose, pharmacyId, onUpdate }: PharmacyDetailModalProps) {
  const toast = useToastHelpers()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [detail, setDetail] = useState<PharmacyDetail | null>(null)
  const [premiumVerificationResult, setPremiumVerificationResult] = useState<string>('')

  useEffect(() => {
    if (isOpen && pharmacyId) {
      loadDetail()
    } else {
      setDetail(null)
      setPremiumVerificationResult('')
    }
  }, [isOpen, pharmacyId])

  const getStatusCode = (status: number | string): string => {
    const statusMap: Record<string, string> = {
      '1': '접수',
      '12': '해피콜',
      '10': '메일 보냄',
      '13': '승인',
      '6': '계약완료',
      '7': '보류',
      '14': '증권발급',
      '15': '해지요청',
      '16': '해지완료',
      '17': '설계중',
      '11': '질문서받음',
      '9': '단순산출',
      '2': '보험료',
      '3': '청약서안내',
      '4': '자필서류',
      '8': '카드승인',
      '5': '입금확인',
    }

    if (Object.keys(statusMap).includes(String(status))) {
      return String(status)
    }

    for (const [code, text] of Object.entries(statusMap)) {
      if (text === status) {
        return code
      }
    }

    return String(status)
  }

  const loadDetail = async () => {
    if (!pharmacyId) return

    try {
      setLoading(true)
      const res = await api.get(`/api/pharmacy/id-detail/${pharmacyId}`)
      if (res.data?.success && res.data.data) {
        const data = res.data.data
        setDetail({
          num: data.num,
          company: data.company || '',
          business_number: data.business_number || data.school2 || '',
          application_date: data.application_date || '',
          general_phone: data.general_phone || data.hphone2 || '',
          applicant_name: data.applicant_name || data.damdangja || '',
          resident_number: data.resident_number || data.jumin || '',
          email: data.email || '',
          mobile_phone: data.mobile_phone || data.hphone || '',
          address: data.address || data.juso || '',
          expert_count: data.expert_count || data.chemist || -1,
          coverage_limit: data.expert_limit || data.coverage_limit || '1',
          business_area: data.business_area || data.area || '',
          inventory_value: data.inventory_value || data.jaegojasan || -1,
          premium: data.premium || data.premium_raw || 0,
          expert_design_number: data.expert_design_number || data.chemist_design_number || data.chemistDesignNumer || '',
          expert_certificate_number: data.expert_certificate_number || data.chemistCerti || '',
          fire_design_number: data.fire_design_number || data.area_design_number || data.areaDesignNumer || '',
          fire_certificate_number: data.fire_certificate_number || data.areaCerti || '',
          insurance_start_date: data.insurance_start_date || data.sigi || '',
          insurance_end_date: data.insurance_end_date || data.jeonggi || '',
          message: data.message || '',
          memo: data.memo || '',
          account: data.account || '1',
          account_directory: data.directory || data.account_directory || '거래처 정보 없음',
          status: data.status || '',
          images: data.images || [],
        })
      }
    } catch (error: any) {
      console.error('상세 정보 로드 오류:', error)
      toast.error(error?.response?.data?.message || error?.message || '상세 정보를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!detail || !pharmacyId) return

    try {
      setSaving(true)
      const formData = {
        company: detail.company,
        business_number: detail.business_number,
        application_date: detail.application_date,
        general_phone: detail.general_phone,
        applicant_name: detail.applicant_name,
        resident_number: detail.resident_number,
        email: detail.email,
        mobile_phone: detail.mobile_phone,
        address: detail.address,
        expert_count: detail.expert_count,
        coverage_limit: detail.coverage_limit,
        business_area: detail.business_area,
        inventory_value: detail.inventory_value,
        expert_design_number: detail.expert_design_number,
        expert_certificate_number: detail.expert_certificate_number,
        fire_design_number: detail.fire_design_number,
        fire_certificate_number: detail.fire_certificate_number,
        insurance_start_date: detail.insurance_start_date,
        insurance_end_date: detail.insurance_end_date,
        memo: detail.memo,
      }

      const res = await api.put(`/api/pharmacy/id-update/${pharmacyId}`, formData)
      if (res.data?.success) {
        toast.success('약국 정보가 성공적으로 수정되었습니다.')
        onUpdate?.()
        await loadDetail()
      }
    } catch (error: any) {
      console.error('약국 정보 저장 오류:', error)
      toast.error(error?.response?.data?.message || error?.message || '저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleVerifyPremium = async () => {
    if (!pharmacyId) return

    try {
      const res = await api.get(`/api/pharmacy/premium-verify?pharmacy_id=${pharmacyId}`)
      if (res.data?.success) {
        if (res.data.is_match) {
          setPremiumVerificationResult('일치')
          toast.success('보험료가 일치합니다.')
        } else {
          const message = `보험료 불일치 발견!\n\nDB 저장값: ${res.data.db_premium?.toLocaleString('ko-KR')}원\n계산값: ${res.data.calculated_premium?.toLocaleString('ko-KR')}원\n차이: ${res.data.difference?.toLocaleString('ko-KR')}원`
          setPremiumVerificationResult('불일치')
          alert(message)
        }
      }
    } catch (error: any) {
      console.error('보험료 검증 오류:', error)
      toast.error(error?.response?.data?.message || error?.message || '보험료 검증에 실패했습니다.')
    }
  }

  const handleSaveDesignNumber = async (designType: 'expert' | 'fire') => {
    if (!pharmacyId || !detail) return

    const designNumber = designType === 'expert' ? detail.expert_design_number : detail.fire_design_number
    if (!designNumber.trim()) {
      toast.error('설계번호를 입력해주세요.')
      return
    }

    try {
      const res = await api.post('/api/pharmacy2/design-number', {
        pharmacyId,
        designNumber: designNumber.trim(),
        designType,
      })

      if (res.data?.success) {
        toast.success('설계번호가 저장되었습니다.')
        await loadDetail()
      }
    } catch (error: any) {
      console.error('설계번호 저장 오류:', error)
      toast.error(error?.response?.data?.message || error?.message || '설계번호 저장에 실패했습니다.')
    }
  }

  const handleSaveCertificateNumber = async (certType: 'expert' | 'fire') => {
    if (!pharmacyId || !detail) return

    const certNumber = certType === 'expert' ? detail.expert_certificate_number : detail.fire_certificate_number
    if (!certNumber.trim()) {
      toast.error('증권번호를 입력해주세요.')
      return
    }

    try {
      // 사용자 정보 가져오기
      const registrar = user?.name || user?.email || null
      const registrarId = user?.email || user?.id || null

      // TODO: API 엔드포인트 확인 필요
      const res = await api.post('/api/pharmacy2/certificate-number', {
        pharmacyId,
        certificateNumber: certNumber.trim(),
        certificateType: certType,
        registrar: registrar,      // 사용자 이름
        registrarId: registrarId,  // 사용자 ID (이메일)
      })

      if (res.data?.success) {
        toast.success('증권번호가 저장되었습니다.')
        await loadDetail()
      }
    } catch (error: any) {
      console.error('증권번호 저장 오류:', error)
      toast.error(error?.response?.data?.message || error?.message || '증권번호 저장에 실패했습니다.')
    }
  }

  const handleViewCertificate = (certType: 'expert' | 'fire') => {
    if (!pharmacyId) return

    const certificateUrl = `/api/pharmacy/certificate/${pharmacyId}/${certType}`
    window.open(certificateUrl, '_blank')
  }

  const handleMemoKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!pharmacyId || !detail) return

      try {
        const res = await api.post(`/api/pharmacy2/${pharmacyId}/memo`, { memo: detail.memo })
        if (res.data?.success) {
          toast.success('메모가 저장되었습니다.')
        }
      } catch (error: any) {
        console.error('메모 저장 오류:', error)
        toast.error(error?.response?.data?.message || error?.message || '메모 저장에 실패했습니다.')
      }
    }
  }

  const formatPremium = (value: string | number) => {
    if (!value) return '0'
    const numValue = typeof value === 'string' ? parseInt(value.replace(/,/g, '')) : value
    return numValue.toLocaleString('ko-KR')
  }

  if (!detail && !loading) {
    return null
  }

  const currentStatus = getStatusCode(detail?.status || '')
  const isLockedStatus = ['13', '15', '16', '6', '14'].includes(currentStatus)
  const accountNum = String(detail?.account || '1')
  const hasMultipleLimits = ['6', '8'].includes(accountNum)
  const hasSingleLimit = ['1', '7'].includes(accountNum)

  const expertCertFile = detail?.images?.find((img) => img.kind === '1')
  const fireCertFile = detail?.images?.find((img) => img.kind === '2')
  const hasExpertCert = !!(expertCertFile || detail?.expert_certificate_number)
  const hasFireCert = !!(fireCertFile || detail?.fire_certificate_number)

  const modalTitle = detail ? (
    <div className="flex items-center gap-2">
      <span>{detail.company}</span>
      <span className={`px-2 py-0.5 text-xs font-medium rounded ${hasSingleLimit ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
        {hasSingleLimit ? '표준형(1억)' : '선택형(1억/2억)'}
      </span>
      <button
        onClick={() => {
          // TODO: 파일 업로드 모달 열기
          toast.info('파일 업로드 기능은 준비 중입니다.')
        }}
        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
      >
        <Upload className="w-3 h-3 inline mr-1" />
        업로드
      </button>
    </div>
  ) : (
    '약국 상세 정보'
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      maxWidth="4xl"
      maxHeight="90vh"
      footer={
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            <span className="hidden md:inline text-xs text-gray-600">{detail?.account_directory}</span>
            <span className={`px-2 py-0.5 text-xs font-medium rounded ${hasSingleLimit ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
              {hasSingleLimit ? '표준형' : '선택형'}
            </span>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !detail || loading}
            className="px-4 py-2 bg-yellow-500 text-white rounded text-xs font-medium hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <span>수정</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {loading ? (
          <LoadingSpinner size="md" />
        ) : detail ? (
          <div className="grid grid-cols-[100px_1fr_100px_1fr] gap-y-1 gap-x-4 items-center text-xs">
            {/* 상호 / 사업자번호 */}
            <label className="text-xs font-medium text-gray-700 py-1">상호</label>
            <input
              type="text"
              value={detail.company}
              onChange={(e) => setDetail({ ...detail, company: e.target.value })}
              className="px-3 py-1.5 text-xs border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 text-right focus:text-left"
            />
            <label className="text-xs font-medium text-gray-700 py-1">사업자번호</label>
            <input
              type="text"
              value={detail.business_number}
              onChange={(e) => setDetail({ ...detail, business_number: e.target.value })}
              placeholder="하이픈 없이 번호만"
              className="px-3 py-1.5 text-xs border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 text-right focus:text-left"
            />

            {/* 일반전화 / 휴대전화 */}
            <label className="text-xs font-medium text-gray-700 py-1">일반전화</label>
            <input
              type="tel"
              value={detail.general_phone}
              onChange={(e) => setDetail({ ...detail, general_phone: e.target.value })}
              className="px-3 py-1.5 text-xs border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 text-right focus:text-left"
            />
            <label className="text-xs font-medium text-gray-700 py-1">휴대전화</label>
            <input
              type="tel"
              value={detail.mobile_phone}
              onChange={(e) => setDetail({ ...detail, mobile_phone: e.target.value })}
              className="px-3 py-1.5 text-xs border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 text-right focus:text-left"
            />

            {/* 주소 (전체 폭) */}
            <label className="text-xs font-medium text-gray-700 py-1 col-span-1">주소</label>
            <input
              type="text"
              value={detail.address}
              onChange={(e) => setDetail({ ...detail, address: e.target.value })}
              className="col-span-3 px-3 py-1.5 text-xs border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 text-right focus:text-left"
            />

            {/* 이메일 (전체 폭) */}
            <label className="text-xs font-medium text-gray-700 py-1 col-span-1">이메일</label>
            <input
              type="email"
              value={detail.email}
              onChange={(e) => setDetail({ ...detail, email: e.target.value })}
              className="col-span-3 px-3 py-1.5 text-xs border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 text-right focus:text-left"
            />

            {/* 신청자명 / 주민번호 */}
            <label className="text-xs font-medium text-gray-700 py-1">신청자명</label>
            <input
              type="text"
              value={detail.applicant_name}
              onChange={(e) => setDetail({ ...detail, applicant_name: e.target.value })}
              className="px-3 py-1.5 text-xs border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 text-right focus:text-left"
            />
            <label className="text-xs font-medium text-gray-700 py-1">주민번호</label>
            <input
              type="text"
              value={detail.resident_number}
              onChange={(e) => setDetail({ ...detail, resident_number: e.target.value })}
              maxLength={13}
              placeholder="'-' 없이 숫자만 입력"
              className="px-3 py-1.5 text-xs border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 text-right focus:text-left"
            />

            {/* 전문인수 */}
            <label className="text-xs font-medium text-gray-700 py-1">
              전문인수
              {isLockedStatus && <span className="ml-1 text-[10px] text-gray-500">(변경불가)</span>}
            </label>
            <select
              value={detail.expert_count}
              onChange={(e) => setDetail({ ...detail, expert_count: e.target.value })}
              disabled={isLockedStatus}
              className={`px-3 py-1.5 text-xs border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 text-right focus:text-left ${isLockedStatus ? 'bg-gray-100' : ''}`}
            >
              <option value="-1">전문인수 선택</option>
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <option key={n} value={n}>
                  {n}명
                </option>
              ))}
            </select>

            {/* 보상한도 */}
            <label className="text-xs font-medium text-gray-700 py-1">
              보상한도
              {isLockedStatus && <span className="ml-1 text-[10px] text-gray-500">(변경불가)</span>}
              {hasSingleLimit && <span className="ml-1 text-[10px] text-blue-600">(1억 고정)</span>}
              {hasMultipleLimits && !isLockedStatus && <span className="ml-1 text-[10px] text-green-600">(선택가능)</span>}
            </label>
            <select
              value={detail.coverage_limit}
              onChange={(e) => setDetail({ ...detail, coverage_limit: e.target.value })}
              disabled={isLockedStatus || hasSingleLimit}
              className={`px-3 py-1.5 text-xs border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 text-right focus:text-left ${isLockedStatus || hasSingleLimit ? 'bg-gray-100' : ''}`}
            >
              <option value="1">1억</option>
              {hasMultipleLimits && <option value="2">2억</option>}
            </select>

            {/* 재고자산 */}
            <label className="text-xs font-medium text-gray-700 py-1">
              재고자산
              {isLockedStatus && <span className="ml-1 text-[10px] text-gray-500">(변경불가)</span>}
            </label>
            <select
              value={detail.inventory_value}
              onChange={(e) => setDetail({ ...detail, inventory_value: e.target.value })}
              disabled={isLockedStatus}
              className={`px-3 py-1.5 text-xs border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 text-right focus:text-left ${isLockedStatus ? 'bg-gray-100' : ''}`}
            >
              <option value="-1">화재보험미가입</option>
              <option value="1">5천만 원</option>
              <option value="2">1억 원</option>
              <option value="3">2억 원</option>
              <option value="4">3억 원</option>
              <option value="5">5억 원</option>
            </select>

            {/* 사업장면적 */}
            <label className="text-xs font-medium text-gray-700 py-1">
              사업장면적
              {isLockedStatus && <span className="ml-1 text-[9px] text-gray-500">(변경불가)</span>}
            </label>
            <input
              type="text"
              value={detail.business_area}
              onChange={(e) => setDetail({ ...detail, business_area: e.target.value })}
              disabled={isLockedStatus}
              placeholder="면적을 입력하세요"
              className={`px-3 py-1.5 text-xs border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 text-right focus:text-left ${isLockedStatus ? 'bg-gray-100' : ''}`}
            />

            {/* 보험료(기본) */}
            <label className="text-xs font-medium text-gray-700 py-1 col-span-1">
              보험료(기본)
              <button
                onClick={handleVerifyPremium}
                className="ml-1 p-0.5 text-blue-500 hover:text-blue-700"
                title="보험료 검증"
              >
                <CheckCircle className="w-3 h-3 inline" />
              </button>
            </label>
            <div className="col-span-3 px-3 py-1.5 text-xs border-0 border-b border-gray-300 bg-transparent">
              <p className="font-bold text-blue-600 mb-0">{formatPremium(detail.premium)} 원</p>
              {premiumVerificationResult && (
                <small className={`text-xs ${premiumVerificationResult === '일치' ? 'text-green-600' : 'text-red-600'}`}>
                  {premiumVerificationResult === '일치' ? '✓ 일치' : '✗ 불일치'}
                </small>
              )}
            </div>

            {/* 전문인설계번호 / 전문인증권번호 (2행 2열) */}
            <label className="text-xs font-medium text-gray-700 py-1">전문인설계번호</label>
            <div className="flex gap-1 items-center">
              <input
                type="text"
                value={detail.expert_design_number}
                onChange={(e) => setDetail({ ...detail, expert_design_number: e.target.value })}
                placeholder="설계번호 입력"
                className="flex-1 px-3 py-1.5 text-xs border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 text-right focus:text-left"
              />
              <button
                onClick={() => handleSaveDesignNumber('expert')}
                className="px-2 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-300 rounded hover:bg-blue-100"
              >
                설계번호입력
              </button>
            </div>
            <label className="text-xs font-medium text-gray-700 py-1">전문인증권번호</label>
            <div className="flex gap-1 items-center">
              <input
                type="text"
                value={detail.expert_certificate_number}
                onChange={(e) => setDetail({ ...detail, expert_certificate_number: e.target.value })}
                placeholder="증권번호 입력"
                className="flex-1 px-3 py-1.5 text-xs border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 text-right focus:text-left"
              />
              <button
                onClick={() => handleSaveCertificateNumber('expert')}
                className="px-2 py-1 text-xs bg-green-50 text-green-700 border border-green-300 rounded hover:bg-green-100"
              >
                입력
              </button>
              <button
                onClick={() => handleViewCertificate('expert')}
                disabled={!hasExpertCert}
                className="px-2 py-1 text-xs bg-gray-50 text-gray-700 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                보기
              </button>
            </div>

            {/* 화재설계번호 / 화재증권번호 (2행 2열) */}
            <label className="text-xs font-medium text-gray-700 py-1">화재설계번호</label>
            <div className="flex gap-1 items-center">
              <input
                type="text"
                value={detail.fire_design_number}
                onChange={(e) => setDetail({ ...detail, fire_design_number: e.target.value })}
                placeholder="설계번호 입력"
                className="flex-1 px-3 py-1.5 text-xs border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 text-right focus:text-left"
              />
              <button
                onClick={() => handleSaveDesignNumber('fire')}
                className="px-2 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-300 rounded hover:bg-blue-100"
              >
                설계번호입력
              </button>
            </div>
            <label className="text-xs font-medium text-gray-700 py-1">화재증권번호</label>
            <div className="flex gap-1 items-center">
              <input
                type="text"
                value={detail.fire_certificate_number}
                onChange={(e) => setDetail({ ...detail, fire_certificate_number: e.target.value })}
                placeholder="증권번호 입력"
                className="flex-1 px-3 py-1.5 text-xs border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 text-right focus:text-left"
              />
              <button
                onClick={() => handleSaveCertificateNumber('fire')}
                className="px-2 py-1 text-xs bg-green-50 text-green-700 border border-green-300 rounded hover:bg-green-100"
              >
                입력
              </button>
              <button
                onClick={() => handleViewCertificate('fire')}
                disabled={!hasFireCert}
                className="px-2 py-1 text-xs bg-gray-50 text-gray-700 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                보기
              </button>
            </div>

            {/* 메시지 (전체 폭) */}
            <label className="text-xs font-medium text-gray-700 py-1 col-span-1">메시지</label>
            <div className="col-span-3 px-3 py-1.5 text-xs border-0 border-b border-gray-300 bg-gray-50 text-right">
              {detail.message || '-'}
            </div>

            {/* 메모 (전체 폭) */}
            <label className="text-xs font-medium text-gray-700 py-1 col-span-1">메모</label>
            <textarea
              value={detail.memo}
              onChange={(e) => setDetail({ ...detail, memo: e.target.value })}
              onKeyDown={handleMemoKeyDown}
              rows={2}
              placeholder="메모를 입력하세요... (Enter로 저장)"
              className="col-span-3 px-3 py-1.5 text-xs border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 text-right focus:text-left resize-none"
            />

            {/* 보험기간 (전체 폭) */}
            <label className="text-xs font-medium text-gray-700 py-1 col-span-1">보험기간</label>
            <div className="col-span-3 flex items-center gap-2">
              <input
                type="date"
                value={detail.insurance_start_date}
                onChange={(e) => setDetail({ ...detail, insurance_start_date: e.target.value })}
                className="flex-1 px-3 py-1.5 text-xs border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 text-right focus:text-left"
              />
              <span className="text-gray-400">~</span>
              <input
                type="date"
                value={detail.insurance_end_date}
                onChange={(e) => setDetail({ ...detail, insurance_end_date: e.target.value })}
                className="flex-1 px-3 py-1.5 text-xs border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 text-right focus:text-left"
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-sm text-red-500">상세 정보를 불러올 수 없습니다.</div>
        )}
      </div>
    </Modal>
  )
}
