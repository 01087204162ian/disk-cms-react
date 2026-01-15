import { useEffect, useState } from 'react'
import api from '../../lib/api'
import {
  FilterBar,
  DataTable,
  type Column,
  useToastHelpers,
  DatePicker,
  Modal,
  ExportButton,
  Select,
} from '../../components'
import { INSURER_OPTIONS, getInsurerName } from './constants'

interface CertiListItem {
  certi: string
  sigi: string
}

interface PolicySearchResult {
  num: number
  DaeriCompany: string
  policyNum: string
  currentInwon: number
  startyDay: string
}

interface SearchData {
  certiTableRows: PolicySearchResult[]
  totalRows: number
  filteredRows: number
  memberCount: number
  filteredMemberCount: number
}

interface PolicySearchResponse {
  success: boolean
  data: SearchData
  error?: string
}

interface CertiListResponse {
  success: boolean
  data: CertiListItem[]
  error?: string
}

export default function PolicySearch() {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(false)
  const [certiList, setCertiList] = useState<CertiListItem[]>([])
  const [searchResults, setSearchResults] = useState<PolicySearchResult[]>([])
  const [statistics, setStatistics] = useState<SearchData | null>(null)
  const [changeModalOpen, setChangeModalOpen] = useState(false)

  // 필터 상태
  const [filters, setFilters] = useState({
    policyNum: '', // 증권번호 선택 값
    policyNumInput: '', // 직접 입력 값
    isDirectInput: false, // 직접 입력 모드인지
    startyDay: '', // 시작일
  })

  // 변경 모달 상태
  const [changeForm, setChangeForm] = useState({
    newPolicyNum: '',
    newStartyDay: '',
    newInsuranceCompany: '',
  })

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

  // 증권번호 옵션 생성 (목록 + 직접 입력)
  const policyNumOptions = [
    { value: '', label: '증권번호 선택' },
    ...certiList.map((item) => ({
      value: item.certi,
      label: item.certi,
      sigi: item.sigi,
    })),
    { value: '__DIRECT_INPUT__', label: '직접 입력' },
  ]

  // 증권번호 선택 변경
  const handlePolicyNumChange = async (value: string) => {
    if (value === '__DIRECT_INPUT__') {
      setFilters((prev) => ({
        ...prev,
        policyNum: '__DIRECT_INPUT__',
        isDirectInput: true,
        startyDay: '', // 직접 입력 시 시작일 초기화
      }))
    } else {
      const selectedItem = certiList.find((item) => item.certi === value)
      const newStartyDay = selectedItem?.sigi || ''
      
      setFilters((prev) => ({
        ...prev,
        policyNum: value,
        isDirectInput: false,
        policyNumInput: '',
        startyDay: newStartyDay,
      }))

      // 증권번호 선택 시 자동 검색 실행
      if (value && newStartyDay) {
        // 상태 업데이트 후 검색 실행을 위해 약간의 지연
        setTimeout(() => {
          handleSearch(value, newStartyDay)
        }, 0)
      }
    }
  }

  // 검색 실행
  const handleSearch = async (policyNumOverride?: string, startyDayOverride?: string) => {
    const policyNum = policyNumOverride !== undefined 
      ? policyNumOverride 
      : (filters.isDirectInput ? filters.policyNumInput.trim() : filters.policyNum.trim())
    const startyDay = startyDayOverride !== undefined 
      ? startyDayOverride 
      : filters.startyDay

    if (!policyNum) {
      toast.error('증권번호를 선택하거나 입력하세요.')
      return
    }

    if (!startyDay) {
      toast.error('시작일을 선택하세요.')
      return
    }

    try {
      setLoading(true)
      const response = await api.post<PolicySearchResponse>('/api/insurance/kj-certi/change-policy-search', {
        oldPolicyNum: policyNum,
        oldStartyDay: startyDay,
      })

      if (response.data.success) {
        setSearchResults(response.data.data.certiTableRows || [])
        setStatistics(response.data.data)
      } else {
        toast.error(response.data.error || '검색 중 오류가 발생했습니다.')
        setSearchResults([])
        setStatistics(null)
      }
    } catch (error: any) {
      console.error('검색 오류:', error)
      toast.error(error.response?.data?.error || '검색 중 오류가 발생했습니다.')
      setSearchResults([])
      setStatistics(null)
    } finally {
      setLoading(false)
    }
  }

  // 변경 모달 열기
  const handleOpenChangeModal = () => {
    if (!statistics || searchResults.length === 0) {
      toast.error('먼저 검색을 실행하세요.')
      return
    }
    setChangeForm({
      newPolicyNum: '',
      newStartyDay: '',
      newInsuranceCompany: '',
    })
    setChangeModalOpen(true)
  }

  // 변경 실행
  const handleExecuteChange = async () => {
    const policyNum = filters.isDirectInput ? filters.policyNumInput.trim() : filters.policyNum.trim()

    if (!policyNum || !filters.startyDay) {
      toast.error('변경 전 정보가 없습니다.')
      return
    }

    if (!changeForm.newPolicyNum || !changeForm.newStartyDay || !changeForm.newInsuranceCompany) {
      toast.error('변경 후 정보를 모두 입력하세요.')
      return
    }

    if (!statistics || searchResults.length === 0) {
      toast.error('변경할 증권이 없습니다.')
      return
    }

    const confirmMessage = `다음과 같이 변경하시겠습니까?\n\n` +
      `변경 전: ${policyNum} (${filters.startyDay})\n` +
      `변경 후: ${changeForm.newPolicyNum} (${changeForm.newStartyDay})\n` +
      `보험회사: ${getInsurerName(changeForm.newInsuranceCompany)}\n\n` +
      `변경될 증권: ${searchResults.length}건\n` +
      `변경될 회원: ${statistics.filteredMemberCount || 0}건`

    if (!window.confirm(confirmMessage)) {
      return
    }

    try {
      const response = await api.post('/api/insurance/kj-certi/change-policy-execute', {
        oldPolicyNum: policyNum,
        oldStartyDay: filters.startyDay,
        newPolicyNum: changeForm.newPolicyNum,
        newStartyDay: changeForm.newStartyDay,
        newInsuranceCompany: changeForm.newInsuranceCompany,
        cNums: searchResults.map((row) => row.num),
      })

      if (response.data.success) {
        toast.success(
          `증권번호 변경이 완료되었습니다.\n\n` +
            `변경된 증권: ${response.data.data.updatedCertiTableRows}건\n` +
            `변경된 회원: ${response.data.data.updatedMemberRows}건`
        )
        setChangeModalOpen(false)
        await handleSearch() // 검색 결과 다시 조회
      } else {
        toast.error(response.data.error || '변경 중 오류가 발생했습니다.')
      }
    } catch (error: any) {
      console.error('변경 실행 오류:', error)
      toast.error(error.response?.data?.error || '변경 중 오류가 발생했습니다.')
    }
  }

  // 엑셀 다운로드
  const handleExcelDownload = async () => {
    const policyNum = filters.isDirectInput ? filters.policyNumInput.trim() : filters.policyNum.trim()

    if (!policyNum || !filters.startyDay) {
      toast.error('검색 정보가 없습니다.')
      return
    }

    if (!statistics || searchResults.length === 0) {
      toast.error('다운로드할 데이터가 없습니다.')
      return
    }

    try {
      const response = await api.post('/api/insurance/kj-certi/change-policy-excel', {
        oldPolicyNum: policyNum,
        oldStartyDay: filters.startyDay,
      })

      if (!response.data.success) {
        throw new Error(response.data.error || '데이터 조회 실패')
      }

      const data = response.data.data

      // ExcelJS를 동적으로 로드
      const ExcelJS = (await import('exceljs')).default

      // 워크북 생성
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('회원리스트')

      // 제목 영역
      worksheet.addRow([`증권번호: ${data.oldPolicyNum || ''} - 회원리스트`])
      worksheet.addRow([`시작일: ${data.oldStartyDay || ''}`])
      worksheet.addRow([`다운로드 일시: ${new Date().toLocaleString('ko-KR')}`])
      worksheet.addRow([])

      // 헤더
      worksheet.addRow(['번호', '대리운전회사', '성명', '나이', '주민번호', '전화번호', '증권번호'])

      // 데이터 행
      let index = 1
      data.members.forEach((member: any) => {
        worksheet.addRow([
          index++,
          member.DaeriCompany || '',
          member.Name || '',
          member.nai || '',
          member.Jumin || '',
          member.Hphone || '',
          member.dongbuCerti || '',
        ])
      })

      // 컬럼 너비 설정
      worksheet.columns = [
        { width: 6 }, // 번호
        { width: 20 }, // 대리운전회사
        { width: 10 }, // 성명
        { width: 6 }, // 나이
        { width: 15 }, // 주민번호
        { width: 15 }, // 전화번호
        { width: 20 }, // 증권번호
      ]

      // 버퍼로 변환
      const buffer = await workbook.xlsx.writeBuffer()

      // Blob 생성 및 다운로드
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const fileName = `증권번호_${data.oldPolicyNum}_${data.oldStartyDay.replace(/-/g, '')}_회원리스트.xlsx`
      a.download = fileName
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success('엑셀 다운로드가 완료되었습니다.')
    } catch (error: any) {
      console.error('엑셀 다운로드 오류:', error)
      toast.error(error.response?.data?.error || '엑셀 다운로드 중 오류가 발생했습니다.')
    }
  }

  // 컬럼 정의
  const columns: Column<PolicySearchResult>[] = [
    {
      key: 'index',
      header: '#',
      cell: (row) => {
        const index = searchResults.indexOf(row)
        return <div className="whitespace-nowrap">{index + 1}</div>
      },
      className: 'w-12 whitespace-nowrap',
    },
    {
      key: 'DaeriCompany',
      header: '대리운전회사',
      cell: (row) => <div className="whitespace-nowrap">{row.DaeriCompany || ''}</div>,
      className: 'whitespace-nowrap',
    },
    {
      key: 'policyNum',
      header: '증권번호',
      cell: (row) => <div className="whitespace-nowrap">{row.policyNum || ''}</div>,
      className: 'whitespace-nowrap',
    },
    {
      key: 'currentInwon',
      header: '현재 인원',
      cell: (row) => (
        <div className="text-center whitespace-nowrap">{(row.currentInwon || 0).toLocaleString('ko-KR')}</div>
      ),
      className: 'text-center whitespace-nowrap',
    },
    {
      key: 'startyDay',
      header: '시작일',
      cell: (row) => <div className="text-center whitespace-nowrap">{row.startyDay || ''}</div>,
      className: 'text-center whitespace-nowrap',
    },
  ]

  // 초기화: 증권번호 목록 로드
  useEffect(() => {
    loadCertiList()
  }, [])

  return (
    <div className="space-y-6">
      <FilterBar>
        <FilterBar.Select
          value={filters.isDirectInput ? '__DIRECT_INPUT__' : filters.policyNum}
          onChange={(value) => handlePolicyNumChange(value)}
          options={policyNumOptions}
          className="w-48"
        />
        {filters.isDirectInput && (
          <FilterBar.Input
            value={filters.policyNumInput}
            onChange={(value) => setFilters((prev) => ({ ...prev, policyNumInput: value }))}
            placeholder="예: 2025-S331191"
            onSearch={handleSearch}
            className="w-48"
          />
        )}
        <DatePicker
          value={filters.startyDay}
          onChange={(value) => setFilters((prev) => ({ ...prev, startyDay: value }))}
          className="w-[204.8px]"
          fullWidth={false}
        />
        <FilterBar.SearchButton onClick={handleSearch} />
        {statistics && (
          <>
            <FilterBar.Stats
              stats={[
                {
                  label: '전체 증권',
                  value: statistics.totalRows || 0,
                  color: 'foreground' as const,
                },
                {
                  label: '인원 1명 이상',
                  value: statistics.filteredRows || 0,
                  color: 'green' as const,
                },
                {
                  label: '전체 인원',
                  value: (statistics.memberCount || 0).toLocaleString('ko-KR'),
                  color: 'foreground' as const,
                },
                {
                  label: '인원 1명 이상 합계',
                  value: (statistics.filteredMemberCount || 0).toLocaleString('ko-KR'),
                  color: 'green' as const,
                },
              ]}
            />
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handleOpenChangeModal}
                className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-xs whitespace-nowrap"
              >
                변경
              </button>
              <ExportButton onClick={handleExcelDownload} label="엑셀" />
            </div>
          </>
        )}
      </FilterBar>

      {searchResults.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {/* 왼쪽 테이블 */}
          <DataTable
            columns={columns}
            data={searchResults.slice(0, Math.ceil(searchResults.length / 2))}
            loading={loading}
            emptyMessage=""
          />
          {/* 오른쪽 테이블 */}
          <DataTable
            columns={columns}
            data={searchResults.slice(Math.ceil(searchResults.length / 2))}
            loading={loading}
            emptyMessage=""
          />
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-8">
          증권번호를 선택하고 시작일을 입력한 후 검색 버튼을 클릭하세요.
        </div>
      )}

      {/* 증권번호 변경 모달 */}
      <Modal
        isOpen={changeModalOpen}
        onClose={() => setChangeModalOpen(false)}
        title="증권번호 변경"
        maxWidth="lg"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setChangeModalOpen(false)}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleExecuteChange}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors flex items-center gap-2"
            >
              <span>변경 실행</span>
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* 변경 전 정보 */}
          <div>
            <h6 className="font-semibold mb-3">변경 전 정보</h6>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">증권번호</label>
                <input
                  type="text"
                  value={filters.isDirectInput ? filters.policyNumInput : filters.policyNum}
                  readOnly
                  className="w-full px-3 py-2 border border-input rounded-lg bg-muted cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">시작일</label>
                <input
                  type="date"
                  value={filters.startyDay}
                  readOnly
                  className="w-full px-3 py-2 border border-input rounded-lg bg-muted cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* 변경 후 정보 */}
          <div>
            <h6 className="font-semibold mb-3">변경 후 정보</h6>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">새 증권번호</label>
                <input
                  type="text"
                  value={changeForm.newPolicyNum}
                  onChange={(e) => setChangeForm((prev) => ({ ...prev, newPolicyNum: e.target.value }))}
                  placeholder="예: 2025-S999999"
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">새 시작일</label>
                <input
                  type="date"
                  value={changeForm.newStartyDay}
                  onChange={(e) => setChangeForm((prev) => ({ ...prev, newStartyDay: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">새 보험회사</label>
                <Select
                  value={changeForm.newInsuranceCompany}
                  onChange={(e) => setChangeForm((prev) => ({ ...prev, newInsuranceCompany: e.target.value }))}
                  options={INSURER_OPTIONS}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
