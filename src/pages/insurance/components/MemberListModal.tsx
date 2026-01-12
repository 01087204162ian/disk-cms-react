import { useEffect, useState } from 'react'
import { Modal, LoadingSpinner, useToastHelpers } from '../../../components'
import api from '../../../lib/api'
import { getInsurerName, getGitaName } from '../constants'

interface MemberListModalProps {
  isOpen: boolean
  onClose: () => void
  certiTableNum: number | null
}

interface Member {
  Name?: string
  nai?: number
  Jumin?: string
  Hphone?: string
  push?: number
  InsuranceCompany?: number
  etag?: number
}

interface MemberListResponse {
  success: boolean
  data?: Member[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  error?: string
}

const mapPushLabel = (push: number): string => {
  switch (push) {
    case 1:
      return '청약중'
    case 2:
      return '해지'
    case 4:
      return '정상'
    case 5:
      return '거절'
    case 6:
      return '취소'
    case 7:
      return '실효'
    default:
      return '기타'
  }
}

export default function MemberListModal({ isOpen, onClose, certiTableNum }: MemberListModalProps) {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  })

  useEffect(() => {
    if (isOpen && certiTableNum) {
      loadMembers(1)
    } else {
      setMembers([])
      setPagination({ page: 1, limit: 20, total: 0, totalPages: 1 })
    }
  }, [isOpen, certiTableNum])

  const loadMembers = async (page: number) => {
    if (!certiTableNum) return

    try {
      setLoading(true)
      const response = await api.get<MemberListResponse>(
        `/api/insurance/kj-certi/member-list?certiTableNum=${certiTableNum}&page=${page}&limit=${pagination.limit}`
      )

      if (response.data.success) {
        setMembers(response.data.data || [])
        if (response.data.pagination) {
          setPagination(response.data.pagination)
        }
      } else {
        toast.error(response.data.error || '대리기사 정보를 불러올 수 없습니다.')
        setMembers([])
      }
    } catch (error: any) {
      console.error('대리기사 정보 로드 오류:', error)
      toast.error(error.response?.data?.error || '대리기사 정보를 불러오는 중 오류가 발생했습니다.')
      setMembers([])
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadMembers(newPage)
    }
  }

  const startIndex = (pagination.page - 1) * pagination.limit

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="대리기사 리스트"
      maxWidth="4xl"
    >
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : members.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          등록된 대리기사가 없습니다.
        </div>
      ) : (
        <div>
          <div className="mb-3">
            <h6 className="text-sm font-semibold">총 {pagination.total}명</h6>
          </div>
          <div className="overflow-x-auto border border-border rounded">
            <table className="w-full text-xs border-collapse" style={{ fontSize: '0.9rem' }}>
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '5%' }}>
                    번호
                  </th>
                  <th className="px-2 py-2 text-left font-medium border border-border" style={{ width: '15%' }}>
                    이름
                  </th>
                  <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '10%' }}>
                    나이
                  </th>
                  <th className="px-2 py-2 text-left font-medium border border-border" style={{ width: '20%' }}>
                    주민번호
                  </th>
                  <th className="px-2 py-2 text-left font-medium border border-border" style={{ width: '15%' }}>
                    연락처
                  </th>
                  <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '10%' }}>
                    상태
                  </th>
                  <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '10%' }}>
                    보험사
                  </th>
                  <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '15%' }}>
                    기타
                  </th>
                </tr>
              </thead>
              <tbody>
                {members.map((member, idx) => {
                  const bgClass = idx % 2 === 0 ? 'bg-gray-50' : ''
                  const displayIndex = startIndex + idx + 1

                  return (
                    <tr key={idx} className={bgClass}>
                      <td className="px-2 py-2 text-center border border-border">{displayIndex}</td>
                      <td className="px-2 py-2 border border-border">{member.Name || ''}</td>
                      <td className="px-2 py-2 text-center border border-border">{member.nai || ''}</td>
                      <td className="px-2 py-2 border border-border">{member.Jumin || ''}</td>
                      <td className="px-2 py-2 border border-border">{member.Hphone || ''}</td>
                      <td className="px-2 py-2 text-center border border-border">
                        {mapPushLabel(member.push || 0)}
                      </td>
                      <td className="px-2 py-2 text-center border border-border">
                        {getInsurerName(member.InsuranceCompany || 0)}
                      </td>
                      <td className="px-2 py-2 text-center border border-border">
                        {getGitaName(member.etag || 0)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {pagination.totalPages > 1 && (
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                총 {pagination.total}명 / {pagination.page}/{pagination.totalPages} 페이지
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ‹
                </button>
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = pagination.page <= 3 ? i + 1 : pagination.page - 2 + i
                  if (page > pagination.totalPages) return null
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 text-xs rounded ${
                        page === pagination.page
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
