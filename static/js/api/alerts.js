/**
 * 알림 관련 API 함수들
 * /api/alerts/* 엔드포인트 호출
 */

// 알림 목록 조회
async function getAlerts() {
  try {
    const response = await fetch("/api/alerts");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return null;
  }
}

// 특정 알림 상세 정보 조회
async function getAlert(alertId) {
  try {
    const response = await fetch(`/api/alerts/${alertId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching alert:", error);
    return null;
  }
}

// 알림 해결 처리
async function resolveAlert(alertId) {
  try {
    const response = await fetch(`/api/alerts/${alertId}/resolve`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error resolving alert:", error);
    return null;
  }
}

// 알림 API 함수들을 전역으로 노출
window.AlertsAPI = {
  getAlerts,
  getAlert,
  resolveAlert,
};
