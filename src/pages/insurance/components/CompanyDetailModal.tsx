import { useEffect, useState } from 'react'
import { Modal, LoadingSpinner, useToastHelpers, Select } from '../../../components'
import api from '../../../lib/api'
import { INSURER_OPTIONS, GITA_OPTIONS, getGitaName } from '../constants'
import MemberListModal from './MemberListModal'
import EndorseModal from './EndorseModal'
import PremiumModal from './PremiumModal'

interface CompanyDetailModalProps {
  isOpen: boolean
  onClose: () => void
  companyNum: number | null
  companyName?: string
  onUpdate?: () => void
}

interface CompanyDetail {
  num: number
  company: string
  MemberNum?: number
  name?: string
  hphone?: string
  cphone?: string
  FirstStartDay?: string
  FirstStart?: string
  inWonTotal?: number
  mem_id?: string
  permit?: string
  [key: string]: any
}

interface PolicyInfo {
  num?: number
  certi?: string
  policyNum?: string
  InsuraneCompany?: number
  startyDay?: string
  f_date?: string
  inwon?: number
  naState?: string
  naColor?: number
  gigan?: number | string
  diviName?: string
  divi?: number
  gitaName?: string
  gita?: number
  nabang?: string
  nabang_1?: number
  content?: string
  [key: string]: any
}

interface EditingPolicyInfo extends PolicyInfo {
  isNew?: boolean
}

interface CompanyDetailResponse {
  success: boolean
  data?: PolicyInfo[]
  memoData?: any[]
  smsData?: any[]
  content?: string[]
  Rnum?: number
  error?: string
  [key: string]: any
}


const NA_STATE_COLORS: Record<number, string> = {
  1: 'text-green-600', // 납
  2: 'text-yellow-600', // 유
  3: 'text-red-600', // 실
}

export default function CompanyDetailModal({
  isOpen,
  onClose,
  companyNum,
  companyName,
}: CompanyDetailModalProps) {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState<CompanyDetail | null>(null)
  const [editingPolicies, setEditingPolicies] = useState<EditingPolicyInfo[]>([])
  const [savingPolicyIndex, setSavingPolicyIndex] = useState<number | null>(null)
  const [memoData, setMemoData] = useState<any[]>([])
  const [contentData, setContentData] = useState<string[]>([])
  const [smsData, setSmsData] = useState<any[]>([])
  const [memberListModalOpen, setMemberListModalOpen] = useState(false)
  const [selectedCertiTableNum, setSelectedCertiTableNum] = useState<number | null>(null)
  const [endorseModalOpen, setEndorseModalOpen] = useState(false)
  const [endorseModalData, setEndorseModalData] = useState<{
    certiTableNum: number
    insurerCode?: number
    policyNum?: string
    gita?: number
    companyNum?: number
  } | null>(null)
  const [premiumModalOpen, setPremiumModalOpen] = useState(false)
  const [selectedPremiumCertiNum, setSelectedPremiumCertiNum] = useState<number | null>(null)
  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false)
  const [editingBasicInfo, setEditingBasicInfo] = useState<Partial<CompanyDetail>>({})
  const [savingBasicInfo, setSavingBasicInfo] = useState(false)

  useEffect(() => {
    if (isOpen && companyNum) {
      loadDetail()
    } else {
      setDetail(null)
      setEditingPolicies([])
        setMemoData([])
        setContentData([])
        setSmsData([])
        setIsEditingBasicInfo(false)
        setEditingBasicInfo({})
    }
  }, [isOpen, companyNum])

  const loadDetail = async () => {
    if (!companyNum) return

    try {
      setLoading(true)
      const response = await api.get<CompanyDetailResponse>(`/api/insurance/kj-company/${companyNum}`)

      if (response.data.success) {
        // main_info는 최상위 레벨에 있음
        const mainInfo: Partial<CompanyDetail> = {}
        const policyData: PolicyInfo[] = []

        // response.data의 모든 키를 순회
        Object.keys(response.data).forEach((key) => {
          if (key === 'data') {
            // 증권 정보 배열
            if (Array.isArray(response.data.data)) {
              policyData.push(...response.data.data)
            }
          } else if (!['success', 'memoData', 'smsData', 'content', 'Rnum', 'sNum', 'gaesu', 'error'].includes(key)) {
            // main_info 필드
            mainInfo[key] = (response.data as any)[key]
          }
        })

        setDetail(mainInfo as CompanyDetail)
        // 편집용 상태 초기화 (기존 데이터 + 1 신규 입력행, 최대 10행)
        const maxRows = Math.min((policyData.length || 0) + 1, 10)
        const editingData: EditingPolicyInfo[] = []
        for (let i = 0; i < maxRows; i++) {
          if (i < policyData.length) {
            editingData.push({ ...policyData[i] })
          } else {
            editingData.push({ isNew: true })
          }
        }
        setEditingPolicies(editingData)
        // 메모 데이터 설정
        setMemoData(response.data.memoData || [])
        setContentData(response.data.content || [])
        // SMS 데이터 설정
        setSmsData(response.data.smsData || [])
      } else {
        toast.error(response.data.error || '업체 정보를 불러오는 중 오류가 발생했습니다.')
        setDetail(null)
        setEditingPolicies([])
      }
    } catch (error: any) {
      console.error('업체 상세 정보 로드 오류:', error)
      toast.error(error.response?.data?.error || '업체 정보를 불러오는 중 오류가 발생했습니다.')
      setDetail(null)
      setEditingPolicies([])
      setMemoData([])
      setContentData([])
      setSmsData([])
    } finally {
      setLoading(false)
    }
  }

  const getDiviName = (divi?: number): string => {
    if (divi === 1) return '정상납'
    if (divi === 2) return '월납'
    return '정상납'
  }

  // 필수 필드 검증 (보험사, 시작일, 증권번호, 분납)
  const isPolicyValid = (policy: EditingPolicyInfo): boolean => {
    return Boolean(
      policy.InsuraneCompany &&
      Number(policy.InsuraneCompany) > 0 &&
      policy.startyDay &&
      policy.policyNum &&
      policy.nabang
    )
  }

  // 증권 정보 저장
  const handleSavePolicy = async (index: number) => {
    const policy = editingPolicies[index]
    if (!policy || !companyNum) return

    if (!isPolicyValid(policy)) {
      toast.error('필수 필드를 모두 입력해주세요. (보험사, 시작일, 증권번호, 분납)')
      return
    }

    try {
      setSavingPolicyIndex(index)
      const response = await api.post('/api/insurance/kj-certi/save', {
        certiNum: policy.num || undefined,
        companyNum: companyNum,
        InsuraneCompany: policy.InsuraneCompany,
        startyDay: policy.startyDay,
        policyNum: policy.policyNum || policy.certi,
        nabang: policy.nabang,
      })

      if (response.data.success) {
        toast.success(response.data.message || (policy.isNew ? '저장되었습니다.' : '수정되었습니다.'))
        // 모달 재조회
        setTimeout(() => {
          loadDetail()
        }, 300)
      } else {
        toast.error(response.data.error || '저장 중 오류가 발생했습니다.')
      }
    } catch (error: any) {
      console.error('증권 정보 저장 오류:', error)
      toast.error(error.response?.data?.error || '저장 중 오류가 발생했습니다.')
    } finally {
      setSavingPolicyIndex(null)
    }
  }

  // 증권 정보 업데이트
  const updateEditingPolicy = (index: number, field: keyof EditingPolicyInfo, value: any) => {
    setEditingPolicies((prev) => {
      const newPolicies = [...prev]
      newPolicies[index] = { ...newPolicies[index], [field]: value }
      return newPolicies
    })
  }

  const getNaStateColor = (color?: number): string => {
    if (!color) return 'text-gray-600'
    return NA_STATE_COLORS[color] || 'text-gray-600'
  }

  // 기본 정보 수정 모드 시작
  const handleStartEditBasicInfo = () => {
    if (!detail) return
    setEditingBasicInfo({ ...detail })
    setIsEditingBasicInfo(true)
  }

  // 기본 정보 수정 취소
  const handleCancelEditBasicInfo = () => {
    setEditingBasicInfo({})
    setIsEditingBasicInfo(false)
  }

  // 기본 정보 저장
  const handleSaveBasicInfo = async () => {
    if (!companyNum || !detail) return

    try {
      setSavingBasicInfo(true)
      const response = await api.post('/api/insurance/kj-company/store', {
        dNum: companyNum,
        jumin: editingBasicInfo.jumin || detail.jumin || '',
        company: editingBasicInfo.company || detail.company || '',
        Pname: editingBasicInfo.Pname || detail.Pname || '',
        hphone: editingBasicInfo.hphone || detail.hphone || '',
        cphone: editingBasicInfo.cphone || detail.cphone || '',
        cNumber: editingBasicInfo.cNumber || detail.cNumber || '',
        lNumber: editingBasicInfo.lNumber || detail.lNumber || '',
        postNum: editingBasicInfo.postNum || detail.postNum || '',
        address1: editingBasicInfo.address1 || detail.address1 || '',
        address2: editingBasicInfo.address2 || detail.address2 || '',
      })

      if (response.data.success) {
        toast.success('기본 정보가 저장되었습니다.')
        setIsEditingBasicInfo(false)
        setEditingBasicInfo({})
        // 모달 재조회
        setTimeout(() => {
          loadDetail()
        }, 300)
      } else {
        toast.error(response.data.error || '저장 중 오류가 발생했습니다.')
      }
    } catch (error: any) {
      console.error('기본 정보 저장 오류:', error)
      toast.error(error.response?.data?.error || '저장 중 오류가 발생했습니다.')
    } finally {
      setSavingBasicInfo(false)
    }
  }

  // 기본 정보 편집 상태 업데이트
  const updateEditingBasicInfo = (field: keyof CompanyDetail, value: any) => {
    setEditingBasicInfo((prev) => ({ ...prev, [field]: value }))
  }

  // 표시할 기본 정보 (편집 중이면 editingBasicInfo, 아니면 detail)
  const displayBasicInfo = isEditingBasicInfo ? editingBasicInfo : detail

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={companyName || detail?.company || '업체 상세 정보'}
      maxWidth="6xl"
      maxHeight="90vh"
    >
      {loading ? (
        <LoadingSpinner fullScreen={false} text="업체 정보를 불러오는 중..." />
      ) : (
        <div className="space-y-6">
          {/* 기본 정보 */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h6 className="text-sm font-semibold mb-0">기본 정보</h6>
              <div className="flex items-center gap-2">
                {isEditingBasicInfo ? (
                  <>
                    <button
                      type="button"
                      className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                      onClick={handleCancelEditBasicInfo}
                      disabled={savingBasicInfo}
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                      onClick={handleSaveBasicInfo}
                      disabled={savingBasicInfo}
                    >
                      {savingBasicInfo ? '저장 중...' : '저장'}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors flex items-center gap-1"
                    onClick={handleStartEditBasicInfo}
                  >
                    <span>수정</span>
                  </button>
                )}
              </div>
            </div>
            <div className="border border-border rounded overflow-hidden">
              <table className="w-full border-collapse" style={{ fontSize: '0.85rem' }}>
                <tbody>
                  <tr>
                    <th className="bg-gray-100 px-3 py-2 text-left font-medium border border-border">주민번호</th>
                    <td className="px-3 py-2 border border-border">
                      {isEditingBasicInfo ? (
                        <input
                          type="text"
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                          value={displayBasicInfo?.jumin || ''}
                          onChange={(e) => updateEditingBasicInfo('jumin', e.target.value)}
                        />
                      ) : (
                        displayBasicInfo?.jumin || '-'
                      )}
                    </td>
                    <th className="bg-gray-100 px-3 py-2 text-left font-medium border border-border">대리운전회사</th>
                    <td className="px-3 py-2 border border-border">
                      {isEditingBasicInfo ? (
                        <input
                          type="text"
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                          value={displayBasicInfo?.company || companyName || ''}
                          onChange={(e) => updateEditingBasicInfo('company', e.target.value)}
                        />
                      ) : (
                        displayBasicInfo?.company || companyName || '-'
                      )}
                    </td>
                    <th className="bg-gray-100 px-3 py-2 text-left font-medium border border-border">성명</th>
                    <td className="px-3 py-2 border border-border">
                      {isEditingBasicInfo ? (
                        <input
                          type="text"
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                          value={displayBasicInfo?.Pname || ''}
                          onChange={(e) => updateEditingBasicInfo('Pname', e.target.value)}
                        />
                      ) : (
                        displayBasicInfo?.Pname || '-'
                      )}
                    </td>
                    <th className="bg-gray-100 px-3 py-2 text-left font-medium border border-border">핸드폰번호</th>
                    <td className="px-3 py-2 border border-border">
                      {isEditingBasicInfo ? (
                        <input
                          type="text"
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                          value={displayBasicInfo?.hphone || ''}
                          onChange={(e) => updateEditingBasicInfo('hphone', e.target.value)}
                        />
                      ) : (
                        displayBasicInfo?.hphone || '-'
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th className="bg-gray-100 px-3 py-2 text-left font-medium border border-border">전화번호</th>
                    <td className="px-3 py-2 border border-border">
                      {isEditingBasicInfo ? (
                        <input
                          type="text"
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                          value={displayBasicInfo?.cphone || ''}
                          onChange={(e) => updateEditingBasicInfo('cphone', e.target.value)}
                        />
                      ) : (
                        displayBasicInfo?.cphone || '-'
                      )}
                    </td>
                    <th className="bg-gray-100 px-3 py-2 text-left font-medium border border-border">담당자</th>
                    <td className="px-3 py-2 border border-border">{displayBasicInfo?.name || displayBasicInfo?.damdanga || '-'}</td>
                    <th className="bg-gray-100 px-3 py-2 text-left font-medium border border-border">팩스</th>
                    <td className="px-3 py-2 border border-border">{displayBasicInfo?.fax || '-'}</td>
                    <th className="bg-gray-100 px-3 py-2 text-left font-medium border border-border">사업자번호</th>
                    <td className="px-3 py-2 border border-border">
                      {isEditingBasicInfo ? (
                        <input
                          type="text"
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                          value={displayBasicInfo?.cNumber || ''}
                          onChange={(e) => updateEditingBasicInfo('cNumber', e.target.value)}
                        />
                      ) : (
                        displayBasicInfo?.cNumber || '-'
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th className="bg-gray-100 px-3 py-2 text-left font-medium border border-border">법인번호</th>
                    <td className="px-3 py-2 border border-border">
                      {isEditingBasicInfo ? (
                        <input
                          type="text"
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                          value={displayBasicInfo?.lNumber || ''}
                          onChange={(e) => updateEditingBasicInfo('lNumber', e.target.value)}
                        />
                      ) : (
                        displayBasicInfo?.lNumber || '-'
                      )}
                    </td>
                    <th className="bg-gray-100 px-3 py-2 text-left font-medium border border-border">보험료 받는날</th>
                    <td className="px-3 py-2 border border-border">
                      <input
                        type="date"
                        className="w-full px-2 py-1 text-xs border-0 bg-transparent"
                        value={displayBasicInfo?.FirstStart ? displayBasicInfo.FirstStart.substring(0, 10) : ''}
                        readOnly
                      />
                    </td>
                    <th className="bg-gray-100 px-3 py-2 text-left font-medium border border-border">업체 I.D</th>
                    <td colSpan={3} className="px-3 py-2 border border-border">
                      <button
                        type="button"
                        className="text-primary hover:underline"
                        onClick={() => {
                          // Phase 6: 업체 I.D 관리 모달 구현 예정
                          console.log('업체 I.D 관리 모달 열기')
                        }}
                      >
                        {displayBasicInfo?.mem_id || '클릭하여 관리'}
                      </button>
                      {String(displayBasicInfo?.permit) === '1' ? ' (허용)' : String(displayBasicInfo?.permit) === '2' ? ' (차단)' : ''}
                    </td>
                  </tr>
                  <tr>
                    <th className="bg-gray-100 px-3 py-2 text-left font-medium border border-border">주소</th>
                    <td colSpan={7} className="px-3 py-2 border border-border">
                      {isEditingBasicInfo ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="w-24 px-2 py-1 text-xs border border-gray-300 rounded"
                            placeholder="우편번호"
                            value={displayBasicInfo?.postNum || ''}
                            onChange={(e) => updateEditingBasicInfo('postNum', e.target.value)}
                          />
                          <input
                            type="text"
                            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                            placeholder="주소1"
                            value={displayBasicInfo?.address1 || ''}
                            onChange={(e) => updateEditingBasicInfo('address1', e.target.value)}
                          />
                          <input
                            type="text"
                            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                            placeholder="주소2"
                            value={displayBasicInfo?.address2 || ''}
                            onChange={(e) => updateEditingBasicInfo('address2', e.target.value)}
                          />
                        </div>
                      ) : (
                        [displayBasicInfo?.postNum, displayBasicInfo?.address1, displayBasicInfo?.address2].filter(Boolean).join(' ') || '-'
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <hr className="my-4" />

          {/* 증권 정보 */}
          <div className="mb-4">
            <h6 className="text-sm font-semibold mb-2">증권 정보</h6>
            <div className="overflow-x-auto border border-border rounded">
              <table className="w-full border-collapse" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '4%' }}>
                      #
                    </th>
                    <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '8%' }}>
                      보험사
                    </th>
                    <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '6%' }}>
                      시작일
                    </th>
                    <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '12%' }}>
                      증권번호
                    </th>
                    <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '5%' }}>
                      분납
                    </th>
                    <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '7%' }}>
                      저장
                    </th>
                    <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '9%' }}>
                      회차
                    </th>
                    <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '8%' }}>
                      상태
                    </th>
                    <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '6%' }}>
                      인원
                    </th>
                    <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '6%' }}>
                      신규<br />
                      입력
                    </th>
                    <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '6%' }}>
                      운전자<br />
                      추가
                    </th>
                    <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '7%' }}>
                      결제<br />
                      방식
                    </th>
                    <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '7%' }}>
                      월보험료
                    </th>
                    <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '8%' }}>
                      성격
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {editingPolicies.length > 0 ? (
                    editingPolicies.map((policy, idx) => {
                      const isNew = policy.isNew
                      const isValid = isPolicyValid(policy)
                      const isSaving = savingPolicyIndex === idx
                      
                      return (
                        <tr key={policy.num || `new-${idx}`} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="px-2 py-2 text-center border border-border">{idx + 1}</td>
                          <td className="px-2 py-2 border border-border">
                            <Select
                              value={policy.InsuraneCompany || 0}
                              onChange={(e) => updateEditingPolicy(idx, 'InsuraneCompany', Number(e.target.value))}
                              options={INSURER_OPTIONS}
                              variant="modal"
                              fullWidth={false}
                              className="text-xs"
                            />
                          </td>
                          <td className="px-2 py-2 border border-border">
                            <input
                              type="date"
                              value={policy.startyDay ? policy.startyDay.substring(0, 10) : ''}
                              onChange={(e) => updateEditingPolicy(idx, 'startyDay', e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-2 py-2 border border-border">
                            <input
                              type="text"
                              value={policy.policyNum || policy.certi || ''}
                              onChange={(e) => updateEditingPolicy(idx, 'policyNum', e.target.value)}
                              placeholder="증권번호"
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-2 py-2 border border-border">
                            <input
                              type="text"
                              value={policy.nabang || ''}
                              onChange={(e) => updateEditingPolicy(idx, 'nabang', e.target.value)}
                              placeholder="분납"
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-2 py-2 text-center border border-border">
                            <button
                              onClick={() => handleSavePolicy(idx)}
                              disabled={!isValid || isSaving}
                              className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isSaving ? '저장 중...' : (policy.num ? '수정' : '저장')}
                            </button>
                          </td>
                          <td className="px-2 py-2 text-center border border-border">
                            {!isNew && policy.num ? (
                              <Select
                                value={policy.nabang_1 || 1}
                                onChange={async (e) => {
                                  const newNabang = Number(e.target.value)
                                  if (!window.confirm(`${newNabang}회차로 변경하시겠습니까?`)) {
                                    e.target.value = String(policy.nabang_1 || 1)
                                    return
                                  }
                                  try {
                                    const response = await api.get(
                                      `/api/insurance/kj-certi/update-nabang?nabsunso=${newNabang}&certiTableNum=${policy.num}&sunso=${idx}`
                                    )
                                    if (response.data.success) {
                                      toast.success(response.data.message || `${newNabang}회차로 변경되었습니다.`)
                                      updateEditingPolicy(idx, 'nabang_1', newNabang)
                                      if (response.data.naState) updateEditingPolicy(idx, 'naState', response.data.naState)
                                      if (response.data.naColor) updateEditingPolicy(idx, 'naColor', response.data.naColor)
                                    } else {
                                      toast.error(response.data.error || '회차 변경에 실패했습니다.')
                                      e.target.value = String(policy.nabang_1 || 1)
                                    }
                                  } catch (error: any) {
                                    console.error('회차 변경 오류:', error)
                                    toast.error(error.response?.data?.error || '회차 변경 중 오류가 발생했습니다.')
                                    e.target.value = String(policy.nabang_1 || 1)
                                  }
                                }}
                                options={Array.from({ length: 10 }, (_, i) => ({ value: i + 1, label: `${i + 1}회차` }))}
                                variant="modal"
                                fullWidth={false}
                                className="text-xs"
                              />
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="px-2 py-2 text-center border border-border">
                            {!isNew && (
                              <span className={getNaStateColor(policy.naColor)}>
                                {policy.naState || '-'}
                                {policy.gigan && typeof policy.gigan === 'number' && policy.gigan > 0 && (
                                  <span className="text-xs text-gray-500 ml-1">({Math.floor(policy.gigan)}일)</span>
                                )}
                              </span>
                            )}
                          </td>
                          <td className="px-2 py-2 text-center border border-border">
                            {!isNew && policy.num ? (
                              <button
                                onClick={() => {
                                  setSelectedCertiTableNum(policy.num!)
                                  setMemberListModalOpen(true)
                                }}
                                className="text-xs text-gray-700 hover:bg-blue-100 hover:text-blue-700 hover:rounded hover:px-2 hover:py-1 hover:border hover:border-blue-300 transition-all cursor-pointer"
                                style={{ background: 'transparent', border: 'none', padding: '0' }}
                              >
                                {policy.inwon?.toLocaleString('ko-KR') || 0}명
                              </button>
                            ) : null}
                          </td>
                          <td className="px-2 py-2 text-center border border-border">
                            {!isNew && policy.num ? (
                              <button
                                onClick={() => {
                                  // Phase 2: 신규 입력 기능 구현 예정
                                  console.log('신규 입력 클릭')
                                }}
                                className="text-xs text-gray-700 hover:bg-green-100 hover:text-green-700 hover:rounded hover:px-2 hover:py-1 hover:border hover:border-green-300 transition-all cursor-pointer"
                                style={{ background: 'transparent', border: 'none', padding: '0' }}
                              >
                                신규
                              </button>
                            ) : null}
                          </td>
                          <td className="px-2 py-2 text-center border border-border">
                            {!isNew && policy.num ? (
                              <button
                                onClick={() => {
                                  setEndorseModalData({
                                    certiTableNum: policy.num!,
                                    insurerCode: policy.InsuraneCompany,
                                    policyNum: policy.certi || policy.policyNum,
                                    gita: policy.gita,
                                    companyNum: companyNum || undefined,
                                  })
                                  setEndorseModalOpen(true)
                                }}
                                className="text-xs text-gray-700 hover:bg-yellow-100 hover:text-yellow-700 hover:rounded hover:px-2 hover:py-1 hover:border hover:border-yellow-300 transition-all cursor-pointer"
                                style={{ background: 'transparent', border: 'none', padding: '0' }}
                              >
                                배서
                              </button>
                            ) : null}
                          </td>
                          <td className="px-2 py-2 text-center border border-border">
                            {!isNew && policy.num ? (
                              <button
                                onClick={async () => {
                                  const currentDivi = policy.divi || 1
                                  const newDivi = currentDivi === 1 ? 2 : 1
                                  const diviName = newDivi === 1 ? '정상납' : '월납'
                                  if (!window.confirm(`결제방식을 "${diviName}"로 변경하시겠습니까?`)) {
                                    return
                                  }
                                  try {
                                    const response = await api.get(
                                      `/api/insurance/kj-certi/update-divi?cNum=${policy.num}&divi=${currentDivi}`
                                    )
                                    if (response.data.success) {
                                      toast.success(response.data.message || `결제방식이 "${response.data.diviName || diviName}"로 변경되었습니다.`)
                                      updateEditingPolicy(idx, 'divi', response.data.divi || newDivi)
                                      updateEditingPolicy(idx, 'diviName', response.data.diviName || diviName)
                                    } else {
                                      toast.error(response.data.error || '결제방식 변경에 실패했습니다.')
                                    }
                                  } catch (error: any) {
                                    console.error('결제방식 변경 오류:', error)
                                    toast.error(error.response?.data?.error || '결제방식 변경 중 오류가 발생했습니다.')
                                  }
                                }}
                                className="text-xs text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:rounded hover:px-2 hover:py-1 hover:border hover:border-gray-300 transition-all cursor-pointer"
                                style={{ background: 'transparent', border: 'none', padding: '0' }}
                              >
                                {policy.diviName || getDiviName(policy.divi)}
                              </button>
                            ) : null}
                          </td>
                          <td className="px-2 py-2 text-center border border-border">
                            {!isNew && policy.num ? (
                              <button
                                onClick={() => {
                                  setSelectedPremiumCertiNum(policy.num!)
                                  setPremiumModalOpen(true)
                                }}
                                className="text-xs text-gray-700 hover:bg-blue-100 hover:text-blue-700 hover:rounded hover:px-2 hover:py-1 hover:border hover:border-blue-300 transition-all cursor-pointer"
                                style={{ background: 'transparent', border: 'none', padding: '0' }}
                              >
                                {policy.divi === 2 ? '보험료' : '입력'}
                              </button>
                            ) : null}
                          </td>
                          <td className="px-2 py-2 text-center border border-border">
                            {!isNew && policy.num ? (
                              <Select
                                value={policy.gita || 1}
                                onChange={async (e) => {
                                  const newGita = Number(e.target.value)
                                  const gitaLabel = getGitaName(newGita)
                                  if (!window.confirm(`증권성격을 "${gitaLabel}"로 변경하시겠습니까?`)) {
                                    e.target.value = String(policy.gita || 1)
                                    return
                                  }
                                  try {
                                    const response = await api.get(
                                      `/api/insurance/kj-certi/update-gita?cNum=${policy.num}&gita=${newGita}`
                                    )
                                    if (response.data.success) {
                                      toast.success(response.data.message || '증권성격이 변경되었습니다.')
                                      updateEditingPolicy(idx, 'gita', newGita)
                                      updateEditingPolicy(idx, 'gitaName', gitaLabel)
                                    } else {
                                      toast.error(response.data.error || '증권성격 변경에 실패했습니다.')
                                      e.target.value = String(policy.gita || 1)
                                    }
                                  } catch (error: any) {
                                    console.error('증권성격 변경 오류:', error)
                                    toast.error(error.response?.data?.error || '증권성격 변경 중 오류가 발생했습니다.')
                                    e.target.value = String(policy.gita || 1)
                                  }
                                }}
                                options={GITA_OPTIONS}
                                variant="modal"
                                fullWidth={false}
                                className="text-xs"
                              />
                            ) : (
                              policy.gitaName || (policy.gita ? getGitaName(policy.gita) : '-')
                            )}
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={14} className="px-3 py-4 text-center text-gray-500 border border-border">
                        증권 정보가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
                {editingPolicies.length > 0 && detail?.inWonTotal !== undefined && (
                  <tfoot>
                    <tr>
                      <td colSpan={8} className="px-2 py-2 text-right font-semibold border border-border">
                        계
                      </td>
                      <td className="px-2 py-2 text-center font-semibold border border-border">
                        {detail.inWonTotal.toLocaleString('ko-KR')}
                      </td>
                      <td colSpan={5} className="border border-border"></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 메모 목록 */}
      {(memoData.length > 0 || contentData.length > 0) && (
        <>
          <hr className="my-4" />
          <div className="mb-4">
            <h6 className="text-sm font-semibold mb-2">메모</h6>
            <div className="overflow-x-auto border border-border rounded">
              <table className="w-full border-collapse" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-2 py-2 font-medium border border-border" style={{ width: '5%' }}>
                      순번
                    </th>
                    <th className="px-2 py-2 font-medium border border-border" style={{ width: '10%' }}>
                      날자
                    </th>
                    <th className="px-2 py-2 font-medium border border-border" style={{ width: '5%' }}>
                      종류
                    </th>
                    <th className="px-2 py-2 font-medium border border-border" style={{ width: '40%' }}>
                      내용
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {memoData.slice(0, 10).map((memo, idx) => {
                    const bgClass = idx % 2 === 0 ? 'bg-gray-50' : ''
                    return (
                      <tr key={idx} className={bgClass}>
                        <td className="px-2 py-2 border border-border">{idx + 1}</td>
                        <td className="px-2 py-2 border border-border">{memo.wdate || ''}</td>
                        <td className="px-2 py-2 border border-border">{memo.memokindName || '일반'}</td>
                        <td className="px-2 py-2 border border-border">{memo.memo || ''}</td>
                      </tr>
                    )
                  })}
                  {contentData.length > 0 && (
                    <tr>
                      <td colSpan={4} className="px-2 py-2 border border-border">
                        <textarea
                          className="w-full px-2 py-1 text-xs border-0 bg-transparent outline-none resize-none"
                          rows={3}
                          readOnly
                          value={contentData.join('\n')}
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* SMS 목록 */}
      {smsData.length > 0 && (
        <>
          <hr className="my-4" />
          <div className="mb-4">
            <h6 className="text-sm font-semibold mb-2">SMS 목록</h6>
            <div className="overflow-x-auto border border-border rounded">
              <table className="w-full border-collapse" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '5%' }}>
                      번호
                    </th>
                    <th className="px-2 py-2 text-left font-medium border border-border" style={{ width: '20%' }}>
                      발송일
                    </th>
                    <th className="px-2 py-2 text-left font-medium border border-border">
                      메세지
                    </th>
                    <th className="px-2 py-2 text-left font-medium border border-border" style={{ width: '10%' }}>
                      회사
                    </th>
                    <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '10%' }}>
                      결과
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {smsData.slice(0, 10).map((sms, idx) => {
                    const bgClass = idx % 2 === 0 ? 'bg-gray-50' : ''
                    const textColor = sms.get == 2 ? '#0A8FC1' : ''
                    return (
                      <tr key={idx} className={bgClass}>
                        <td className="px-2 py-2 text-center border border-border">{idx + 1}</td>
                        <td className="px-2 py-2 border border-border" style={{ color: textColor }}>
                          {sms.dates || ''}
                        </td>
                        <td className="px-2 py-2 border border-border" style={{ color: textColor }}>
                          {sms.Msg || ''}
                        </td>
                        <td className="px-2 py-2 border border-border" style={{ color: textColor }}>
                          {sms.comName || ''}
                        </td>
                        <td className="px-2 py-2 text-center border border-border">
                          {sms.get == 2 ? '수신' : ''}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* 대리기사 리스트 모달 */}
      <MemberListModal
        isOpen={memberListModalOpen}
        onClose={() => {
          setMemberListModalOpen(false)
          setSelectedCertiTableNum(null)
        }}
        certiTableNum={selectedCertiTableNum}
      />

      {/* 배서 모달 */}
      {endorseModalData && (
        <EndorseModal
          isOpen={endorseModalOpen}
          onClose={() => {
            setEndorseModalOpen(false)
            setEndorseModalData(null)
          }}
          certiTableNum={endorseModalData.certiTableNum}
          insurerCode={endorseModalData.insurerCode}
          policyNum={endorseModalData.policyNum}
          gita={endorseModalData.gita}
          companyNum={endorseModalData.companyNum}
          onSuccess={() => {
            // 배서 저장 후 업체 상세 정보 재조회
            if (companyNum) {
              loadDetail()
            }
          }}
        />
      )}

      {/* 월보험료 모달 */}
      <PremiumModal
        isOpen={premiumModalOpen}
        onClose={() => {
          setPremiumModalOpen(false)
          setSelectedPremiumCertiNum(null)
        }}
        certiNum={selectedPremiumCertiNum}
        onSuccess={() => {
          // 월보험료 저장 후 업체 상세 정보 재조회
          if (companyNum) {
            loadDetail()
          }
        }}
      />
    </Modal>
  )
}
