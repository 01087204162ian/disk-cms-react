import { useState, useEffect } from 'react'
import { Modal, useToastHelpers } from '../../../components'
import api from '../../../lib/api'
import { getInsurerName, getGitaName } from '../constants'

interface EndorseModalProps {
  isOpen: boolean
  onClose: () => void
  certiTableNum: number | null
  insurerCode?: number
  policyNum?: string
  gita?: number
  companyNum?: number
  onSuccess?: () => void
}

interface EndorseMember {
  name: string
  juminNo: string
  phoneNo: string
}

export default function EndorseModal({
  isOpen,
  onClose,
  certiTableNum,
  insurerCode,
  policyNum,
  gita,
  companyNum,
  onSuccess,
}: EndorseModalProps) {
  const toast = useToastHelpers()
  const [endorseDate, setEndorseDate] = useState('')
  const [members, setMembers] = useState<EndorseMember[]>(Array(10).fill({ name: '', juminNo: '', phoneNo: '' }))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // 오늘 날짜를 기본값으로 설정
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      setEndorseDate(todayStr)
      // 입력 필드 초기화
      setMembers(Array(10).fill({ name: '', juminNo: '', phoneNo: '' }))
    }
  }, [isOpen])

  const handleMemberChange = (index: number, field: keyof EndorseMember, value: string) => {
    const newMembers = [...members]
    newMembers[index] = { ...newMembers[index], [field]: value }
    setMembers(newMembers)
  }

  const formatJumin = (value: string): string => {
    const digits = value.replace(/[^0-9]/g, '')
    if (digits.length > 6) {
      return digits.substring(0, 6) + '-' + digits.substring(6, 13)
    }
    return digits
  }

  const formatPhone = (value: string): string => {
    const digits = value.replace(/[^0-9]/g, '')
    if (digits.length > 3 && digits.length <= 7) {
      return digits.substring(0, 3) + '-' + digits.substring(3)
    } else if (digits.length > 7) {
      return digits.substring(0, 3) + '-' + digits.substring(3, 7) + '-' + digits.substring(7, 11)
    }
    return digits
  }

  const handleSave = async () => {
    if (!certiTableNum || !companyNum || !endorseDate) {
      toast.error('필수 정보가 누락되었습니다.')
      return
    }

    // 입력된 멤버만 필터링
    const validMembers = members.filter((m) => m.name.trim())

    if (validMembers.length === 0) {
      toast.error('입력된 대리기사 정보가 없습니다. 최소 1명의 이름을 입력해주세요.')
      return
    }

    // 유효성 검사
    for (const member of validMembers) {
      if (!member.juminNo || !member.phoneNo) {
        toast.error(`"${member.name}"님의 주민번호와 전화번호를 모두 입력해주세요.`)
        return
      }
      const juminDigits = member.juminNo.replace(/[^0-9]/g, '')
      if (juminDigits.length !== 13) {
        toast.error(`"${member.name}"님의 주민번호가 13자리가 아닙니다.`)
        return
      }
    }

    if (!window.confirm(`총 ${validMembers.length}명의 배서 정보를 저장하시겠습니까?`)) {
      return
    }

    try {
      setSaving(true)
      const response = await api.post('/api/insurance/kj-endorse/save', {
        data: validMembers,
        cNum: certiTableNum,
        dNum: companyNum,
        InsuraneCompany: insurerCode,
        endorseDay: endorseDate,
        policyNum: policyNum,
        gita: gita,
      })

      if (response.data.success) {
        toast.success(response.data.message || `배서 정보가 성공적으로 저장되었습니다. (총 ${response.data.data?.count || validMembers.length}명)`)
        onSuccess?.()
        onClose()
      } else {
        toast.error(response.data.error || '배서 저장에 실패했습니다.')
      }
    } catch (error: any) {
      console.error('배서 저장 오류:', error)
      toast.error(error.response?.data?.error || '배서 저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const insurerName = insurerCode ? getInsurerName(insurerCode) : ''
  const gitaName = gita ? getGitaName(gita) : ''

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
            onClick={() => {
              // ExcelUp 기능은 추후 구현
              toast.info('ExcelUp 기능은 추후 구현 예정입니다.')
            }}
          >
            ExcelUp
          </button>
          <span className="font-bold">
            [{insurerName}][{policyNum || ''}]
          </span>
        </div>
      }
      maxWidth="2xl"
      footer={
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      }
    >
      <div className="mb-3 flex items-center gap-2">
        <label className="font-bold">배서기준일</label>
        <input
          type="date"
          value={endorseDate}
          onChange={(e) => setEndorseDate(e.target.value)}
          className="px-2 py-1 text-sm border border-border rounded"
          style={{ width: '150px' }}
        />
      </div>
      <div className="overflow-x-auto border border-border rounded">
        <table className="w-full text-xs border-collapse" style={{ fontSize: '0.9rem' }}>
          <thead>
            <tr className="bg-gray-100">
              <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '5%' }}>
                순번
              </th>
              <th className="px-2 py-2 text-left font-medium border border-border" style={{ width: '20%' }}>
                성명
              </th>
              <th className="px-2 py-2 text-left font-medium border border-border" style={{ width: '25%' }}>
                주민번호
              </th>
              <th className="px-2 py-2 text-left font-medium border border-border" style={{ width: '20%' }}>
                핸드폰번호
              </th>
              <th className="px-2 py-2 text-left font-medium border border-border" style={{ width: '30%' }}>
                증권성격
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((member, idx) => (
              <tr key={idx} style={{ backgroundColor: '#ffffff' }}>
                <td className="px-2 py-2 text-center border border-border">{idx + 1}</td>
                <td className="px-2 py-2 border border-border" style={{ padding: 0 }}>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                    placeholder="성명"
                    className="w-full px-2 py-1 text-xs border-0 bg-transparent outline-none"
                    style={{ backgroundColor: '#ffffff' }}
                  />
                </td>
                <td className="px-2 py-2 border border-border" style={{ padding: 0 }}>
                  <input
                    type="text"
                    value={member.juminNo}
                    onChange={(e) => {
                      const formatted = formatJumin(e.target.value)
                      handleMemberChange(idx, 'juminNo', formatted)
                    }}
                    placeholder="주민번호"
                    maxLength={14}
                    className="w-full px-2 py-1 text-xs border-0 bg-transparent outline-none"
                    style={{ backgroundColor: '#ffffff' }}
                  />
                </td>
                <td className="px-2 py-2 border border-border" style={{ padding: 0 }}>
                  <input
                    type="text"
                    value={member.phoneNo}
                    onChange={(e) => {
                      const formatted = formatPhone(e.target.value)
                      handleMemberChange(idx, 'phoneNo', formatted)
                    }}
                    placeholder="핸드폰번호"
                    maxLength={13}
                    className="w-full px-2 py-1 text-xs border-0 bg-transparent outline-none"
                    style={{ backgroundColor: '#ffffff' }}
                  />
                </td>
                <td className="px-2 py-2 border border-border">{gitaName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  )
}
