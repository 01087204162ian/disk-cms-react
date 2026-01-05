import { useState, useEffect, FormEvent, ChangeEvent } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import api from '../lib/api'
import { Key, Shield } from 'lucide-react'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({})
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setError('유효하지 않은 접근입니다.')
      setVerifying(false)
      return
    }
    verifyToken()
  }, [token])

  const verifyToken = async () => {
    try {
      const response = await api.get(`/api/auth/verify-reset-token/${token}`)
      if (response.data.success) {
        setTokenValid(true)
      } else {
        setError(response.data.message || '유효하지 않은 토큰입니다.')
      }
    } catch (err: any) {
      console.error('토큰 검증 오류:', err)
      setError(err.response?.data?.message || '서버와의 연결에 문제가 발생했습니다.')
    } finally {
      setVerifying(false)
    }
  }

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'newPassword':
        if (!value) return '비밀번호를 입력해주세요.'
        if (value.length < 8) return '비밀번호는 8자 이상이어야 합니다.'
        return undefined

      case 'confirmPassword':
        if (!value) return '비밀번호 확인을 입력해주세요.'
        if (value !== formData.newPassword) return '비밀번호가 일치하지 않습니다.'
        return undefined

      default:
        return undefined
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // 실시간 유효성 검사 (이미 에러가 있는 필드만)
    if (errors[name as keyof typeof errors]) {
      const error = validateField(name, value)
      setErrors((prev) => ({ ...prev, [name]: error }))
    }

    if (error) setError('')
  }

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const error = validateField(name, value)
    setErrors((prev) => ({ ...prev, [name]: error }))

    // 비밀번호 확인 필드는 새 비밀번호 변경 시에도 재검사
    if (name === 'newPassword' && formData.confirmPassword) {
      const confirmError = validateField('confirmPassword', formData.confirmPassword)
      setErrors((prev) => ({ ...prev, confirmPassword: confirmError }))
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    // 전체 필드 검증
    const newErrors: typeof errors = {}
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof typeof formData])
      if (error) {
        newErrors[key as keyof typeof errors] = error
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/api/auth/reset-password', {
        token,
        newPassword: formData.newPassword,
      })

      if (response.data.success) {
        setSuccess(true)
        // 2초 후 로그인 페이지로 이동
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        setError(response.data.message || '비밀번호 변경에 실패했습니다.')
      }
    } catch (err: any) {
      console.error('비밀번호 재설정 오류:', err)
      setError(err.response?.data?.message || '서버와의 연결에 문제가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">비밀번호 변경 완료</h1>
            <p className="text-muted-foreground mb-4">
              비밀번호가 성공적으로 변경되었습니다. 로그인 페이지로 이동합니다...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">토큰을 확인하는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!tokenValid || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">오류 발생</h1>
            <p className="text-muted-foreground mb-6">{error || '유효하지 않은 토큰입니다.'}</p>
            <Link
              to="/login"
              className="inline-block py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              로그인 페이지로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-xl p-8 space-y-6">
          {/* 헤더 */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
              <Key className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">비밀번호 재설정</h1>
              <p className="text-muted-foreground mt-1">새로운 비밀번호를 입력해주세요</p>
            </div>
          </div>

          {/* 비밀번호 요구사항 */}
          <div className="bg-accent rounded-lg p-4 text-sm">
            <p className="font-medium text-foreground mb-2">비밀번호 요구사항</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>최소 8자 이상</li>
              <li>영문, 숫자 조합 권장</li>
            </ul>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* 비밀번호 재설정 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium text-foreground">
                새 비밀번호
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                minLength={8}
                className={`w-full px-4 py-3 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                  errors.newPassword ? 'border-destructive' : 'border-input'
                }`}
                placeholder="새 비밀번호 입력"
              />
              {errors.newPassword && (
                <p className="text-sm text-destructive">{errors.newPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                비밀번호 확인
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                minLength={8}
                className={`w-full px-4 py-3 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                  errors.confirmPassword ? 'border-destructive' : 'border-input'
                }`}
                placeholder="비밀번호 재입력"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {loading ? '처리중...' : '비밀번호 변경'}
            </button>
          </form>

          {/* 로그인 링크 */}
          <div className="text-center pt-4 border-t border-border">
            <Link to="/login" className="text-sm text-primary hover:underline font-medium">
              로그인 페이지로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
