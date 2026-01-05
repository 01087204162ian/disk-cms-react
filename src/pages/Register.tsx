import { useState, FormEvent, ChangeEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../lib/api'
import { Shield } from 'lucide-react'

interface FormErrors {
  email?: string
  password?: string
  confirmPassword?: string
  name?: string
  phone?: string
}

export default function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [apiError, setApiError] = useState('')

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^01[0-9]-\d{4}-\d{4}$/
    return phoneRegex.test(phone)
  }

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'email':
        if (!value) return '이메일을 입력해주세요.'
        if (!isValidEmail(value)) return '올바른 이메일 주소를 입력해주세요.'
        return undefined

      case 'password':
        if (!value) return '비밀번호를 입력해주세요.'
        if (value.length < 8) return '비밀번호는 8자 이상이어야 합니다.'
        return undefined

      case 'confirmPassword':
        if (!value) return '비밀번호 확인을 입력해주세요.'
        if (value !== formData.password) return '비밀번호가 일치하지 않습니다.'
        return undefined

      case 'name':
        if (!value.trim()) return '성명을 입력해주세요.'
        return undefined

      case 'phone':
        if (!value) return '휴대폰번호를 입력해주세요.'
        if (!isValidPhone(value)) return '올바른 휴대폰번호를 입력해주세요. (예: 010-1234-5678)'
        return undefined

      default:
        return undefined
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let formattedValue = value

    // 휴대폰번호 자동 포맷팅
    if (name === 'phone') {
      const numbers = value.replace(/[^\d]/g, '')
      if (numbers.length >= 3 && numbers.length <= 7) {
        formattedValue = numbers.replace(/(\d{3})(\d+)/, '$1-$2')
      } else if (numbers.length >= 8) {
        formattedValue = numbers.replace(/(\d{3})(\d{4})(\d+)/, '$1-$2-$3')
      }
      if (formattedValue.length > 13) {
        formattedValue = formattedValue.substring(0, 13)
      }
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }))

    // 실시간 유효성 검사 (이미 에러가 있는 필드만)
    if (errors[name as keyof FormErrors]) {
      const error = validateField(name, formattedValue)
      setErrors((prev) => ({ ...prev, [name]: error }))
    }

    // API 에러 초기화
    if (apiError) setApiError('')
  }

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const error = validateField(name, value)
    setErrors((prev) => ({ ...prev, [name]: error }))

    // 비밀번호 확인 필드는 비밀번호 변경 시에도 재검사
    if (name === 'password' && formData.confirmPassword) {
      const confirmError = validateField('confirmPassword', formData.confirmPassword)
      setErrors((prev) => ({ ...prev, confirmPassword: confirmError }))
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setApiError('')

    // 전체 필드 검증
    const newErrors: FormErrors = {}
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof typeof formData])
      if (error) {
        newErrors[key as keyof FormErrors] = error
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)

    try {
      const { confirmPassword, ...submitData } = formData
      const response = await api.post('/api/auth/signup', submitData)

      if (response.data.success) {
        setSuccess(true)
        // 2초 후 로그인 페이지로 이동
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        setApiError(response.data.message || '회원가입에 실패했습니다.')

        // 특정 필드 오류 표시
        if (response.data.field) {
          setErrors((prev) => ({
            ...prev,
            [response.data.field]: response.data.message,
          }))
        }
      }
    } catch (error: any) {
      console.error('회원가입 오류:', error)
      setApiError(
        error.response?.data?.message ||
          '서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.'
      )

      // 특정 필드 오류 표시
      if (error.response?.data?.field) {
        setErrors((prev) => ({
          ...prev,
          [error.response.data.field]: error.response.data.message,
        }))
      }
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
            <h1 className="text-2xl font-bold text-foreground mb-2">회원가입 완료</h1>
            <p className="text-muted-foreground mb-4">
              회원가입이 완료되었습니다. 로그인 페이지로 이동합니다...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
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
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">회원가입</h1>
              <p className="text-muted-foreground mt-1">새 계정을 만들어보세요</p>
            </div>
          </div>

          {/* 성공/에러 메시지 */}
          {apiError && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
              {apiError}
            </div>
          )}

          {/* 회원가입 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                이메일 *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={`w-full px-4 py-3 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                  errors.email ? 'border-destructive' : 'border-input'
                }`}
                placeholder="example@email.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                비밀번호 *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={`w-full px-4 py-3 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                  errors.password ? 'border-destructive' : 'border-input'
                }`}
                placeholder="8자 이상 입력해주세요"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                비밀번호 확인 *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={`w-full px-4 py-3 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                  errors.confirmPassword ? 'border-destructive' : 'border-input'
                }`}
                placeholder="비밀번호를 다시 입력해주세요"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                성명 *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={`w-full px-4 py-3 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                  errors.name ? 'border-destructive' : 'border-input'
                }`}
                placeholder="홍길동"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-foreground">
                휴대폰번호 *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={`w-full px-4 py-3 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                  errors.phone ? 'border-destructive' : 'border-input'
                }`}
                placeholder="010-1234-5678"
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
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
              {loading ? '처리중...' : '회원가입'}
            </button>
          </form>

          {/* 로그인 링크 */}
          <div className="text-center pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
