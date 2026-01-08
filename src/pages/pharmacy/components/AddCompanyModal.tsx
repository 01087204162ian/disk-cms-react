import { useEffect, useState } from 'react'
import { Modal, FormInput, LoadingSpinner, useToastHelpers, DataTable, type Column } from '../../../components'
import api from '../../../lib/api'

interface Company {
  num?: number
  name: string
  mem_id: string
  hphone1: string
  password?: string
  created_at?: string
}

interface AddCompanyModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function AddCompanyModal({ isOpen, onClose, onSuccess }: AddCompanyModalProps) {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(true)
  const [companies, setCompanies] = useState<Company[]>([])
  const [newCompany, setNewCompany] = useState<Company>({
    name: '',
    mem_id: '',
    hphone1: '',
    password: '',
  })

  useEffect(() => {
    if (isOpen) {
      loadCompanies()
    }
  }, [isOpen])

  const loadCompanies = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/pharmacy2/customers')
      if (res.data?.success) {
        setCompanies(res.data.data || [])
      }
    } catch (error: any) {
      console.error('거래처 목록 로드 오류:', error)
      toast.error(error?.message || '거래처 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (company: Company) => {
    try {
      if (!company.name || !company.mem_id) {
        toast.warning('업체명과 아이디는 필수입니다.')
        return
      }

      const res = company.num
        ? await api.put(`/api/pharmacy2/customers/${company.num}`, company)
        : await api.post('/api/pharmacy2/customers', company)

      if (res.data?.success) {
        toast.success(company.num ? '업체가 수정되었습니다.' : '업체가 추가되었습니다.')
        await loadCompanies()
        onSuccess?.()
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || '저장에 실패했습니다.')
    }
  }

  const handleDelete = async (num: number) => {
    if (!confirm('업체를 삭제하시겠습니까?')) return

    try {
      const res = await api.delete(`/api/pharmacy2/customers/${num}`)
      if (res.data?.success) {
        toast.success('업체가 삭제되었습니다.')
        await loadCompanies()
        onSuccess?.()
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || '삭제에 실패했습니다.')
    }
  }

  const columns: Column<Company>[] = [
    {
      key: 'num',
      header: '#',
      className: 'w-12',
      cell: (row) => {
        const index = companies.findIndex((c) => c.num === row.num)
        return index + 1
      },
    },
    {
      key: 'name',
      header: '업체명',
      cell: (row) => (
        <input
          type="text"
          value={row.name || ''}
          onChange={(e) => {
            const updated = companies.map((c) => (c.num === row.num ? { ...c, name: e.target.value } : c))
            setCompanies(updated)
          }}
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
          placeholder="업체명"
        />
      ),
    },
    {
      key: 'mem_id',
      header: '아이디',
      cell: (row) => (
        <input
          type="text"
          value={row.mem_id || ''}
          onChange={(e) => {
            const updated = companies.map((c) => (c.num === row.num ? { ...c, mem_id: e.target.value } : c))
            setCompanies(updated)
          }}
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
          placeholder="아이디"
        />
      ),
    },
    {
      key: 'hphone1',
      header: '휴대전화',
      cell: (row) => (
        <input
          type="tel"
          value={row.hphone1 || ''}
          onChange={(e) => {
            const updated = companies.map((c) => (c.num === row.num ? { ...c, hphone1: e.target.value } : c))
            setCompanies(updated)
          }}
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
          placeholder="휴대전화"
        />
      ),
    },
    {
      key: 'password',
      header: '비밀번호',
      cell: (row) => (
        <input
          type="password"
          value={row.password || ''}
          onChange={(e) => {
            const updated = companies.map((c) => (c.num === row.num ? { ...c, password: e.target.value } : c))
            setCompanies(updated)
          }}
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
          placeholder="비밀번호"
        />
      ),
    },
    {
      key: 'created_at',
      header: '등록일',
      cell: (row) => (row.created_at ? new Date(row.created_at).toLocaleDateString('ko-KR') : '-'),
    },
    {
      key: 'actions',
      header: '관리',
      className: 'text-center',
      cell: (row) => (
        <div className="flex gap-1 justify-center">
          <button
            onClick={() => handleSave(row)}
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
          >
            저장
          </button>
          {row.num && (
            <button
              onClick={() => handleDelete(row.num!)}
              className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
            >
              삭제
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="거래처 관리" maxWidth="6xl" maxHeight="90vh">
      <div className="space-y-4">
        {/* 신규 업체 추가 폼 */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h6 className="text-sm font-medium mb-3">신규 업체 추가</h6>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <FormInput
              type="text"
              value={newCompany.name}
              onChange={(e) => setNewCompany((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="업체명 *"
              variant="modal"
            />
            <FormInput
              type="text"
              value={newCompany.mem_id}
              onChange={(e) => setNewCompany((prev) => ({ ...prev, mem_id: e.target.value }))}
              placeholder="아이디 *"
              variant="modal"
            />
            <FormInput
              type="tel"
              value={newCompany.hphone1}
              onChange={(e) => setNewCompany((prev) => ({ ...prev, hphone1: e.target.value }))}
              placeholder="휴대전화"
              variant="modal"
            />
            <button
              onClick={() => {
                handleSave(newCompany).then(() => {
                  setNewCompany({ name: '', mem_id: '', hphone1: '', password: '' })
                })
              }}
              className="px-4 py-2 bg-green-500 text-white rounded text-xs font-medium hover:bg-green-600"
            >
              추가
            </button>
          </div>
        </div>

        {/* 기존 업체 목록 */}
        {loading ? (
          <LoadingSpinner size="md" />
        ) : (
          <DataTable
            data={companies}
            columns={columns}
            emptyMessage="등록된 업체가 없습니다."
            className="text-xs"
          />
        )}
      </div>
    </Modal>
  )
}
