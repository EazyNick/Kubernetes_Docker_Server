/**
 * 메인 애플리케이션 JavaScript
 * 사이드바, 반응형 레이아웃, 페이지 초기화를 관리
 */

// 사이드바 토글 기능 초기화
function initSidebar() {
  const sidebarToggle = document.getElementById("sidebarToggle");
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");

  if (sidebarToggle && sidebar && mainContent) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("sidebar-collapsed");

      // 사이드바 상태에 따라 메인 콘텐츠 여백 조정
      if (sidebar.classList.contains("sidebar-collapsed")) {
        mainContent.classList.add("expanded");
      } else {
        mainContent.classList.remove("expanded");
      }
    });
  }
}

// 반응형 레이아웃 처리
function handleResize() {
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");

  if (sidebar && mainContent) {
    if (window.innerWidth < 768) {
      sidebar.classList.add("sidebar-collapsed");
      mainContent.classList.add("expanded");
    } else {
      sidebar.classList.remove("sidebar-collapsed");
      mainContent.classList.remove("expanded");
    }
  }
}

// 메인 초기화 함수
function init() {
  // 인증 상태 확인
  if (!isLoggedIn()) {
    redirectToLogin();
    return;
  }

  initSidebar();
  handleResize();
  window.addEventListener("resize", handleResize);

  // 페이지 로드 시 사이드바 상태 초기화
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");

  if (sidebar && mainContent) {
    // 데스크톱에서는 기본적으로 열려있음 (sidebar-collapsed 클래스 제거)
    if (window.innerWidth >= 768) {
      sidebar.classList.remove("sidebar-collapsed");
      mainContent.classList.remove("expanded");
    } else {
      // 모바일에서는 기본적으로 닫혀있음
      sidebar.classList.add("sidebar-collapsed");
      mainContent.classList.add("expanded");
    }
  }

  // 현재 페이지에 따라 적절한 초기화 함수 호출
  const currentPath = window.location.pathname;

  if (currentPath === "/home") {
    // 홈 페이지 초기화
    if (window.HomeAPI) {
      window.HomeAPI.initHome();
    }
  } else if (currentPath === "/dashboard") {
    // 대시보드 페이지 초기화
    if (window.HomeAPI) {
      window.HomeAPI.initDashboard();
    }
  } else if (currentPath === "/containers") {
    // 컨테이너 페이지 초기화
    if (window.ContainersAPI) {
      window.ContainersAPI.loadContainersData();
    }
  } else if (currentPath === "/nodes") {
    // 노드 페이지 초기화
    if (window.NodesAPI) {
      window.NodesAPI.loadNodesData();
    }
    // 노드 차트 초기화
    if (window.NodeCharts) {
      window.NodeCharts.initAllCharts();
    }
  } else if (currentPath === "/alerts") {
    // 알림 페이지 초기화
    if (window.AlertsAPI) {
      window.AlertsAPI.loadAlertsData();
      window.AlertsAPI.loadAlertRulesData();
    }
    // 알림 차트 초기화
    if (window.AlertCharts) {
      window.AlertCharts.initAllCharts();
    }
  } else if (currentPath === "/events") {
    // 이벤트 페이지 초기화
    if (window.EventsAPI) {
      window.EventsAPI.loadEventsData();
    }
    // 이벤트 차트 초기화
    if (window.EventCharts) {
      window.EventCharts.initAllCharts();
    }
  } else if (currentPath === "/logs") {
    // 로그 페이지 초기화
    if (window.LogsAPI) {
      window.LogsAPI.loadLogsData();
    }
  } else if (currentPath === "/monitoring") {
    // 모니터링 페이지 초기화
    if (window.MonitoringAPI) {
      window.MonitoringAPI.loadMonitoringData();
      window.MonitoringAPI.loadContainerData();
    }
    // 모니터링 차트 초기화
    if (window.MonitoringCharts) {
      window.MonitoringCharts.initAllCharts();
    }
  } else if (currentPath === "/admin") {
    // 관리자 페이지 초기화
    if (window.AdminAPI) {
      window.AdminAPI.initAdmin();
    }
  }
}

// 차트 함수들은 별도 파일로 분리됨
// - static/js/charts/nodes.js: 노드 페이지 차트
// - static/js/charts/alerts.js: 알림 페이지 차트
// - static/js/charts/events.js: 이벤트 페이지 차트
// - static/js/charts/monitoring.js: 모니터링 페이지 차트

// DOM 로드 완료 시 초기화
// HTML 문서가 완전히 로드된 후 애플리케이션을 초기화합니다.
document.addEventListener("DOMContentLoaded", init);
