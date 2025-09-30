/**
 * 통계 관련 API 함수들
 * /api/stats/* 엔드포인트 호출
 */

// 홈 페이지 개요 통계 조회
async function getOverviewStats() {
  try {
    console.log("📊 [통계API] 홈 페이지 개요 통계 요청 중...");
    const data = await apiGet("/api/stats/overview");
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
    const data = await apiGet("/api/stats/dashboard");
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

// 변화량 요소와 화살표 업데이트 헬퍼 함수
function updateChangeElement(changeId, value) {
  const changeElement = document.getElementById(changeId);
  if (!changeElement) {
    console.warn(`⚠️ 변화량 요소 '${changeId}'를 찾을 수 없습니다.`);
    return;
  }

  // 변화량 텍스트 업데이트
  changeElement.textContent = value;

  // 부모 요소 찾기 (metric-change 클래스를 가진 div)
  const parentElement = changeElement.closest(".metric-change");
  if (!parentElement) {
    console.warn(`⚠️ 변화량 요소의 부모 '.metric-change'를 찾을 수 없습니다.`);
    return;
  }

  // 화살표 아이콘 찾기
  const arrowIcon = parentElement.querySelector("i");
  if (!arrowIcon) {
    console.warn(`⚠️ 화살표 아이콘을 찾을 수 없습니다.`);
    return;
  }

  // 변화량 값 파싱 (+5%, -3% 등)
  const isPositive =
    value.startsWith("+") || (!value.startsWith("-") && parseFloat(value) > 0);
  const isNegative = value.startsWith("-") || parseFloat(value) < 0;

  // 클래스와 아이콘 업데이트
  if (isPositive) {
    parentElement.className = "metric-change positive";
    arrowIcon.className = "fas fa-arrow-up";
  } else if (isNegative) {
    parentElement.className = "metric-change negative";
    arrowIcon.className = "fas fa-arrow-down";
  } else {
    // 변화 없음 (0% 또는 변화량이 없는 경우)
    parentElement.className = "metric-change neutral";
    arrowIcon.className = "fas fa-minus";
  }
}

// 실시간 데이터 업데이트 (홈 화면용 - 변화량 제외)
async function updateRealTimeData() {
  const stats = await window.StatsAPI.getOverviewStats();
  // 홈 화면 통계 데이터가 성공적으로 로드된 경우
  if (stats && stats.success) {
    console.log("📊 [통계API] 홈 화면 데이터 업데이트 중...");

    // 기본 통계 데이터만 업데이트 (변화량 제외)
    updateElement("totalContainers", stats.data.total_containers); // 전체 컨테이너 카드
    updateElement("runningContainers", stats.data.running_containers); // 실행 중 컨테이너 카드
    updateElement("activeNodes", stats.data.active_nodes); // 활성 노드 카드
    updateElement("healthyNodes", stats.data.healthy_nodes); // 정상 노드 카드
    updateElement("systemHealth", stats.data.system_health + "%"); // 시스템 건강성 카드
    updateElement("uptime", stats.data.uptime + "%"); // 업타임 카드
    updateElement("warningAlerts", stats.data.warning_alerts); // 경고 알림 카드
    updateElement("criticalAlerts", stats.data.critical_alerts); // 위험 알림 카드

    console.log("📊 [통계API] 홈 화면 데이터 업데이트 완료");
  }

  const lastUpdateElement = document.getElementById("lastUpdate");
  // 마지막 업데이트 시간 표시 요소가 존재하는 경우
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
  // StatsAPI가 사용 가능한지 확인
  if (!window.StatsAPI) {
    console.error("StatsAPI not available");
    return;
  }

  try {
    const stats = await window.StatsAPI.getDashboardStats();
    // 대시보드 통계 데이터가 성공적으로 로드된 경우
    if (stats && stats.success) {
      // 메트릭 카드 업데이트
      updateElement("totalContainers", stats.data.containers.total); // 전체 컨테이너 카드
      updateElement("runningContainers", stats.data.containers.running); // 실행 중 컨테이너 카드
      updateElement("stoppedContainers", stats.data.containers.stopped); // 중지된 컨테이너 카드
      updateElement("failedContainers", stats.data.containers.failed); // 실패한 컨테이너 카드

      // 노드 상태별 통계 업데이트
      // NodesAPI가 사용 가능한 경우 상세한 노드 통계 계산
      if (window.NodesAPI) {
        try {
          const nodesResponse = await window.NodesAPI.getNodes();
          // 노드 데이터가 성공적으로 로드된 경우
          if (nodesResponse && nodesResponse.success) {
            const nodeStats = calculateNodeStatusStats(
              nodesResponse.data.nodes
            );
            updateElement("dashboardActiveNodes", nodeStats.healthy); // 활성 노드 카드
          }
        } catch (error) {
          console.error("Error fetching node stats:", error);
          updateElement("dashboardActiveNodes", stats.data.nodes.total); // 활성 노드 카드 (fallback)
        }
      } else {
        updateElement("dashboardActiveNodes", stats.data.nodes.total); // 활성 노드 카드 (fallback)
      }

      updateElement("dashboardAvgCpuUsage", stats.data.resources.avg_cpu + "%"); // 평균 CPU 사용률 카드

      updateElement(
        "dashboardAvgMemoryUsage",
        stats.data.resources.avg_memory + "%"
      ); // 평균 메모리 사용률 카드

      updateElement(
        "networkTraffic",
        stats.data.resources.network_traffic + "MB"
      ); // 네트워크 트래픽 카드

      // 서버에서 받은 변화량으로 업데이트 (화살표 방향 포함)
      updateChangeElement(
        "totalContainersChange",
        stats.data.containers.total_change
      );
      updateChangeElement(
        "runningContainersChange",
        stats.data.containers.running_change
      );
      updateChangeElement(
        "stoppedContainersChange",
        stats.data.containers.stopped_change
      );
      updateChangeElement(
        "failedContainersChange",
        stats.data.containers.failed_change
      );
      updateChangeElement(
        "dashboardActiveNodesChange",
        stats.data.nodes.total_change
      );
      updateChangeElement(
        "dashboardAvgCpuUsageChange",
        stats.data.resources.avg_cpu_change
      );
      updateChangeElement(
        "dashboardAvgMemoryUsageChange",
        stats.data.resources.avg_memory_change
      );
      updateChangeElement(
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
window.updateChangeElement = updateChangeElement;
