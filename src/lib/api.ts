import axios from 'axios'

// 프로덕션과 개발 환경 모두 상대 경로 사용
// 프로덕션: 같은 도메인의 /api 경로 사용 (https://react.disk-cms.simg.kr/api)
// 개발: Vite 프록시가 /api 요청을 백엔드로 전달
const API_BASE_URL = import.meta.env.VITE_API_URL || ''

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
