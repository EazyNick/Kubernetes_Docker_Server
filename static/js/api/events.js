/**
 * 이벤트 관련 API 함수들
 * /api/events/* 엔드포인트 호출
 */

// 이벤트 목록 조회
async function getEvents() {
  try {
    const response = await fetch("/api/events");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching events:", error);
    return null;
  }
}

// 특정 이벤트 상세 정보 조회
async function getEvent(eventId) {
  try {
    const response = await fetch(`/api/events/${eventId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}

// 특정 네임스페이스의 이벤트 조회
async function getEventsByNamespace(namespace) {
  try {
    const response = await fetch(`/api/events/namespace/${namespace}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching events by namespace:", error);
    return null;
  }
}

// 시간 경과 계산 함수
function getTimeAgo(timeStr) {
  const now = new Date();
  const time = new Date(now.toDateString() + " " + timeStr);
  const diffMs = now - time;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "방금 전";
  if (diffMins < 60) return `${diffMins}분 전`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}일 전`;
}

// 이벤트 페이지 데이터 로딩
async function loadEventsData() {
  if (!window.EventsAPI) {
    console.error("EventsAPI not available");
    return;
  }

  try {
    const response = await window.EventsAPI.getEvents();
    if (response && response.success) {
      const events = response.data.events;
      const summary = response.data.summary;
      const tbody = document.getElementById("eventsTableBody");

      // 이벤트 통계 업데이트
      updateElement("todayEvents", summary.today_events);
      updateElement("warningEvents", summary.warning_events);
      updateElement("normalEvents", summary.normal_events);
      updateElement("systemEvents", summary.system_events);

      if (tbody) {
        tbody.innerHTML = "";

        if (events.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="7" class="text-center text-muted py-4">
                <i class="fas fa-info-circle me-2"></i>
                이벤트가 없습니다.
              </td>
            </tr>
          `;
          return;
        }

        events.forEach((event) => {
          const statusClass = event.type === "Normal" ? "running" : "warning";
          const rowClass = event.type === "Warning" ? "table-warning" : "";
          const iconClass = event.object.includes("Pod")
            ? "fas fa-cube"
            : event.object.includes("Node")
            ? "fas fa-server"
            : event.object.includes("Service")
            ? "fas fa-network-wired"
            : event.object.includes("Deployment")
            ? "fas fa-layer-group"
            : event.object.includes("ServiceAccount")
            ? "fas fa-shield-alt"
            : "fas fa-hdd";

          const row = document.createElement("tr");
          if (rowClass) row.className = rowClass;

          row.innerHTML = `
            <td>
              <small class="text-muted">${event.time}</small>
              <div class="small">${getTimeAgo(event.time)}</div>
            </td>
            <td>
              <span class="status-badge ${statusClass}">
                <i class="fas fa-${
                  event.type === "Normal"
                    ? "info-circle"
                    : "exclamation-triangle"
                } me-1"></i>
                ${event.type}
              </span>
            </td>
            <td>
              <div class="d-flex align-items-center">
                <i class="${iconClass} me-2 text-primary"></i>
                <div>
                  <strong>${event.object}</strong>
                  <div class="small text-muted">${
                    event.object.split("-")[0]
                  }</div>
                </div>
              </div>
            </td>
            <td><code>${event.namespace}</code></td>
            <td><span class="badge bg-${
              event.type === "Normal" ? "success" : "warning"
            }">${event.reason}</span></td>
            <td>${event.message}</td>
            <td>${event.source}</td>
          `;
          tbody.appendChild(row);
        });
      }
    }
  } catch (error) {
    console.error("Error loading events data:", error);
    const tbody = document.getElementById("eventsTableBody");
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-danger py-4">
            <i class="fas fa-exclamation-triangle me-2"></i>
            이벤트 데이터를 불러오는데 실패했습니다.
          </td>
        </tr>
      `;
    }
  }
}

// 이벤트 API 함수들을 전역으로 노출
window.EventsAPI = {
  getEvents,
  getEvent,
  getEventsByNamespace,
  loadEventsData,
};
