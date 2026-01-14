import { useState, useEffect, useMemo } from 'react'
import { Modal, useToastHelpers, DatePicker, FilterSelect } from '../../../components'
import api from '../../../lib/api'
import { INSURER_MAP, GITA_MAP, PUSH_MAP, GITA_OPTIONS } from '../constants'
import { List, CheckCircle2 } from 'lucide-react'
import EndorseStatusModal from './EndorseStatusModal'

interface DailyEndorseListModalProps {
  isOpen: boolean
  onClose: () => void
}

interface DailyEndorseItem {
  SeqNo: number
  name: string
  Jumin: string
  hphone: string
  push: number | string
  cancel?: string | number
  policyNum: string
  etag: number | string
  insuranceCom: number | string
  company: string
  Rphone1?: string
  Rphone2?: string
  Rphone3?: string
  rate: string
  preminum: number
  c_preminum: number
  manager: string
  LastTime: string
}

interface SituationCounts {
  subscription: number
  subscriptionCancel: number
  subscriptionReject: number
  termination: number
  terminationCancel: number
  total: number
}

export default function DailyEndorseListModal({ isOpen, onClose }: DailyEndorseListModalProps) {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState('')
  const [companyNum, setCompanyNum] = useState('')
  const [policyNum, setPolicyNum] = useState('')
  const [companyOptions, setCompanyOptions] = useState<{ value: string; label: string }[]>([])
  const [policyOptions, setPolicyOptions] = useState<{ value: string; label: string }[]>([])
  const [data, setData] = useState<DailyEndorseItem[]>([])
  const [situation, setSituation] = useState<SituationCounts>({
    subscription: 0,
    subscriptionCancel: 0,
    subscriptionReject: 0,
    termination: 0,
    terminationCancel: 0,
    total: 0,
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 15,
    totalCount: 0,
    totalPages: 1,
  })
  const [endorseStatusModalOpen, setEndorseStatusModalOpen] = useState(false)

  // 초기 날짜 설정 (오늘) 및 자동 조회
  useEffect(() => {
    if (isOpen) {
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      setDate(todayStr)
      setCompanyNum('')
      setPolicyNum('')
      loadCompanyOptions(todayStr)
      loadPolicyOptions(todayStr, '', '')
      // 모달 열 때 자동 조회
      setTimeout(() => {
        loadData(1, todayStr, '', '', 1)
      }, 100)
    }
  }, [isOpen])

  // 날짜 변경 시 회사/증권 목록 다시 로드 및 자동 조회
  useEffect(() => {
    if (isOpen && date) {
      loadCompanyOptions(date)
      loadPolicyOptions(date, companyNum, policyNum)
      const sort = policyNum ? '3' : companyNum ? '2' : '1'
      loadData(1, date, companyNum, policyNum, sort)
    }
  }, [date])

  // 회사 변경 시 증권 목록 다시 로드 및 자동 조회
  useEffect(() => {
    if (isOpen && date && companyNum) {
      loadPolicyOptions(date, companyNum, '')
      setPolicyNum('')
      loadData(1, date, companyNum, '', 2)
    } else if (isOpen && date && !companyNum) {
      loadPolicyOptions(date, '', '')
      setPolicyNum('')
      loadData(1, date, '', '', 1)
    }
  }, [companyNum])

  // 증권 변경 시 자동 조회
  useEffect(() => {
    if (isOpen && date && companyNum && policyNum) {
      loadData(1, date, companyNum, policyNum, 3)
    }
  }, [policyNum])

  const loadCompanyOptions = async (endorseDay: string) => {
    try {
      const res = await api.get<{ success: boolean; data: any[] }>(
        '/api/insurance/kj-daily-endorse/company-list',
        { params: { endorseDay } }
      )
      if (res.data.success) {
        const items = res.data.data || []
        // 케이드라이브(dNum: "653")를 최상단에 표시
        const kaiDriveItem = items.find((item: any) => String(item.dNum || item.num || '') === '653')
        const otherItems = items.filter((item: any) => String(item.dNum || item.num || '') !== '653')
        
        const options: { value: string; label: string }[] = []
        if (kaiDriveItem) {
          options.push({
            value: String(kaiDriveItem.dNum || kaiDriveItem.num || ''),
            label: kaiDriveItem.company || kaiDriveItem.companyName || '',
          })
        }
        otherItems.forEach((item: any) => {
          options.push({
            value: String(item.dNum || item.num || ''),
            label: item.company || item.companyName || '',
          })
        })
        
        setCompanyOptions([{ value: '', label: '-- 대리운전회사 선택 --' }, ...options])
      }
    } catch (error) {
      console.error('대리운전회사 목록 로드 오류:', error)
    }
  }

  const loadPolicyOptions = async (endorseDay: string, dNum: string, policyNum: string) => {
    try {
      const sort = policyNum ? '3' : dNum ? '2' : '1'
      const res = await api.get<{ success: boolean; data: any[] }>(
        '/api/insurance/kj-daily-endorse/certi-list',
        { params: { endorseDay, dNum: dNum || '', policyNum: policyNum || '', sort } }
      )
      if (res.data.success) {
        const items = res.data.data || []
        const options = items.map((item: any) => {
          const insuranceComCode = parseInt(item.insuranceCom) || 0
          const insuranceCompany = INSURER_MAP[insuranceComCode] || String(item.insuranceCom || '알 수 없음')
          return {
            value: item.policyNum || '',
            label: `${insuranceCompany}[${item.policyNum || ''}]`,
          }
        })
        setPolicyOptions([
          { value: '', label: '-- 증권 선택 --' },
          { value: '1', label: '-- 모든 증권 --' },
          ...options,
        ])
      }
    } catch (error) {
      console.error('증권 목록 로드 오류:', error)
    }
  }

  const loadData = async (page: number = 1, selectedDate?: string, dNum?: string, policyNum?: string, sort?: string) => {
    const dateToUse = selectedDate || date
    if (!dateToUse) {
      return
    }

    const companyToUse = dNum !== undefined ? dNum : companyNum
    const policyToUse = policyNum !== undefined ? policyNum : policyNum
    const sortToUse = sort !== undefined ? sort : (policyToUse ? '3' : companyToUse ? '2' : '1')

    try {
      setLoading(true)
      const res = await api.post<{
        success: boolean
        data: DailyEndorseItem[]
        total?: number
        error?: string
      }>('/api/insurance/kj-daily-endorse/search', {
        todayStr: dateToUse,
        dNum: companyToUse || '',
        policyNum: policyToUse || '',
        sort: sortToUse,
        page,
      })

      if (res.data.success) {
        const allData = res.data.data || []
        
        // 페이지네이션 처리 (15개씩)
        const itemsPerPage = 15
        const totalItems = allData.length
        const totalPages = Math.ceil(totalItems / itemsPerPage)
        const currentPage = Math.max(1, Math.min(page, totalPages))
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
        const currentPageItems = allData.slice(startIndex, endIndex)

        setData(currentPageItems)
        setPagination({
          currentPage,
          pageSize: itemsPerPage,
          totalCount: totalItems,
          totalPages,
        })

        // 통계 계산 (전체 데이터 기준)
        const counts: SituationCounts = {
          subscription: 0,
          subscriptionCancel: 0,
          subscriptionReject: 0,
          termination: 0,
          terminationCancel: 0,
          total: allData.length,
        }

        allData.forEach((item) => {
          const push = String(item.push)
          if (push === '1') {
            const cancel = String(item.cancel || '')
            if (cancel === '12') {
              counts.subscriptionCancel++
            } else if (cancel === '13') {
              counts.subscriptionReject++
            } else {
              counts.subscription++
            }
          } else if (push === '2') {
            counts.termination++
          } else if (push === '4') {
            const cancel = String(item.cancel || '')
            if (cancel === '45') {
              counts.terminationCancel++
            } else {
              counts.subscription++
            }
          }
        })

        setSituation(counts)
      } else {
        toast.error(res.data.error || '데이터를 불러오는 중 오류가 발생했습니다.')
        setData([])
        setSituation({
          subscription: 0,
          subscriptionCancel: 0,
          subscriptionReject: 0,
          termination: 0,
          terminationCancel: 0,
          total: 0,
        })
      }
    } catch (error: any) {
      console.error('일일배서리스트 조회 오류:', error)
      toast.error(error.response?.data?.error || '데이터를 불러오는 중 오류가 발생했습니다.')
      setData([])
      setSituation({
        subscription: 0,
        subscriptionCancel: 0,
        subscriptionReject: 0,
        termination: 0,
        terminationCancel: 0,
        total: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    const sort = policyNum ? '3' : companyNum ? '2' : '1'
    loadData(page, date, companyNum, policyNum, sort)
  }

  const handleReview = () => {
    if (!companyNum) {
      toast.error('대리운전회사 선택부터 하세요!!')
      return
    }
    if (!date) {
      toast.error('날짜를 선택해주세요.')
      return
    }
    setEndorseStatusModalOpen(true)
  }

  const formatDateWithTime = (lastTime: string) => {
    if (!lastTime) return '-'
    if (lastTime.length === 14) {
      return `${lastTime.substring(0, 4)}-${lastTime.substring(4, 6)}-${lastTime.substring(6, 8)} ${lastTime.substring(8, 10)}:${lastTime.substring(10, 12)}:${lastTime.substring(12, 14)}`
    }
    return lastTime
  }

  const formatPhone = (rphone1?: string, rphone2?: string, rphone3?: string) => {
    if (!rphone1 && !rphone2 && !rphone3) return '-'
    return `${rphone1 || ''}-${rphone2 || ''}-${rphone3 || ''}`
  }

  const getStatusStyle = (push: string | number) => {
    if (push === '2' || push === 2) {
      return { color: 'red', fontWeight: 'bold' }
    } else if (push === '4' || push === 4) {
      return { color: 'green', fontWeight: 'bold' }
    }
    return {}
  }

  const situationText = useMemo(() => {
    const parts: string[] = []
    if (situation.subscription) parts.push(`청약:${situation.subscription}`)
    if (situation.subscriptionCancel) parts.push(`청약취소:${situation.subscriptionCancel}`)
    if (situation.subscriptionReject) parts.push(`청약거절:${situation.subscriptionReject}`)
    if (situation.termination) parts.push(`해지:${situation.termination}`)
    if (situation.terminationCancel) parts.push(`해지취소:${situation.terminationCancel}`)
    if (situation.total) parts.push(`계:${situation.total}`)
    return parts.join(' ')
  }, [situation])

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={
          <span className="inline-flex items-center gap-2">
            <List className="w-5 h-5" />
            일일배서리스트
          </span>
        }
        maxWidth="6xl"
        maxHeight="90vh"
        position="center"
      >
        <div className="space-y-4">
          {/* 필터 영역 - 이전 버전과 동일한 레이아웃 */}
          <div className="grid grid-cols-12 gap-3 items-end">
            <div className="col-span-2">
              <DatePicker
                value={date}
                onChange={(value) => setDate(value || '')}
                className="w-full"
                variant="filter"
              />
            </div>
            <div className="col-span-3">
              <FilterSelect
                value={companyNum}
                onChange={(value) => setCompanyNum(value)}
                options={companyOptions}
                className="w-full"
              />
            </div>
            <div className="col-span-2">
              <FilterSelect
                value={policyNum}
                onChange={(value) => setPolicyNum(value)}
                options={policyOptions}
                disabled={!companyNum}
                className="w-full"
              />
            </div>
            <div className="col-span-5 flex items-center justify-end gap-2">
              <div className="text-info font-bold text-sm">{situationText}</div>
              <button
                onClick={handleReview}
                disabled={!companyNum}
                className="h-8 px-3 bg-secondary text-secondary-foreground rounded border hover:bg-secondary/90 transition-colors inline-flex items-center gap-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4" />
                검토
              </button>
            </div>
          </div>

          {/* 데이터 테이블 */}
          {loading ? (
            <div className="text-center py-8">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">로딩 중...</span>
              </div>
              <p className="mt-2">데이터를 불러오는 중입니다...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              조회 조건을 선택하고 조회 버튼을 클릭하세요.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300" style={{ fontSize: '0.75rem' }}>
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-2 py-2 text-center font-medium">No</th>
                      <th className="border border-gray-300 px-2 py-2 text-center font-medium">성명</th>
                      <th className="border border-gray-300 px-2 py-2 text-center font-medium">주민번호</th>
                      <th className="border border-gray-300 px-2 py-2 text-center font-medium">핸드폰</th>
                      <th className="border border-gray-300 px-2 py-2 text-center font-medium">상태</th>
                      <th className="border border-gray-300 px-2 py-2 text-center font-medium">증권번호</th>
                      <th className="border border-gray-300 px-2 py-2 text-center font-medium">증권성격</th>
                      <th className="border border-gray-300 px-2 py-2 text-center font-medium">보험사</th>
                      <th className="border border-gray-300 px-2 py-2 text-center font-medium">회사명</th>
                      <th className="border border-gray-300 px-2 py-2 text-center font-medium">회사전화</th>
                      <th className="border border-gray-300 px-2 py-2 text-center font-medium">요율</th>
                      <th className="border border-gray-300 px-2 py-2 text-center font-medium" style={{ width: '8%' }}>보험료</th>
                      <th className="border border-gray-300 px-2 py-2 text-center font-medium" style={{ width: '8%' }}>C보험료</th>
                      <th className="border border-gray-300 px-2 py-2 text-center font-medium">처리자</th>
                      <th className="border border-gray-300 px-2 py-2 text-center font-medium">처리일시</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => {
                      const rowIndex = (pagination.currentPage - 1) * pagination.pageSize + index
                      return (
                        <tr key={item.SeqNo || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-2 py-2 text-center">{rowIndex + 1}</td>
                          <td className="border border-gray-300 px-2 py-2">{item.name || '-'}</td>
                          <td className="border border-gray-300 px-2 py-2">{item.Jumin || '-'}</td>
                          <td className="border border-gray-300 px-2 py-2">{item.hphone || '-'}</td>
                          <td className="border border-gray-300 px-2 py-2 text-center" style={getStatusStyle(item.push)}>
                            {PUSH_MAP[String(item.push)] || item.push || '-'}
                          </td>
                          <td className="border border-gray-300 px-2 py-2">{item.policyNum || '-'}</td>
                          <td className="border border-gray-300 px-2 py-2 text-center">
                            {GITA_OPTIONS.find((opt) => String(opt.value) === String(item.etag))?.label || item.etag || '-'}
                          </td>
                          <td className="border border-gray-300 px-2 py-2 text-center">
                            {INSURER_MAP[Number(item.insuranceCom)] || item.insuranceCom || '-'}
                          </td>
                          <td className="border border-gray-300 px-2 py-2">{item.company || '-'}</td>
                          <td className="border border-gray-300 px-2 py-2 text-center">
                            {formatPhone(item.Rphone1, item.Rphone2, item.Rphone3)}
                          </td>
                          <td className="border border-gray-300 px-2 py-2 text-center">
                            <button
                              className="text-primary hover:underline cursor-pointer"
                              onClick={() => {
                                // TODO: 요율 상세 모달 열기
                                toast.info('요율 상세 설명 기능은 구현 중입니다.')
                              }}
                            >
                              {item.rate || '1'}
                            </button>
                          </td>
                          <td className="border border-gray-300 px-2 py-2" style={{ padding: 0 }}>
                            <input
                              type="text"
                              value={(item.preminum || 0).toLocaleString('ko-KR')}
                              className="w-full text-xs px-1 py-0.5 text-right border border-transparent bg-transparent focus:border-input focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                              style={{ fontSize: '0.75rem' }}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  // TODO: 보험료 업데이트
                                  toast.info('보험료 업데이트 기능은 구현 중입니다.')
                                }
                              }}
                              readOnly
                            />
                          </td>
                          <td className="border border-gray-300 px-2 py-2" style={{ padding: 0 }}>
                            <input
                              type="text"
                              value={(item.c_preminum || 0).toLocaleString('ko-KR')}
                              className="w-full text-xs px-1 py-0.5 text-right border border-transparent bg-transparent focus:border-input focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                              style={{ fontSize: '0.75rem' }}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  // TODO: C보험료 업데이트
                                  toast.info('C보험료 업데이트 기능은 구현 중입니다.')
                                }
                              }}
                              readOnly
                            />
                          </td>
                          <td className="border border-gray-300 px-2 py-2">{item.manager || '-'}</td>
                          <td className="border border-gray-300 px-2 py-2">{formatDateWithTime(item.LastTime)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* 페이지네이션 */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={pagination.currentPage === 1}
                    className="px-2 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    «
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="px-2 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    ‹
                  </button>
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const startPage = Math.max(1, pagination.currentPage - 2)
                    const page = startPage + i
                    if (page > pagination.totalPages) return null
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 text-sm border rounded ${
                          page === pagination.currentPage
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-2 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    ›
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-2 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    »
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </Modal>

      {/* 배서현황 모달 - 검토 버튼 클릭 시 열림 */}
      {endorseStatusModalOpen && (
        <EndorseStatusModal
          isOpen={endorseStatusModalOpen}
          onClose={() => setEndorseStatusModalOpen(false)}
        />
      )}
    </>
  )
}
