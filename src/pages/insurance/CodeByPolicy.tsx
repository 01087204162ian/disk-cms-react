import { useEffect, useState } from 'react'
import api from '../../lib/api'
import {
  FilterBar,
  useToastHelpers,
  Select,
  DataTable,
  type Column,
} from '../../components'
import { INSURER_MAP } from './constants'
import PolicyDetailModal from './components/PolicyDetailModal'

interface CertiListItem {
  certi: string
  sigi: string
}

interface PolicyItem {
  certi: string
  company: string
  name: string
  owner: string
  jumin: string
  insurance: string | number
  sigi: string
  nab: string
  inwon: number
  maxInwon: number
  cord: string
  cordPass: string
  cordCerti: string
  yearRate: string | number
  harinRate: string | number
}

interface PolicySearchResponse {
  success: boolean
  data: PolicyItem[]
  error?: string
}

interface CertiListResponse {
  success: boolean
  data: CertiListItem[]
  error?: string
}

export default function CodeByPolicy() {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(false)
  const [certiList, setCertiList] = useState<CertiListItem[]>([])
  const [policies, setPolicies] = useState<PolicyItem[]>([])
  const [selectedPolicyNum, setSelectedPolicyNum] = useState<string>('')
  const [policyNumInput, setPolicyNumInput] = useState<string>('')
  const [isDirectInput, setIsDirectInput] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(15)
  const [selectedCerti, setSelectedCerti] = useState<string>('')
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  // 증권번호 목록 로드
  const loadCertiList = async () => {
    try {
      const response = await api.get<CertiListResponse>('/api/insurance/kj-certi/list')
      if (response.data.success) {
        setCertiList(response.data.data || [])
      }
    } catch (error: any) {
      console.error('증권번호 목록 로드 오류:', error)
      toast.error('증권번호 목록을 불러오는 중 오류가 발생했습니다.')
    }
  }

  // 증권 리스트 검색
  const searchPolicies = async () => {
    if (loading) return
    setLoading(true)

    try {
      let certi = ''
      if (isDirectInput) {
        certi = policyNumInput.trim()
      } else if (selectedPolicyNum && selectedPolicyNum !== '') {
        certi = selectedPolicyNum.trim()
      }

      const params: any = {
        sj: 'policy_',
      }
      if (certi) {
        params.certi = certi
      }

      const response = await api.get<PolicySearchResponse>('/api/insurance/kj-code/policy-search', { params })
      
      if (response.data.success) {
        setPolicies(response.data.data || [])
        setCurrentPage(1)
      } else {
        toast.error(response.data.error || '데이터를 불러오는 중 오류가 발생했습니다.')
      }
    } catch (error: any) {
      console.error('증권 리스트 검색 오류:', error)
      toast.error('데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 증권번호 선택 변경
  const handlePolicyNumChange = (value: string) => {
    if (value === '__DIRECT_INPUT__') {
      setIsDirectInput(true)
      setSelectedPolicyNum('')
      setPolicyNumInput('')
    } else {
      setIsDirectInput(false)
      setSelectedPolicyNum(value)
      setPolicyNumInput('')
      // Select에서 증권번호 선택 시 자동 검색
      if (value && value !== '') {
        searchPolicies()
      }
    }
  }

  // 직접 입력 필드에서 Enter 키 처리
  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      searchPolicies()
    }
  }

  // 페이지 변경
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // 테이블로 스크롤
    const table = document.querySelector('.kje-data-table-container')
    if (table) {
      table.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // 증권 상세 모달 열기
  const handleOpenDetail = (certi: string) => {
    setSelectedCerti(certi)
    setDetailModalOpen(true)
  }

  // 초기 로드
  useEffect(() => {
    loadCertiList()
    // 초기 검색 (전체 목록)
    searchPolicies()
  }, [])

  // 증권번호 옵션 생성
  const policyNumOptions = [
    { value: '', label: '증권번호' },
    ...certiList.map((item) => ({
      value: item.certi,
      label: item.certi,
    })),
    { value: '__DIRECT_INPUT__', label: '직접 입력' },
  ]

  // 페이지네이션 계산
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, policies.length)
  const currentPolicies = policies.slice(startIndex, endIndex)

  // 인원 합계 계산
  const totalInwon = policies.reduce((sum, item) => {
    const inwon = parseInt(String(item.inwon || 0), 10)
    return sum + (isNaN(inwon) ? 0 : inwon)
  }, 0)

  // 테이블 컬럼 정의
  const columns: Column<PolicyItem>[] = [
    {
      key: 'num',
      header: '#',
      cell: (row: PolicyItem) => {
        const index = policies.findIndex((p) => p.certi === row.certi)
        return (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleOpenDetail(row.certi)
            }}
            className="text-primary hover:underline"
          >
            {index + 1 + startIndex}
          </button>
        )
      },
      className: 'w-12 text-center',
    },
    {
      key: 'certi',
      header: '증권번호',
      cell: (row: PolicyItem) => row.certi,
      className: 'w-32',
    },
    {
      key: 'company',
      header: '회사명',
      cell: (row: PolicyItem) => row.company,
      className: 'w-32',
    },
    {
      key: 'name',
      header: '계약자',
      cell: (row: PolicyItem) => row.name,
      className: 'w-24',
    },
    {
      key: 'owner',
      header: '소유자',
      cell: (row: PolicyItem) => row.owner,
      className: 'w-24',
    },
    {
      key: 'jumin',
      header: '주민번호',
      cell: (row: PolicyItem) => row.jumin,
      className: 'w-36',
    },
    {
      key: 'insurance',
      header: '보험사',
      cell: (row: PolicyItem) => {
        const insurerCode = String(row.insurance || '')
        return (INSURER_MAP as Record<string, string>)[insurerCode] || insurerCode
      },
      className: 'w-20',
    },
    {
      key: 'sigi',
      header: '계약일',
      cell: (row: PolicyItem) => row.sigi,
      className: 'w-24',
    },
    {
      key: 'nab',
      header: '회차',
      cell: (row: PolicyItem) => row.nab,
      className: 'w-16 text-center',
    },
    {
      key: 'inwon',
      header: '인원',
      cell: (row: PolicyItem) => (row.inwon || 0).toLocaleString('ko-KR'),
      className: 'w-20 text-end',
    },
    {
      key: 'maxInwon',
      header: 'max',
      cell: (row: PolicyItem) => (row.maxInwon || 0).toLocaleString('ko-KR'),
      className: 'w-20 text-end',
    },
    {
      key: 'cord',
      header: '코드',
      cell: (row: PolicyItem) => row.cord,
      className: 'w-24',
    },
    {
      key: 'cordPass',
      header: '비밀번호',
      cell: (row: PolicyItem) => row.cordPass,
      className: 'w-24',
    },
    {
      key: 'cordCerti',
      header: '인증번호',
      cell: (row: PolicyItem) => row.cordCerti,
      className: 'w-28',
    },
    {
      key: 'yearRate',
      header: '단체율',
      cell: (row: PolicyItem) => `${row.yearRate || 0}%`,
      className: 'w-20 text-center',
    },
    {
      key: 'harinRate',
      header: '할인율',
      cell: (row: PolicyItem) => `${row.harinRate || 0}%`,
      className: 'w-20 text-center',
    },
  ]

  return (
    <div className="space-y-4">
      {/* 검색 필터 영역 */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <Select
            value={isDirectInput ? '__DIRECT_INPUT__' : selectedPolicyNum}
            onChange={(e) => handlePolicyNumChange(e.target.value)}
            options={policyNumOptions}
            placeholder="증권번호"
            variant="filter"
          />
          {isDirectInput && (
            <input
              type="text"
              value={policyNumInput}
              onChange={(e) => setPolicyNumInput(e.target.value)}
              onKeyPress={handleInputKeyPress}
              placeholder="직접 입력: 예: 2025-S331191"
              className="mt-2 w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            />
          )}
        </div>
        <FilterBar.SearchButton onClick={searchPolicies} />
        <div className="ml-auto text-sm text-muted-foreground">
          총 {policies.length}개의 증권이 검색되었습니다. ({startIndex + 1}-{endIndex}/{policies.length})
        </div>
      </div>

      {/* 데이터 테이블 */}
      <div className="relative">
        <DataTable
          data={currentPolicies}
          columns={columns}
          loading={loading}
          pagination={{
            currentPage,
            pageSize: itemsPerPage,
            totalCount: policies.length,
            onPageChange: handlePageChange,
          }}
        />
        {/* 합계 행 */}
        {currentPolicies.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <tbody>
                <tr className="bg-gray-100 font-bold">
                  <td colSpan={9} className="text-right px-4 py-2 border border-gray-300">
                    인원 합계:
                  </td>
                  <td className="text-end px-4 py-2 border border-gray-300">
                    {totalInwon.toLocaleString('ko-KR')}
                  </td>
                  <td colSpan={6} className="border border-gray-300"></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 증권 상세 모달 */}
      <PolicyDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false)
          setSelectedCerti('')
        }}
        certi={selectedCerti}
        onUpdate={() => {
          // 모달에서 수정 후 리스트 새로고침
          searchPolicies()
        }}
      />
    </div>
  )
}
