import { useState, useEffect, useMemo } from 'react'
import { Modal, useToastHelpers, DatePicker, FilterSelect, DataTable, type Column, FilterInput } from '../../../components'
import api from '../../../lib/api'

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

      // 초기 데이터 로드 (날짜 범위로)
      if (initialSort === '2' && weekAgoStr && todayStr) {
        loadData(weekAgoStr, todayStr, '2', 1)
      } else if (initialSort === '1' && initialPhone) {
        loadData(initialPhone, '', '1', 1)
      } else if (initialSort === '3' && initialCompanyNum) {
        loadData('', '', '3', 1, String(initialCompanyNum))
      }
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
        error?: string
      }>('/api/insurance/kj-sms/list', params)

      if (res.data.success) {
        setData(res.data.data || [])
        setPagination((prev) => ({
          ...prev,
          currentPage: page,
          totalCount: res.data.total || 0,
        }))
      } else {
        toast.error(res.data.error || '데이터를 불러오는 중 오류가 발생했습니다.')
        setData([])
      }
    } catch (error: any) {
      console.error('문자리스트 조회 오류:', error)
      toast.error(error.response?.data?.error || '데이터를 불러오는 중 오류가 발생했습니다.')
      setData([])
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

  const columns: Column<SmsItem>[] = useMemo(() => [
    {
      key: 'SeqNo',
      header: '순번',
      cell: (row) => {
        const index = data.indexOf(row)
        const startIndex = (pagination.currentPage - 1) * pagination.pageSize
        return startIndex + index + 1
      },
      className: 'w-20 text-center',
    },
    {
      key: 'phone',
      header: '수신번호',
      cell: (row) => {
        const phone = `${row.Rphone1 || ''}-${row.Rphone2 || ''}-${row.Rphone3 || ''}`
        return phone || '-'
      },
      className: 'w-32',
    },
    {
      key: 'Msg',
      header: '메시지',
      cell: (row) => <div className="whitespace-pre-wrap">{row.Msg || '-'}</div>,
      className: 'w-auto',
    },
    {
      key: 'LastTime',
      header: '발송시간',
      cell: (row) => row.LastTime || '-',
      className: 'w-48',
    },
  ], [data, pagination])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="문자리스트"
      maxWidth="6xl"
    >
      <div className="space-y-4">
        {/* 필터 영역 */}
        <div className="flex items-end gap-3 flex-wrap">
          <FilterSelect
            value={sort}
            onChange={(value) => {
              setSort(value)
              setPhone('')
              setCompany('')
              setStartDate('')
              setEndDate('')
            }}
            options={[
              { value: '1', label: '핸드폰' },
              { value: '2', label: '날짜 범위' },
              { value: '3', label: '대리운전회사' },
            ]}
            className="w-32"
          />
          {sort === '1' && (
            <FilterInput
              value={phone}
              onChange={(value) => setPhone(value)}
              placeholder="010-1234-5678"
              className="w-48"
            />
          )}
          {sort === '2' && (
            <>
              <DatePicker
                value={startDate}
                onChange={(value) => setStartDate(value || '')}
                label="시작일"
                className="w-40"
              />
              <DatePicker
                value={endDate}
                onChange={(value) => setEndDate(value || '')}
                label="종료일"
                className="w-40"
              />
            </>
          )}
          {sort === '3' && (
            <FilterInput
              value={company}
              onChange={(value) => setCompany(value)}
              placeholder="회사명 입력"
              className="w-48"
            />
          )}
          <button
            onClick={handleSearch}
            className="h-10 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            조회
          </button>
          <div className="ml-auto text-sm text-muted-foreground">
            총 <strong>{pagination.totalCount.toLocaleString('ko-KR')}</strong>건
          </div>
        </div>

        {/* 데이터 테이블 */}
        <DataTable
          data={data}
          columns={columns}
          loading={loading}
          pagination={{
            currentPage: pagination.currentPage,
            pageSize: pagination.pageSize,
            totalCount: pagination.totalCount,
            onPageChange: (page) => {
              if (sort === '1') {
                loadData(phone, '', '1', page)
              } else if (sort === '2') {
                loadData(startDate, endDate, '2', page)
              } else if (sort === '3') {
                loadData(company, '', '3', page, initialCompanyNum ? String(initialCompanyNum) : undefined)
              }
            },
          }}
          emptyMessage="검색 조건을 선택하고 조회 버튼을 클릭하세요."
        />
      </div>
    </Modal>
  )
}
