// 로그 API 모듈
const LOGS_API_BASE = "/api";

// 로그 목록 조회
async function getLogs(params = {}) {
  try {
    console.log("📝 [로그API] 로그 목록 요청 중...", params);
    const queryParams = new URLSearchParams();

    if (params.limit) queryParams.append("limit", params.limit);
    if (params.level) queryParams.append("level", params.level);
    if (params.container_id)
      queryParams.append("container_id", params.container_id);
    if (params.time_range) queryParams.append("time_range", params.time_range);

    const url = `${LOGS_API_BASE}/logs?${queryParams.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("📝 [로그API] 로그 목록 응답:", data);
    return data;
  } catch (error) {
    console.error("❌ [로그API] 로그 목록 요청 실패:", error);
    throw error;
  }
}

// 로그 통계 조회
async function getLogStats(timeRange = "24h") {
  try {
    console.log(`📊 [로그API] 로그 통계 요청 중... (시간 범위: ${timeRange})`);
    const url = `${LOGS_API_BASE}/logs/stats?time_range=${timeRange}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("📊 [로그API] 로그 통계 응답:", data);
    return data;
  } catch (error) {
    console.error("❌ [로그API] 로그 통계 요청 실패:", error);
    throw error;
  }
}

// 특정 로그 조회
async function getLog(logId) {
  try {
    const url = `${LOGS_API_BASE}/logs/${logId}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching log:", error);
    throw error;
  }
}

// 로그 데이터 로딩 (페이지용)
async function loadLogsData(params = {}) {
  const container = document.getElementById("logContainer");

  console.log("📝 [로그API] 로그 데이터 로딩 시작...", params);

  try {
    const response = await getLogs(params);

    if (container) {
      if (!response.success || !response.data || !response.data.logs) {
        container.innerHTML = `
          <div class="text-center py-4">
            <i class="fas fa-info-circle me-2"></i>
            로그를 불러올 수 없습니다.
          </div>
        `;
        return;
      }

      const logs = response.data.logs;

      if (logs.length === 0) {
        container.innerHTML = `
          <div class="text-center py-4">
            <i class="fas fa-info-circle me-2"></i>
            로그가 없습니다.
          </div>
        `;
        return;
      }

      container.innerHTML = logs
        .map(
          (log) => `
        <div class="log-entry" data-container="${log.container_id || ""}">
          <span class="log-timestamp">${log.timestamp}</span>
          <span class="log-level ${log.level.toLowerCase()}">${log.level.toUpperCase()}</span>
          <span class="log-message">${log.message}</span>
        </div>
      `
        )
        .join("");
    }
  } catch (error) {
    console.error("Error loading logs data:", error);
    if (container) {
      container.innerHTML = `
        <div class="text-center py-4">
          <i class="fas fa-exclamation-triangle me-2"></i>
          로그 데이터를 불러오는데 실패했습니다.
        </div>
      `;
    }
  }
}

// 로그 통계 업데이트
async function updateLogStats(timeRange = "24h") {
  try {
    const response = await getLogStats(timeRange);

    if (response.success && response.data) {
      const stats = response.data;

      // 통계 요소들 업데이트 (만약 있다면)
      if (document.getElementById("totalLogs")) {
        window.updateElement("totalLogs", stats.total_logs);
      }
      if (document.getElementById("infoLogs")) {
        window.updateElement("infoLogs", stats.info_count);
      }
      if (document.getElementById("warnLogs")) {
        window.updateElement("warnLogs", stats.warn_count);
      }
      if (document.getElementById("errorLogs")) {
        window.updateElement("errorLogs", stats.error_count);
      }
    }
  } catch (error) {
    console.error("Error updating log stats:", error);
  }
}

// 로그 필터링
function filterLogs(level, source, timeRange) {
  const params = {};

  if (level && level !== "all") {
    params.level = level;
  }

  if (source && source.trim() !== "") {
    params.source = source;
  }

  if (timeRange) {
    params.time_range = timeRange;
  }

  loadLogsData(params);
}

// 모든 로그 삭제
async function clearAllLogs() {
  try {
    console.log("🗑️ [로그API] 모든 로그 삭제 요청 중...");
    const response = await fetch(`${LOGS_API_BASE}/logs`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("🗑️ [로그API] 로그 삭제 응답:", data);
    return data;
  } catch (error) {
    console.error("❌ [로그API] 로그 삭제 요청 실패:", error);
    throw error;
  }
}

// 로그 삭제 확인 및 실행
async function confirmAndClearLogs() {
  if (confirm("정말 모든 로그를 지우시겠습니까?")) {
    try {
      // 로딩 상태 표시
      showLogToast("로그를 삭제하는 중...", "info");

      // 로그 삭제 API 호출
      const response = await clearAllLogs();

      if (response && response.success) {
        // 삭제 성공 시
        showLogToast("모든 로그가 성공적으로 삭제되었습니다.", "success");

        // 로그 컨테이너 비우기
        const logContainer = document.getElementById("logContainer");
        if (logContainer) {
          logContainer.innerHTML = `
            <div class="text-center py-4">
              <i class="fas fa-info-circle me-2"></i>
              로그가 삭제되었습니다.
            </div>
          `;
        }

        // 로그 통계 새로고침
        await updateLogStats();
      } else {
        // 삭제 실패 시
        const errorMessage =
          response?.message || "알 수 없는 오류가 발생했습니다.";
        showLogToast(`로그 삭제 실패: ${errorMessage}`, "error");
        console.error("❌ [로그API] 삭제 실패:", response);
      }
    } catch (error) {
      // 예외 발생 시
      showLogToast("로그 삭제 중 오류가 발생했습니다.", "error");
      console.error("❌ [로그API] 삭제 중 오류:", error);
    }
  }
}

// 로그 토스트 메시지 표시
function showLogToast(message, type = "info") {
  // 기존 토스트가 있으면 제거
  const existingToast = document.querySelector(".toast-container");
  if (existingToast) {
    existingToast.remove();
  }

  // 토스트 컨테이너 생성
  const toastContainer = document.createElement("div");
  toastContainer.className = "toast-container position-fixed top-0 end-0 p-3";
  toastContainer.style.zIndex = "9999";

  // 토스트 아이콘과 색상 설정
  const iconClass =
    type === "success"
      ? "fa-check-circle text-success"
      : type === "error"
      ? "fa-exclamation-circle text-danger"
      : "fa-info-circle text-info";

  toastContainer.innerHTML = `
    <div class="toast show" role="alert">
      <div class="toast-header">
        <i class="fas ${iconClass} me-2"></i>
        <strong class="me-auto">로그 관리</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
      </div>
      <div class="toast-body">
        ${message}
      </div>
    </div>
  `;

  document.body.appendChild(toastContainer);

  // 3초 후 자동 제거
  setTimeout(() => {
    if (toastContainer.parentNode) {
      toastContainer.remove();
    }
  }, 3000);
}

// CSV 내보내기 기능
function exportLogsToCSV() {
  try {
    console.log("📊 [로그내보내기] CSV 내보내기 시작...");

    const logContainer = document.getElementById("logContainer");
    if (!logContainer) {
      showLogToast("로그 컨테이너를 찾을 수 없습니다.", "error");
      return;
    }

    // 현재 화면에 표시된 로그 엔트리들 수집
    const logEntries = logContainer.querySelectorAll(".log-entry");

    if (logEntries.length === 0) {
      showLogToast("내보낼 로그가 없습니다.", "warning");
      return;
    }

    // CSV 헤더
    const csvHeaders = ["시간", "레벨", "메시지"];

    // 로그 데이터 추출
    const csvData = [];
    logEntries.forEach((entry, index) => {
      const timestamp =
        entry.querySelector(".log-timestamp")?.textContent?.trim() || "";
      const level =
        entry.querySelector(".log-level")?.textContent?.trim() || "";
      const message =
        entry.querySelector(".log-message")?.textContent?.trim() || "";

      // CSV 형식으로 데이터 추가 (쉼표와 따옴표 처리)
      csvData.push([
        `"${timestamp.replace(/"/g, '""')}"`,
        `"${level.replace(/"/g, '""')}"`,
        `"${message.replace(/"/g, '""')}"`,
      ]);
    });

    // CSV 내용 생성
    const csvContent = [
      csvHeaders.map((header) => `"${header}"`).join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    // BOM 추가 (한글 깨짐 방지)
    const BOM = "\uFEFF";
    const csvWithBOM = BOM + csvContent;

    // 파일명 생성 (현재 날짜/시간 포함)
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/:/g, "-");
    const filename = `logs_export_${timestamp}.csv`;

    // Blob 생성 및 다운로드
    const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      // 지원하는 브라우저
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // 구형 브라우저 지원
      const csvDataUri =
        "data:text/csv;charset=utf-8," + encodeURIComponent(csvWithBOM);
      window.open(csvDataUri);
    }

    showLogToast(
      `${logEntries.length}개의 로그가 CSV로 내보내졌습니다.`,
      "success"
    );
    console.log(
      `📊 [로그내보내기] CSV 내보내기 완료: ${filename} (${logEntries.length}개 로그)`
    );
  } catch (error) {
    console.error("❌ [로그내보내기] CSV 내보내기 실패:", error);
    showLogToast("CSV 내보내기 중 오류가 발생했습니다.", "error");
  }
}

// 필터링 기능
function applyFilters() {
  const containerFilter = document.getElementById("containerFilter");
  const levelFilter = document.getElementById("levelFilter");
  const timeRangeFilter = document.getElementById("timeRangeFilter");
  const searchInput = document.getElementById("searchInput");
  const logContainer = document.getElementById("logContainer");

  const containerId = containerFilter?.value || "";
  const level = levelFilter?.value || "";
  const timeRange = timeRangeFilter?.value || "";
  const searchTerm = searchInput?.value.trim().toLowerCase() || "";

  console.log("🔍 필터 적용:", { containerId, level, timeRange, searchTerm });

  // 모든 로그 엔트리 가져오기
  const logEntries = Array.from(logContainer.querySelectorAll(".log-entry"));

  if (logEntries.length === 0) {
    console.log("⚠️ 로그 엔트리가 없습니다.");
    return;
  }

  // 필터링된 로그 엔트리들
  const filteredEntries = logEntries.filter((entry) => {
    const timestamp = entry.querySelector(".log-timestamp")?.textContent || "";
    const logLevel =
      entry.querySelector(".log-level")?.textContent?.toLowerCase() || "";
    const message =
      entry.querySelector(".log-message")?.textContent?.toLowerCase() || "";
    const containerName = entry.getAttribute("data-container") || "";

    // 컨테이너 필터
    if (containerId && containerName !== containerId) {
      return false;
    }

    // 레벨 필터
    if (level && logLevel !== level) {
      return false;
    }

    // 검색어 필터
    if (searchTerm && !message.includes(searchTerm)) {
      return false;
    }

    // 시간 범위 필터 (간단한 구현)
    if (timeRange) {
      const logTime = new Date(timestamp);
      const now = new Date();
      const timeDiff = now - logTime;

      let maxTime = 0;
      switch (timeRange) {
        case "1h":
          maxTime = 60 * 60 * 1000;
          break;
        case "6h":
          maxTime = 6 * 60 * 60 * 1000;
          break;
        case "24h":
          maxTime = 24 * 60 * 60 * 1000;
          break;
        case "7d":
          maxTime = 7 * 24 * 60 * 60 * 1000;
          break;
      }

      if (timeDiff > maxTime) {
        return false;
      }
    }

    return true;
  });

  // 로그 컨테이너 비우기
  logContainer.innerHTML = "";

  if (filteredEntries.length === 0) {
    logContainer.innerHTML = `
      <div class="text-center py-4">
        <i class="fas fa-search me-2"></i>
        필터 조건에 맞는 로그가 없습니다.
      </div>
    `;
  } else {
    // 필터링된 로그들 다시 추가
    filteredEntries.forEach((entry) => logContainer.appendChild(entry));

    // 필터 상태 표시
    showFilterStatus(filteredEntries.length, logEntries.length);
  }
}

// 필터 초기화 함수
function clearFilters() {
  const containerFilter = document.getElementById("containerFilter");
  const levelFilter = document.getElementById("levelFilter");
  const timeRangeFilter = document.getElementById("timeRangeFilter");
  const searchInput = document.getElementById("searchInput");

  if (containerFilter) containerFilter.value = "";
  if (levelFilter) levelFilter.value = "";
  if (timeRangeFilter) timeRangeFilter.value = "24h";
  if (searchInput) searchInput.value = "";

  // 모든 로그 다시 로드
  loadLogsData();

  // 필터 상태 숨기기
  hideFilterStatus();
}

// 필터 상태 표시
function showFilterStatus(filteredCount, totalCount) {
  const logContainer = document.getElementById("logContainer");
  let statusDiv = document.getElementById("filterStatus");
  if (!statusDiv) {
    statusDiv = document.createElement("div");
    statusDiv.id = "filterStatus";
    statusDiv.className = "alert alert-info mt-3";
    logContainer.parentNode.insertBefore(statusDiv, logContainer);
  }

  statusDiv.innerHTML = `
    <i class="fas fa-filter me-2"></i>
    필터링 결과: <strong>${filteredCount}</strong>개 / 전체 <strong>${totalCount}</strong>개
    <button type="button" class="btn btn-sm btn-outline-secondary ms-2" onclick="window.LogsAPI.clearFilters()">
      <i class="fas fa-times"></i> 필터 초기화
    </button>
  `;
}

// 필터 상태 숨기기
function hideFilterStatus() {
  const statusDiv = document.getElementById("filterStatus");
  if (statusDiv) {
    statusDiv.remove();
  }
}

// 필터 이벤트 리스너 초기화
function initializeFilterEvents() {
  const searchBtn = document.getElementById("searchBtn");
  const clearFilterBtn = document.getElementById("clearFilterBtn");
  const searchInput = document.getElementById("searchInput");

  // 검색 버튼 이벤트
  if (searchBtn) {
    searchBtn.addEventListener("click", function () {
      applyFilters();
    });
  }

  // 필터 초기화 버튼 이벤트
  if (clearFilterBtn) {
    clearFilterBtn.addEventListener("click", function () {
      clearFilters();
    });
  }

  // Enter 키로 검색
  if (searchInput) {
    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        applyFilters();
      }
    });
  }
}

// 로그 API 함수들을 전역으로 노출
window.LogsAPI = {
  getLogs,
  getLogStats,
  getLog,
  loadLogsData,
  updateLogStats,
  filterLogs,
  clearAllLogs,
  confirmAndClearLogs,
  exportLogsToCSV,
  applyFilters,
  clearFilters,
  initializeFilterEvents,
};

// 전역 함수로 노출
window.confirmAndClearLogs = confirmAndClearLogs;
window.exportLogsToCSV = exportLogsToCSV;
window.clearFilters = clearFilters;
