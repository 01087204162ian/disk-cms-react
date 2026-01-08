import { useEffect, useState } from 'react'
import { Modal, LoadingSpinner, useToastHelpers, FormInput, DatePicker } from '../../../components'
import api from '../../../lib/api'

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
  business_area: string | number
  inventory_value: string | number
  premium: string | number
  certificate_number: string
  insurance_start_date: string
  insurance_end_date: string
  message: string
}

export default function PharmacyDetailModal({ isOpen, onClose, pharmacyId, onUpdate }: PharmacyDetailModalProps) {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [detail, setDetail] = useState<PharmacyDetail | null>(null)

  useEffect(() => {
    if (isOpen && pharmacyId) {
      loadDetail()
    } else {
      setDetail(null)
    }
  }, [isOpen, pharmacyId])

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
          resident_number: data.resident_number || '',
          email: data.email || '',
          mobile_phone: data.mobile_phone || data.hphone || '',
          address: data.address || '',
          expert_count: data.expert_count || data.chemist || '',
          business_area: data.business_area || data.area || '',
          inventory_value: data.inventory_value || data.jaegojasan || '',
          premium: data.premium || '',
          certificate_number: data.certificate_number || data.chemist_design_number || '',
          insurance_start_date: data.insurance_start_date || '',
          insurance_end_date: data.insurance_end_date || '',
          message: data.message || data.memo || '',
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
        business_area: detail.business_area,
        inventory_value: detail.inventory_value,
        premium: detail.premium.toString().replace(/,/g, ''),
        certificate_number: detail.certificate_number,
        insurance_start_date: detail.insurance_start_date,
        insurance_end_date: detail.insurance_end_date,
        message: detail.message,
      }

      const res = await api.put(`/api/pharmacy/id-update/${pharmacyId}`, formData)
      if (res.data?.success) {
        toast.success('약국 정보가 성공적으로 수정되었습니다.')
        onUpdate?.()
        if (res.data.data) {
          setDetail({ ...detail, premium: res.data.data.premium || detail.premium })
        }
      }
    } catch (error: any) {
      console.error('약국 정보 저장 오류:', error)
      toast.error(error?.response?.data?.message || error?.message || '저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleIssueCertificate = async () => {
    if (!pharmacyId) return

    if (!confirm('전문증권을 발행하시겠습니까?')) return

    try {
      const res = await api.post('/api/pharmacy/issue-certificate', { num: pharmacyId })
      if (res.data?.success) {
        toast.success('전문증권이 발행되었습니다.')
        await loadDetail()
        onUpdate?.()
      }
    } catch (error: any) {
      console.error('증권 발행 오류:', error)
      toast.error(error?.response?.data?.message || error?.message || '증권 발행에 실패했습니다.')
    }
  }

  const formatPremium = (value: string | number) => {
    if (!value) return ''
    const numValue = typeof value === 'string' ? parseInt(value.replace(/,/g, '')) : value
    return numValue.toLocaleString('ko-KR')
  }

  const handlePremiumChange = (value: string) => {
    const numValue = value.replace(/[^0-9]/g, '')
    setDetail((prev) => (prev ? { ...prev, premium: numValue } : null))
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="약국 상세 정보"
      maxWidth="4xl"
      maxHeight="90vh"
      footer={
        <div className="flex gap-2 justify-end">
          <button
            onClick={handleIssueCertificate}
            disabled={saving || !detail}
            className="px-4 py-2 bg-green-500 text-white rounded text-xs font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            전문증권 발행
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !detail || loading}
            className="px-4 py-2 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {loading ? (
          <LoadingSpinner size="md" />
        ) : detail ? (
          <div className="grid grid-cols-[100px_1fr_100px_1fr] gap-y-2 gap-x-4 items-center text-xs">
            {/* 기본 정보 */}
            <label className="text-xs font-medium text-gray-700">업체명:</label>
            <FormInput
              type="text"
              value={detail.company}
              onChange={(e) => setDetail({ ...detail, company: e.target.value })}
              variant="modal"
              className="col-span-1"
            />
            <label className="text-xs font-medium text-gray-700">사업자번호:</label>
            <FormInput
              type="text"
              value={detail.business_number}
              onChange={(e) => setDetail({ ...detail, business_number: e.target.value })}
              variant="modal"
              className="col-span-1"
            />
            <label className="text-xs font-medium text-gray-700">신청일:</label>
            <DatePicker
              value={detail.application_date}
              onChange={(value) => setDetail({ ...detail, application_date: value })}
              variant="modal"
              className="col-span-1"
            />
            <label className="text-xs font-medium text-gray-700">일반전화:</label>
            <FormInput
              type="tel"
              value={detail.general_phone}
              onChange={(e) => setDetail({ ...detail, general_phone: e.target.value })}
              variant="modal"
              className="col-span-1"
            />

            {/* 신청자 정보 */}
            <label className="text-xs font-medium text-gray-700 col-span-4 mt-2">신청자 정보</label>
            <label className="text-xs font-medium text-gray-700">성명:</label>
            <FormInput
              type="text"
              value={detail.applicant_name}
              onChange={(e) => setDetail({ ...detail, applicant_name: e.target.value })}
              variant="modal"
              className="col-span-1"
            />
            <label className="text-xs font-medium text-gray-700">주민번호:</label>
            <FormInput
              type="text"
              value={detail.resident_number}
              onChange={(e) => setDetail({ ...detail, resident_number: e.target.value })}
              variant="modal"
              className="col-span-1"
            />
            <label className="text-xs font-medium text-gray-700">이메일:</label>
            <FormInput
              type="email"
              value={detail.email}
              onChange={(e) => setDetail({ ...detail, email: e.target.value })}
              variant="modal"
              className="col-span-1"
            />
            <label className="text-xs font-medium text-gray-700">휴대전화:</label>
            <FormInput
              type="tel"
              value={detail.mobile_phone}
              onChange={(e) => setDetail({ ...detail, mobile_phone: e.target.value })}
              variant="modal"
              className="col-span-1"
            />

            {/* 사업장 정보 */}
            <label className="text-xs font-medium text-gray-700 col-span-4 mt-2">사업장 정보</label>
            <label className="text-xs font-medium text-gray-700">주소:</label>
            <FormInput
              type="text"
              value={detail.address}
              onChange={(e) => setDetail({ ...detail, address: e.target.value })}
              variant="modal"
              className="col-span-3"
            />
            <label className="text-xs font-medium text-gray-700">전문인 수:</label>
            <FormInput
              type="number"
              value={detail.expert_count}
              onChange={(e) => setDetail({ ...detail, expert_count: e.target.value })}
              variant="modal"
              className="col-span-1"
            />
            <label className="text-xs font-medium text-gray-700">사업장 면적:</label>
            <FormInput
              type="number"
              value={detail.business_area}
              onChange={(e) => setDetail({ ...detail, business_area: e.target.value })}
              variant="modal"
              className="col-span-1"
            />
            <label className="text-xs font-medium text-gray-700">재고자산:</label>
            <FormInput
              type="number"
              value={detail.inventory_value}
              onChange={(e) => setDetail({ ...detail, inventory_value: e.target.value })}
              variant="modal"
              className="col-span-1"
            />

            {/* 보험 정보 */}
            <label className="text-xs font-medium text-gray-700 col-span-4 mt-2">보험 정보</label>
            <label className="text-xs font-medium text-gray-700">보험료:</label>
            <FormInput
              type="text"
              value={formatPremium(detail.premium)}
              onChange={(e) => handlePremiumChange(e.target.value)}
              variant="modal"
              className="col-span-1"
            />
            <label className="text-xs font-medium text-gray-700">전문인증권번호:</label>
            <FormInput
              type="text"
              value={detail.certificate_number}
              onChange={(e) => setDetail({ ...detail, certificate_number: e.target.value })}
              variant="modal"
              className="col-span-1"
            />
            <label className="text-xs font-medium text-gray-700">보험시작일:</label>
            <DatePicker
              value={detail.insurance_start_date}
              onChange={(value) => setDetail({ ...detail, insurance_start_date: value })}
              variant="modal"
              className="col-span-1"
            />
            <label className="text-xs font-medium text-gray-700">보험종료일:</label>
            <DatePicker
              value={detail.insurance_end_date}
              onChange={(value) => setDetail({ ...detail, insurance_end_date: value })}
              variant="modal"
              className="col-span-1"
            />
            <label className="text-xs font-medium text-gray-700">메모:</label>
            <textarea
              value={detail.message}
              onChange={(e) => setDetail({ ...detail, message: e.target.value })}
              className="col-span-3 px-3 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="메모"
            />
          </div>
        ) : (
          <div className="text-center py-4 text-sm text-red-500">상세 정보를 불러올 수 없습니다.</div>
        )}
      </div>
    </Modal>
  )
}
