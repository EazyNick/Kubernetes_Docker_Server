/**
 * 노드 관련 API 함수들
 * /api/nodes/* 엔드포인트 호출
 */

// 노드 목록 조회
async function getNodes() {
  try {
    const response = await fetch("/api/nodes");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching nodes:", error);
    return null;
  }
}

// 특정 노드 상세 정보 조회
async function getNode(nodeName) {
  try {
    const response = await fetch(`/api/nodes/${nodeName}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching node:", error);
    return null;
  }
}

// 노드 API 함수들을 전역으로 노출
window.NodesAPI = {
  getNodes,
  getNode,
};
