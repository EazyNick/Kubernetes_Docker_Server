// Container Monitor - 메인 앱 초기화
// 이 파일은 Container Monitor 웹 애플리케이션의 메인 JavaScript 파일입니다.
// 차트 초기화, 실시간 데이터 업데이트, 사이드바 토글 등의 기능을 담당합니다.

// 사이드바 토글 기능
// 햄버거 메뉴 버튼을 클릭했을 때 사이드바를 접었다 펼쳤다 하는 기능을 초기화합니다.
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
// 브라우저 창 크기가 변경될 때 사이드바와 메인 콘텐츠의 레이아웃을 조정합니다.
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
// 대시보드 페이지의 차트 인스턴스들을 저장하는 전역 변수들입니다.
let cpuChart, memoryChart, networkChart, diskChart;

// CPU 사용률 차트 초기화
// 대시보드 페이지의 CPU 사용률 라인 차트를 생성합니다.
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

// 메모리 사용률 차트 초기화
// 대시보드 페이지의 메모리 사용률 라인 차트를 생성합니다.
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

// 네트워크 트래픽 차트 초기화
// 대시보드 페이지의 네트워크 트래픽 라인 차트를 생성합니다.
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

// 디스크 I/O 차트 초기화
// 대시보드 페이지의 디스크 I/O 라인 차트를 생성합니다.
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
// 차트의 X축에 표시할 시간 라벨을 생성합니다. (예: "00:00", "01:00", ...)
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
// 차트에 표시할 랜덤 데이터를 생성합니다. (현재는 시뮬레이션용)
function generateRandomData(count, min, max) {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return data;
}

// 차트 데이터 업데이트
// 대시보드의 모든 차트 데이터를 새로운 랜덤 데이터로 업데이트합니다.
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
// 애플리케이션의 모든 기능을 초기화하고 페이지별 차트를 설정합니다.
function init() {
  initSidebar();
  window.addEventListener("resize", handleResize);
  handleResize();

  // 홈 페이지 실시간 업데이트
  if (
    document.getElementById("totalContainers") &&
    !document.getElementById("cpuChart")
  ) {
    setInterval(window.StatsAPI.updateRealTimeData, 5000);
    window.StatsAPI.updateRealTimeData();
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
        if (window.StatsAPI && window.AlertsAPI) {
          window.StatsAPI.updateDashboardData();
          window.AlertsAPI.loadRecentAlerts();

          // 5초마다 차트 및 데이터 업데이트
          setInterval(() => {
            updateCharts();
            window.StatsAPI.updateDashboardData();
            window.AlertsAPI.loadRecentAlerts();
          }, 5000);
        } else {
          setTimeout(waitForAPI, 50);
        }
      }

      waitForAPI();
    }, 100);
  }

  // 컨테이너 페이지 데이터 로딩
  if (document.getElementById("containersTableBody")) {
    setTimeout(() => {
      function waitForAPI() {
        if (
          window.ContainersAPI &&
          typeof window.ContainersAPI.loadContainersData === "function"
        ) {
          window.ContainersAPI.loadContainersData();
        } else {
          setTimeout(waitForAPI, 100);
        }
      }
      waitForAPI();
    }, 100);
  }

  // 노드 페이지 데이터 로딩
  if (document.getElementById("nodesTableBody")) {
    setTimeout(() => {
      function waitForAPI() {
        if (
          window.NodesAPI &&
          typeof window.NodesAPI.loadNodesData === "function"
        ) {
          window.NodesAPI.loadNodesData();
        } else {
          setTimeout(waitForAPI, 100);
        }
      }
      waitForAPI();
    }, 100);
  }

  // 알림 페이지 데이터 로딩
  if (document.getElementById("alertsTableBody")) {
    setTimeout(() => {
      function waitForAPI() {
        if (
          window.AlertsAPI &&
          typeof window.AlertsAPI.loadAlertsData === "function" &&
          typeof window.AlertsAPI.loadAlertRulesData === "function"
        ) {
          window.AlertsAPI.loadAlertsData();
          window.AlertsAPI.loadAlertRulesData();
        } else {
          setTimeout(waitForAPI, 100);
        }
      }
      waitForAPI();
    }, 200);
  }

  // 이벤트 페이지 데이터 로딩
  if (document.getElementById("eventsTableBody")) {
    setTimeout(() => {
      function waitForAPI() {
        if (
          window.EventsAPI &&
          typeof window.EventsAPI.loadEventsData === "function"
        ) {
          window.EventsAPI.loadEventsData();
        } else {
          setTimeout(waitForAPI, 100);
        }
      }
      waitForAPI();
    }, 100);
  }

  // 노드 페이지 차트 초기화
  if (document.getElementById("nodeCpuChart")) {
    setTimeout(() => {
      initNodeCpuChart();
      initNodeMemoryChart();
    }, 100);
  }

  // 알림 페이지 차트 초기화
  if (document.getElementById("alertTrendChart")) {
    setTimeout(() => {
      initAlertTrendChart();
    }, 100);
  }

  // 이벤트 페이지 차트 초기화
  if (document.getElementById("eventTrendChart")) {
    setTimeout(() => {
      initEventTrendChart();
      initEventTypeChart();
    }, 100);
  }

  // 모니터링 페이지 차트 초기화
  if (document.getElementById("networkTrafficChart")) {
    setTimeout(() => {
      initNetworkTrafficChart();
      initDiskIoChart();
      initResponseTimeChart();
      initRequestStatusChart();
    }, 100);
  }
}

// 노드 페이지 차트 초기화 함수들
// 노드 페이지의 CPU 사용률과 메모리 사용률 바 차트를 생성합니다.
function initNodeCpuChart() {
  const ctx = document.getElementById("nodeCpuChart");
  if (!ctx) return;

  if (typeof Chart === "undefined") {
    console.error("Chart.js가 로드되지 않았습니다.");
    return;
  }

  // API에서 노드 데이터를 가져와서 차트 생성
  async function createNodeCpuChart() {
    try {
      if (window.NodesAPI) {
        const response = await window.NodesAPI.getNodes();
        if (response && response.success) {
          const nodes = response.data.nodes;

          const cpuData = {
            labels: nodes.map((node) => node.name),
            datasets: [
              {
                label: "CPU 사용률 (%)",
                data: nodes.map((node) => node.cpu.usage),
                backgroundColor: nodes.map((node) => {
                  const usage = node.cpu.usage;
                  if (usage < 30) return "rgba(5, 150, 105, 0.8)";
                  if (usage < 70) return "rgba(217, 119, 6, 0.8)";
                  return "rgba(220, 38, 38, 0.8)";
                }),
                borderColor: nodes.map((node) => {
                  const usage = node.cpu.usage;
                  if (usage < 30) return "rgba(5, 150, 105, 1)";
                  if (usage < 70) return "rgba(217, 119, 6, 1)";
                  return "rgba(220, 38, 38, 1)";
                }),
                borderWidth: 2,
              },
            ],
          };

          new Chart(ctx, {
            type: "bar",
            data: cpuData,
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                x: {
                  grid: {
                    display: false,
                  },
                },
                y: {
                  beginAtZero: true,
                  max: 100,
                  grid: {
                    color: "rgba(0, 0, 0, 0.1)",
                  },
                  ticks: {
                    callback: function (value) {
                      return value + "%";
                    },
                  },
                },
              },
            },
          });
        }
      }
    } catch (error) {
      console.error("Error creating node CPU chart:", error);
    }
  }

  createNodeCpuChart();
}

function initNodeMemoryChart() {
  const ctx = document.getElementById("nodeMemoryChart");
  if (!ctx) return;

  if (typeof Chart === "undefined") {
    console.error("Chart.js가 로드되지 않았습니다.");
    return;
  }

  // API에서 노드 데이터를 가져와서 차트 생성
  async function createNodeMemoryChart() {
    try {
      if (window.NodesAPI) {
        const response = await window.NodesAPI.getNodes();
        if (response && response.success) {
          const nodes = response.data.nodes;

          const memoryData = {
            labels: nodes.map((node) => node.name),
            datasets: [
              {
                label: "메모리 사용률 (%)",
                data: nodes.map((node) => node.memory.usage),
                backgroundColor: nodes.map((node) => {
                  const usage = node.memory.usage;
                  if (usage < 30) return "rgba(5, 150, 105, 0.8)";
                  if (usage < 70) return "rgba(217, 119, 6, 0.8)";
                  return "rgba(220, 38, 38, 0.8)";
                }),
                borderColor: nodes.map((node) => {
                  const usage = node.memory.usage;
                  if (usage < 30) return "rgba(5, 150, 105, 1)";
                  if (usage < 70) return "rgba(217, 119, 6, 1)";
                  return "rgba(220, 38, 38, 1)";
                }),
                borderWidth: 2,
              },
            ],
          };

          new Chart(ctx, {
            type: "bar",
            data: memoryData,
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                x: {
                  grid: {
                    display: false,
                  },
                },
                y: {
                  beginAtZero: true,
                  max: 100,
                  grid: {
                    color: "rgba(0, 0, 0, 0.1)",
                  },
                  ticks: {
                    callback: function (value) {
                      return value + "%";
                    },
                  },
                },
              },
            },
          });
        }
      }
    } catch (error) {
      console.error("Error creating node memory chart:", error);
    }
  }

  createNodeMemoryChart();
}

// 알림 페이지 차트 초기화 함수
// 알림 페이지의 알림 발생 추이 라인 차트를 생성합니다.
function initAlertTrendChart() {
  const ctx = document.getElementById("alertTrendChart");
  if (!ctx) return;

  if (typeof Chart === "undefined") {
    console.error("Chart.js가 로드되지 않았습니다.");
    return;
  }

  // 최근 7일간의 알림 데이터 (예시)
  const alertData = {
    labels: ["월", "화", "수", "목", "금", "토", "일"],
    datasets: [
      {
        label: "Critical",
        data: [2, 1, 3, 2, 4, 1, 2],
        borderColor: "#dc2626",
        backgroundColor: "rgba(220, 38, 38, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Warning",
        data: [5, 7, 4, 6, 8, 3, 5],
        borderColor: "#d97706",
        backgroundColor: "rgba(217, 119, 6, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Info",
        data: [8, 12, 10, 15, 11, 9, 13],
        borderColor: "#059669",
        backgroundColor: "rgba(5, 150, 105, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  new Chart(ctx, {
    type: "line",
    data: alertData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            usePointStyle: true,
            padding: 20,
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(0, 0, 0, 0.1)",
          },
        },
      },
      elements: {
        point: {
          radius: 4,
          hoverRadius: 6,
        },
      },
    },
  });
}

// 이벤트 페이지 차트 초기화 함수들
// 이벤트 페이지의 이벤트 발생 추이 라인 차트와 이벤트 타입 분포 도넛 차트를 생성합니다.
function initEventTrendChart() {
  const ctx = document.getElementById("eventTrendChart");
  if (!ctx) return;

  if (typeof Chart === "undefined") {
    console.error("Chart.js가 로드되지 않았습니다.");
    return;
  }

  // 최근 24시간 이벤트 발생 추이 데이터 (예시)
  const eventData = {
    labels: [
      "00:00",
      "02:00",
      "04:00",
      "06:00",
      "08:00",
      "10:00",
      "12:00",
      "14:00",
      "16:00",
      "18:00",
      "20:00",
      "22:00",
    ],
    datasets: [
      {
        label: "Normal",
        data: [12, 8, 15, 22, 18, 25, 30, 28, 35, 42, 38, 45],
        borderColor: "#059669",
        backgroundColor: "rgba(5, 150, 105, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Warning",
        data: [3, 2, 4, 6, 5, 8, 10, 9, 12, 15, 13, 18],
        borderColor: "#d97706",
        backgroundColor: "rgba(217, 119, 6, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Error",
        data: [1, 0, 2, 3, 2, 4, 5, 4, 6, 8, 7, 9],
        borderColor: "#dc2626",
        backgroundColor: "rgba(220, 38, 38, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  new Chart(ctx, {
    type: "line",
    data: eventData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            usePointStyle: true,
            padding: 20,
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(0, 0, 0, 0.1)",
          },
        },
      },
      elements: {
        point: {
          radius: 4,
          hoverRadius: 6,
        },
      },
    },
  });
}

function initEventTypeChart() {
  const ctx = document.getElementById("eventTypeChart");
  if (!ctx) return;

  if (typeof Chart === "undefined") {
    console.error("Chart.js가 로드되지 않았습니다.");
    return;
  }

  // 이벤트 타입별 분포 데이터 (예시)
  const typeData = {
    labels: ["Normal", "Warning", "Error", "Info"],
    datasets: [
      {
        data: [65, 20, 10, 5],
        backgroundColor: ["#059669", "#d97706", "#dc2626", "#0891b2"],
        borderColor: ["#047857", "#b45309", "#b91c1c", "#0e7490"],
        borderWidth: 2,
      },
    ],
  };

  new Chart(ctx, {
    type: "doughnut",
    data: typeData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            padding: 20,
          },
        },
      },
      cutout: "60%",
    },
  });
}

// 모니터링 페이지 차트 초기화 함수들
// 모니터링 페이지의 네트워크 트래픽, 디스크 I/O, 응답 시간, 요청 상태 차트를 생성합니다.
function initNetworkTrafficChart() {
  const ctx = document.getElementById("networkTrafficChart");
  if (!ctx) return;

  if (typeof Chart === "undefined") {
    console.error("Chart.js가 로드되지 않았습니다.");
    return;
  }

  // 네트워크 트래픽 데이터 (예시)
  const networkData = {
    labels: [
      "00:00",
      "02:00",
      "04:00",
      "06:00",
      "08:00",
      "10:00",
      "12:00",
      "14:00",
      "16:00",
      "18:00",
      "20:00",
      "22:00",
    ],
    datasets: [
      {
        label: "입력 (MB/s)",
        data: [12, 8, 15, 22, 18, 25, 30, 28, 35, 42, 38, 45],
        borderColor: "#059669",
        backgroundColor: "rgba(5, 150, 105, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "출력 (MB/s)",
        data: [8, 12, 10, 18, 15, 22, 28, 25, 32, 38, 35, 42],
        borderColor: "#d97706",
        backgroundColor: "rgba(217, 119, 6, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  new Chart(ctx, {
    type: "line",
    data: networkData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            usePointStyle: true,
            padding: 20,
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(0, 0, 0, 0.1)",
          },
        },
      },
      elements: {
        point: {
          radius: 4,
          hoverRadius: 6,
        },
      },
    },
  });
}

function initDiskIoChart() {
  const ctx = document.getElementById("diskIoChart");
  if (!ctx) return;

  if (typeof Chart === "undefined") {
    console.error("Chart.js가 로드되지 않았습니다.");
    return;
  }

  // 디스크 I/O 데이터 (예시)
  const diskData = {
    labels: [
      "00:00",
      "02:00",
      "04:00",
      "06:00",
      "08:00",
      "10:00",
      "12:00",
      "14:00",
      "16:00",
      "18:00",
      "20:00",
      "22:00",
    ],
    datasets: [
      {
        label: "읽기 (IOPS)",
        data: [45, 38, 52, 48, 65, 72, 68, 75, 82, 78, 85, 92],
        borderColor: "#0891b2",
        backgroundColor: "rgba(8, 145, 178, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "쓰기 (IOPS)",
        data: [32, 28, 38, 42, 48, 55, 52, 58, 65, 62, 68, 75],
        borderColor: "#dc2626",
        backgroundColor: "rgba(220, 38, 38, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  new Chart(ctx, {
    type: "line",
    data: diskData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            usePointStyle: true,
            padding: 20,
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(0, 0, 0, 0.1)",
          },
        },
      },
      elements: {
        point: {
          radius: 4,
          hoverRadius: 6,
        },
      },
    },
  });
}

function initResponseTimeChart() {
  const ctx = document.getElementById("responseTimeChart");
  if (!ctx) return;

  if (typeof Chart === "undefined") {
    console.error("Chart.js가 로드되지 않았습니다.");
    return;
  }

  // 응답 시간 데이터 (예시)
  const responseData = {
    labels: [
      "00:00",
      "02:00",
      "04:00",
      "06:00",
      "08:00",
      "10:00",
      "12:00",
      "14:00",
      "16:00",
      "18:00",
      "20:00",
      "22:00",
    ],
    datasets: [
      {
        label: "평균 응답 시간 (ms)",
        data: [120, 95, 110, 85, 105, 90, 115, 100, 125, 95, 110, 88],
        borderColor: "#059669",
        backgroundColor: "rgba(5, 150, 105, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  new Chart(ctx, {
    type: "line",
    data: responseData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(0, 0, 0, 0.1)",
          },
        },
      },
      elements: {
        point: {
          radius: 4,
          hoverRadius: 6,
        },
      },
    },
  });
}

function initRequestStatusChart() {
  const ctx = document.getElementById("requestStatusChart");
  if (!ctx) return;

  if (typeof Chart === "undefined") {
    console.error("Chart.js가 로드되지 않았습니다.");
    return;
  }

  // 요청 상태 분포 데이터 (예시)
  const statusData = {
    labels: ["2xx", "3xx", "4xx", "5xx"],
    datasets: [
      {
        data: [85, 8, 5, 2],
        backgroundColor: [
          "#059669", // 2xx - 성공
          "#0891b2", // 3xx - 리다이렉트
          "#d97706", // 4xx - 클라이언트 오류
          "#dc2626", // 5xx - 서버 오류
        ],
        borderColor: ["#047857", "#0e7490", "#b45309", "#b91c1c"],
        borderWidth: 2,
      },
    ],
  };

  new Chart(ctx, {
    type: "doughnut",
    data: statusData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            padding: 20,
          },
        },
      },
      cutout: "60%",
    },
  });
}

// DOM 로드 완료 시 초기화
// HTML 문서가 완전히 로드된 후 애플리케이션을 초기화합니다.
document.addEventListener("DOMContentLoaded", init);
