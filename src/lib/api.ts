import axios from 'axios'

// API 베이스 URL 설정
// - 프로덕션: 빈 문자열('')이면 상대 경로 사용 → 같은 서버의 /api 경로 사용
//   예: https://react.disk-cms.simg.kr/api/auth/login
// - 개발: Vite 프록시가 /api 요청을 localhost:3000으로 전달
// - 커스텀: VITE_API_URL 환경변수로 다른 서버 지정 가능
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
    // 디버깅: update-status 엔드포인트 요청 데이터 로그
    if (config.url?.includes('update-status')) {
      console.log('API 인터셉터 - URL:', config.url)
      console.log('API 인터셉터 - 요청 데이터:', config.data)
      console.log('API 인터셉터 - 데이터 타입:', typeof config.data)
      if (config.data && typeof config.data === 'object') {
        console.log('API 인터셉터 - sangtae 포함 여부:', 'sangtae' in config.data)
      }
    }
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
