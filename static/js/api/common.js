/**
 * 공통 API 유틸리티 함수들
 * 모든 API 파일에서 사용하는 공통 함수들을 정의
 */

/**
 * 인증 헤더 생성 함수
 * @returns {Object} 인증 헤더 객체
 */
function getAuthHeaders() {
  const token = getToken();
  console.log(
    "🔑 [공통API] 토큰 확인:",
    token ? `토큰 있음 (${token.substring(0, 10)}...)` : "토큰 없음"
  );
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

/**
 * API 요청 공통 처리 함수
 * @param {string} url - 요청 URL
 * @param {Object} options - fetch 옵션
 * @returns {Promise<Object>} 응답 데이터
 */
async function apiRequest(url, options = {}) {
  const defaultOptions = {
    method: "GET",
    headers: getAuthHeaders(),
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    console.log(`🌐 [공통API] 요청: ${mergedOptions.method} ${url}`);
    const response = await fetch(url, mergedOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ [공통API] 응답: ${url}`, data);
    return data;
  } catch (error) {
    console.error(`❌ [공통API] 요청 실패: ${url}`, error);
    throw error;
  }
}

/**
 * GET 요청 헬퍼 함수
 * @param {string} url - 요청 URL
 * @returns {Promise<Object>} 응답 데이터
 */
async function apiGet(url) {
  return apiRequest(url, { method: "GET" });
}

/**
 * POST 요청 헬퍼 함수
 * @param {string} url - 요청 URL
 * @param {Object} data - 요청 데이터
 * @returns {Promise<Object>} 응답 데이터
 */
async function apiPost(url, data) {
  return apiRequest(url, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * PUT 요청 헬퍼 함수
 * @param {string} url - 요청 URL
 * @param {Object} data - 요청 데이터
 * @returns {Promise<Object>} 응답 데이터
 */
async function apiPut(url, data) {
  return apiRequest(url, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * DELETE 요청 헬퍼 함수
 * @param {string} url - 요청 URL
 * @returns {Promise<Object>} 응답 데이터
 */
async function apiDelete(url) {
  return apiRequest(url, { method: "DELETE" });
}

// 전역으로 함수들을 노출
window.getAuthHeaders = getAuthHeaders;
window.apiRequest = apiRequest;
window.apiGet = apiGet;
window.apiPost = apiPost;
window.apiPut = apiPut;
window.apiDelete = apiDelete;
