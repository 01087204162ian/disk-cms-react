import { useEffect, useState, useMemo } from 'react'
import { Plus, Key, TrendingUp, Wallet, RefreshCw, CheckCircle, Download, AlertTriangle } from 'lucide-react'
import api from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import {
  FilterBar,
  DataTable,
  type Column,
  useToastHelpers,
} from '../../components'
import AddCompanyModal from './components/AddCompanyModal'
import DailyReportModal from './components/DailyReportModal'
import DepositBalanceModal from './components/DepositBalanceModal'
import ApiManagerModal from './components/ApiManagerModal'
import PharmacyDetailModal from './components/PharmacyDetailModal'
import SettlementCleanupModal from './components/SettlementCleanupModal'

interface PharmacyApplication {
  id: number
  company_name: string
  business_number: string
  manager: string
  phone?: string
  contact?: string
  design_number_professional?: string
  design_number_fire?: string
  request_date?: string
  approval_date?: string
  status: number
  status_name: string
  memo?: string
  premium?: number
  premium_raw?: number
  account?: string
  chemist?: number // 전문인 수 (0이면 전문설계번호 입력 필드 숨김)
  area?: number // 사업장 면적 (0이면 화재설계번호 입력 필드 숨김)
  chemist_design_number?: string
  area_design_number?: string
  original_status?: number // 상태 변경 추적용//
}

const STATUS_OPTIONS = [
  { value: '', label: '전체' },
  { value: '10', label: '메일보냄' },
  { value: '13', label: '승인' },
  { value: '6', label: '계약' },
  { value: '7', label: '보류' },
  { value: '14', label: '증권발급' },
  { value: '15', label: '해지요청' },
  { value: '16', label: '해지완료' },
  { value: '17', label: '설계중' },
]

export default function Applications() {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<PharmacyApplication[]>([])
  const [accounts, setAccounts] = useState<Array<{ value: string; label: string }>>([])
  const [designListExporting, setDesignListExporting] = useState(false)

  // 필터 상태
  const [filters, setFilters] = useState({
    account: '',
    status: '13', // 기본값: 승인
    pageSize: '20',
    search: '',
  })

  // 페이지네이션
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 20,
    totalCount: 0,
  })

  // 모달 상태
  const [addCompanyModalOpen, setAddCompanyModalOpen] = useState(false)
  const [dailyReportModalOpen, setDailyReportModalOpen] = useState(false)
  const [depositBalanceModalOpen, setDepositBalanceModalOpen] = useState(false)
  const [apiManagerModalOpen, setApiManagerModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<number | null>(null)
  const [cleanupModalOpen, setCleanupModalOpen] = useState(false)

  // 데이터 로드
  const loadApplications = async (page?: number, pageSize?: number) => {
    try {
      setLoading(true)
      const currentPage = page !== undefined ? page : pagination.currentPage
      const currentPageSize = pageSize !== undefined ? pageSize : pagination.pageSize
      const params: any = {
        page: currentPage,
        limit: currentPageSize,
      }
      if (filters.account) params.account = filters.account
      if (filters.status) params.status = filters.status
      if (filters.search) params.search = filters.search

      console.log('API 요청 파라미터:', params)
      const res = await api.get('/api/pharmacy/list', { params })
      console.log('API 응답 전체:', res.data)
      console.log('API 응답 요약:', { 
        success: res.data?.success, 
        dataLength: res.data?.data?.length, 
        total_count: res.data?.total_count,
        total: res.data?.total,
        pagination: res.data?.pagination,
        allKeys: Object.keys(res.data || {}),
        currentPage: currentPage,
        pageSize: currentPageSize
      })
      if (res.data?.success) {
        // API 응답 구조에 맞게 데이터 변환
        const data = res.data.data || []
        
        // 디버깅: 실제 응답 데이터 확인
        if (data.length > 0) {
          console.log('서버 응답 데이터 샘플 (첫 번째 항목):', data[0])
        }
        
        const transformedData = data.map((item: any) => {
          // 상태 처리: 코드 또는 텍스트 모두 처리
          const statusValue = item.status
          const statusCode = getStatusCode(statusValue)
          
          return {
            id: item.num,
            company_name: item.company || '',
            business_number: item.school2 || item.business_number || '', // school2가 실제 필드명
            manager: item.damdangja || item.manager || '', // damdangja가 실제 필드명
            phone: item.hphone || item.phone || item.mobile || '', // hphone이 실제 필드명
            contact: item.hphone2 || item.contact || item.tel || '', // hphone2가 실제 필드명
            design_number_professional: item.chemist_design_number || item.design_number_professional || '',
            design_number_fire: item.area_design_number || item.design_number_fire || '',
            request_date: item.request_date || item.created_at || '',
            approval_date: item.approval_date || item.approved_at || '',
            status: statusCode,
            status_name: getStatusText(statusValue),
            memo: item.memo || item.remark || '',
            premium: item.premium ? (typeof item.premium === 'string' ? parseInt(item.premium.replace(/[^0-9]/g, '')) : item.premium) : (item.premium_raw ? (typeof item.premium_raw === 'string' ? parseInt(item.premium_raw.replace(/[^0-9]/g, '')) : item.premium_raw) : 0),
            premium_raw: item.premium_raw ? (typeof item.premium_raw === 'string' ? parseInt(item.premium_raw.replace(/[^0-9]/g, '')) : item.premium_raw) : (item.premium ? (typeof item.premium === 'string' ? parseInt(item.premium.replace(/[^0-9]/g, '')) : item.premium) : 0),
            account: item.account_directory || item.account_company || item.account || '',
            chemist: item.chemist || 0,
            area: item.area || 0,
            chemist_design_number: item.chemist_design_number || '',
            area_design_number: item.area_design_number || '',
            original_status: statusCode,
          }
        })
        
        console.log('변환된 데이터 샘플 (첫 번째 항목):', transformedData[0] || null)
        setApplications(transformedData)
        
        // totalCount 추출 시도 (여러 가능한 위치 확인)
        const totalCount = 
          res.data.pagination?.total_count ||
          res.data.pagination?.total ||
          res.data.total_count ||
          res.data.total ||
          (res.data.count !== undefined ? res.data.count : null) ||
          data.length // 마지막 대안: 현재 페이지 데이터 개수 (부정확하지만 페이지네이션은 작동함)
        
        console.log('총 개수 추출:', {
          'pagination.total_count': res.data.pagination?.total_count,
          'pagination.total': res.data.pagination?.total,
          'total_count': res.data.total_count,
          'total': res.data.total,
          'count': res.data.count,
          'data.length (fallback)': data.length,
          '최종 사용 값': totalCount
        })
        
        setPagination((prev) => ({
          ...prev,
          totalCount: totalCount,
        }))
      }
    } catch (error: any) {
      console.error('약국배상책임보험 목록 로드 오류:', error)
      console.error('에러 상세 정보:', {
        message: error?.message,
        code: error?.code,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        config: {
          url: error?.config?.url,
          method: error?.config?.method,
          params: error?.config?.params
        }
      })
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.message || 
                          error?.message || 
                          '목록을 불러오는데 실패했습니다.'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // 상태 코드를 텍스트로 변환
  const getStatusText = (status: number | string): string => {
    const statusMap: Record<string, string> = {
      '1': '접수',
      '12': '해피콜',
      '10': '메일 보냄',
      '13': '승인',
      '6': '계약완료',
      '7': '보류',
      '14': '증권발급',
      '15': '해지요청',
      '16': '해지완료',
      '17': '설계중',
      '11': '질문서받음',
      '9': '단순산출',
      '2': '보험료',
      '3': '청약서안내',
      '4': '자필서류',
      '8': '카드승인',
      '5': '입금확인',
    }
    return statusMap[String(status)] || String(status) || '알 수 없음'
  }

  // 상태 텍스트를 코드로 변환
  const getStatusCode = (status: number | string): number => {
    const statusMap: Record<string, string> = {
      '1': '접수',
      '12': '해피콜',
      '10': '메일 보냄',
      '13': '승인',
      '6': '계약완료',
      '7': '보류',
      '14': '증권발급',
      '15': '해지요청',
      '16': '해지완료',
      '17': '설계중',
      '11': '질문서받음',
      '9': '단순산출',
      '2': '보험료',
      '3': '청약서안내',
      '4': '자필서류',
      '8': '카드승인',
      '5': '입금확인',
    }

    // 이미 코드인 경우
    if (Object.keys(statusMap).includes(String(status))) {
      return parseInt(String(status), 10)
    }

    // 텍스트인 경우 코드 찾기
    for (const [code, text] of Object.entries(statusMap)) {
      if (text === status) {
        return parseInt(code, 10)
      }
    }

    return typeof status === 'number' ? status : 0
  }

  // 상태별 선택 가능한 옵션 생성
  const getStatusOptions = (currentStatus: number): Array<{ value: string; label: string }> => {
    const statusMap: Record<string, string> = {
      '1': '접수',
      '12': '해피콜',
      '10': '메일 보냄',
      '13': '승인',
      '6': '계약완료',
      '7': '보류',
      '14': '증권발급',
      '15': '해지요청',
      '16': '해지완료',
      '17': '설계중',
      '11': '질문서받음',
      '9': '단순산출',
      '2': '보험료',
      '3': '청약서안내',
      '4': '자필서류',
      '8': '카드승인',
      '5': '입금확인',
    }

    const currentStatusCode = String(currentStatus)

    // 승인(13) 상태: 특정 옵션만 선택 가능
    if (currentStatusCode === '13') {
      return [
        { value: '1', label: '접수' },
        { value: '10', label: '메일 보냄' },
        { value: '7', label: '보류' },
        { value: '13', label: '승인' },
      ]
    }

    // 해지요청(15) 상태: 특정 옵션만 선택 가능
    if (currentStatusCode === '15') {
      return [
        { value: '15', label: '해지요청' },
        { value: '16', label: '해지완료' },
        { value: '6', label: '계약완료' },
        { value: '14', label: '증권발급' },
      ]
    }

    // 기본: 모든 옵션 선택 가능
    return Object.entries(statusMap).map(([code, text]) => ({
      value: code,
      label: text,
    }))
  }

  // 상태 변경 처리
  const handleStatusChange = async (pharmacyId: number, newStatus: string, oldStatus: number) => {
    if (String(newStatus) === String(oldStatus)) return

    // 해지요청(15) → 해지완료(16) 변경 시 특별 처리 (추후 해지 모달 추가 가능)
    if (newStatus === '16' && oldStatus === 15) {
      if (!confirm('해지완료로 변경하시겠습니까?')) {
        return
      }
    } else {
      const statusText = getStatusText(newStatus)
      if (!confirm(`상태를 "${statusText}"로 변경하시겠습니까?`)) {
        return
      }
    }

    try {
      // 사용자 정보 가져오기
      const { user } = useAuthStore.getState()
      const registrar = user?.name || user?.email || null
      const registrarId = user?.email || user?.id || null

      const res = await api.post('/api/pharmacy2/update-status', {
        pharmacy_id: pharmacyId,
        status: newStatus,
        old_status: String(oldStatus),
        registrar: registrar,      // 사용자 이름
        registrarId: registrarId,  // 사용자 ID (이메일)
      })

      if (res.data?.success) {
        toast.success(res.data.message || '상태가 변경되었습니다.')
        await loadApplications()
      }
    } catch (error: any) {
      console.error('상태 변경 오류:', error)
      console.error('에러 상세 정보:', {
        message: error?.message,
        code: error?.code,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        requestData: { pharmacy_id: pharmacyId, status: newStatus, old_status: String(oldStatus) }
      })
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.message || 
                          error?.message || 
                          '상태 변경에 실패했습니다.'
      toast.error(errorMessage)
    }
  }

  // 메모 저장 처리
  const handleMemoSave = async (pharmacyId: number, memo: string) => {
    try {
      const res = await api.post(`/api/pharmacy2/${pharmacyId}/memo`, { memo })
      if (res.data?.success) {
        toast.success('메모가 저장되었습니다.')
        // 로컬 상태 업데이트
        setApplications((prev) =>
          prev.map((item) => (item.id === pharmacyId ? { ...item, memo } : item))
        )
      }
    } catch (error: any) {
      console.error('메모 저장 오류:', error)
      console.error('에러 상세 정보:', {
        message: error?.message,
        code: error?.code,
        status: error?.response?.status,
        data: error?.response?.data
      })
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.message || 
                          error?.message || 
                          '메모 저장에 실패했습니다.'
      toast.error(errorMessage)
    }
  }

  // 설계번호 저장 처리
  const handleDesignNumberSave = async (pharmacyId: number, designNumber: string, designType: 'expert' | 'fire') => {
    if (!designNumber.trim()) return

    try {
      const res = await api.post('/api/pharmacy2/design-number', {
        pharmacyId,
        designNumber: designNumber.trim(),
        designType,
      })

      if (res.data?.success) {
        toast.success('설계번호가 저장되었습니다.')
        await loadApplications()
      }
    } catch (error: any) {
      console.error('설계번호 저장 오류:', error)
      console.error('에러 상세 정보:', {
        message: error?.message,
        code: error?.code,
        status: error?.response?.status,
        data: error?.response?.data,
        requestData: { pharmacyId, designNumber, designType }
      })
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.message || 
                          error?.message || 
                          '설계번호 저장에 실패했습니다.'
      toast.error(errorMessage)
    }
  }

  // 보험료 검증
  const verifyPremium = async (pharmacyId: number) => {
    try {
      const res = await api.get(`/api/pharmacy/premium-verify?pharmacy_id=${pharmacyId}`)
      if (res.data?.success) {
        if (res.data.is_match) {
          toast.success('보험료가 일치합니다.')
        } else {
          const message = `보험료 불일치 발견!\n\nDB 저장값: ${res.data.db_premium?.toLocaleString('ko-KR')}원\n계산값: ${res.data.calculated_premium?.toLocaleString('ko-KR')}원\n차이: ${res.data.difference?.toLocaleString('ko-KR')}원`
          alert(message)
        }
      }
    } catch (error: any) {
      console.error('보험료 검증 오류:', error)
      toast.error(error?.response?.data?.message || error?.message || '보험료 검증에 실패했습니다.')
    }
  }

  // 거래처 목록 로드
  const loadAccounts = async () => {
    try {
      const res = await api.get('/api/pharmacy/accounts')
      if (res.data?.success) {
        const accountOptions = [
          { value: '', label: '전체 거래처' },
          ...(res.data.data || []).map((acc: any) => ({
            value: acc.num || acc.id || acc.code,
            label: acc.directory || acc.name || acc.code,
          })),
        ]
        setAccounts(accountOptions)
      }
    } catch (error) {
      console.error('거래처 목록 로드 오류:', error)
    }
  }

  useEffect(() => {
    loadAccounts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // 필터나 페이지 크기가 변경될 때만 실행 (페이지 변경은 onPageChange에서 처리)
    loadApplications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageSize, filters])

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
    loadApplications()
  }

  const handleRefresh = () => {
    loadApplications()
  }

  const handleExportExcel = async () => {
    try {
      toast.info('엑셀 다운로드 중...')
      const params: any = {}
      if (filters.account) params.account = filters.account
      if (filters.status) params.status = filters.status
      if (filters.search) params.search = filters.search

      const res = await api.get('/api/pharmacy/list', {
        params,
        responseType: 'blob',
      })

      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pharmacy_applications_${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('엑셀 다운로드가 완료되었습니다.')
    } catch (error: any) {
      console.error('엑셀 다운로드 오류:', error)
      toast.error(error?.response?.data?.message || error?.message || '엑셀 다운로드 중 오류가 발생했습니다.')
    }
  }

  const handleExportDesignListExcel = async () => {
    if (designListExporting) return

    if (
      !confirm(
        '설계리스트를 엑셀로 다운로드하시겠습니까?\n\n※ 다운로드 후 해당 건들의 출력 상태가 초기화될 수 있습니다.'
      )
    ) {
      return
    }

    setDesignListExporting(true)
    try {
      toast.info('설계리스트 엑셀 다운로드 중...')

      const response = await api.post('/api/pharmacy2/design-list-excel', { trigger: 'value1' })
      const result = response.data

      if (!result?.success) {
        throw new Error(result?.message || result?.error || '데이터 조회 실패')
      }

      const rawData: any[] = Array.isArray(result.data) ? result.data : []
      if (rawData.length === 0) {
        toast.error('다운로드할 설계 데이터가 없습니다. (설계중/출력되지 않은 건)')
        return
      }

      // ExcelJS를 동적으로 로드 (다운로드 시에만 로드)
      const ExcelJS = (await import('exceljs')).default
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('설계리스트')

      // 제목/메타 영역
      worksheet.addRow(['약국배상책임보험 설계리스트'])
      worksheet.addRow([`다운로드 일시: ${new Date().toLocaleString('ko-KR')}`])
      worksheet.addRow([`총 건수: ${rawData.length}건`])
      worksheet.addRow([])

      // 헤더
      worksheet.addRow(['구분', '승인일', '약국명', '전문인설계번호', '화재설계번호', '거래처'])

      // 헤더 스타일
      const headerRowNumber = 5
      const headerRow = worksheet.getRow(headerRowNumber)
      headerRow.font = { bold: true }
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } }
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' }

      // 컬럼 너비
      worksheet.getColumn(1).width = 8
      worksheet.getColumn(2).width = 12
      worksheet.getColumn(3).width = 25
      worksheet.getColumn(4).width = 20
      worksheet.getColumn(5).width = 20
      worksheet.getColumn(6).width = 20

      // 데이터 (설계번호가 하나라도 있는 건만)
      let rowIndex = 0
      rawData.forEach((item) => {
        const expertDesign = item?.expert_design_number || ''
        const fireDesign = item?.fire_design_number || ''
        if (!expertDesign && !fireDesign) return

        rowIndex += 1
        worksheet.addRow([
          rowIndex,
          item?.approval_date ? String(item.approval_date).substring(0, 10) : '',
          item?.company || '',
          expertDesign,
          fireDesign,
          item?.account_directory || '미지정',
        ])
      })

      // 제목 병합 (A1:F1, A2:F2, A3:F3)
      worksheet.mergeCells('A1:F1')
      worksheet.mergeCells('A2:F2')
      worksheet.mergeCells('A3:F3')

      worksheet.getCell('A1').font = { bold: true, size: 14 }
      worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' }
      worksheet.getCell('A2').alignment = { horizontal: 'center' }
      worksheet.getCell('A3').font = { bold: true }
      worksheet.getCell('A3').alignment = { horizontal: 'center' }

      // 다운로드
      const today = new Date().toISOString().substring(0, 10).replace(/-/g, '')
      const fileName = `설계리스트_${today}.xlsx`
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.click()
      window.URL.revokeObjectURL(url)

      toast.success(`설계리스트 엑셀 다운로드 완료 (${rowIndex.toLocaleString('ko-KR')}건)`)
      loadApplications()
    } catch (error: any) {
      console.error('설계리스트 엑셀 다운로드 오류:', error)
      toast.error(error?.response?.data?.error || error?.message || '설계리스트 엑셀 다운로드 중 오류가 발생했습니다.')
    } finally {
      setDesignListExporting(false)
    }
  }

  // 테이블 컬럼 정의
  const columns: Column<PharmacyApplication>[] = useMemo(
    () => [
      {
        key: 'id',
        header: '#',
        className: 'w-12 text-center align-middle',
        cell: (row) => {
          const index = applications.findIndex((item) => item.id === row.id)
          const rowNumber = (pagination.currentPage - 1) * pagination.pageSize + index + 1
          return (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedPharmacyId(row.id)
                setDetailModalOpen(true)
              }}
              className="px-2 py-0.5 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600 transition-colors leading-tight h-fit"
            >
              {rowNumber}
            </button>
          )
        },
      },
      {
        key: 'company_name',
        header: '업체명',
      },
      {
        key: 'business_number',
        header: '사업자번호',
      },
      {
        key: 'manager',
        header: '담당자',
      },
      {
        key: 'phone',
        header: '휴대전화',
        className: 'hidden lg:table-cell',
        hidden: true,
      },
      {
        key: 'contact',
        header: '연락처',
        className: 'hidden xl:table-cell',
        hidden: true,
      },
      {
        key: 'design_number_professional',
        header: '전문설계번호',
        className: 'hidden lg:table-cell p-0',
        hidden: true,
        cell: (row) => {
          if (!row.chemist || row.chemist < 1) return <span className="text-gray-400">-</span>
          return (
            <input
              type="text"
              value={row.chemist_design_number || ''}
              placeholder="전문인설계번호"
              className="w-full text-xs border-0 bg-white px-2 py-1 focus:outline-none"
              onBlur={(e) => {
                const newValue = e.target.value
                if (newValue !== (row.chemist_design_number || '')) {
                  handleDesignNumberSave(row.id, newValue, 'expert')
                }
              }}
            />
          )
        },
      },
      {
        key: 'design_number_fire',
        header: '화재설계번호',
        className: 'hidden lg:table-cell p-0',
        hidden: true,
        cell: (row) => {
          if (!row.area || row.area < 1) return <span className="text-gray-400">-</span>
          return (
            <input
              type="text"
              value={row.area_design_number || ''}
              placeholder="화재설계번호"
              className="w-full text-xs border-0 bg-white px-2 py-1 focus:outline-none"
              onBlur={(e) => {
                const newValue = e.target.value
                if (newValue !== (row.area_design_number || '')) {
                  handleDesignNumberSave(row.id, newValue, 'fire')
                }
              }}
            />
          )
        },
      },
      {
        key: 'request_date',
        header: '가입요청일',
        className: 'hidden xl:table-cell',
        hidden: true,
        cell: (row) => {
          if (!row.request_date || row.request_date === '0000-00-00 00:00:00' || row.request_date.startsWith('0000-00-00')) {
            return '-'
          }
          const date = new Date(row.request_date)
          // 유효하지 않은 날짜 체크 (NaN)
          if (isNaN(date.getTime())) {
            return '-'
          }
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          const hours = String(date.getHours()).padStart(2, '0')
          const minutes = String(date.getMinutes()).padStart(2, '0')
          const seconds = String(date.getSeconds()).padStart(2, '0')
          return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
        },
      },
      {
        key: 'approval_date',
        header: '승인일',
        cell: (row) => {
          if (!row.approval_date || row.approval_date === '0000-00-00 00:00:00' || row.approval_date.startsWith('0000-00-00')) {
            return '-'
          }
          const date = new Date(row.approval_date)
          // 유효하지 않은 날짜 체크 (NaN)
          if (isNaN(date.getTime())) {
            return '-'
          }
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          const hours = String(date.getHours()).padStart(2, '0')
          const minutes = String(date.getMinutes()).padStart(2, '0')
          const seconds = String(date.getSeconds()).padStart(2, '0')
          return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
        },
      },
      {
        key: 'status',
        header: '상태',
        cell: (row) => {
          const statusOptions = getStatusOptions(row.status)
          return (
            <select
              value={String(row.status)}
              onChange={(e) => handleStatusChange(row.id, e.target.value, row.original_status || row.status)}
              className="w-full text-xs px-2 py-1 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem',
              }}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )
        },
      },
      {
        key: 'memo',
        header: '메모',
        className: 'hidden xl:table-cell p-0',
        hidden: true,
        cell: (row) => {
          let lastSavedMemo = row.memo || ''
          return (
            <input
              type="text"
              value={row.memo || ''}
              placeholder="메모"
              className="w-full text-xs border-0 bg-white px-2 py-1 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  const newValue = (e.target as HTMLInputElement).value.trim()
                  if (newValue !== lastSavedMemo) {
                    lastSavedMemo = newValue
                    handleMemoSave(row.id, newValue)
                  }
                }
              }}
            />
          )
        },
      },
      {
        key: 'premium',
        header: '보험료',
        className: 'text-right',
        cell: (row) => (
          <div className="flex items-center justify-end gap-1">
            <span>{row.premium ? row.premium.toLocaleString('ko-KR') : '-'}</span>
            {row.premium && (
              <button
                onClick={() => verifyPremium(row.id)}
                className="p-0.5 text-blue-500 hover:text-blue-700"
                title="보험료 검증"
              >
                <CheckCircle className="w-3 h-3" />
              </button>
            )}
          </div>
        ),
      },
      {
        key: 'account',
        header: '거래처',
        cell: (row) => row.account || '-',
      },
    ],
    [pagination.currentPage, pagination.pageSize, applications]
  )

  // 모바일 카드 렌더링
  const mobileCard = (application: PharmacyApplication) => (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="font-medium text-sm text-gray-900">{application.company_name}</div>
          <div className="text-xs text-gray-500 mt-1">
            사업자번호: {application.business_number} | 담당자: {application.manager}
          </div>
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            application.status === 13
              ? 'bg-green-100 text-green-800'
              : application.status === 7
                ? 'bg-yellow-100 text-yellow-800'
                : application.status === 14
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
          }`}
        >
          {application.status_name}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mt-2">
        <div>
          승인일:{' '}
          {application.approval_date &&
          application.approval_date !== '0000-00-00 00:00:00' &&
          !application.approval_date.startsWith('0000-00-00') ? (
            (() => {
              const date = new Date(application.approval_date)
              return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('ko-KR')
            })()
          ) : (
            '-'
          )}
        </div>
        <div className="text-right">보험료: {application.premium ? application.premium.toLocaleString('ko-KR') : '-'}</div>
        {application.account && <div className="col-span-2">거래처: {application.account}</div>}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* 필터 영역 */}
      <FilterBar>
        <FilterBar.Select
          value={filters.account}
          onChange={(value) => setFilters((prev) => ({ ...prev, account: value }))}
          options={accounts}
        />
        <FilterBar.Select
          value={filters.status}
          onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
          options={STATUS_OPTIONS}
        />
        <FilterBar.Select
          value={filters.pageSize}
          onChange={(value) => {
            setFilters((prev) => ({ ...prev, pageSize: value }))
            setPagination((prev) => ({ ...prev, pageSize: parseInt(value, 10), currentPage: 1 }))
          }}
          options={[
            { value: '20', label: '20개' },
            { value: '50', label: '50개' },
            { value: '100', label: '100개' },
          ]}
        />
        <FilterBar.Input
          value={filters.search}
          onChange={(value) => setFilters((prev) => ({ ...prev, search: value }))}
          placeholder="업체명, 사업자번호, 담당자로 검색"
          onSearch={handleSearch}
        />
        <FilterBar.SearchButton onClick={handleSearch} />

        {/* 액션 버튼들 */}
        <button
          onClick={() => setDailyReportModalOpen(true)}
          className="h-7 px-2 py-0.5 text-xs border border-primary text-primary bg-background rounded-md hover:bg-primary hover:text-white transition-colors flex items-center gap-1 whitespace-nowrap"
        >
          <TrendingUp className="w-3 h-3" />
          일별실적
        </button>
        <button
          onClick={() => setDepositBalanceModalOpen(true)}
          className="h-7 px-2 py-0.5 text-xs border border-primary text-primary bg-background rounded-md hover:bg-primary hover:text-white transition-colors flex items-center gap-1 whitespace-nowrap"
        >
          <Wallet className="w-3 h-3" />
          예치잔액
        </button>
        <button
          onClick={handleExportDesignListExcel}
          disabled={designListExporting}
          className="h-7 px-2 py-0.5 text-xs border border-primary text-primary bg-background rounded-md hover:bg-primary hover:text-white transition-colors flex items-center gap-1 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          title="설계중/미출력 건 설계리스트 엑셀"
        >
          <Download className="w-3 h-3" />
          설계리스트 엑셀
        </button>
        <button
          onClick={handleExportExcel}
          className="h-7 px-2 py-0.5 text-xs border border-primary text-primary bg-background rounded-md hover:bg-primary hover:text-white transition-colors flex items-center gap-1 whitespace-nowrap"
        >
          <Download className="w-3 h-3" />
          엑셀 다운로드
        </button>
        <button
          onClick={handleRefresh}
          className="h-7 px-2 py-0.5 text-xs border border-primary text-primary bg-background rounded-md hover:bg-primary hover:text-white transition-colors flex items-center gap-1 whitespace-nowrap"
        >
          <RefreshCw className="w-3 h-3" />
          새로고침
        </button>
        <button
          onClick={() => setCleanupModalOpen(true)}
          className="h-7 px-2 py-0.5 text-xs border border-primary text-primary bg-background rounded-md hover:bg-primary hover:text-white transition-colors flex items-center gap-1 whitespace-nowrap"
        >
          <AlertTriangle className="w-3 h-3" />
          정리
        </button>
        <button
          onClick={() => setApiManagerModalOpen(true)}
          className="h-7 px-2 py-0.5 text-xs border border-primary text-primary bg-background rounded-md hover:bg-primary hover:text-white transition-colors flex items-center gap-1 whitespace-nowrap"
        >
          <Key className="w-3 h-3" />
          API 관리
        </button>
        <button
          onClick={() => setAddCompanyModalOpen(true)}
          className="h-7 px-2 py-0.5 text-xs border border-primary text-primary bg-background rounded-md hover:bg-primary hover:text-white transition-colors flex items-center gap-1 whitespace-nowrap ml-auto"
        >
          <Plus className="w-3 h-3" />
          업체추가
        </button>
      </FilterBar>

      {/* 테이블 */}
      <DataTable
        data={applications}
        columns={columns}
        loading={loading}
        emptyMessage="등록된 약국배상책임보험이 없습니다."
        pagination={{
          currentPage: pagination.currentPage,
          pageSize: pagination.pageSize,
          totalCount: pagination.totalCount,
          onPageChange: (page) => {
            console.log('페이지 변경 요청:', page, '현재 페이지:', pagination.currentPage, '페이지 크기:', pagination.pageSize)
            setPagination((prev) => {
              const newPage = page
              const newPageSize = prev.pageSize
              console.log('페이지네이션 상태 업데이트:', { currentPage: newPage, pageSize: newPageSize, totalCount: prev.totalCount })
              // 상태 업데이트와 동시에 데이터 로드 (최신 상태 값 사용)
              loadApplications(newPage, newPageSize)
              return { ...prev, currentPage: newPage }
            })
          },
        }}
        mobileCard={mobileCard}
      />

      {/* 업체 추가 모달 */}
      <AddCompanyModal
        isOpen={addCompanyModalOpen}
        onClose={() => setAddCompanyModalOpen(false)}
        onSuccess={() => {
          loadApplications()
          loadAccounts()
        }}
      />

      {/* 일별실적 모달 */}
      <DailyReportModal isOpen={dailyReportModalOpen} onClose={() => setDailyReportModalOpen(false)} />

      {/* 예치잔액 모달 */}
      <DepositBalanceModal isOpen={depositBalanceModalOpen} onClose={() => setDepositBalanceModalOpen(false)} />

      {/* API 관리 모달 */}
      <ApiManagerModal isOpen={apiManagerModalOpen} onClose={() => setApiManagerModalOpen(false)} />

      {/* 상세 모달 */}
      <PharmacyDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false)
          setSelectedPharmacyId(null)
        }}
        pharmacyId={selectedPharmacyId}
        onUpdate={() => {
          loadApplications()
        }}
      />

      {/* 정리 모달 */}
      <SettlementCleanupModal
        isOpen={cleanupModalOpen}
        onClose={() => setCleanupModalOpen(false)}
      />
    </div>
  )
}
