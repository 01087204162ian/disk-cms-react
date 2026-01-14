import { useState, useEffect } from 'react'
import { Modal, useToastHelpers, FilterSelect } from '../../../components'
import api from '../../../lib/api'
import { BarChart3 } from 'lucide-react'

interface EndorseReviewModalProps {
  isOpen: boolean
  onClose: () => void
  date?: string
  companyNum?: string
  companyName?: string
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
}

export default function EndorseReviewModal({
  isOpen,
  onClose,
  date: initialDate,
  companyNum: initialCompanyNum,
  companyName: initialCompanyName,
}: EndorseReviewModalProps) {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState(initialDate || '')
  const [companyNum, setCompanyNum] = useState(initialCompanyNum || '')
  const [companyOptions, setCompanyOptions] = useState<{ value: string; label: string }[]>([])
  const [data, setData] = useState<EndorseReviewData | null>(null)

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
        {/* 필터 영역 */}
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
          <div className="space-y-6">
            {/* 회사명 표시 */}
            <div className="text-lg font-semibold">
              대리운전회사: {data.company}
            </div>

            {/* 대리운전 청약 */}
            <div>
              <h6 className="text-sm font-semibold mb-2">대리운전 청약</h6>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300" style={{ fontSize: '0.75rem' }}>
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-2 py-2 text-center">No</th>
                      <th className="border border-gray-300 px-2 py-2 text-center">성명</th>
                      <th className="border border-gray-300 px-2 py-2 text-center">주민번호</th>
                      <th className="border border-gray-300 px-2 py-2 text-center">보험료</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.daeriRegistrations.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="border border-gray-300 px-2 py-2 text-center text-muted-foreground">
                          데이터가 없습니다.
                        </td>
                      </tr>
                    ) : (
                      data.daeriRegistrations.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-2 py-2 text-center">{index + 1}</td>
                          <td className="border border-gray-300 px-2 py-2">{item.name || '-'}</td>
                          <td className="border border-gray-300 px-2 py-2">{item.Jumin || '-'}</td>
                          <td className="border border-gray-300 px-2 py-2 text-right">
                            {((item.c_preminum || item.preminum) || 0).toLocaleString('ko-KR')}
                          </td>
                        </tr>
                      ))
                    )}
                    <tr className="bg-gray-100 font-semibold">
                      <td colSpan={3} className="border border-gray-300 px-2 py-2 text-right">합계</td>
                      <td className="border border-gray-300 px-2 py-2 text-right">
                        {data.daeriRegPremium.toLocaleString('ko-KR')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 대리운전 해지 */}
            <div>
              <h6 className="text-sm font-semibold mb-2">대리운전 해지</h6>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300" style={{ fontSize: '0.75rem' }}>
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-2 py-2 text-center">No</th>
                      <th className="border border-gray-300 px-2 py-2 text-center">성명</th>
                      <th className="border border-gray-300 px-2 py-2 text-center">주민번호</th>
                      <th className="border border-gray-300 px-2 py-2 text-center">보험료</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.daeriTerminations.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="border border-gray-300 px-2 py-2 text-center text-muted-foreground">
                          데이터가 없습니다.
                        </td>
                      </tr>
                    ) : (
                      data.daeriTerminations.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-2 py-2 text-center">{index + 1}</td>
                          <td className="border border-gray-300 px-2 py-2">{item.name || '-'}</td>
                          <td className="border border-gray-300 px-2 py-2">{item.Jumin || '-'}</td>
                          <td className="border border-gray-300 px-2 py-2 text-right">
                            {((item.c_preminum || item.preminum) || 0).toLocaleString('ko-KR')}
                          </td>
                        </tr>
                      ))
                    )}
                    <tr className="bg-gray-100 font-semibold">
                      <td colSpan={3} className="border border-gray-300 px-2 py-2 text-right">합계</td>
                      <td className="border border-gray-300 px-2 py-2 text-right">
                        {data.daeriTermPremium.toLocaleString('ko-KR')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 탁송 청약 */}
            <div>
              <h6 className="text-sm font-semibold mb-2">탁송 청약</h6>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300" style={{ fontSize: '0.75rem' }}>
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-2 py-2 text-center">No</th>
                      <th className="border border-gray-300 px-2 py-2 text-center">성명</th>
                      <th className="border border-gray-300 px-2 py-2 text-center">주민번호</th>
                      <th className="border border-gray-300 px-2 py-2 text-center">보험료</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.taksongRegistrations.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="border border-gray-300 px-2 py-2 text-center text-muted-foreground">
                          데이터가 없습니다.
                        </td>
                      </tr>
                    ) : (
                      data.taksongRegistrations.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-2 py-2 text-center">{index + 1}</td>
                          <td className="border border-gray-300 px-2 py-2">{item.name || '-'}</td>
                          <td className="border border-gray-300 px-2 py-2">{item.Jumin || '-'}</td>
                          <td className="border border-gray-300 px-2 py-2 text-right">
                            {((item.c_preminum || item.preminum) || 0).toLocaleString('ko-KR')}
                          </td>
                        </tr>
                      ))
                    )}
                    <tr className="bg-gray-100 font-semibold">
                      <td colSpan={3} className="border border-gray-300 px-2 py-2 text-right">합계</td>
                      <td className="border border-gray-300 px-2 py-2 text-right">
                        {data.taksongRegPremium.toLocaleString('ko-KR')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 탁송 해지 */}
            <div>
              <h6 className="text-sm font-semibold mb-2">탁송 해지</h6>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300" style={{ fontSize: '0.75rem' }}>
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-2 py-2 text-center">No</th>
                      <th className="border border-gray-300 px-2 py-2 text-center">성명</th>
                      <th className="border border-gray-300 px-2 py-2 text-center">주민번호</th>
                      <th className="border border-gray-300 px-2 py-2 text-center">보험료</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.taksongTerminations.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="border border-gray-300 px-2 py-2 text-center text-muted-foreground">
                          데이터가 없습니다.
                        </td>
                      </tr>
                    ) : (
                      data.taksongTerminations.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-2 py-2 text-center">{index + 1}</td>
                          <td className="border border-gray-300 px-2 py-2">{item.name || '-'}</td>
                          <td className="border border-gray-300 px-2 py-2">{item.Jumin || '-'}</td>
                          <td className="border border-gray-300 px-2 py-2 text-right">
                            {((item.c_preminum || item.preminum) || 0).toLocaleString('ko-KR')}
                          </td>
                        </tr>
                      ))
                    )}
                    <tr className="bg-gray-100 font-semibold">
                      <td colSpan={3} className="border border-gray-300 px-2 py-2 text-right">합계</td>
                      <td className="border border-gray-300 px-2 py-2 text-right">
                        {data.taksongTermPremium.toLocaleString('ko-KR')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 요약 정보 */}
            <div className="bg-gray-50 p-4 rounded">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>대리운전 청약 합계:</strong> {data.daeriRegPremium.toLocaleString('ko-KR')}원
                </div>
                <div>
                  <strong>대리운전 해지 합계:</strong> {data.daeriTermPremium.toLocaleString('ko-KR')}원
                </div>
                <div>
                  <strong>탁송 청약 합계:</strong> {data.taksongRegPremium.toLocaleString('ko-KR')}원
                </div>
                <div>
                  <strong>탁송 해지 합계:</strong> {data.taksongTermPremium.toLocaleString('ko-KR')}원
                </div>
                <div className="col-span-2">
                  <strong>할등 건수:</strong> {data.haldungCount}건
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
