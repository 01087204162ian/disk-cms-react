import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Shield, Key, X, Mail } from 'lucide-react'
import api from '../lib/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)
  const [accountStatus, setAccountStatus] = useState<{
    email?: string
    status?: string
    registered_at?: string
  } | null>(null)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || '로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckAccountStatus = async () => {
    if (!email.trim()) {
      setError('이메일을 먼저 입력해주세요.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('올바른 이메일 형식을 입력해주세요.')
      return
    }

    setCheckingStatus(true)
    setError('')

    try {
      const response = await api.get(`/api/auth/account-status/${email}`)
      if (response.data.success) {
        setAccountStatus(response.data.data)
      } else {
        setError(response.data.message || '계정 상태 확인에 실패했습니다.')
        setAccountStatus(null)
      }
    } catch (err: any) {
      console.error('계정 상태 확인 오류:', err)
      if (err.response?.status === 404) {
        setError('등록되지 않은 이메일입니다.')
      } else {
        setError(err.response?.data?.message || '계정 상태 확인 중 오류가 발생했습니다.')
      }
      setAccountStatus(null)
    } finally {
      setCheckingStatus(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetError('')
    setResetSuccess(false)

    if (!resetEmail.trim()) {
      setResetError('이메일을 입력해주세요.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(resetEmail)) {
      setResetError('올바른 이메일 형식을 입력해주세요.')
      return
    }

    setResetLoading(true)

    try {
      const response = await api.post('/api/auth/request-password-reset', {
        email: resetEmail,
      })

      if (response.data.success) {
        setResetSuccess(true)
        setTimeout(() => {
          setShowResetModal(false)
          setResetEmail('')
          setResetSuccess(false)
          setResetError('')
        }, 3000)
      } else {
        setResetError(response.data.message || '비밀번호 재설정 요청에 실패했습니다.')
      }
    } catch (err: any) {
      console.error('비밀번호 재설정 요청 오류:', err)
      setResetError(err.response?.data?.message || '서버와의 연결에 문제가 발생했습니다.')
    } finally {
      setResetLoading(false)
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '활성'
      case 'pending_approval':
        return '승인 대기'
      default:
        return status
    }
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-xl overflow-hidden">
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-primary to-purple-600 p-8 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-light text-white mb-2">보험 CMS</h1>
              <p className="text-white/90 text-sm">(주)에스아이엠지</p>
            </div>

            {/* 바디 */}
            <div className="p-8 space-y-6">
              {/* 계정 상태 표시 */}
              {accountStatus && (
                <div
                  className={`p-4 rounded-lg border-l-4 ${
                    accountStatus.status === 'active'
                      ? 'bg-green-50 border-green-500'
                      : 'bg-yellow-50 border-yellow-500'
                  }`}
                >
                  <p className="font-medium text-foreground mb-1">계정 상태</p>
                  <p className="text-sm text-muted-foreground">
                    이메일: {accountStatus.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    상태: {getStatusText(accountStatus.status || '')}
                  </p>
                  {accountStatus.status === 'pending_approval' && (
                    <p className="text-sm text-muted-foreground mt-2">
                      관리자 승인 후 로그인하실 수 있습니다.
                    </p>
                  )}
                </div>
              )}

              {/* 로그인 폼 */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    이메일
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError('')
                      setAccountStatus(null)
                    }}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    placeholder="이메일을 입력하세요"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    비밀번호
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    placeholder="비밀번호를 입력하세요"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <span className="text-sm text-muted-foreground">로그인 상태 유지</span>
                  </label>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    {loading ? '로그인 중...' : '로그인'}
                  </button>
                </div>
              </form>

              {/* 추가 링크 */}
              <div className="text-center text-sm">
                <button
                  onClick={handleCheckAccountStatus}
                  disabled={checkingStatus || !email.trim()}
                  className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkingStatus ? '확인 중...' : '계정 상태 확인'}
                </button>
                <span className="text-muted-foreground mx-2">|</span>
                <button
                  onClick={() => setShowResetModal(true)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  비밀번호 찾기
                </button>
              </div>
            </div>

            {/* 푸터 */}
            <div className="bg-accent px-8 py-6 text-center border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">
                계정이 없으신가요?{' '}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  회원가입
                </Link>
              </p>
              <p className="text-xs text-muted-foreground">
                © 2024 보험 CMS. 모든 권리 보유.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 비밀번호 재설정 모달 */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            {/* 모달 헤더 */}
            <div className="bg-gradient-to-r from-primary to-purple-600 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-white" />
                <h2 className="text-xl font-semibold text-white">비밀번호 재설정</h2>
              </div>
              <button
                onClick={() => {
                  setShowResetModal(false)
                  setResetEmail('')
                  setResetError('')
                  setResetSuccess(false)
                }}
                className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 모달 바디 */}
            <div className="p-6">
              {resetSuccess ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-foreground font-medium mb-2">
                    비밀번호 재설정 링크가 이메일로 발송되었습니다.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    이메일을 확인해주세요.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    가입하신 이메일 주소를 입력하시면,
                    <br />
                    비밀번호 재설정 링크를 발송해드립니다.
                  </p>

                  <form onSubmit={handlePasswordReset} className="space-y-4">
                    {resetError && (
                      <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
                        {resetError}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label htmlFor="resetEmail" className="text-sm font-medium text-foreground">
                        이메일 주소
                      </label>
                      <input
                        id="resetEmail"
                        type="email"
                        value={resetEmail}
                        onChange={(e) => {
                          setResetEmail(e.target.value)
                          setResetError('')
                        }}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        placeholder="example@email.com"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {resetLoading && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      )}
                      {resetLoading ? '발송 중...' : '재설정 링크 발송'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
