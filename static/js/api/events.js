/**
 * 이벤트 관련 API 함수들
 * /api/events/* 엔드포인트 호출
 */

// 이벤트 목록 조회
async function getEvents() {
  try {
    console.log("📅 [이벤트API] 이벤트 목록 요청 중...");
    const response = await fetch("/api/events");
    const data = await response.json();
    console.log("📅 [이벤트API] 이벤트 목록 응답:", data);
    return data;
  } catch (error) {
    console.error("❌ [이벤트API] 이벤트 목록 요청 실패:", error);
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

// 전역 변수
let allEvents = []; // 모든 이벤트 데이터
let filteredEvents = []; // 필터링된 이벤트 데이터

// 이벤트 필터링 함수
function filterEvents() {
  const typeFilter = document.getElementById("eventTypeFilter").value;
  const namespaceFilter = document.getElementById("namespaceFilter").value;
  const timeFilter = document.getElementById("timeFilter").value;
  const searchFilter = document
    .getElementById("searchFilter")
    .value.toLowerCase();

  console.log("🔍 [필터] 필터링 조건:", {
    type: typeFilter,
    namespace: namespaceFilter,
    time: timeFilter,
    search: searchFilter,
  });

  // 시간 필터링 디버깅 정보
  if (timeFilter && allEvents.length > 0) {
    const now = new Date();
    const sampleEvent = allEvents[0];
    try {
      const [hours, minutes, seconds] = sampleEvent.time.split(":").map(Number);
      const sampleEventTime = new Date();
      sampleEventTime.setHours(hours, minutes, seconds || 0, 0);
      sampleEventTime.setFullYear(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

      if (sampleEventTime > now) {
        sampleEventTime.setDate(sampleEventTime.getDate() - 1);
      }

      const diffHours = (now - sampleEventTime) / (1000 * 60 * 60);
      console.log(
        `🕐 [시간필터] 샘플 이벤트 시간: ${
          sampleEvent.time
        }, 현재와의 차이: ${diffHours.toFixed(2)}시간`
      );
    } catch (error) {
      console.warn("🕐 [시간필터] 샘플 이벤트 시간 파싱 실패:", error);
    }
  }

  filteredEvents = allEvents.filter((event) => {
    // 타입 필터링 (Normal, Warning)
    if (typeFilter && event.type !== typeFilter) {
      return false;
    }

    // 네임스페이스 필터링
    if (namespaceFilter && event.namespace !== namespaceFilter) {
      return false;
    }

    // 시간 필터링
    if (timeFilter) {
      const now = new Date();
      let eventTime;

      // 이벤트 시간 파싱 (HH:MM:SS 형태)
      try {
        const [hours, minutes, seconds] = event.time.split(":").map(Number);
        eventTime = new Date();
        eventTime.setHours(hours, minutes, seconds || 0, 0);

        // 오늘 날짜로 설정
        const today = new Date();
        eventTime.setFullYear(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );

        // 만약 이벤트 시간이 현재 시간보다 미래라면 어제로 설정
        if (eventTime > now) {
          eventTime.setDate(eventTime.getDate() - 1);
        }
      } catch (error) {
        console.warn(`시간 파싱 오류: ${event.time}`, error);
        return true; // 파싱 실패 시 필터링하지 않음
      }

      const diffMs = now - eventTime;
      const diffHours = diffMs / (1000 * 60 * 60);

      switch (timeFilter) {
        case "1h":
          if (diffHours > 1) return false;
          break;
        case "6h":
          if (diffHours > 6) return false;
          break;
        case "24h":
          if (diffHours > 24) return false;
          break;
        case "7d":
          if (diffHours > 168) return false; // 7일 = 168시간
          break;
        default:
          console.warn(`알 수 없는 시간 필터: ${timeFilter}`);
          break;
      }
    }

    // 검색 필터링
    if (searchFilter) {
      const searchText =
        `${event.object} ${event.namespace} ${event.reason} ${event.message} ${event.source} ${event.type}`.toLowerCase();
      if (!searchText.includes(searchFilter)) {
        return false;
      }
    }

    return true;
  });

  console.log(
    `🔍 [필터] 필터링 결과: ${filteredEvents.length}/${allEvents.length} 이벤트`
  );

  // 필터 정보 업데이트
  updateFilterInfo();

  // 검색 통계 표시
  updateSearchStats();

  renderEventsTable();
}

// 텍스트 하이라이트 함수
function highlightText(text, searchTerm) {
  if (!searchTerm) return text;

  const regex = new RegExp(
    `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  return text.replace(regex, '<mark class="search-highlight">$1</mark>');
}

// 이벤트 테이블 렌더링 함수
function renderEventsTable() {
  const tbody = document.getElementById("eventsTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (filteredEvents.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-muted py-4">
          <i class="fas fa-info-circle me-2"></i>
          ${
            allEvents.length === 0
              ? "이벤트가 없습니다."
              : "필터 조건에 맞는 이벤트가 없습니다."
          }
        </td>
      </tr>
    `;
    return;
  }

  // 검색어 가져오기
  const searchFilter = document
    .getElementById("searchFilter")
    .value.toLowerCase();

  filteredEvents.forEach((event) => {
    const statusClass = event.type === "Normal" ? "running" : "warning";
    const rowClass = event.type === "Warning" ? "table-warning" : "";

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
            event.type === "Normal" ? "info-circle" : "exclamation-triangle"
          } me-1"></i>
          ${highlightText(event.type, searchFilter)}
        </span>
      </td>
      <td>
        <div>
          <strong>${highlightText(event.object, searchFilter)}</strong>
          <div class="small text-muted">${highlightText(
            event.object.split("-")[0],
            searchFilter
          )}</div>
        </div>
      </td>
      <td><code>${highlightText(event.namespace, searchFilter)}</code></td>
      <td><span class="badge bg-${
        event.type === "Normal" ? "success" : "warning"
      }">${highlightText(event.reason, searchFilter)}</span></td>
      <td>${highlightText(event.message, searchFilter)}</td>
      <td>${highlightText(event.source, searchFilter)}</td>
    `;
    tbody.appendChild(row);
  });
}

// 검색 통계 업데이트
function updateSearchStats() {
  const searchFilter = document.getElementById("searchFilter");
  const searchStats = document.getElementById("searchStats");

  if (!searchFilter || !searchStats) return;

  const searchTerm = searchFilter.value.trim();

  if (searchTerm) {
    const totalResults = filteredEvents.length;
    const totalEvents = allEvents.length;
    const percentage =
      totalEvents > 0 ? ((totalResults / totalEvents) * 100).toFixed(1) : 0;

    searchStats.innerHTML = `
      <div class="search-stats">
        <i class="fas fa-search me-1"></i>
        "<strong>${searchTerm}</strong>" 검색 결과: 
        <span class="text-primary fw-bold">${totalResults}</span>개 
        (전체 ${totalEvents}개 중 ${percentage}%)
      </div>
    `;
    searchStats.style.display = "block";
  } else {
    searchStats.style.display = "none";
  }
}

// 필터 정보 업데이트
function updateFilterInfo() {
  const typeFilter = document.getElementById("eventTypeFilter").value;
  const namespaceFilter = document.getElementById("namespaceFilter").value;
  const timeFilter = document.getElementById("timeFilter").value;
  const searchFilter = document.getElementById("searchFilter").value;

  // 활성 필터 목록 생성
  const activeFilters = [];

  if (typeFilter) activeFilters.push(`타입: ${typeFilter}`);
  if (namespaceFilter) activeFilters.push(`네임스페이스: ${namespaceFilter}`);
  if (timeFilter) {
    const timeLabels = {
      "1h": "최근 1시간",
      "6h": "최근 6시간",
      "24h": "최근 24시간",
      "7d": "최근 7일",
    };
    activeFilters.push(`시간: ${timeLabels[timeFilter]}`);
  }
  if (searchFilter) activeFilters.push(`검색: "${searchFilter}"`);

  // 필터 정보를 콘솔에 출력
  if (activeFilters.length > 0) {
    console.log(`🔍 [필터] 활성 필터: ${activeFilters.join(", ")}`);
    console.log(
      `📊 [필터] 필터링 결과: ${filteredEvents.length}/${allEvents.length} 이벤트 표시`
    );
  } else {
    console.log("🔍 [필터] 활성 필터 없음 (모든 이벤트 표시)");
  }
}

// 네임스페이스 필터 옵션 동적 생성
function updateNamespaceFilter() {
  const namespaceFilter = document.getElementById("namespaceFilter");
  if (!namespaceFilter || allEvents.length === 0) return;

  // 현재 선택된 값 저장
  const currentValue = namespaceFilter.value;

  // 고유한 네임스페이스 목록 추출
  const uniqueNamespaces = [
    ...new Set(allEvents.map((event) => event.namespace)),
  ].sort();

  // 기존 옵션 제거 (첫 번째 "모든 네임스페이스" 옵션 제외)
  while (namespaceFilter.children.length > 1) {
    namespaceFilter.removeChild(namespaceFilter.lastChild);
  }

  // 새로운 네임스페이스 옵션 추가
  uniqueNamespaces.forEach((namespace) => {
    const option = document.createElement("option");
    option.value = namespace;
    option.textContent = namespace;
    namespaceFilter.appendChild(option);
  });

  // 이전 선택값 복원 (유효한 경우)
  if (uniqueNamespaces.includes(currentValue)) {
    namespaceFilter.value = currentValue;
  } else {
    namespaceFilter.value = ""; // "모든 네임스페이스" 선택
  }

  console.log(
    `📋 [네임스페이스] 사용 가능한 네임스페이스: ${uniqueNamespaces.join(", ")}`
  );
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
      allEvents = response.data.events;
      const summary = response.data.summary;

      // 이벤트 통계 업데이트
      updateElement("todayEvents", summary.today_events);
      updateElement("warningEvents", summary.warning_events);
      updateElement("normalEvents", summary.normal_events);
      updateElement("systemEvents", summary.system_events);

      // 네임스페이스 필터 옵션 업데이트
      updateNamespaceFilter();

      // 초기 필터링 적용
      filterEvents();
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

// 필터 이벤트 리스너 설정
function setupEventFilters() {
  // 타입 필터
  const typeFilter = document.getElementById("eventTypeFilter");
  if (typeFilter) {
    typeFilter.addEventListener("change", filterEvents);
  }

  // 네임스페이스 필터
  const namespaceFilter = document.getElementById("namespaceFilter");
  if (namespaceFilter) {
    namespaceFilter.addEventListener("change", filterEvents);
  }

  // 시간 필터
  const timeFilter = document.getElementById("timeFilter");
  if (timeFilter) {
    timeFilter.addEventListener("change", filterEvents);
  }

  // 검색 필터 (실시간 검색)
  const searchFilter = document.getElementById("searchFilter");
  if (searchFilter) {
    searchFilter.addEventListener("input", filterEvents);
  }
}

// 페이지 로드 시 필터 이벤트 리스너 설정
document.addEventListener("DOMContentLoaded", function () {
  setupEventFilters();
});

// 이벤트 API 함수들을 전역으로 노출
window.EventsAPI = {
  getEvents,
  getEvent,
  getEventsByNamespace,
  loadEventsData,
  filterEvents,
  renderEventsTable,
  updateNamespaceFilter,
  updateFilterInfo,
  updateSearchStats,
  highlightText,
};
