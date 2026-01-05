import axios from 'axios'

// 개발 환경에서는 Vite 프록시를 통해 상대 경로 사용
// 프로덕션에서는 환경 변수 또는 기본값 사용
const API_BASE_URL = import.meta.env.PROD
  ? (import.meta.env.VITE_API_URL || 'https://disk-cms.simg.kr')
  : '' // 개발 환경에서는 상대 경로 사용 (Vite 프록시가 처리)

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // 인증 실패 시 로그인 페이지로 리다이렉트
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
