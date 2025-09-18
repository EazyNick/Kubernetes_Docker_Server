/**
 * 통계 관련 API 함수들
 * /api/stats/* 엔드포인트 호출
 */

// 홈 페이지 개요 통계 조회
async function getOverviewStats() {
  try {
    console.log("📊 [통계API] 홈 페이지 개요 통계 요청 중...");
    const response = await fetch("/api/stats/overview");
    const data = await response.json();
    console.log("📊 [통계API] 개요 통계 응답:", data);
    return data;
  } catch (error) {
    console.error("❌ [통계API] 개요 통계 요청 실패:", error);
    return null;
  }
}

// 대시보드 통계 조회
async function getDashboardStats() {
  try {
    console.log("📊 [통계API] 대시보드 통계 요청 중...");
    const response = await fetch("/api/stats/dashboard");
    const data = await response.json();
    console.log("📊 [통계API] 대시보드 통계 응답:", data);
    return data;
  } catch (error) {
    console.error("❌ [통계API] 대시보드 통계 요청 실패:", error);
    return null;
  }
}

// 요소 업데이트 헬퍼 함수 (전역으로 사용)
function updateElement(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  } else {
    // 변화량 요소는 선택적이므로 오류 대신 경고만 표시
    if (id.includes("Change")) {
      console.warn(`⚠️ 변화량 요소 '${id}'를 찾을 수 없습니다. (선택적 요소)`);
    } else {
      console.error(`❌ 필수 요소 '${id}'를 찾을 수 없습니다.`);
    }
  }
}

// 실시간 데이터 업데이트 (홈 화면용 - 변화량 제외)
async function updateRealTimeData() {
  const stats = await window.StatsAPI.getOverviewStats();
  if (stats && stats.success) {
    console.log("📊 [통계API] 홈 화면 데이터 업데이트 중...");

    // 기본 통계 데이터만 업데이트 (변화량 제외)
    updateElement("totalContainers", stats.data.total_containers);
    updateElement("runningContainers", stats.data.running_containers);
    updateElement("activeNodes", stats.data.active_nodes);
    updateElement("healthyNodes", stats.data.healthy_nodes);
    updateElement("systemHealth", stats.data.system_health + "%");
    updateElement("uptime", stats.data.uptime + "%");
    updateElement("warningAlerts", stats.data.warning_alerts);
    updateElement("criticalAlerts", stats.data.critical_alerts);

    console.log("📊 [통계API] 홈 화면 데이터 업데이트 완료");
  }

  const lastUpdateElement = document.getElementById("lastUpdate");
  if (lastUpdateElement) {
    lastUpdateElement.textContent = new Date().toLocaleTimeString("ko-KR");
  }
}

// 노드 상태별 통계 계산
function calculateNodeStatusStats(nodes) {
  const readyNodes = nodes.filter((node) => node.status === "Ready").length;
  const notReadyNodes = nodes.filter(
    (node) => node.status === "NotReady"
  ).length;
  const unknownNodes = nodes.filter((node) => node.status === "Unknown").length;
  const warningNodes = nodes.filter((node) => node.status === "Warning").length;

  return {
    ready: readyNodes,
    notReady: notReadyNodes,
    unknown: unknownNodes,
    warning: warningNodes,
    healthy: readyNodes, // 정상 = Ready만
    total: nodes.length,
  };
}

// 대시보드 페이지 실시간 데이터 업데이트
async function updateDashboardData() {
  if (!window.StatsAPI) {
    console.error("StatsAPI not available");
    return;
  }

  try {
    const stats = await window.StatsAPI.getDashboardStats();
    if (stats && stats.success) {
      // 메트릭 카드 업데이트
      updateElement("totalContainers", stats.data.containers.total);
      updateElement("runningContainers", stats.data.containers.running);
      updateElement("stoppedContainers", stats.data.containers.stopped);
      updateElement("failedContainers", stats.data.containers.failed);

      // 노드 상태별 통계 업데이트
      if (window.NodesAPI) {
        try {
          const nodesResponse = await window.NodesAPI.getNodes();
          if (nodesResponse && nodesResponse.success) {
            const nodeStats = calculateNodeStatusStats(
              nodesResponse.data.nodes
            );
            updateElement("dashboardActiveNodes", nodeStats.healthy);
          }
        } catch (error) {
          console.error("Error fetching node stats:", error);
          updateElement("dashboardActiveNodes", stats.data.nodes.total);
        }
      } else {
        updateElement("dashboardActiveNodes", stats.data.nodes.total);
      }

      updateElement("dashboardAvgCpuUsage", stats.data.resources.avg_cpu + "%");

      updateElement(
        "dashboardAvgMemoryUsage",
        stats.data.resources.avg_memory + "%"
      );

      updateElement(
        "networkTraffic",
        stats.data.resources.network_traffic + "MB"
      );

      // 서버에서 받은 변화량으로 업데이트
      updateElement(
        "totalContainersChange",
        stats.data.containers.total_change
      );
      updateElement(
        "runningContainersChange",
        stats.data.containers.running_change
      );
      updateElement(
        "stoppedContainersChange",
        stats.data.containers.stopped_change
      );
      updateElement(
        "failedContainersChange",
        stats.data.containers.failed_change
      );
      updateElement(
        "dashboardActiveNodesChange",
        stats.data.nodes.total_change
      );
      updateElement(
        "dashboardAvgCpuUsageChange",
        stats.data.resources.avg_cpu_change
      );
      updateElement(
        "dashboardAvgMemoryUsageChange",
        stats.data.resources.avg_memory_change
      );
      updateElement(
        "networkTrafficChange",
        stats.data.resources.network_traffic_change
      );
    }
  } catch (error) {
    console.error("Error updating dashboard data:", error);
  }
}

// 통계 API 함수들을 전역으로 노출
window.StatsAPI = {
  getOverviewStats,
  getDashboardStats,
  updateRealTimeData,
  updateDashboardData,
};

// updateElement 함수를 전역으로 노출
window.updateElement = updateElement;
