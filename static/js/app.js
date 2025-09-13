// Container Monitor - 메인 앱 초기화

// 홈 페이지 실시간 데이터 업데이트
async function updateRealTimeData() {
  const stats = await window.StatsAPI.getOverviewStats();
  if (stats && stats.success) {
    updateElement("totalContainers", stats.data.total_containers);
    updateElement("runningContainers", stats.data.running_containers);
    updateElement("activeNodes", stats.data.active_nodes);
    updateElement("healthyNodes", stats.data.healthy_nodes);
    updateElement("systemHealth", stats.data.system_health + "%");
    updateElement("uptime", stats.data.uptime + "%");
    updateElement("warningAlerts", stats.data.warning_alerts);
    updateElement("criticalAlerts", stats.data.critical_alerts);
  }

  const lastUpdateElement = document.getElementById("lastUpdate");
  if (lastUpdateElement) {
    lastUpdateElement.textContent = new Date().toLocaleTimeString("ko-KR");
  }
}

// 대시보드 페이지 실시간 데이터 업데이트
async function updateDashboardData() {
  if (!window.StatsAPI) {
    return;
  }

  const stats = await window.StatsAPI.getDashboardStats();
  if (stats && stats.success) {
    // 메트릭 카드 업데이트
    updateElement("totalContainers", stats.data.containers.total);
    updateElement("runningContainers", stats.data.containers.running);
    updateElement("stoppedContainers", stats.data.containers.stopped);
    updateElement("failedContainers", stats.data.containers.failed);
    updateElement("totalNodes", stats.data.nodes.total);
    updateElement("avgCpu", stats.data.resources.avg_cpu + "%");
    updateElement("avgMemory", stats.data.resources.avg_memory + "%");
    updateElement("networkTraffic", stats.data.resources.network_traffic);
  }
}

// 요소 업데이트 헬퍼 함수
function updateElement(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

// 사이드바 토글 기능
function initSidebar() {
  const sidebarToggle = document.getElementById("sidebarToggle");
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");

  if (sidebarToggle && sidebar && mainContent) {
    sidebarToggle.addEventListener("click", function () {
      sidebar.classList.toggle("sidebar-collapsed");
      mainContent.classList.toggle("content-expanded");
    });
  }
}

// 반응형 처리
function handleResize() {
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");

  if (sidebar && mainContent) {
    if (window.innerWidth <= 768) {
      sidebar.classList.add("sidebar-collapsed");
      mainContent.classList.add("content-expanded");
    } else {
      sidebar.classList.remove("sidebar-collapsed");
      mainContent.classList.remove("content-expanded");
    }
  }
}

// 차트 관련 변수들
let cpuChart, memoryChart, networkChart, diskChart;

// CPU 사용률 차트
function initCpuChart() {
  const ctx = document.getElementById("cpuChart");
  if (!ctx) {
    return;
  }

  if (typeof Chart === "undefined") {
    return;
  }
  cpuChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: generateTimeLabels(12),
      datasets: [
        {
          label: "CPU 사용률 (%)",
          data: generateRandomData(12, 20, 80),
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
}

// 메모리 사용률 차트
function initMemoryChart() {
  const ctx = document.getElementById("memoryChart");
  if (!ctx) return;

  if (typeof Chart === "undefined") {
    return;
  }

  memoryChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: generateTimeLabels(12),
      datasets: [
        {
          label: "메모리 사용률 (%)",
          data: generateRandomData(12, 40, 90),
          borderColor: "#059669",
          backgroundColor: "rgba(5, 150, 105, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
}

// 네트워크 트래픽 차트
function initNetworkChart() {
  const ctx = document.getElementById("networkChart");
  if (!ctx) return;

  if (typeof Chart === "undefined") {
    return;
  }

  networkChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: generateTimeLabels(12),
      datasets: [
        {
          label: "네트워크 트래픽 (MB/s)",
          data: generateRandomData(12, 10, 200),
          borderColor: "#d97706",
          backgroundColor: "rgba(217, 119, 6, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
}

// 디스크 I/O 차트
function initDiskChart() {
  const ctx = document.getElementById("diskChart");
  if (!ctx) return;

  if (typeof Chart === "undefined") {
    return;
  }

  diskChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: generateTimeLabels(12),
      datasets: [
        {
          label: "디스크 I/O (MB/s)",
          data: generateRandomData(12, 5, 100),
          borderColor: "#dc2626",
          backgroundColor: "rgba(220, 38, 38, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
}

// 시간 라벨 생성
function generateTimeLabels(count) {
  const labels = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 5 * 60000); // 5분 간격
    labels.push(
      time.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
    );
  }
  return labels;
}

// 랜덤 데이터 생성
function generateRandomData(count, min, max) {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return data;
}

// 차트 데이터 업데이트
function updateCharts() {
  if (cpuChart) {
    cpuChart.data.datasets[0].data = generateRandomData(12, 20, 80);
    cpuChart.update("none");
  }

  if (memoryChart) {
    memoryChart.data.datasets[0].data = generateRandomData(12, 40, 90);
    memoryChart.update("none");
  }

  if (networkChart) {
    networkChart.data.datasets[0].data = generateRandomData(12, 10, 200);
    networkChart.update("none");
  }

  if (diskChart) {
    diskChart.data.datasets[0].data = generateRandomData(12, 5, 100);
    diskChart.update("none");
  }
}

// 초기화 함수
function init() {
  initSidebar();
  window.addEventListener("resize", handleResize);
  handleResize();

  // 홈 페이지 실시간 업데이트
  if (
    document.getElementById("totalContainers") &&
    !document.getElementById("cpuChart")
  ) {
    setInterval(updateRealTimeData, 5000);
    updateRealTimeData();
  }

  // 대시보드 페이지 차트 초기화 (cpuChart가 있으면 대시보드 페이지)
  if (document.getElementById("cpuChart")) {
    // DOM이 완전히 로드된 후 차트 초기화
    setTimeout(() => {
      initCpuChart();
      initMemoryChart();
      initNetworkChart();
      initDiskChart();

      // API 로드 확인 후 데이터 로드
      function waitForAPI() {
        if (window.StatsAPI) {
          updateDashboardData();

          // 5초마다 차트 및 데이터 업데이트
          setInterval(() => {
            updateCharts();
            updateDashboardData();
          }, 5000);
        } else {
          setTimeout(waitForAPI, 100);
        }
      }

      waitForAPI();
    }, 100);
  }
}

// DOM 로드 완료 시 초기화
document.addEventListener("DOMContentLoaded", init);
