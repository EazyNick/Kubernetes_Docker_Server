/**
 * 컨테이너 관련 API 함수들
 * /api/containers/* 엔드포인트 호출
 */

// 컨테이너 목록 조회 (페이징 지원)
async function getContainers(page = 1, perPage = 20) {
  try {
    const response = await fetch(
      `/api/containers?page=${page}&per_page=${perPage}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching containers:", error);
    return null;
  }
}

// 특정 컨테이너 상세 정보 조회
async function getContainer(containerId) {
  try {
    const response = await fetch(`/api/containers/${containerId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching container:", error);
    return null;
  }
}

// 컨테이너 API 함수들을 전역으로 노출
window.ContainersAPI = {
  getContainers,
  getContainer,
};
