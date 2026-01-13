import { useState, useEffect, useMemo } from 'react'
import { Modal, useToastHelpers, DatePicker, FilterSelect, DataTable, type Column } from '../../../components'
import api from '../../../lib/api'
import { INSURER_MAP, GITA_MAP, PUSH_MAP } from '../constants'

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
  policyNum: string
  etag: number | string
  insuranceCom: number | string
  company: string
  rate: string
  preminum: number
  c_preminum: number
  manager: string
  LastTime: string
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
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 20,
    totalCount: 0,
  })

  // 초기 날짜 설정 (오늘)
  useEffect(() => {
    if (isOpen) {
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      setDate(todayStr)
      loadCompanyOptions(todayStr)
      loadPolicyOptions(todayStr)
    }
  }, [isOpen])

  // 날짜 변경 시 회사/증권 목록 다시 로드
  useEffect(() => {
    if (isOpen && date) {
      loadCompanyOptions(date)
      loadPolicyOptions(date)
      setCompanyNum('')
      setPolicyNum('')
    }
  }, [date, isOpen])

  const loadCompanyOptions = async (endorseDay: string) => {
    try {
      const res = await api.get<{ success: boolean; data: any[] }>(
        '/api/insurance/kj-daily-endorse/company-list',
        { params: { endorseDay } }
      )
      if (res.data.success) {
        const options = res.data.data.map((item) => ({
          value: String(item.num),
          label: item.company || item.companyName || '',
        }))
        setCompanyOptions([{ value: '', label: '-- 대리운전회사 선택 --' }, ...options])
      }
    } catch (error) {
      console.error('대리운전회사 목록 로드 오류:', error)
    }
  }

  const loadPolicyOptions = async (endorseDay: string) => {
    try {
      const res = await api.get<{ success: boolean; data: any[] }>(
        '/api/insurance/kj-daily-endorse/certi-list',
        { params: { endorseDay } }
      )
      if (res.data.success) {
        const options = res.data.data.map((item) => ({
          value: item.policyNum || '',
          label: `${item.policyNum || ''} (${item.company || ''})`,
        }))
        setPolicyOptions([{ value: '', label: '-- 증권 선택 --' }, ...options])
      }
    } catch (error) {
      console.error('증권 목록 로드 오류:', error)
    }
  }

  const loadData = async (page: number = 1) => {
    if (!date) {
      toast.error('날짜를 선택해주세요.')
      return
    }

    try {
      setLoading(true)
      const sort = policyNum ? '3' : companyNum ? '2' : '1'
      const res = await api.post<{
        success: boolean
        data: DailyEndorseItem[]
        total?: number
        error?: string
      }>('/api/insurance/kj-daily-endorse/search', {
        todayStr: date,
        dNum: companyNum || '',
        policyNum: policyNum || '',
        sort,
        page,
      })

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
      console.error('일일배서리스트 조회 오류:', error)
      toast.error(error.response?.data?.error || '데이터를 불러오는 중 오류가 발생했습니다.')
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    loadData(1)
  }

  const columns: Column<DailyEndorseItem>[] = useMemo(() => [
    {
      key: 'SeqNo',
      header: 'No',
      cell: (row) => {
        const index = data.indexOf(row)
        const startIndex = (pagination.currentPage - 1) * pagination.pageSize
        return startIndex + index + 1
      },
      className: 'w-12 text-center',
    },
    {
      key: 'name',
      header: '성명',
      cell: (row) => row.name || '-',
      className: 'w-24',
    },
    {
      key: 'Jumin',
      header: '주민번호',
      cell: (row) => row.Jumin || '-',
      className: 'w-36',
    },
    {
      key: 'hphone',
      header: '핸드폰',
      cell: (row) => row.hphone || '-',
      className: 'w-28',
    },
    {
      key: 'push',
      header: '상태',
      cell: (row) => PUSH_MAP[String(row.push)] || row.push || '-',
      className: 'w-20',
    },
    {
      key: 'policyNum',
      header: '증권번호',
      cell: (row) => row.policyNum || '-',
      className: 'w-36',
    },
    {
      key: 'etag',
      header: '증권성격',
      cell: (row) => GITA_MAP[Number(row.etag)] || row.etag || '-',
      className: 'w-24',
    },
    {
      key: 'insuranceCom',
      header: '보험사',
      cell: (row) => INSURER_MAP[Number(row.insuranceCom)] || row.insuranceCom || '-',
      className: 'w-20',
    },
    {
      key: 'company',
      header: '회사명',
      cell: (row) => row.company || '-',
      className: 'w-36',
    },
    {
      key: 'rate',
      header: '요율',
      cell: (row) => row.rate || '-',
      className: 'w-20',
    },
    {
      key: 'preminum',
      header: '보험료',
      cell: (row) => (row.preminum || 0).toLocaleString('ko-KR'),
      className: 'w-28 text-end',
    },
    {
      key: 'c_preminum',
      header: 'C보험료',
      cell: (row) => (row.c_preminum || 0).toLocaleString('ko-KR'),
      className: 'w-28 text-end',
    },
    {
      key: 'manager',
      header: '처리자',
      cell: (row) => row.manager || '-',
      className: 'w-24',
    },
    {
      key: 'LastTime',
      header: '처리일시',
      cell: (row) => row.LastTime || '-',
      className: 'w-36',
    },
  ], [data, pagination])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="일일배서리스트"
      size="xl"
    >
      <div className="space-y-4">
        {/* 필터 영역 */}
        <div className="flex items-end gap-3 flex-wrap">
          <DatePicker
            value={date}
            onChange={(value) => setDate(value || '')}
            label="날짜"
            className="w-40"
          />
          <FilterSelect
            value={companyNum}
            onChange={(value) => {
              setCompanyNum(value)
              setPolicyNum('')
            }}
            options={companyOptions}
            className="w-48"
          />
          <FilterSelect
            value={policyNum}
            onChange={(value) => setPolicyNum(value)}
            options={policyOptions}
            disabled={!companyNum}
            className="w-48"
          />
          <button
            onClick={handleSearch}
            className="h-10 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            조회
          </button>
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
            onPageChange: (page) => loadData(page),
          }}
          emptyMessage="조회 조건을 선택하고 조회 버튼을 클릭하세요."
        />
      </div>
    </Modal>
  )
}
