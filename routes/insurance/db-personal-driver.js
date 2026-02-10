// routes/insurance/db-personal-driver.js
// DB 개인대리운전 (dbins.kr) 운영 조회용 프록시
// 프론트엔드 → /api/insurance/db-personal-driver/applications → PHP(API, dbins.kr) → DB

const express = require('express');
const axios = require('axios');

const router = express.Router();

// dbins.kr 측 운영용 API 기본 엔드포인트
// TODO: 나중에 별도 admin 도메인/경로가 생기면 여기만 수정
const DBINS_ADMIN_BASE_URL = 'https://dbins.kr/api/admin';
const DEFAULT_TIMEOUT = 30000;

const getDefaultHeaders = () => ({
  Accept: 'application/json',
  'Content-Type': 'application/json',
});

// 가입신청 목록 조회 (현재는 기본 전체 조회만, 이후 필터/페이징 확장 예정)
router.get('/db-personal-driver/applications', async (req, res) => {
  try {
    // TODO: from, to, partner, type, page, limit 등 쿼리 파라미터를
    // dbins.kr 측 admin API 스펙에 맞게 전달하도록 확장

    const apiUrl = `${DBINS_ADMIN_BASE_URL}/applications.php`;

    const response = await axios.get(apiUrl, {
      // 현재는 필터 없이 전체 조회 (dbins.kr 쪽 스펙 확정 후 params 추가)
      params: {},
      timeout: DEFAULT_TIMEOUT,
      headers: getDefaultHeaders(),
    });

    res.json(response.data);
  } catch (error) {
    console.error('DB personal driver applications proxy error:', error.message);
    res.status(error.response?.status || 500).json({
      ok: false,
      error: 'DB_PERSONAL_DRIVER_PROXY_ERROR',
      message: 'DB 개인대리운전 가입신청 목록 조회 중 오류가 발생했습니다.',
      details: error.response?.data || error.message,
    });
  }
});

module.exports = router;

