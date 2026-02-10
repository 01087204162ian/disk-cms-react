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

// 가입신청 목록 조회 (필터/페이징 파라미터를 그대로 전달)
router.get('/db-personal-driver/applications', async (req, res) => {
  try {
    // 프론트에서 전달한 쿼리 파라미터를 그대로 admin API에 전달
    // - page, limit, from, to, partner, type, keywordType, keyword 등
    const {
      page,
      limit,
      from,
      to,
      partner,
      type,
      keywordType,
      keyword,
    } = req.query;

    const apiUrl = `${DBINS_ADMIN_BASE_URL}/applications.php`;

    const response = await axios.get(apiUrl, {
      params: {
        page,
        limit,
        from,
        to,
        partner,
        type,
        keywordType,
        keyword,
      },
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

