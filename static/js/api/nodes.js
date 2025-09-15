/**
 * 노드 관련 API 함수들
 * /api/nodes/* 엔드포인트 호출
 */

// 노드 상태별 매핑 함수
function getNodeStatusInfo(status) {
  const statusMap = {
    Ready: {
      class: "running",
      text: "정상",
      icon: "fa-check-circle",
      color: "var(--success-color)",
    },
    NotReady: {
      class: "stopped",
      text: "준비 안됨",
      icon: "fa-times-circle",
      color: "var(--danger-color)",
    },
    Unknown: {
      class: "warning",
      text: "알 수 없음",
      icon: "fa-question-circle",
      color: "var(--warning-color)",
    },
    Warning: {
      class: "warning",
      text: "경고",
      icon: "fa-exclamation-triangle",
      color: "var(--warning-color)",
    },
  };

  return (
    statusMap[status] || {
      class: "warning",
      text: status,
      icon: "fa-question-circle",
      color: "var(--warning-color)",
    }
  );
}

// 노드 목록 조회
async function getNodes() {
  try {
    console.log("🖥️ [노드API] 노드 목록 요청 중...");
    const response = await fetch("/api/nodes");
    const data = await response.json();
    console.log("🖥️ [노드API] 노드 목록 응답:", data);
    return data;
  } catch (error) {
    console.error("❌ [노드API] 노드 목록 요청 실패:", error);
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

// 노드 페이지 데이터 로딩
async function loadNodesData() {
  if (!window.NodesAPI) {
    console.error("NodesAPI not available");
    return;
  }

  try {
    const response = await window.NodesAPI.getNodes();

    if (response && response.success) {
      const nodes = response.data.nodes;
      const tbody = document.getElementById("nodesTableBody");

      if (tbody) {
        tbody.innerHTML = "";

        if (nodes.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="8" class="text-center text-muted py-4">
                <i class="fas fa-info-circle me-2"></i>
                노드가 없습니다.
              </td>
            </tr>
          `;
          return;
        }

        // 노드 통계 업데이트 (세밀한 상태별 분류)
        const readyNodes = nodes.filter(
          (node) => node.status === "Ready"
        ).length;
        const notReadyNodes = nodes.filter(
          (node) => node.status === "NotReady"
        ).length;
        const unknownNodes = nodes.filter(
          (node) => node.status === "Unknown"
        ).length;
        const warningNodes = nodes.filter(
          (node) => node.status === "Warning"
        ).length;

        // 정상 노드 = Ready만 (SchedulingDisabled 제외)
        const healthyNodes = readyNodes;
        const totalCores = nodes.reduce((sum, node) => sum + node.cpu.cores, 0);
        const totalMemory = nodes.reduce(
          (sum, node) => sum + node.memory.total,
          0
        );

        // 노드 페이지 통계를 서버에서 가져오기
        try {
          const statsResponse = await fetch("/api/nodes/stats");
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            if (statsData.success) {
              const stats = statsData.data;

              // 서버에서 받은 데이터로 업데이트
              if (window.updateElement) {
                window.updateElement("healthyNodes", stats.healthy_nodes);
                window.updateElement("warningNodes", stats.warning_nodes);
                window.updateElement("totalCores", stats.total_cores);
                window.updateElement("totalMemory", stats.total_memory + "GB");
                window.updateElement("avgCpuUsage", stats.avg_cpu_usage + "%");
                window.updateElement(
                  "avgMemoryUsage",
                  stats.avg_memory_usage + "%"
                );

                // 서버에서 받은 변화량으로 업데이트
                window.updateElement(
                  "healthyNodesChange",
                  stats.healthy_nodes_change
                );
                window.updateElement(
                  "warningNodesChange",
                  stats.warning_nodes_change
                );
                window.updateElement(
                  "totalCoresChange",
                  stats.total_cores_change
                );
                window.updateElement(
                  "totalMemoryChange",
                  stats.total_memory_change
                );
                window.updateElement(
                  "avgCpuUsageChange",
                  stats.avg_cpu_usage_change
                );
                window.updateElement(
                  "avgMemoryUsageChange",
                  stats.avg_memory_usage_change
                );
              } else {
                console.error("updateElement function not available");
              }

              // 서버 데이터 사용 시 로컬 계산 생략하지만 테이블은 계속 업데이트
            }
          }
        } catch (error) {
          console.error("Error fetching node stats:", error);
        }

        // 서버 데이터 실패 시 로컬 계산 (fallback)
        if (window.updateElement) {
          window.updateElement("healthyNodes", healthyNodes);
          window.updateElement("warningNodes", warningNodes);
          window.updateElement("totalCores", totalCores);
          window.updateElement("totalMemory", totalMemory + "GB");
        }

        // 대시보드 API에서 전체 시스템 평균값 가져오기
        if (window.StatsAPI) {
          try {
            const dashboardResponse = await window.StatsAPI.getDashboardStats();
            if (dashboardResponse && dashboardResponse.success) {
              const resources = dashboardResponse.data.resources;
              if (window.updateElement) {
                window.updateElement("avgCpuUsage", resources.avg_cpu + "%");
                window.updateElement(
                  "avgMemoryUsage",
                  resources.avg_memory + "%"
                );
              }
            }
          } catch (error) {
            console.error(
              "Error loading dashboard stats for nodes page:",
              error
            );
            // 대시보드 API 실패 시 노드 데이터로 계산
            const avgCpuUsage =
              nodes.reduce((sum, node) => sum + node.cpu.usage, 0) /
              nodes.length;
            const avgMemoryUsage =
              nodes.reduce((sum, node) => sum + node.memory.usage, 0) /
              nodes.length;
            if (window.updateElement) {
              window.updateElement("avgCpuUsage", avgCpuUsage.toFixed(1) + "%");
              window.updateElement(
                "avgMemoryUsage",
                avgMemoryUsage.toFixed(1) + "%"
              );
            }
          }
        } else {
          // StatsAPI가 없으면 노드 데이터로 계산
          const avgCpuUsage =
            nodes.reduce((sum, node) => sum + node.cpu.usage, 0) / nodes.length;
          const avgMemoryUsage =
            nodes.reduce((sum, node) => sum + node.memory.usage, 0) /
            nodes.length;
          if (window.updateElement) {
            window.updateElement("avgCpuUsage", avgCpuUsage.toFixed(1) + "%");
            window.updateElement(
              "avgMemoryUsage",
              avgMemoryUsage.toFixed(1) + "%"
            );
          }
        }

        for (let index = 0; index < nodes.length; index++) {
          try {
            const node = nodes[index];
            const statusInfo = getNodeStatusInfo(node.status);
            const roleClass =
              node.role === "Master"
                ? "bg-primary"
                : node.role === "Worker"
                ? "bg-info"
                : "bg-secondary";

            const cpuColor =
              node.cpu.usage < 30
                ? "var(--success-color)"
                : node.cpu.usage < 70
                ? "var(--warning-color)"
                : "var(--danger-color)";
            const memoryColor =
              node.memory.usage < 30
                ? "var(--success-color)"
                : node.memory.usage < 70
                ? "var(--warning-color)"
                : "var(--danger-color)";
            const diskColor =
              node.disk.usage < 30
                ? "var(--success-color)"
                : node.disk.usage < 70
                ? "var(--info-color)"
                : "var(--warning-color)";

            const row = document.createElement("tr");
            row.innerHTML = `
              <td>
                <div class="d-flex align-items-center">
                  <i class="fas fa-${
                    node.role === "Master" ? "crown" : "server"
                  } me-2 text-${
              node.role === "Master" ? "warning" : "primary"
            }"></i>
                  <div>
                    <strong>${node.name}</strong>
                    <div class="small text-muted">${node.ip}</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="status-badge ${statusInfo.class}">
                  <i class="fas ${statusInfo.icon} me-1"></i>
                  <span class="status-indicator"></span>
                  ${statusInfo.text}
                </span>
              </td>
              <td><span class="badge ${roleClass}">${node.role}</span></td>
              <td>
                <div class="small">${node.cpu.cores} cores</div>
                <div class="progress-modern mb-1">
                  <div class="progress-bar-modern" style="width: ${
                    node.cpu.usage
                  }%; background: ${cpuColor};"></div>
                </div>
                <div class="small text-muted">${node.cpu.usage}%</div>
              </td>
              <td>
                <div class="small">${node.memory.total} GB</div>
                <div class="progress-modern mb-1">
                  <div class="progress-bar-modern" style="width: ${
                    node.memory.usage
                  }%; background: ${memoryColor};"></div>
                </div>
                <div class="small text-muted">${(
                  (node.memory.total * node.memory.usage) /
                  100
                ).toFixed(1)} GB</div>
              </td>
              <td>
                <div class="small">${node.disk.total} GB</div>
                <div class="progress-modern mb-1">
                  <div class="progress-bar-modern" style="width: ${
                    node.disk.usage
                  }%; background: ${diskColor};"></div>
                </div>
                <div class="small text-muted">${(
                  (node.disk.total * node.disk.usage) /
                  100
                ).toFixed(0)} GB</div>
              </td>
              <td>${node.containers}</td>
              <td>${node.uptime}</td>
            `;
            tbody.appendChild(row);
          } catch (error) {
            console.error(`Error processing node ${index + 1}:`, error);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error loading nodes data:", error);
    const tbody = document.getElementById("nodesTableBody");
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center text-danger py-4">
            <i class="fas fa-exclamation-triangle me-2"></i>
            노드 데이터를 불러오는데 실패했습니다.
          </td>
        </tr>
      `;
    }
  }
}

// 노드 API 함수들을 전역으로 노출
window.NodesAPI = {
  getNodes,
  getNode,
  loadNodesData,
};
