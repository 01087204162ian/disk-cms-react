import { Modal } from '../../../components'
import { RATE_OPTIONS, getRateValue, getRateName } from '../constants'
import { Info } from 'lucide-react'

interface RateDetailModalProps {
  isOpen: boolean
  onClose: () => void
  rateCode: number | string
}

export default function RateDetailModal({ isOpen, onClose, rateCode }: RateDetailModalProps) {
  const rateCodeNum = parseInt(String(rateCode)) || 1
  const rateValue = getRateValue(rateCodeNum)
  const rateName = getRateName(rateCodeNum)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="요율 상세 설명"
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* 요율 코드 및 값 표시 */}
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm font-medium">
            요율 코드: {rateCodeNum}
          </span>
          <span className="px-3 py-1 bg-blue-500 text-white rounded text-sm font-medium">
            요율: {rateValue.toFixed(3)}
          </span>
        </div>

        {/* 요율 설명 */}
        <div className="border-l-4 border-primary bg-muted/30 p-4 rounded">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-primary" />
            <h6 className="font-semibold text-sm">요율 설명</h6>
          </div>
          <p className="text-sm leading-relaxed">{rateName}</p>
        </div>

        {/* 전체 요율 목록 */}
        <div className="mt-6">
          <h6 className="mb-3 font-semibold text-sm">할인할증 요율 전체 목록</h6>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-center font-medium" style={{ width: '80px' }}>
                    코드
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-center font-medium" style={{ width: '100px' }}>
                    요율
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-medium">설명</th>
                </tr>
              </thead>
              <tbody>
                {RATE_OPTIONS.filter((opt) => opt.value !== '-1').map((opt) => {
                  const code = parseInt(opt.value)
                  const value = getRateValue(code)
                  const name = getRateName(code)
                  const isSelected = code === rateCodeNum

                  return (
                    <tr
                      key={code}
                      className={isSelected ? 'bg-primary/10' : ''}
                    >
                      <td className="border border-gray-300 px-3 py-2 text-center">{code}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center font-semibold">
                        {value.toFixed(3)}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">{name}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  )
}
