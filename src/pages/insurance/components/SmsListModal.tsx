import { useState, useEffect } from 'react'
import { Modal, useToastHelpers } from '../../../components'
import api from '../../../lib/api'
import { MessageSquare } from 'lucide-react'

interface SmsListModalProps {
  isOpen: boolean
  onClose: () => void
  initialPhone?: string
  initialCompanyNum?: string | number
  initialSort?: string
}

interface SmsItem {
  SeqNo: number
  Rphone1: string
  Rphone2: string
  Rphone3: string
  Msg: string
  LastTime: string
}

export default function SmsListModal({
  isOpen,
  onClose,
  initialPhone = '',
  initialCompanyNum,
  initialSort = '2',
}: SmsListModalProps) {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(false)
  const [sort, setSort] = useState(initialSort)
  const [phone, setPhone] = useState(initialPhone)
  const [company, setCompany] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [data, setData] = useState<SmsItem[]>([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 15,
    totalCount: 0,
    totalPages: 1,
  })

  // 초기 날짜 설정 (7일 전 ~ 오늘)
  useEffect(() => {
    if (isOpen) {
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      setEndDate(todayStr)

      const weekAgo = new Date(today)
      weekAgo.setDate(today.getDate() - 7)
      const weekAgoStr = weekAgo.toISOString().split('T')[0]
      setStartDate(weekAgoStr)

      // 초기 데이터 로드 (약간의 지연을 두어 DOM이 완전히 렌더링된 후 실행)
      setTimeout(() => {
        if (initialSort === '2' && weekAgoStr && todayStr) {
          loadData(weekAgoStr, todayStr, '2', 1)
        } else if (initialSort === '1' && initialPhone) {
          loadData(initialPhone, '', '1', 1)
        } else if (initialSort === '3' && initialCompanyNum) {
          loadData('', '', '3', 1, String(initialCompanyNum))
        } else {
          // 기본값: 날짜 범위로 조회
          loadData(weekAgoStr, todayStr, '2', 1)
        }
      }, 100)
    }
  }, [isOpen, initialSort, initialPhone, initialCompanyNum])

  const loadData = async (
    searchParam: string,
    endDateParam: string,
    sortParam: string,
    page: number = 1,
    dnum?: string
  ) => {
    try {
      setLoading(true)
      const params: any = {
        sort: sortParam,
        page,
      }

      if (sortParam === '1') {
        // 핸드폰 번호로 검색
        params.phone = searchParam
      } else if (sortParam === '2') {
        // 날짜 범위로 검색
        params.startDate = searchParam
        params.endDate = endDateParam
      } else if (sortParam === '3') {
        // 회사명으로 검색
        params.company = searchParam
        if (dnum) params.dnum = dnum
      }

      const res = await api.post<{
        success: boolean
        data: SmsItem[]
        total?: number
        totalPages?: number
        totalRecords?: number
        page?: number
        error?: string
      }>('/api/insurance/kj-sms/list', params)

      if (res.data.success) {
        const items = res.data.data || []
        setData(items)
        setPagination({
          currentPage: res.data.page || page,
          pageSize: 15,
          totalCount: res.data.totalRecords || res.data.total || 0,
          totalPages: res.data.totalPages || 1,
        })
      } else {
        toast.error(res.data.error || '데이터를 불러오는 중 오류가 발생했습니다.')
        setData([])
        setPagination({
          currentPage: 1,
          pageSize: 15,
          totalCount: 0,
          totalPages: 1,
        })
      }
    } catch (error: any) {
      console.error('문자리스트 조회 오류:', error)
      toast.error(error.response?.data?.error || '데이터를 불러오는 중 오류가 발생했습니다.')
      setData([])
      setPagination({
        currentPage: 1,
        pageSize: 15,
        totalCount: 0,
        totalPages: 1,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    if (sort === '1' && !phone) {
      toast.error('전화번호를 입력해주세요.')
      return
    }
    if (sort === '2' && (!startDate || !endDate)) {
      toast.error('시작일과 종료일을 선택해주세요.')
      return
    }
    if (sort === '3' && !company) {
      toast.error('대리운전회사명을 입력해주세요.')
      return
    }

    if (sort === '1') {
      loadData(phone, '', '1', 1)
    } else if (sort === '2') {
      loadData(startDate, endDate, '2', 1)
    } else if (sort === '3') {
      loadData(company, '', '3', 1, initialCompanyNum ? String(initialCompanyNum) : undefined)
    }
  }

  const handlePageChange = (page: number) => {
    if (sort === '1') {
      loadData(phone, '', '1', page)
    } else if (sort === '2') {
      loadData(startDate, endDate, '2', page)
    } else if (sort === '3') {
      loadData(company, '', '3', page, initialCompanyNum ? String(initialCompanyNum) : undefined)
    }
  }

  const formatSmsDateTime = (dateStr: string) => {
    if (!dateStr || dateStr.length < 14) return '-'
    
    const year = dateStr.substring(0, 4)
    const month = dateStr.substring(4, 6)
    const day = dateStr.substring(6, 8)
    const hour = dateStr.substring(8, 10)
    const minute = dateStr.substring(10, 12)
    const second = dateStr.substring(12, 14)
    
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
  }

  const handleSortChange = (value: string) => {
    setSort(value)
    setPhone('')
    setCompany('')
    setStartDate('')
    setEndDate('')
    
    // 날짜 범위로 변경 시 초기 날짜 설정
    if (value === '2') {
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      setEndDate(todayStr)

      const weekAgo = new Date(today)
      weekAgo.setDate(today.getDate() - 7)
      const weekAgoStr = weekAgo.toISOString().split('T')[0]
      setStartDate(weekAgoStr)
    }
  }

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '') // 숫자만 추출
    if (value.length > 0) {
      if (value.length <= 3) {
        value = value
      } else if (value.length <= 7) {
        value = value.substring(0, 3) + '-' + value.substring(3)
      } else if (value.length <= 11) {
        value = value.substring(0, 3) + '-' + value.substring(3, 7) + '-' + value.substring(7)
      } else {
        value = value.substring(0, 3) + '-' + value.substring(3, 7) + '-' + value.substring(7, 11)
      }
    }
    setPhone(value)
  }

  const handlePhoneKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleCompanyKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="inline-flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          문자리스트
        </span>
      }
      maxWidth="6xl"
      maxHeight="90vh"
      position="center"
    >
      <div className="space-y-4">
        {/* 필터 영역 - 이전 버전과 동일한 레이아웃 */}
        <div className="grid grid-cols-12 gap-2 items-end">
          <div className="col-span-2">
            <select
            value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full h-8 px-2 text-sm rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              title="검색 방식"
            >
              <option value="2">날짜 범위</option>
              <option value="1">전화번호</option>
              <option value="3">대리운전회사</option>
            </select>
          </div>
          
          {/* 전화번호 필터 */}
          {sort === '1' && (
            <div className="col-span-2">
              <input
                type="text"
                value={phone}
                onChange={handlePhoneInput}
                onKeyPress={handlePhoneKeyPress}
                placeholder="010-1234-5678"
                className="w-full h-8 px-2 text-sm rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                title="전화번호"
              />
            </div>
          )}
          
          {/* 날짜 범위 필터 */}
          {sort === '2' && (
            <>
              <div className="col-span-2">
                <input
                  type="date"
                value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-8 px-2 text-sm rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  title="시작일"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="date"
                value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-8 px-2 text-sm rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  title="종료일"
                />
              </div>
            </>
          )}
          
          {/* 대리운전회사 필터 */}
          {sort === '3' && (
            <div className="col-span-3">
              <input
                type="text"
              value={company}
                onChange={(e) => setCompany(e.target.value)}
                onKeyPress={handleCompanyKeyPress}
              placeholder="회사명 입력"
                className="w-full h-8 px-2 text-sm rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                title="대리운전회사"
            />
            </div>
          )}
          
          {/* 조회 버튼 */}
          <div className="col-span-2">
          <button
            onClick={handleSearch}
              className="w-full h-8 px-3 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-1"
          >
            조회
          </button>
          </div>
          
          {/* 총 건수 */}
          <div className="col-span-1">
            <div className="text-muted-foreground text-xs text-end">
              총 <span className="font-semibold">{pagination.totalCount.toLocaleString('ko-KR')}</span>건
            </div>
          </div>
        </div>

        {/* 테이블 */}
        {loading ? (
          <div className="text-center py-8">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">로딩 중...</span>
            </div>
            <p className="mt-2">데이터를 불러오는 중...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            검색 조건을 선택하고 조회 버튼을 클릭하세요.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300" style={{ fontSize: '0.75rem' }}>
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-2 py-2 text-center font-medium" style={{ width: '8%' }}>순번</th>
                    <th className="border border-gray-300 px-2 py-2 text-center font-medium" style={{ width: '15%' }}>수신번호</th>
                    <th className="border border-gray-300 px-2 py-2 text-center font-medium" style={{ width: '50%' }}>메시지</th>
                    <th className="border border-gray-300 px-2 py-2 text-center font-medium" style={{ width: '27%' }}>발송시간</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => {
                    const rowIndex = (pagination.currentPage - 1) * pagination.pageSize + index
                    const phone = `${item.Rphone1 || ''}-${item.Rphone2 || ''}-${item.Rphone3 || ''}`
                    const msg = item.Msg || '-'
                    const lastTime = formatSmsDateTime(item.LastTime)
                    
                    return (
                      <tr key={item.SeqNo || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} style={{ cursor: 'pointer' }}>
                        <td className="border border-gray-300 px-2 py-2 text-center">{rowIndex + 1}</td>
                        <td className="border border-gray-300 px-2 py-2">{phone || '-'}</td>
                        <td className="border border-gray-300 px-2 py-2" style={{ wordBreak: 'break-word' }}>
                          <div className="whitespace-pre-wrap">{msg}</div>
                        </td>
                        <td className="border border-gray-300 px-2 py-2">{lastTime}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-1 mt-3">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.currentPage === 1}
                  className="px-2 py-1 text-xs border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  이전
                </button>
                {(() => {
                  const startPage = Math.max(1, pagination.currentPage - 2)
                  const endPage = Math.min(pagination.totalPages, pagination.currentPage + 2)
                  const pages: React.ReactNode[] = []
                  
                  if (startPage > 1) {
                    pages.push(
                      <button
                        key={1}
                        onClick={() => handlePageChange(1)}
                        className="px-2 py-1 text-xs border rounded hover:bg-gray-100"
                      >
                        1
                      </button>
                    )
                    if (startPage > 2) {
                      pages.push(
                        <span key="ellipsis-start" className="px-2 py-1 text-xs text-muted-foreground">
                          ...
                        </span>
                      )
                    }
                  }
                  
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`px-2 py-1 text-xs border rounded ${
                          i === pagination.currentPage
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {i}
                      </button>
                    )
                  }
                  
                  if (endPage < pagination.totalPages) {
                    if (endPage < pagination.totalPages - 1) {
                      pages.push(
                        <span key="ellipsis-end" className="px-2 py-1 text-xs text-muted-foreground">
                          ...
                        </span>
                      )
                    }
                    pages.push(
                      <button
                        key={pagination.totalPages}
                        onClick={() => handlePageChange(pagination.totalPages)}
                        className="px-2 py-1 text-xs border rounded hover:bg-gray-100"
                      >
                        {pagination.totalPages}
                      </button>
                    )
                  }
                  
                  return pages
                })()}
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-2 py-1 text-xs border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  )
}
