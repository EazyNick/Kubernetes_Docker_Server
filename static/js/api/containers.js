/**
 * 컨테이너 관련 API 함수들
 * /api/containers/* 엔드포인트 호출
 */

// Bytes/s를 적절한 단위로 변환하는 함수
function formatBytesPerSecond(bytesPerSecond) {
  if (bytesPerSecond >= 1024 * 1024) {
    return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
  } else if (bytesPerSecond >= 1024) {
    return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
  } else {
    return `${bytesPerSecond} B/s`;
  }
}

// 컨테이너 목록 조회 (페이징 지원)
async function getContainers(page = 1, perPage = 20) {
  try {
    console.log(
      `🐳 [컨테이너API] 컨테이너 목록 요청 중... (페이지: ${page}, 크기: ${perPage})`
    );
    const response = await fetch(
      `/api/containers?page=${page}&per_page=${perPage}`
    );
    const data = await response.json();
    console.log("🐳 [컨테이너API] 컨테이너 목록 응답:", data);
    return data;
  } catch (error) {
    console.error("❌ [컨테이너API] 컨테이너 목록 요청 실패:", error);
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

// 컨테이너 페이지 데이터 로딩
async function loadContainersData() {
  if (!window.ContainersAPI) {
    console.error("ContainersAPI not available");
    return;
  }

  try {
    const response = await window.ContainersAPI.getContainers(1, 20);
    if (response && response.success) {
      const containers = response.data.containers;
      const tbody = document.getElementById("containersTableBody");

      if (tbody) {
        tbody.innerHTML = "";

        if (containers.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="8" class="text-center text-muted py-4">
                <i class="fas fa-info-circle me-2"></i>
                컨테이너가 없습니다.
              </td>
            </tr>
          `;
          return;
        }

        containers.forEach((container) => {
          const statusClass =
            container.status === "running"
              ? "running"
              : container.status === "stopped"
              ? "stopped"
              : container.status === "failed"
              ? "failed"
              : container.status === "restarting"
              ? "warning"
              : "info";
          const statusText =
            container.status === "running"
              ? "실행 중"
              : container.status === "stopped"
              ? "중지됨"
              : container.status === "failed"
              ? "실패"
              : container.status === "restarting"
              ? "재시작 중"
              : "일시정지";

          const cpuColor =
            container.cpu < 30
              ? "#059669"
              : container.cpu < 70
              ? "#d97706"
              : "#dc2626";
          const memoryUsed = container.memory.used;
          const memoryTotal = container.memory.total;
          const memoryUsage = container.memory.usage;

          const memoryColor =
            memoryUsage < 30
              ? "#059669"
              : memoryUsage < 70
              ? "#d97706"
              : "#dc2626";

          const row = document.createElement("tr");
          row.innerHTML = `
            <td>
              <div class="d-flex align-items-center">
                <i class="fas fa-cube text-primary me-2"></i>
                <strong>${container.name}</strong>
              </div>
            </td>
            <td>${container.image}</td>
            <td><span class="status-badge ${statusClass}"><span class="status-indicator"></span>${statusText}</span></td>
            <td>
              <div class="d-flex align-items-center">
                <div class="progress-modern me-2" style="width: 60px">
                  <div class="progress-bar-modern" style="width: ${
                    container.cpu
                  }%; background: ${cpuColor}"></div>
                </div>
                <span>${container.cpu}%</span>
              </div>
            </td>
            <td>
              <div class="d-flex align-items-center">
                <div class="progress-modern me-2" style="width: 60px">
                  <div class="progress-bar-modern" style="width: ${memoryUsage}%; background: ${memoryColor}"></div>
                </div>
                <span>${memoryUsed}MB (${memoryUsage}%)</span>
              </div>
            </td>
            <td>
              <div class="d-flex flex-column">
                <small>RX: ${
                  container.network
                    ? formatBytesPerSecond(container.network.rx)
                    : "0 B/s"
                }</small>
                <small>TX: ${
                  container.network
                    ? formatBytesPerSecond(container.network.tx)
                    : "0 B/s"
                }</small>
              </div>
            </td>
            <td>
              <div class="d-flex align-items-center">
                <i class="fas fa-server text-info me-2"></i>
                <span>${container.node || "N/A"}</span>
              </div>
            </td>
            <td>${new Date(container.created_at).toLocaleString("ko-KR")}</td>
          `;
          tbody.appendChild(row);
        });
      }
    }
  } catch (error) {
    console.error("Error loading containers data:", error);
    const tbody = document.getElementById("containersTableBody");
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center text-danger py-4">
            <i class="fas fa-exclamation-triangle me-2"></i>
            컨테이너 데이터를 불러오는데 실패했습니다.
          </td>
        </tr>
      `;
    }
  }
}

// 컨테이너 API 함수들을 전역으로 노출
window.ContainersAPI = {
  getContainers,
  getContainer,
  loadContainersData,
};
