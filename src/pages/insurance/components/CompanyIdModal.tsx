import { useEffect, useState } from 'react'
import { Modal, useToastHelpers, Select } from '../../../components'
import api from '../../../lib/api'
import { addPhoneHyphen, removePhoneHyphen } from '../constants'

interface CompanyIdModalProps {
  isOpen: boolean
  onClose: () => void
  companyNum: number | null
  companyName?: string
  onSuccess?: () => void
}

interface CompanyIdItem {
  num: number
  user?: string
  mem_id?: string
  hphone?: string
  readIs?: string | number
  permit?: string | number
  company?: string
}

interface CompanyIdListResponse {
  success: boolean
  data?: CompanyIdItem[]
  error?: string
}

export default function CompanyIdModal({
  isOpen,
  onClose,
  companyNum,
  companyName,
  onSuccess,
}: CompanyIdModalProps) {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(false)
  const [idList, setIdList] = useState<CompanyIdItem[]>([])
  const [companyNameDisplay, setCompanyNameDisplay] = useState('')
  
  // 신규 아이디 입력 필드
  const [newUser, setNewUser] = useState('')
  const [newId, setNewId] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [idCheckStatus, setIdCheckStatus] = useState<'idle' | 'checking' | 'available' | 'duplicate'>('idle')
  const [passwordValidation, setPasswordValidation] = useState('')
  const [savingNewId, setSavingNewId] = useState(false)
  
  // 각 행의 편집 상태 관리
  const [editingStates, setEditingStates] = useState<Record<number, { user: string; phone: string; password: string }>>({})

  useEffect(() => {
    if (isOpen && companyNum) {
      loadIdList()
    } else {
      setIdList([])
      setCompanyNameDisplay('')
      // 신규 입력 필드 초기화
      setNewUser('')
      setNewId('')
      setNewPhone('')
      setNewPassword('')
      setIdCheckStatus('idle')
      setPasswordValidation('')
      setEditingStates({})
    }
  }, [isOpen, companyNum])

  // idList가 변경될 때 편집 상태 초기화
  useEffect(() => {
    const newStates: Record<number, { user: string; phone: string; password: string }> = {}
    idList.forEach((item) => {
      newStates[item.num] = {
        user: item.user || '',
        phone: item.hphone || '',
        password: '',
      }
    })
    setEditingStates(newStates)
  }, [idList])

  // 업체 I.D 목록 조회
  const loadIdList = async () => {
    if (!companyNum) return

    try {
      setLoading(true)
      const response = await api.post<CompanyIdListResponse>('/api/insurance/kj-company/id-list', {
        dNum: companyNum,
      })

      if (response.data.success && response.data.data) {
        setIdList(response.data.data)
        if (response.data.data.length > 0) {
          setCompanyNameDisplay(response.data.data[0].company || companyName || '')
        }
      } else {
        toast.error(response.data.error || '업체 I.D 목록을 불러오는데 실패했습니다.')
        setIdList([])
      }
    } catch (error: any) {
      console.error('업체 I.D 목록 조회 오류:', error)
      toast.error('업체 I.D 목록을 불러오는 중 오류가 발생했습니다.')
      setIdList([])
    } finally {
      setLoading(false)
    }
  }

  // 담당자성명 수정
  const handleUpdateUser = async (num: number, user: string) => {
    if (!user.trim()) {
      toast.error('담당자명을 입력해주세요.')
      return
    }

    try {
      const response = await api.post('/api/insurance/kj-company/id-update-user', {
        num,
        user: user.trim(),
      })

      if (response.data.success) {
        toast.success('담당자명이 업데이트되었습니다.')
        loadIdList()
        if (onSuccess) onSuccess()
      } else {
        toast.error(response.data.error || '업데이트에 실패했습니다.')
      }
    } catch (error: any) {
      console.error('담당자명 업데이트 오류:', error)
      toast.error('업데이트 중 오류가 발생했습니다.')
    }
  }

  // 핸드폰번호 수정
  const handleUpdatePhone = async (num: number, phone: string) => {
    const cleaned = removePhoneHyphen(phone)
    if (!cleaned) {
      toast.error('전화번호를 입력해주세요.')
      return
    }

    try {
      const response = await api.post('/api/insurance/kj-company/id-update-phone', {
        num,
        hphone: phone, // 하이픈 포함하여 저장
      })

      if (response.data.success) {
        toast.success('전화번호가 업데이트되었습니다.')
        loadIdList()
        if (onSuccess) onSuccess()
      } else {
        toast.error(response.data.error || '업데이트에 실패했습니다.')
      }
    } catch (error: any) {
      console.error('전화번호 업데이트 오류:', error)
      toast.error('업데이트 중 오류가 발생했습니다.')
    }
  }

  // 권한 변경
  const handleUpdateReadStatus = async (num: number, readIs: string) => {
    if (readIs === '-1' || !readIs) {
      return
    }

    try {
      const response = await api.post('/api/insurance/kj-company/id-update-readis', {
        num,
        readIs,
      })

      if (response.data.success) {
        loadIdList()
        if (onSuccess) onSuccess()
      } else {
        toast.error(response.data.error || '권한 업데이트에 실패했습니다.')
        loadIdList() // 원래 값으로 복원
      }
    } catch (error: any) {
      console.error('권한 업데이트 오류:', error)
      toast.error('업데이트 중 오류가 발생했습니다.')
      loadIdList() // 원래 값으로 복원
    }
  }

  // 비밀번호 변경
  const handleUpdatePassword = async (num: number, password: string) => {
    if (!password.trim()) {
      toast.error('비밀번호를 입력해주세요.')
      return
    }

    if (password.length < 8) {
      toast.error('비밀번호는 최소 8자 이상이어야 합니다.')
      return
    }

    if (!/^(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
      toast.error('비밀번호는 영문과 숫자를 포함해야 합니다.')
      return
    }

    try {
      const response = await api.post('/api/insurance/kj-company/id-update-password', {
        num,
        password: password.trim(),
      })

      if (response.data.success) {
        toast.success('비밀번호가 업데이트되었습니다.')
        loadIdList()
        if (onSuccess) onSuccess()
      } else {
        toast.error(response.data.error || '비밀번호 업데이트에 실패했습니다.')
      }
    } catch (error: any) {
      console.error('비밀번호 업데이트 오류:', error)
      toast.error('업데이트 중 오류가 발생했습니다.')
    }
  }

  // 허용/차단 변경
  const handleUpdatePermit = async (num: number, permit: string) => {
    if (permit === '-1' || !permit) {
      return
    }

    try {
      const response = await api.post('/api/insurance/kj-company/id-update-permit', {
        num,
        permit,
      })

      if (response.data.success) {
        loadIdList()
        if (onSuccess) onSuccess()
      } else {
        toast.error(response.data.error || '허용/차단 업데이트에 실패했습니다.')
        loadIdList() // 원래 값으로 복원
      }
    } catch (error: any) {
      console.error('허용/차단 업데이트 오류:', error)
      toast.error('업데이트 중 오류가 발생했습니다.')
      loadIdList() // 원래 값으로 복원
    }
  }

  // ID 중복 검사
  const handleCheckId = async (id: string) => {
    if (!id.trim()) {
      setIdCheckStatus('idle')
      return
    }

    if (id.length > 20) {
      setIdCheckStatus('idle')
      toast.error('ID는 최대 20자까지 입력 가능합니다.')
      setNewId(id.substring(0, 20))
      return
    }

    try {
      setIdCheckStatus('checking')
      // 원본과 동일하게 FormData 사용
      const formData = new URLSearchParams()
      formData.append('mem_id', id.trim())

      const response = await fetch('/api/insurance/kj-company/check-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      })

      const result = await response.json()

      // 원본 코드와 동일하게 available 속성 직접 확인
      if (result.available) {
        setIdCheckStatus('available')
      } else {
        setIdCheckStatus('duplicate')
      }
    } catch (error: any) {
      console.error('ID 중복 검사 오류:', error)
      setIdCheckStatus('idle')
      toast.error('ID 중복 검사 중 오류가 발생했습니다.')
    }
  }

  // 비밀번호 검증
  const handlePasswordInput = (password: string) => {
    setNewPassword(password)
    if (password.length >= 8 && /^(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
      setPasswordValidation('유효한 비밀번호 형식입니다.')
    } else if (password.length > 0) {
      setPasswordValidation('비밀번호는 8자 이상이며 영문과 숫자를 포함해야 합니다.')
    } else {
      setPasswordValidation('')
    }
  }

  // 신규 아이디 생성
  const handleCreateNewId = async () => {
    if (!newUser.trim()) {
      toast.error('담당자명을 입력해주세요.')
      return
    }
    if (!newPhone.trim()) {
      toast.error('핸드폰번호를 입력해주세요.')
      return
    }
    if (!newId.trim()) {
      toast.error('ID를 입력해주세요.')
      return
    }
    if (idCheckStatus !== 'available') {
      toast.error('ID 중복검사를 완료해주세요.')
      return
    }
    if (!newPassword.trim()) {
      toast.error('비밀번호를 입력해주세요.')
      return
    }
    if (newPassword.length < 8 || !/^(?=.*[a-zA-Z])(?=.*[0-9])/.test(newPassword)) {
      toast.error('비밀번호는 8자 이상이며 영문과 숫자를 포함해야 합니다.')
      return
    }

    if (!companyNum) return

    try {
      setSavingNewId(true)
      const response = await api.post('/api/insurance/kj-company/id-save', {
        dNum: companyNum,
        mem_id: newId.trim(),
        password: newPassword.trim(),
        phone: newPhone, // 하이픈 포함하여 저장
        company: companyNameDisplay,
        user: newUser.trim(),
      })

      if (response.data.success) {
        toast.success('신규 아이디가 생성되었습니다.')
        // 입력 필드 초기화
        setNewUser('')
        setNewId('')
        setNewPhone('')
        setNewPassword('')
        setIdCheckStatus('idle')
        setPasswordValidation('')
        // 목록 다시 로드
        loadIdList()
        if (onSuccess) onSuccess()
      } else {
        toast.error(response.data.error || '신규 아이디 생성에 실패했습니다.')
      }
    } catch (error: any) {
      console.error('신규 아이디 생성 오류:', error)
      toast.error('신규 아이디 생성 중 오류가 발생했습니다.')
    } finally {
      setSavingNewId(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="업체 I.D 관리"
      maxWidth="4xl"
    >
      <div className="p-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-sm text-muted-foreground">데이터를 불러오는 중...</p>
          </div>
        ) : (
          <>
            <div className="mb-3">
              <h6 className="text-sm font-medium">{companyNameDisplay}</h6>
            </div>

            <div className="table-responsive">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium" style={{ width: '14%' }}>
                      담당자성명
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium" style={{ width: '14%' }}>
                      업체 I.D
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium" style={{ width: '20%' }}>
                      핸드폰번호
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium" style={{ width: '13%' }}>
                      권한
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium" style={{ width: '19%' }}>
                      비밀번호
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium" style={{ width: '20%' }}>
                      허용/차단
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {idList.map((item) => {
                    const editingState = editingStates[item.num] || { user: item.user || '', phone: item.hphone || '', password: '' }

                    return (
                      <tr key={item.num}>
                        <td className="border border-gray-300 px-2 py-1">
                          <input
                            type="text"
                            className="w-full px-2 py-1 text-xs border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                            value={editingState.user}
                            onChange={(e) => {
                              setEditingStates((prev) => ({
                                ...prev,
                                [item.num]: { ...prev[item.num], user: e.target.value },
                              }))
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdateUser(item.num, editingState.user)
                              }
                            }}
                            onBlur={() => {
                              if (editingState.user !== (item.user || '')) {
                                handleUpdateUser(item.num, editingState.user)
                              }
                            }}
                            autoComplete="off"
                          />
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          <input
                            type="text"
                            className="w-full px-2 py-1 text-xs border-0 bg-transparent"
                            value={item.mem_id || ''}
                            readOnly
                          />
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          <input
                            type="text"
                            className="w-full px-2 py-1 text-xs border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                            value={editingState.phone}
                            onChange={(e) => {
                              const cleaned = removePhoneHyphen(e.target.value)
                              const formatted = addPhoneHyphen(cleaned)
                              setEditingStates((prev) => ({
                                ...prev,
                                [item.num]: { ...prev[item.num], phone: formatted },
                              }))
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdatePhone(item.num, editingState.phone)
                              }
                            }}
                            onBlur={() => {
                              if (editingState.phone !== (item.hphone || '')) {
                                handleUpdatePhone(item.num, editingState.phone)
                              }
                            }}
                            autoComplete="off"
                          />
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          <Select
                            value={String(item.readIs || '2')}
                            onChange={(e) => handleUpdateReadStatus(item.num, e.target.value)}
                            options={[
                              { value: '-1', label: '선택' },
                              { value: '1', label: '읽기전용' },
                              { value: '2', label: '모든권한' },
                            ]}
                            className="w-full text-xs"
                          />
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          <input
                            type="text"
                            className="w-full px-2 py-1 text-xs border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="비밀번호 입력"
                            value={editingState.password}
                            onChange={(e) => {
                              setEditingStates((prev) => ({
                                ...prev,
                                [item.num]: { ...prev[item.num], password: e.target.value },
                              }))
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdatePassword(item.num, editingState.password)
                                setEditingStates((prev) => ({
                                  ...prev,
                                  [item.num]: { ...prev[item.num], password: '' },
                                }))
                              }
                            }}
                            autoComplete="off"
                          />
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          <Select
                            value={String(item.permit || '-1')}
                            onChange={(e) => handleUpdatePermit(item.num, e.target.value)}
                            options={[
                              { value: '-1', label: '선택' },
                              { value: '1', label: '허용' },
                              { value: '2', label: '차단' },
                            ]}
                            className="w-full text-xs"
                          />
                        </td>
                      </tr>
                    )
                  })}

                  {/* 신규 아이디 추가 행 */}
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="text"
                        className="w-full px-2 py-1 text-xs border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="담당자성명"
                        value={newUser}
                        onChange={(e) => setNewUser(e.target.value)}
                        autoComplete="off"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="text"
                        className="w-full px-2 py-1 text-xs border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="아이디"
                        value={newId}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value.length <= 20) {
                            setNewId(value)
                            if (value.trim()) {
                              handleCheckId(value)
                            } else {
                              setIdCheckStatus('idle')
                            }
                          }
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleCheckId(newId)
                          }
                        }}
                        autoComplete="off"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="text"
                        className="w-full px-2 py-1 text-xs border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="핸드폰번호"
                        value={newPhone}
                        onChange={(e) => {
                          const cleaned = removePhoneHyphen(e.target.value)
                          const formatted = addPhoneHyphen(cleaned)
                          setNewPhone(formatted)
                        }}
                        autoComplete="off"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1"></td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="text"
                        className="w-full px-2 py-1 text-xs border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="비밀번호 입력"
                        value={newPassword}
                        onChange={(e) => handlePasswordInput(e.target.value)}
                        autoComplete="off"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <button
                        type="button"
                        className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                        onClick={handleCreateNewId}
                        disabled={savingNewId}
                      >
                        {savingNewId ? '생성 중...' : '신규아이디 생성'}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 안내 메시지 */}
            <div className="mt-2">
              {idCheckStatus === 'checking' && (
                <small className="text-blue-600">확인 중...</small>
              )}
              {idCheckStatus === 'available' && (
                <small className="text-green-600">사용할 수 있는 ID 입니다</small>
              )}
              {idCheckStatus === 'duplicate' && (
                <small className="text-red-600">이미 사용 중인 ID 입니다</small>
              )}
            </div>
            <div className="mt-1">
              {passwordValidation && (
                <small className={passwordValidation.includes('유효한') ? 'text-green-600' : 'text-red-600'}>
                  {passwordValidation}
                </small>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
