// 현대적인 색상 팔레트
const colors = {
  primary: "#2563eb",
  primaryLight: "rgba(37, 99, 235, 0.1)",
  success: "#059669",
  successLight: "rgba(5, 150, 105, 0.1)",
  warning: "#d97706",
  warningLight: "rgba(217, 119, 6, 0.1)",
  danger: "#dc2626",
  dangerLight: "rgba(220, 38, 38, 0.1)",
  info: "#0891b2",
  infoLight: "rgba(8, 145, 178, 0.1)",
  gray: "#6b7280",
  grayLight: "rgba(107, 114, 128, 0.1)",
};

// Chart.js 기본 설정
Chart.defaults.font.family =
  'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
Chart.defaults.font.size = 12;
Chart.defaults.color = "#6b7280";
Chart.defaults.borderColor = "#e5e7eb";
Chart.defaults.backgroundColor = "#f9fafb";

// 글로벌 변수
let charts = {};
let updateInterval;

// DOM 요소들
const sidebarToggle = document.getElementById("sidebarToggle");
const sidebar = document.getElementById("sidebar");
const mainContent = document.getElementById("mainContent");
const navItems = document.querySelectorAll(".sidebar-nav-item");
const tabContents = document.querySelectorAll(".tab-content");

// 사이드바 토글 기능
sidebarToggle.addEventListener("click", function () {
  sidebar.classList.toggle("sidebar-collapsed");
  mainContent.classList.toggle("content-expanded");
});

// 네비게이션 링크는 기본 동작(페이지 이동)을 사용하므로 별도 이벤트 리스너 불필요
// 기존 탭 전환 로직은 제거하고 페이지별 차트 초기화만 사용

// 차트 초기화 함수
function initializeCharts() {
  // CPU 추이 차트
  const cpuTrendCtx = document.getElementById("cpuTrendChart");
  if (cpuTrendCtx && !charts.cpuTrend) {
    const timeLabels = generateTimeLabels(120, 1); // 최근 2시간
    const cpuData = generateRandomData(120, 25, 45);

    charts.cpuTrend = new Chart(cpuTrendCtx, {
      type: "line",
      data: {
        labels: timeLabels,
        datasets: [
          {
            label: "CPU 사용률",
            data: cpuData,
            borderColor: colors.primary,
            backgroundColor: colors.primaryLight,
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 4,
          },
        ],
      },
      options: getChartOptions("CPU 사용률 (%)"),
    });
  }

  // 메모리 추이 차트
  const memoryTrendCtx = document.getElementById("memoryTrendChart");
  if (memoryTrendCtx && !charts.memoryTrend) {
    const timeLabels = generateTimeLabels(120, 1);
    const memoryData = generateRandomData(120, 55, 75);

    charts.memoryTrend = new Chart(memoryTrendCtx, {
      type: "line",
      data: {
        labels: timeLabels,
        datasets: [
          {
            label: "메모리 사용률",
            data: memoryData,
            borderColor: colors.warning,
            backgroundColor: colors.warningLight,
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 4,
          },
        ],
      },
      options: getChartOptions("메모리 사용률 (%)"),
    });
  }

  // 노드 분포 차트
  const nodeDistributionCtx = document.getElementById("nodeDistributionChart");
  if (nodeDistributionCtx && !charts.nodeDistribution) {
    charts.nodeDistribution = new Chart(nodeDistributionCtx, {
      type: "doughnut",
      data: {
        labels: [
          "k8s-node-01",
          "k8s-node-02",
          "k8s-node-03",
          "k8s-node-04",
          "docker-host-01",
        ],
        datasets: [
          {
            data: [34, 28, 21, 19, 15],
            backgroundColor: [
              colors.primary,
              colors.success,
              colors.warning,
              colors.info,
              colors.danger,
            ],
            borderWidth: 3,
            borderColor: "#ffffff",
            hoverBorderWidth: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 11,
              },
            },
          },
        },
      },
    });
  }

  // 엔진 분포 차트
  const engineCtx = document.getElementById("engineChart");
  if (engineCtx && !charts.engine) {
    charts.engine = new Chart(engineCtx, {
      type: "pie",
      data: {
        labels: ["Kubernetes", "Docker", "Containerd"],
        datasets: [
          {
            data: [78, 35, 12],
            backgroundColor: [colors.primary, colors.info, colors.success],
            borderWidth: 3,
            borderColor: "#ffffff",
            hoverBorderWidth: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 11,
              },
            },
          },
        },
      },
    });
  }
}

// 차트 옵션 생성 헬퍼 함수
function getChartOptions(yAxisLabel) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index",
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function (value) {
            return value + "%";
          },
        },
        grid: {
          color: "#f3f4f6",
        },
      },
      x: {
        ticks: {
          maxTicksLimit: 10,
        },
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        cornerRadius: 8,
        padding: 12,
      },
    },
  };
}

// 시간 레이블 생성 함수
function generateTimeLabels(count, intervalMinutes) {
  const labels = [];
  for (let i = count - 1; i >= 0; i--) {
    const time = new Date(Date.now() - i * intervalMinutes * 60000);
    labels.push(
      time.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    );
  }
  return labels;
}

// 랜덤 데이터 생성 함수
function generateRandomData(count, min, max) {
  const data = [];
  let prev = (min + max) / 2;
  for (let i = 0; i < count; i++) {
    // 이전 값과 연관성을 가진 랜덤 데이터 생성
    const change = (Math.random() - 0.5) * 10;
    prev = Math.max(min, Math.min(max, prev + change));
    data.push(Math.round(prev * 10) / 10);
  }
  return data;
}

// 실시간 데이터 업데이트 함수
function updateRealTimeData() {
  // 메트릭 카드 업데이트
  updateMetricCards();

  // 차트 데이터 업데이트
  updateChartData();

  // 로그 업데이트
  updateLogs();

  // 마지막 업데이트 시간 갱신
  document.getElementById("lastUpdate").textContent =
    new Date().toLocaleTimeString("ko-KR");
}

// 메트릭 카드 업데이트
function updateMetricCards() {
  const metrics = {
    totalContainers: { min: 140, max: 155, current: 147 },
    runningContainers: { min: 125, max: 145, current: 134 },
    stoppedContainers: { min: 5, max: 15, current: 8 },
    failedContainers: { min: 2, max: 8, current: 5 },
    totalNodes: { min: 12, max: 12, current: 12 },
    avgCpu: { min: 30, max: 45, current: 34.7 },
  };

  Object.keys(metrics).forEach((key) => {
    const element = document.getElementById(key);
    if (element) {
      const metric = metrics[key];
      const change = (Math.random() - 0.5) * 5;
      let newValue = metric.current + change;
      newValue = Math.max(metric.min, Math.min(metric.max, newValue));

      if (key === "avgCpu") {
        element.textContent = newValue.toFixed(1) + "%";
      } else {
        element.textContent = Math.round(newValue);
      }
      metrics[key].current = newValue;
    }
  });
}

// 차트 데이터 업데이트
function updateChartData() {
  Object.keys(charts).forEach((chartKey) => {
    const chart = charts[chartKey];
    if (
      chart &&
      chart.data &&
      chart.data.datasets[0] &&
      chart.data.datasets[0].data
    ) {
      const dataset = chart.data.datasets[0];

      if (chartKey === "cpuTrend" || chartKey === "memoryTrend") {
        // 시계열 차트의 경우 새 데이터 포인트 추가 및 오래된 데이터 제거
        const newValue =
          chartKey === "cpuTrend"
            ? Math.random() * 20 + 25
            : Math.random() * 15 + 55;

        dataset.data.push(Math.round(newValue * 10) / 10);
        dataset.data.shift();

        // 시간 레이블 업데이트
        const now = new Date();
        chart.data.labels.push(
          now.toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        );
        chart.data.labels.shift();

        chart.update("none");
      }
    }
  });
}

// 로그 업데이트
function updateLogs() {
  const logContainer = document.getElementById("logContainer");
  if (logContainer) {
    const logTypes = ["info", "warn", "error"];
    const messages = [
      "Container health check passed",
      "Pod scheduled successfully",
      "Image pull completed",
      "Service endpoint updated",
      "Resource limits exceeded",
      "Connection timeout detected",
      "Backup process completed",
    ];

    const logType = logTypes[Math.floor(Math.random() * logTypes.length)];
    const message = messages[Math.floor(Math.random() * messages.length)];
    const timestamp = new Date().toLocaleTimeString("ko-KR", { hour12: false });

    const logEntry = document.createElement("div");
    logEntry.className = "log-entry";
    logEntry.innerHTML = `
            <span class="log-timestamp">${timestamp}</span>
            <span class="log-level ${logType}">${logType.toUpperCase()}</span>
            <span class="log-message">nginx-web-${
              Math.floor(Math.random() * 10) + 1
            }: ${message}</span>
        `;

    logContainer.insertBefore(logEntry, logContainer.firstChild);

    // 로그가 너무 많으면 오래된 것 제거
    const logEntries = logContainer.querySelectorAll(".log-entry");
    if (logEntries.length > 20) {
      logContainer.removeChild(logContainer.lastChild);
    }
  }
}

// Node Charts 초기화
function initializeNodeCharts() {
  // 노드별 CPU 차트
  const nodeCpuCtx = document.getElementById("nodeCpuChart");
  if (nodeCpuCtx && !charts.nodeCpu) {
    charts.nodeCpu = new Chart(nodeCpuCtx, {
      type: "bar",
      data: {
        labels: [
          "k8s-master-01",
          "k8s-worker-01",
          "k8s-worker-02",
          "docker-host-01",
        ],
        datasets: [
          {
            label: "CPU 사용률 (%)",
            data: [23, 67, 89, 34],
            backgroundColor: [
              colors.success,
              colors.warning,
              colors.danger,
              colors.success,
            ],
            borderRadius: 6,
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
            ticks: {
              callback: function (value) {
                return value + "%";
              },
            },
          },
        },
        plugins: {
          legend: { display: false },
        },
      },
    });
  }

  // 노드별 메모리 차트
  const nodeMemoryCtx = document.getElementById("nodeMemoryChart");
  if (nodeMemoryCtx && !charts.nodeMemory) {
    charts.nodeMemory = new Chart(nodeMemoryCtx, {
      type: "bar",
      data: {
        labels: [
          "k8s-master-01",
          "k8s-worker-01",
          "k8s-worker-02",
          "docker-host-01",
        ],
        datasets: [
          {
            label: "메모리 사용률 (%)",
            data: [45, 78, 91, 56],
            backgroundColor: [
              colors.warning,
              colors.danger,
              colors.danger,
              colors.warning,
            ],
            borderRadius: 6,
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
            ticks: {
              callback: function (value) {
                return value + "%";
              },
            },
          },
        },
        plugins: {
          legend: { display: false },
        },
      },
    });
  }
}

// Monitoring Charts 초기화
function initializeMonitoringCharts() {
  // 네트워크 트래픽 차트
  const networkTrafficCtx = document.getElementById("networkTrafficChart");
  if (networkTrafficCtx && !charts.networkTraffic) {
    const timeLabels = generateTimeLabels(30, 2);
    const inboundData = generateRandomData(30, 50, 180); // 최대 180MB/s까지 가능
    const outboundData = generateRandomData(30, 30, 160); // 최대 160MB/s까지 가능

    charts.networkTraffic = new Chart(networkTrafficCtx, {
      type: "line",
      data: {
        labels: timeLabels,
        datasets: [
          {
            label: "Inbound (MB/s)",
            data: inboundData,
            borderColor: colors.primary,
            backgroundColor: colors.primaryLight,
            borderWidth: 2,
            fill: false,
            tension: 0.4,
          },
          {
            label: "Outbound (MB/s)",
            data: outboundData,
            borderColor: colors.warning,
            backgroundColor: colors.warningLight,
            borderWidth: 2,
            fill: false,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: "index",
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 200, // 네트워크 트래픽은 200MB/s까지 표시
            ticks: {
              callback: function (value) {
                return value + " MB/s";
              },
            },
            grid: {
              color: "#f3f4f6",
            },
          },
          x: {
            ticks: {
              maxTicksLimit: 10,
            },
            grid: {
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            position: "top",
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleColor: "#ffffff",
            bodyColor: "#ffffff",
            cornerRadius: 8,
            padding: 12,
          },
        },
      },
    });
  }

  // 디스크 I/O 차트
  const diskIoCtx = document.getElementById("diskIoChart");
  if (diskIoCtx && !charts.diskIo) {
    const timeLabels = generateTimeLabels(30, 2);
    const readData = generateRandomData(30, 20, 60);
    const writeData = generateRandomData(30, 15, 45);

    charts.diskIo = new Chart(diskIoCtx, {
      type: "line",
      data: {
        labels: timeLabels,
        datasets: [
          {
            label: "Read (MB/s)",
            data: readData,
            borderColor: colors.success,
            backgroundColor: colors.successLight,
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 4,
          },
          {
            label: "Write (MB/s)",
            data: writeData,
            borderColor: colors.info,
            backgroundColor: colors.infoLight,
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: "index",
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 80,
            ticks: {
              callback: function (value) {
                return value + " MB/s";
              },
            },
            grid: {
              color: "#f3f4f6",
            },
          },
          x: {
            ticks: {
              maxTicksLimit: 8,
            },
            grid: {
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            position: "top",
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleColor: "#ffffff",
            bodyColor: "#ffffff",
            cornerRadius: 8,
            padding: 12,
          },
        },
      },
    });
  }

  // 응답 시간 차트
  const responseTimeCtx = document.getElementById("responseTimeChart");
  if (responseTimeCtx && !charts.responseTime) {
    const timeLabels = generateTimeLabels(60, 1);
    const apiGatewayData = generateRandomData(60, 50, 200);
    const backendData = generateRandomData(60, 100, 300);
    const databaseData = generateRandomData(60, 20, 150);

    charts.responseTime = new Chart(responseTimeCtx, {
      type: "line",
      data: {
        labels: timeLabels,
        datasets: [
          {
            label: "API Gateway",
            data: apiGatewayData,
            borderColor: colors.primary,
            backgroundColor: colors.primaryLight,
            borderWidth: 2,
            pointRadius: 0,
          },
          {
            label: "Backend Service",
            data: backendData,
            borderColor: colors.warning,
            backgroundColor: colors.warningLight,
            borderWidth: 2,
            pointRadius: 0,
          },
          {
            label: "Database",
            data: databaseData,
            borderColor: colors.success,
            backgroundColor: colors.successLight,
            borderWidth: 2,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: "index",
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 400,
            ticks: {
              callback: function (value) {
                return value + "ms";
              },
            },
            grid: {
              color: "#f3f4f6",
            },
          },
          x: {
            ticks: {
              maxTicksLimit: 12,
            },
            grid: {
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            position: "top",
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleColor: "#ffffff",
            bodyColor: "#ffffff",
            cornerRadius: 8,
            padding: 12,
          },
        },
      },
    });
  }

  // 요청 상태 분포 차트
  const requestStatusCtx = document.getElementById("requestStatusChart");
  if (requestStatusCtx && !charts.requestStatus) {
    charts.requestStatus = new Chart(requestStatusCtx, {
      type: "doughnut",
      data: {
        labels: [
          "2xx Success",
          "3xx Redirect",
          "4xx Client Error",
          "5xx Server Error",
        ],
        datasets: [
          {
            data: [8547, 234, 156, 23],
            backgroundColor: [
              colors.success,
              colors.info,
              colors.warning,
              colors.danger,
            ],
            borderWidth: 3,
            borderColor: "#ffffff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 12,
              usePointStyle: true,
              font: { size: 11 },
              boxWidth: 12,
            },
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleColor: "#ffffff",
            bodyColor: "#ffffff",
            cornerRadius: 8,
            padding: 12,
            callbacks: {
              label: function (context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((context.parsed * 100) / total).toFixed(1);
                return (
                  context.label +
                  ": " +
                  context.parsed.toLocaleString() +
                  " (" +
                  percentage +
                  "%)"
                );
              },
            },
          },
        },
        cutout: "40%",
      },
    });
  }
}

// Alert Charts 초기화
function initializeAlertCharts() {
  const alertTrendCtx = document.getElementById("alertTrendChart");
  if (alertTrendCtx && !charts.alertTrend) {
    const timeLabels = generateTimeLabels(24, 60); // 최근 24시간
    const criticalData = generateRandomData(24, 0, 5);
    const warningData = generateRandomData(24, 5, 15);
    const infoData = generateRandomData(24, 2, 10);

    charts.alertTrend = new Chart(alertTrendCtx, {
      type: "line",
      data: {
        labels: timeLabels,
        datasets: [
          {
            label: "Critical",
            data: criticalData,
            borderColor: colors.danger,
            backgroundColor: colors.dangerLight,
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          },
          {
            label: "Warning",
            data: warningData,
            borderColor: colors.warning,
            backgroundColor: colors.warningLight,
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          },
          {
            label: "Info",
            data: infoData,
            borderColor: colors.info,
            backgroundColor: colors.infoLight,
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
          },
        },
        plugins: {
          legend: {
            position: "top",
          },
        },
      },
    });
  }
}

// Event Charts 초기화
function initializeEventCharts() {
  // 이벤트 발생 추이 차트
  const eventTrendCtx = document.getElementById("eventTrendChart");
  if (eventTrendCtx && !charts.eventTrend) {
    const timeLabels = generateTimeLabels(24, 60); // 최근 24시간
    const normalData = generateRandomData(24, 10, 30);
    const warningData = generateRandomData(24, 2, 8);
    const errorData = generateRandomData(24, 0, 3);

    charts.eventTrend = new Chart(eventTrendCtx, {
      type: "area",
      data: {
        labels: timeLabels,
        datasets: [
          {
            label: "Normal Events",
            data: normalData,
            borderColor: colors.success,
            backgroundColor: colors.successLight,
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          },
          {
            label: "Warning Events",
            data: warningData,
            borderColor: colors.warning,
            backgroundColor: colors.warningLight,
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          },
          {
            label: "Error Events",
            data: errorData,
            borderColor: colors.danger,
            backgroundColor: colors.dangerLight,
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            stacked: true,
          },
        },
        plugins: {
          legend: {
            position: "top",
          },
        },
      },
    });
  }

  // 이벤트 타입 분포 차트
  const eventTypeCtx = document.getElementById("eventTypeChart");
  if (eventTypeCtx && !charts.eventType) {
    charts.eventType = new Chart(eventTypeCtx, {
      type: "doughnut",
      data: {
        labels: [
          "Pod Events",
          "Node Events",
          "Service Events",
          "Deployment Events",
          "System Events",
        ],
        datasets: [
          {
            data: [35, 6, 8, 12, 6],
            backgroundColor: [
              colors.primary,
              colors.success,
              colors.info,
              colors.warning,
              colors.gray,
            ],
            borderWidth: 3,
            borderColor: "#ffffff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 15,
              usePointStyle: true,
              font: { size: 10 },
            },
          },
        },
      },
    });
  }
}

// DataTable 초기화
function initializeDataTable() {
  // 컨테이너 테이블
  const containersTable = $("#containersTable");
  if (
    containersTable.length &&
    !$.fn.DataTable.isDataTable("#containersTable")
  ) {
    containersTable.DataTable({
      pageLength: 10,
      responsive: true,
      language: {
        url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/ko.json",
      },
      columnDefs: [{ orderable: false, targets: [7] }],
    });
  }

  // 노드 테이블
  const nodesTable = $("#nodesTable");
  if (nodesTable.length && !$.fn.DataTable.isDataTable("#nodesTable")) {
    nodesTable.DataTable({
      pageLength: 10,
      responsive: true,
      language: {
        url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/ko.json",
      },
      columnDefs: [{ orderable: false, targets: [8] }],
    });
  }

  // 알림 테이블
  const alertsTable = $("#alertsTable");
  if (alertsTable.length && !$.fn.DataTable.isDataTable("#alertsTable")) {
    alertsTable.DataTable({
      pageLength: 10,
      responsive: true,
      order: [[4, "desc"]],
      language: {
        url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/ko.json",
      },
      columnDefs: [{ orderable: false, targets: [6] }],
    });
  }

  // 이벤트 테이블
  const eventsTable = $("#eventsTable");
  if (eventsTable.length && !$.fn.DataTable.isDataTable("#eventsTable")) {
    eventsTable.DataTable({
      pageLength: 15,
      responsive: true,
      order: [[0, "desc"]],
      language: {
        url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/ko.json",
      },
    });
  }
}

// 반응형 처리
function handleResize() {
  if (window.innerWidth <= 768) {
    sidebar.classList.add("sidebar-collapsed");
    mainContent.classList.add("content-expanded");
  } else {
    sidebar.classList.remove("sidebar-collapsed");
    mainContent.classList.remove("content-expanded");
  }
}

// 페이지별 차트 초기화 함수
function initializePageCharts() {
  const currentPath = window.location.pathname;

  if (currentPath === "/" || currentPath === "/dashboard") {
    setTimeout(initializeCharts, 100);
  } else if (currentPath === "/nodes") {
    setTimeout(initializeNodeCharts, 100);
  } else if (currentPath === "/monitoring") {
    setTimeout(initializeMonitoringCharts, 100);
  } else if (currentPath === "/alerts") {
    setTimeout(initializeAlertCharts, 100);
  } else if (currentPath === "/events") {
    setTimeout(initializeEventCharts, 100);
  }
}

// 초기화
document.addEventListener("DOMContentLoaded", function () {
  // 페이지별 차트 초기화
  initializePageCharts();

  // DataTable 초기화
  setTimeout(initializeDataTable, 200);

  // 실시간 업데이트 시작
  updateInterval = setInterval(updateRealTimeData, 5000);

  // 초기 데이터 업데이트
  updateRealTimeData();

  // 반응형 처리
  window.addEventListener("resize", handleResize);
  handleResize(); // 초기 호출
});

// 페이지 언로드 시 인터벌 정리
window.addEventListener("beforeunload", function () {
  if (updateInterval) {
    clearInterval(updateInterval);
  }
});
