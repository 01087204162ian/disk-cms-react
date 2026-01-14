import { useEffect, useState } from 'react'
import { Modal, useToastHelpers, FormInput, DatePicker, LoadingSpinner } from '../../../components'
import api from '../../../lib/api'
import { FileEdit } from 'lucide-react'
import PremiumInputModal from './PremiumInputModal'

interface PolicyDetailModalProps {
  isOpen: boolean
  onClose: () => void
  certi: string
  onUpdate?: () => void
}

interface PolicyDetail {
  certi: string
  company: string
  name: string
  jumin: string
  sigi: string
  nab: string
  inwon: number
  yearRate: string | number
  harinRate: string | number
  insurance?: string | number
  p_preminum?: number
}

interface PolicyDetailResponse {
  success: boolean
  data: PolicyDetail[]
  error?: string
}

export default function PolicyDetailModal({ isOpen, onClose, certi, onUpdate }: PolicyDetailModalProps) {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [policyDetail, setPolicyDetail] = useState<PolicyDetail | null>(null)
  const [premiumModalOpen, setPremiumModalOpen] = useState(false)

  // 수정 가능한 필드 상태
  const [editData, setEditData] = useState({
    company: '',
    name: '',
    jumin: '',
    sigi: '',
    nab: '',
    yearRate: '',
    harinRate: '',
  })

  // 증권 상세 정보 조회
  const loadPolicyDetail = async () => {
    if (!certi) return

    setLoading(true)
    try {
      const response = await api.post<PolicyDetailResponse>('/api/insurance/kj-code/policy-num-detail', {
        num: certi,
      })

      if (response.data.success && response.data.data && response.data.data.length > 0) {
        const data = response.data.data[0]
        setPolicyDetail(data)
        setEditData({
          company: data.company || '',
          name: data.name || '',
          jumin: data.jumin || '',
          sigi: data.sigi || '',
          nab: String(data.nab || ''),
          yearRate: String(data.yearRate || ''),
          harinRate: String(data.harinRate || ''),
        })
      } else {
        toast.error(response.data.error || '증권 정보를 불러올 수 없습니다.')
      }
    } catch (error: any) {
      console.error('증권 상세 정보 조회 오류:', error)
      toast.error('증권 정보를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 증권 정보 수정
  const handleUpdate = async () => {
    if (!certi) {
      toast.error('증권번호가 없습니다.')
      return
    }

    setSaving(true)
    try {
      const response = await api.post('/api/insurance/kj-certi/update', {
        certi,
        company: editData.company.trim(),
        name: editData.name.trim(),
        jumin: editData.jumin.trim(),
        sigi: editData.sigi.trim(),
        nab: editData.nab.trim(),
        yearRate: editData.yearRate.trim(),
        harinRate: editData.harinRate.trim(),
      })

      if (response.data.success) {
        toast.success(response.data.message || '증권 정보가 수정되었습니다.')
        // 상세 정보 다시 로드
        await loadPolicyDetail()
        // 부모 컴포넌트에 업데이트 알림
        if (onUpdate) {
          onUpdate()
        }
      } else {
        toast.error(response.data.error || '증권 정보 수정에 실패했습니다.')
      }
    } catch (error: any) {
      console.error('증권 정보 수정 오류:', error)
      toast.error('증권 정보 수정 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  // 모달 열릴 때 데이터 로드
  useEffect(() => {
    if (isOpen && certi) {
      loadPolicyDetail()
      // p_preminum이 1이면 보험료 입력 모달 자동 열기
      if (policyDetail?.p_preminum === 1) {
        setPremiumModalOpen(true)
      }
    } else {
      // 모달 닫힐 때 상태 초기화
      setPolicyDetail(null)
      setEditData({
        company: '',
        name: '',
        jumin: '',
        sigi: '',
        nab: '',
        yearRate: '',
        harinRate: '',
      })
    }
  }, [isOpen, certi])

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="증권 상세 정보"
        maxWidth="xl"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPremiumModalOpen(true)}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center gap-2"
            >
              <FileEdit className="w-4 h-4" />
              보험료 입력
            </button>
          </div>
        }
      >
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : policyDetail ? (
          <div className="space-y-4">
            {/* 증권 정보 테이블 */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-center" style={{ width: '15%' }}>
                      증권번호
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center" style={{ width: '15%' }}>
                      회사명
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center" style={{ width: '15%' }}>
                      계약자
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center" style={{ width: '15%' }}>
                      주민번호
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center" style={{ width: '10%' }}>
                      계약일
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center" style={{ width: '5%' }}>
                      회차
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center" style={{ width: '5%' }}>
                      인원
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center" style={{ width: '10%' }}>
                      단체율
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center" style={{ width: '10%' }}>
                      할인율
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2">
                      <FormInput
                        value={policyDetail.certi}
                        readOnly
                        variant="modal"
                        className="text-xs"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <FormInput
                        value={editData.company}
                        onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                        variant="modal"
                        className="text-xs"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <FormInput
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        variant="modal"
                        className="text-xs"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <FormInput
                        value={editData.jumin}
                        onChange={(e) => setEditData({ ...editData, jumin: e.target.value })}
                        variant="modal"
                        className="text-xs"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <DatePicker
                        value={editData.sigi}
                        onChange={(value) => setEditData({ ...editData, sigi: value })}
                        variant="modal"
                        className="text-xs"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <FormInput
                        value={editData.nab}
                        onChange={(e) => setEditData({ ...editData, nab: e.target.value })}
                        variant="modal"
                        className="text-xs"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center">
                      {policyDetail.inwon || 0}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <FormInput
                        value={editData.yearRate}
                        onChange={(e) => setEditData({ ...editData, yearRate: e.target.value })}
                        variant="modal"
                        className="text-xs"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <FormInput
                        value={editData.harinRate}
                        onChange={(e) => setEditData({ ...editData, harinRate: e.target.value })}
                        variant="modal"
                        className="text-xs"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={9} className="border border-gray-300 px-3 py-2 text-end">
                      <button
                        onClick={handleUpdate}
                        disabled={saving}
                        className="px-4 py-1.5 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 text-xs"
                      >
                        {saving ? '저장 중...' : '수정'}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 보험료 통계 영역 (추후 구현) */}
            <div id="Insurance_premium_statistics">
              {/* TODO: 보험료 통계 표시 */}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            데이터가 없습니다.
          </div>
        )}
      </Modal>

      {/* 보험료 입력 모달 */}
      {certi && (
        <PremiumInputModal
          isOpen={premiumModalOpen}
          onClose={() => setPremiumModalOpen(false)}
          certi={certi}
          onUpdate={() => {
            // 보험료 입력 후 통계 새로고침
            loadPolicyDetail()
          }}
        />
      )}
    </>
  )
}
