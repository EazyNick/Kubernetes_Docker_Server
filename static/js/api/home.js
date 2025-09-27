/**
 * 홈/대시보드 페이지 API 모듈
 * 홈 페이지와 대시보드 페이지의 실시간 데이터와 차트를 관리
 */

// 홈 API 네임스페이스
window.HomeAPI = {
  // 대시보드 차트 관련 변수들
  cpuChart: null,
  memoryChart: null,
  networkChart: null,
  diskChart: null,

  /**
   * 홈 페이지 초기화 (차트 없음)
   */
  initHome() {
    console.log("🏠 홈 페이지 로드됨 - 데이터 요청 시작");

    // 기존 StatsAPI 방식 사용
    if (window.StatsAPI) {
      window.StatsAPI.updateRealTimeData();

      // 30초마다 데이터 자동 새로고침
      setInterval(() => {
        console.log("🔄 홈 페이지 데이터 자동 새로고침");
        window.StatsAPI.updateRealTimeData();
      }, 30000);
    } else {
      console.error("❌ StatsAPI를 찾을 수 없습니다.");
    }
  },

  /**
   * CPU 사용률 차트 초기화
   */
  initCpuChart() {
    const ctx = document.getElementById("cpuChart");
    if (!ctx) return;

    if (typeof Chart === "undefined") return;

    this.cpuChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: this.generateTimeLabels(12),
        datasets: [
          {
            label: "CPU 사용률 (%)",
            data: this.generateRandomData(12, 20, 80),
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
  },

  /**
   * 메모리 사용률 차트 초기화
   */
  initMemoryChart() {
    const ctx = document.getElementById("memoryChart");
    if (!ctx) return;

    if (typeof Chart === "undefined") return;

    this.memoryChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: this.generateTimeLabels(12),
        datasets: [
          {
            label: "메모리 사용률 (%)",
            data: this.generateRandomData(12, 40, 90),
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
  },

  /**
   * 네트워크 트래픽 차트 초기화
   */
  initNetworkChart() {
    const ctx = document.getElementById("networkChart");
    if (!ctx) return;

    if (typeof Chart === "undefined") return;

    this.networkChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: this.generateTimeLabels(12),
        datasets: [
          {
            label: "네트워크 트래픽 (MB/s)",
            data: this.generateRandomData(12, 10, 200),
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
  },

  /**
   * 디스크 I/O 차트 초기화
   */
  initDiskChart() {
    const ctx = document.getElementById("diskChart");
    if (!ctx) return;

    if (typeof Chart === "undefined") return;

    this.diskChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: this.generateTimeLabels(12),
        datasets: [
          {
            label: "디스크 I/O (MB/s)",
            data: this.generateRandomData(12, 5, 100),
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
  },

  /**
   * 시간 라벨 생성
   */
  generateTimeLabels(count) {
    const labels = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 5 * 60000); // 5분 간격
      labels.push(
        time.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
      );
    }
    return labels;
  },

  /**
   * 랜덤 데이터 생성
   */
  generateRandomData(count, min, max) {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return data;
  },

  /**
   * 차트 데이터 업데이트
   */
  updateCharts() {
    if (this.cpuChart) {
      this.cpuChart.data.datasets[0].data = this.generateRandomData(12, 20, 80);
      this.cpuChart.update("none");
    }

    if (this.memoryChart) {
      this.memoryChart.data.datasets[0].data = this.generateRandomData(
        12,
        40,
        90
      );
      this.memoryChart.update("none");
    }

    if (this.networkChart) {
      this.networkChart.data.datasets[0].data = this.generateRandomData(
        12,
        10,
        200
      );
      this.networkChart.update("none");
    }

    if (this.diskChart) {
      this.diskChart.data.datasets[0].data = this.generateRandomData(
        12,
        5,
        100
      );
      this.diskChart.update("none");
    }
  },

  /**
   * 모든 차트 초기화
   */
  initAllCharts() {
    this.initCpuChart();
    this.initMemoryChart();
    this.initNetworkChart();
    this.initDiskChart();
  },

  /**
   * 대시보드 페이지 초기화 (차트가 있는 페이지)
   */
  initDashboard() {
    // DOM이 완전히 로드된 후 차트 초기화
    setTimeout(() => {
      this.initAllCharts();

      // API 로드 확인 후 데이터 로드
      const self = this;
      function waitForAPI() {
        if (window.StatsAPI && window.AlertsAPI) {
          window.StatsAPI.updateDashboardData();
          window.AlertsAPI.loadRecentAlerts();

          // 5초마다 차트 및 데이터 업데이트
          setInterval(() => {
            self.updateCharts();
            window.StatsAPI.updateDashboardData();
            window.AlertsAPI.loadRecentAlerts();
          }, 5000);
        } else {
          setTimeout(waitForAPI, 50);
        }
      }

      waitForAPI();
    }, 100);
  },
};
