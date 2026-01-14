import { useState, useEffect } from 'react'
import { Modal, useToastHelpers, FilterSelect } from '../../../components'
import api from '../../../lib/api'
import { BarChart3, Copy, Check } from 'lucide-react'

interface EndorseReviewModalProps {
  isOpen: boolean
  onClose: () => void
  date?: string
  companyNum?: string
}

interface EndorseReviewItem {
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
  rate?: string | number
  preminum: number
  c_preminum: number
  manager: string
  LastTime: string
}

interface EndorseReviewData {
  daeriRegistrations: EndorseReviewItem[]
  daeriTerminations: EndorseReviewItem[]
  taksongRegistrations: EndorseReviewItem[]
  taksongTerminations: EndorseReviewItem[]
  daeriRegPremium: number
  daeriTermPremium: number
  taksongRegPremium: number
  taksongTermPremium: number
  haldungCount: number
  company: string
  reportDate: string
  dayOfWeek: string
}

export default function EndorseReviewModal({
  isOpen,
  onClose,
  date: initialDate,
  companyNum: initialCompanyNum,
}: EndorseReviewModalProps) {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState(initialDate || '')
  const [companyNum, setCompanyNum] = useState(initialCompanyNum || '')
  const [companyOptions, setCompanyOptions] = useState<{ value: string; label: string }[]>([])
  const [data, setData] = useState<EndorseReviewData | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (initialDate) setDate(initialDate)
      if (initialCompanyNum) setCompanyNum(initialCompanyNum)
      
      if (initialDate && initialCompanyNum) {
        loadData(initialDate, initialCompanyNum)
      }
    }
  }, [isOpen, initialDate, initialCompanyNum])

  const loadCompanyOptions = async (endorseDay: string) => {
    try {
      const res = await api.get<{ success: boolean; data: any[] }>(
        '/api/insurance/kj-daily-endorse/company-list',
        { params: { endorseDay } }
      )
      if (res.data.success) {
        const items = res.data.data || []
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

  const loadData = async (selectedDate: string, dNum: string) => {
    if (!selectedDate || !dNum) {
      toast.error('날짜와 대리운전회사를 선택해주세요.')
      return
    }

    try {
      setLoading(true)
      const res = await api.post<{
        success: boolean
        data: EndorseReviewItem[]
        error?: string
      }>('/api/insurance/kj-daily-endorse/status', {
        todayStr: selectedDate,
        dNum: dNum,
      })

      if (res.data.success && res.data.data) {
        const items = res.data.data
        const company = items[0]?.company || ''

        // 날짜 포맷팅
        const reportDate = new Date(selectedDate)
        const formattedDate = `${reportDate.getFullYear()}.${String(reportDate.getMonth() + 1).padStart(2, '0')}.${String(reportDate.getDate()).padStart(2, '0')}`
        const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][reportDate.getDay()]

        // 데이터 분류
        const daeriRegistrations: EndorseReviewItem[] = []
        const daeriTerminations: EndorseReviewItem[] = []
        const taksongRegistrations: EndorseReviewItem[] = []
        const taksongTerminations: EndorseReviewItem[] = []

        let daeriRegPremium = 0
        let daeriTermPremium = 0
        let taksongRegPremium = 0
        let taksongTermPremium = 0
        let haldungCount = 0

        items.forEach((item) => {
          const premiumValue = item.c_preminum || item.preminum || 0
          const premium = parseInt(String(premiumValue), 10)

          const etagStr = String(item.etag || '')
          const isDaeri = etagStr === '1' || etagStr === '3'
          const isTaksong = !isDaeri

          const pushStr = String(item.push || '')
          const isRegistration = pushStr === '4'  // 정상만 청약으로 처리
          const isTermination = pushStr === '2'    // 해지

          if (isDaeri && isRegistration) {
            daeriRegistrations.push(item)
            daeriRegPremium += premium
          } else if (isDaeri && isTermination) {
            daeriTerminations.push(item)
            daeriTermPremium -= premium  // 해지는 음수로 계산 (환급)
          } else if (isTaksong && isRegistration) {
            taksongRegistrations.push(item)
            taksongRegPremium += premium
          } else if (isTaksong && isTermination) {
            taksongTerminations.push(item)
            taksongTermPremium -= premium  // 해지는 음수로 계산 (환급)
          }

          // 할등 카운트 (청약이고 rate가 1보다 큰 경우)
          if (isRegistration && item.rate && parseInt(String(item.rate), 10) > 1) {
            haldungCount++
          }
        })

        const daeriTotal = daeriRegPremium + daeriTermPremium
        const taksongTotal = taksongRegPremium + taksongTermPremium
        const overallTotal = daeriTotal + taksongTotal

        setData({
          daeriRegistrations,
          daeriTerminations,
          taksongRegistrations,
          taksongTerminations,
          daeriRegPremium,
          daeriTermPremium,
          taksongRegPremium,
          taksongTermPremium,
          haldungCount,
          company,
          reportDate: formattedDate,
          dayOfWeek,
        })
      } else {
        toast.error(res.data.error || '데이터를 불러오는 중 오류가 발생했습니다.')
        setData(null)
      }
    } catch (error: any) {
      console.error('배서현황 조회 오류:', error)
      toast.error(error.response?.data?.error || '데이터를 불러오는 중 오류가 발생했습니다.')
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    if (!date || !companyNum) {
      toast.error('날짜와 대리운전회사를 선택해주세요.')
      return
    }
    loadData(date, companyNum)
  }

  const handleCompanyChange = (value: string) => {
    setCompanyNum(value)
  }

  useEffect(() => {
    if (date) {
      loadCompanyOptions(date)
    }
  }, [date])

  const formatCurrency = (number: number) => {
    if (number === null || number === undefined || isNaN(number)) {
      return '0'
    }
    return Math.abs(number).toLocaleString('ko-KR')
  }

  const handleCopy = async () => {
    if (!data) return

    try {
      let copyText = `${data.reportDate} (${data.dayOfWeek}) 배서현황\n\n`

      // 대리 가입자
      copyText += '*대리 가입자\n\n'
      data.daeriRegistrations.forEach((item) => {
        copyText += `${item.name}\n`
      })
      if (data.daeriRegistrations.length > 0) {
        copyText += '\n'
      }
      copyText += `총 ${data.daeriRegistrations.length}명\n\n`

      // 대리 해지자
      copyText += '*대리 해지자\n\n'
      data.daeriTerminations.forEach((item) => {
        copyText += `${item.name}\n`
      })
      if (data.daeriTerminations.length > 0) {
        copyText += '\n'
      }
      copyText += `총 ${data.daeriTerminations.length}명\n\n`

      // 탁송 가입자
      copyText += '*탁송 가입자\n\n'
      data.taksongRegistrations.forEach((item) => {
        copyText += `${item.name}\n`
      })
      if (data.taksongRegistrations.length > 0) {
        copyText += '\n'
      }
      copyText += `총 ${data.taksongRegistrations.length}명\n\n`

      // 탁송 해지자
      copyText += '*탁송 해지자\n\n'
      data.taksongTerminations.forEach((item) => {
        copyText += `${item.name}\n`
      })
      if (data.taksongTerminations.length > 0) {
        copyText += '\n'
      }
      copyText += `총 ${data.taksongTerminations.length}명\n\n`

      // 영수보험료
      const daeriTotal = data.daeriRegPremium + data.daeriTermPremium
      const taksongTotal = data.taksongRegPremium + data.taksongTermPremium
      const overallTotal = daeriTotal + taksongTotal

      copyText += '영수보험료 (+추징/-환급)\n'
      copyText += `대리 : ${formatCurrency(daeriTotal)}원 ${daeriTotal >= 0 ? '추징' : '환급'}\n`
      copyText += `탁송 : ${formatCurrency(taksongTotal)}원 ${taksongTotal >= 0 ? '추징' : '환급'}\n`
      copyText += `합계 : ${formatCurrency(overallTotal)}원 ${overallTotal >= 0 ? '추징' : '환급'}\n\n`

      // 할증자 정보
      copyText += `보험료 파일은 할증 관련 내용 정리하여 메일로 발송하겠습니다.`

      // 연속된 빈 줄 정리
      copyText = copyText.replace(/\n{3,}/g, '\n\n').trim()

      await navigator.clipboard.writeText(copyText)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('복사 실패:', error)
      toast.error('복사에 실패했습니다. 브라우저가 클립보드 접근을 지원하지 않을 수 있습니다.')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="inline-flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          배서현황
        </span>
      }
      maxWidth="xl"
      maxHeight="90vh"
      position="center"
    >
      <div className="space-y-4">
        {/* 필터 영역 - 숨김 처리 (이전 버전과 동일) */}
        <div className="hidden">
          <div className="grid grid-cols-12 gap-3 items-end">
            <div className="col-span-4">
              <FilterSelect
                value={companyNum}
                onChange={handleCompanyChange}
                options={companyOptions}
                className="w-full"
              />
            </div>
            <div className="col-span-3">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-10 px-3 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="col-span-2">
              <button
                onClick={handleSearch}
                className="w-full h-10 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-2"
              >
                조회
              </button>
            </div>
          </div>
        </div>

        {/* 데이터 표시 영역 */}
        {loading ? (
          <div className="text-center py-8">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">로딩 중...</span>
            </div>
            <p className="mt-2">데이터를 불러오는 중...</p>
          </div>
        ) : !data ? (
          <div className="text-center py-8 text-muted-foreground">
            조회 조건을 선택하고 조회 버튼을 클릭하세요.
          </div>
        ) : (
          <div className="report-container">
            {/* 제목 및 복사 버튼 */}
            <div className="flex justify-between items-center mb-3">
              <h3 className="mb-0 text-lg font-semibold">
                {data.reportDate} ({data.dayOfWeek}) 배서현황
              </h3>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 text-sm border rounded hover:bg-accent transition-colors inline-flex items-center gap-1"
                title="배서현황 내용을 클립보드에 복사합니다"
              >
                {copySuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    복사됨
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    복사
                  </>
                )}
              </button>
            </div>

            {/* 대리 가입자 */}
            <div className="report-section mb-4">
              <h4 className="text-base font-semibold mb-2">*대리 가입자</h4>
              <ul className="list-disc list-inside mb-2">
                {data.daeriRegistrations.map((item, index) => (
                  <li key={index}>{item.name}</li>
                ))}
              </ul>
              <p className="mt-2">총 {data.daeriRegistrations.length}명</p>
            </div>

            {/* 대리 해지자 */}
            <div className="report-section mb-4">
              <h4 className="text-base font-semibold mb-2">*대리 해지자</h4>
              <ul className="list-disc list-inside mb-2">
                {data.daeriTerminations.map((item, index) => (
                  <li key={index}>{item.name}</li>
                ))}
              </ul>
              <p className="mt-2">총 {data.daeriTerminations.length}명</p>
            </div>

            {/* 탁송 가입자 */}
            <div className="report-section mb-4">
              <h4 className="text-base font-semibold mb-2">*탁송 가입자</h4>
              <ul className="list-disc list-inside mb-2">
                {data.taksongRegistrations.map((item, index) => (
                  <li key={index}>{item.name}</li>
                ))}
              </ul>
              <p className="mt-2">총 {data.taksongRegistrations.length}명</p>
            </div>

            {/* 탁송 해지자 */}
            <div className="report-section mb-4">
              <h4 className="text-base font-semibold mb-2">*탁송 해지자</h4>
              <ul className="list-disc list-inside mb-2">
                {data.taksongTerminations.map((item, index) => (
                  <li key={index}>{item.name}</li>
                ))}
              </ul>
              <p className="mt-2">총 {data.taksongTerminations.length}명</p>
            </div>

            {/* 영수보험료 (+추징/-환급) */}
            <div
              id="premium-settlement-section"
              className="report-section mb-4 p-4 rounded"
              style={{
                border: '2px solid #007bff',
                backgroundColor: '#f8f9fa',
              }}
            >
              <h4 className="text-base font-bold mb-2" style={{ color: '#007bff' }}>
                영수보험료 (+추징/-환급)
              </h4>
              {(() => {
                const daeriTotal = data.daeriRegPremium + data.daeriTermPremium
                const taksongTotal = data.taksongRegPremium + data.taksongTermPremium
                const overallTotal = daeriTotal + taksongTotal

                return (
                  <>
                    <p className="text-base my-1">
                      <strong>대리:</strong> {formatCurrency(daeriTotal)}원 {daeriTotal >= 0 ? '추징' : '환급'}
                    </p>
                    <p className="text-base my-1">
                      <strong>탁송:</strong> {formatCurrency(taksongTotal)}원 {taksongTotal >= 0 ? '추징' : '환급'}
                    </p>
                    <p className="text-lg my-2 font-bold" style={{ color: '#28a745' }}>
                      <strong>합계:</strong> {formatCurrency(overallTotal)}원 {overallTotal >= 0 ? '추징' : '환급'}
                    </p>
                  </>
                )
              })()}
            </div>

            {/* 할증자 정보 및 메일 발송 문구 */}
            <div className="report-section">
              <p className="mb-1">금일 가입자 중 할증자는 {data.haldungCount} 명입니다.</p>
              <p>보험료 파일은 정리하여 메일로 발송하겠습니다.</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
