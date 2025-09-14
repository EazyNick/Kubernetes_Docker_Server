// 로그 API 모듈
const LOGS_API_BASE = "/api";

// 로그 목록 조회
async function getLogs(params = {}) {
  try {
    const queryParams = new URLSearchParams();

    if (params.limit) queryParams.append("limit", params.limit);
    if (params.level) queryParams.append("level", params.level);
    if (params.source) queryParams.append("source", params.source);
    if (params.time_range) queryParams.append("time_range", params.time_range);

    const url = `${LOGS_API_BASE}/logs?${queryParams.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching logs:", error);
    throw error;
  }
}

// 로그 통계 조회
async function getLogStats(timeRange = "24h") {
  try {
    const url = `${LOGS_API_BASE}/logs/stats?time_range=${timeRange}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching log stats:", error);
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
        <div class="log-entry">
          <span class="log-timestamp">${log.timestamp}</span>
          <span class="log-level ${log.level}">${log.level.toUpperCase()}</span>
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

// 로그 API 함수들을 전역으로 노출
window.LogsAPI = {
  getLogs,
  getLogStats,
  getLog,
  loadLogsData,
  updateLogStats,
  filterLogs,
};
