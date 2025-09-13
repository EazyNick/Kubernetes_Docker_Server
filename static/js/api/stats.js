/**
 * 통계 관련 API 함수들
 * /api/stats/* 엔드포인트 호출
 */

// 홈 페이지 개요 통계 조회
async function getOverviewStats() {
  try {
    const response = await fetch("/api/stats/overview");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching overview stats:", error);
    return null;
  }
}

// 대시보드 통계 조회
async function getDashboardStats() {
  try {
    const response = await fetch("/api/stats/dashboard");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return null;
  }
}

// 통계 API 함수들을 전역으로 노출
window.StatsAPI = {
  getOverviewStats,
  getDashboardStats,
};
