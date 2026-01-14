import { useState, useEffect, useMemo } from 'react'
import { Modal, useToastHelpers, DataTable, type Column } from '../../../components'
import api from '../../../lib/api'
import CompanyDetailModal from './CompanyDetailModal'

interface DuplicateListModalProps {
  isOpen: boolean
  onClose: () => void
  jumin: string
}

interface DuplicateItem {
  num: number
  Name: string
  Jumin: string
  age?: number
  push: number
  cancel?: string | number
  sangtae?: string | number
  etag: number
  companyName?: string
  companyNum?: string
  InsuranceCompany?: string
  insuranceCompanyName?: string
  policyNum?: string
  personRateFactor?: number | string
  personRateName?: string
  Hphone?: string
  InputDay?: string
  OutPutDay?: string
  sago: number
  CertiTableNum?: string
}

interface DriverSearchResponse {
  success: boolean
  data: DuplicateItem[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  total?: number
  total_count?: number
  page?: number
  limit?: number
  totalPages?: number
}

export default function DuplicateListModal({ isOpen, onClose, jumin }: DuplicateListModalProps) {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<DuplicateItem[]>([])
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedCompanyNum, setSelectedCompanyNum] = useState<number | null>(null)
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>('')
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 1,
  })

  // 모달이 열릴 때 데이터 로드
  useEffect(() => {
    if (isOpen && jumin) {
      loadData(1, 20)
    }
  }, [isOpen, jumin])

  const loadData = async (page: number = 1, pageSize: number = 20) => {
    if (!jumin) return

    try {
      setLoading(true)
      const params: any = {
        page,
        limit: pageSize,
        jumin: jumin,
        status: '4', // 정상 상태만 조회
      }

      const res = await api.get<DriverSearchResponse>('/api/insurance/kj-driver/list', { params })

      if (res.data.success) {
        setData(res.data.data || [])
        const paginationData = res.data.pagination
        setPagination({
          currentPage: paginationData?.page || res.data.page || page,
          pageSize: paginationData?.limit || res.data.limit || pageSize,
          totalCount: paginationData?.total || res.data.total || res.data.total_count || 0,
          totalPages: paginationData?.totalPages || res.data.totalPages || Math.ceil((paginationData?.total || res.data.total || res.data.total_count || 0) / (paginationData?.limit || res.data.limit || pageSize)),
        })
      } else {
        toast.error('데이터를 불러오는 중 오류가 발생했습니다.')
        setData([])
      }
    } catch (error: any) {
      console.error('중복 리스트 조회 오류:', error)
      toast.error(error.response?.data?.error || '데이터를 불러오는 중 오류가 발생했습니다.')
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    loadData(page, pagination.pageSize)
  }

  const columns: Column<DuplicateItem>[] = useMemo(() => [
    {
      key: 'num',
      header: 'No',
      cell: (row) => {
        const index = data.indexOf(row)
        const startIndex = (pagination.currentPage - 1) * pagination.pageSize
        return <div className="text-center whitespace-nowrap">{startIndex + index + 1}</div>
      },
      className: 'w-12 text-center',
    },
    {
      key: 'Name',
      header: '이름',
      cell: (row) => <div className="whitespace-nowrap">{row.Name || ''}</div>,
    },
    {
      key: 'Jumin',
      header: '주민번호',
      cell: (row) => (
        <div className="whitespace-nowrap">
          {row.Jumin || ''}
          {row.age ? ` (${row.age}세)` : ''}
        </div>
      ),
    },
    {
      key: 'company',
      header: '대리운전회사',
      cell: (row) => {
        const companyText = (row.companyName || '') + (row.companyNum ? ` (${row.companyNum})` : '')
        const companyNum = row.companyNum ? Number(row.companyNum) : null
        return (
          <button
            type="button"
            className="text-primary hover:underline whitespace-nowrap text-left"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (companyNum) {
                setSelectedCompanyNum(companyNum)
                setSelectedCompanyName(row.companyName || '')
                setDetailModalOpen(true)
              }
            }}
          >
            {companyText}
          </button>
        )
      },
    },
    {
      key: 'policyNum',
      header: '증권번호',
      cell: (row) => <div className="whitespace-nowrap">{row.policyNum || ''}</div>,
    },
  ], [data, pagination])

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="중복 리스트"
        maxWidth="6xl"
      >
        <div className="space-y-4">
          <DataTable
            data={data}
            columns={columns}
            loading={loading}
            pagination={{
              currentPage: pagination.currentPage,
              pageSize: pagination.pageSize,
              totalCount: pagination.totalCount,
              onPageChange: handlePageChange,
            }}
            emptyMessage="조회된 데이터가 없습니다."
          />
        </div>
      </Modal>

      {/* 업체 상세 모달 */}
      <CompanyDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false)
          setSelectedCompanyNum(null)
          setSelectedCompanyName('')
        }}
        companyNum={selectedCompanyNum}
        companyName={selectedCompanyName}
      />
    </>
  )
}
