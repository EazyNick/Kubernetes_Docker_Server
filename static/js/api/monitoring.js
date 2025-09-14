/**
 * 모니터링 API 모듈
 * 차트 데이터와 성능 메트릭을 관리
 */

// 모니터링 API 네임스페이스
window.MonitoringAPI = {
  /**
   * 네트워크 트래픽 데이터 가져오기
   */
  async getNetworkTrafficData() {
    try {
      const response = await fetch("/api/monitoring/network-traffic");
      if (!response.ok) throw new Error("Network response was not ok");
      const result = await response.json();
      return result.success ? result.data : this.getMockNetworkTrafficData();
    } catch (error) {
      console.error("Error fetching network traffic data:", error);
      return this.getMockNetworkTrafficData();
    }
  },

  /**
   * 디스크 I/O 데이터 가져오기
   */
  async getDiskIoData() {
    try {
      const response = await fetch("/api/monitoring/disk-io");
      if (!response.ok) throw new Error("Network response was not ok");
      const result = await response.json();
      return result.success ? result.data : this.getMockDiskIoData();
    } catch (error) {
      console.error("Error fetching disk I/O data:", error);
      return this.getMockDiskIoData();
    }
  },

  /**
   * 응답 시간 데이터 가져오기
   */
  async getResponseTimeData() {
    try {
      const response = await fetch("/api/monitoring/response-time");
      if (!response.ok) throw new Error("Network response was not ok");
      const result = await response.json();
      return result.success ? result.data : this.getMockResponseTimeData();
    } catch (error) {
      console.error("Error fetching response time data:", error);
      return this.getMockResponseTimeData();
    }
  },

  /**
   * 요청 상태 분포 데이터 가져오기
   */
  async getRequestStatusData() {
    try {
      const response = await fetch("/api/monitoring/request-status");
      if (!response.ok) throw new Error("Network response was not ok");
      const result = await response.json();
      return result.success ? result.data : this.getMockRequestStatusData();
    } catch (error) {
      console.error("Error fetching request status data:", error);
      return this.getMockRequestStatusData();
    }
  },

  /**
   * 모든 모니터링 메트릭 가져오기
   */
  async getMetrics() {
    try {
      const [networkData, diskData, responseData, statusData] =
        await Promise.all([
          this.getNetworkTrafficData(),
          this.getDiskIoData(),
          this.getResponseTimeData(),
          this.getRequestStatusData(),
        ]);

      return {
        networkTraffic: networkData,
        diskIo: diskData,
        responseTime: responseData,
        requestStatus: statusData,
      };
    } catch (error) {
      console.error("Error fetching monitoring metrics:", error);
      return null;
    }
  },

  // Mock 데이터 생성 함수들
  getMockNetworkTrafficData() {
    const labels = [];
    const rxData = [];
    const txData = [];

    // 최근 24시간 데이터 생성
    for (let i = 23; i >= 0; i--) {
      const time = new Date();
      time.setHours(time.getHours() - i);
      labels.push(time.getHours() + ":00");
      rxData.push(Math.random() * 100 + 10);
      txData.push(Math.random() * 80 + 5);
    }

    return {
      labels,
      datasets: [
        {
          label: "수신 (MB/s)",
          data: rxData,
          borderColor: "#4CAF50",
          backgroundColor: "rgba(76, 175, 80, 0.1)",
          tension: 0.4,
        },
        {
          label: "송신 (MB/s)",
          data: txData,
          borderColor: "#2196F3",
          backgroundColor: "rgba(33, 150, 243, 0.1)",
          tension: 0.4,
        },
      ],
    };
  },

  getMockDiskIoData() {
    const labels = [];
    const readData = [];
    const writeData = [];

    for (let i = 23; i >= 0; i--) {
      const time = new Date();
      time.setHours(time.getHours() - i);
      labels.push(time.getHours() + ":00");
      readData.push(Math.random() * 50 + 5);
      writeData.push(Math.random() * 30 + 3);
    }

    return {
      labels,
      datasets: [
        {
          label: "읽기 (MB/s)",
          data: readData,
          borderColor: "#FF9800",
          backgroundColor: "rgba(255, 152, 0, 0.1)",
          tension: 0.4,
        },
        {
          label: "쓰기 (MB/s)",
          data: writeData,
          borderColor: "#9C27B0",
          backgroundColor: "rgba(156, 39, 176, 0.1)",
          tension: 0.4,
        },
      ],
    };
  },

  getMockResponseTimeData() {
    const services = [
      "API Gateway",
      "User Service",
      "Order Service",
      "Payment Service",
      "Notification Service",
    ];
    const labels = [];
    const datasets = services.map((service, index) => {
      const data = [];
      for (let i = 23; i >= 0; i--) {
        data.push(Math.random() * 200 + 50 + index * 20);
      }
      return {
        label: service,
        data: data,
        borderColor: `hsl(${index * 60}, 70%, 50%)`,
        backgroundColor: `hsla(${index * 60}, 70%, 50%, 0.1)`,
        tension: 0.4,
      };
    });

    // 시간 라벨 생성
    for (let i = 23; i >= 0; i--) {
      const time = new Date();
      time.setHours(time.getHours() - i);
      labels.push(time.getHours() + ":00");
    }

    return {
      labels,
      datasets,
    };
  },

  getMockRequestStatusData() {
    return {
      labels: ["2xx", "3xx", "4xx", "5xx"],
      datasets: [
        {
          data: [75, 15, 8, 2],
          backgroundColor: [
            "#4CAF50", // 2xx - 성공
            "#2196F3", // 3xx - 리다이렉트
            "#FF9800", // 4xx - 클라이언트 에러
            "#F44336", // 5xx - 서버 에러
          ],
          borderWidth: 2,
          borderColor: "#fff",
        },
      ],
    };
  },
};

// 차트 초기화 함수들
window.MonitoringCharts = {
  networkTrafficChart: null,
  diskIoChart: null,
  responseTimeChart: null,
  requestStatusChart: null,

  /**
   * 네트워크 트래픽 차트 초기화
   */
  initNetworkTrafficChart(data) {
    const ctx = document.getElementById("networkTrafficChart");
    if (!ctx) return;

    if (this.networkTrafficChart) {
      this.networkTrafficChart.destroy();
    }

    this.networkTrafficChart = new Chart(ctx, {
      type: "line",
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "트래픽 (MB/s)",
            },
          },
          x: {
            title: {
              display: true,
              text: "시간",
            },
          },
        },
      },
    });
  },

  /**
   * 디스크 I/O 차트 초기화
   */
  initDiskIoChart(data) {
    const ctx = document.getElementById("diskIoChart");
    if (!ctx) return;

    if (this.diskIoChart) {
      this.diskIoChart.destroy();
    }

    this.diskIoChart = new Chart(ctx, {
      type: "line",
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "I/O (MB/s)",
            },
          },
          x: {
            title: {
              display: true,
              text: "시간",
            },
          },
        },
      },
    });
  },

  /**
   * 응답 시간 차트 초기화
   */
  initResponseTimeChart(data) {
    const ctx = document.getElementById("responseTimeChart");
    if (!ctx) return;

    if (this.responseTimeChart) {
      this.responseTimeChart.destroy();
    }

    this.responseTimeChart = new Chart(ctx, {
      type: "line",
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "응답시간 (ms)",
            },
          },
          x: {
            title: {
              display: true,
              text: "시간",
            },
          },
        },
      },
    });
  },

  /**
   * 요청 상태 분포 차트 초기화
   */
  initRequestStatusChart(data) {
    const ctx = document.getElementById("requestStatusChart");
    if (!ctx) return;

    if (this.requestStatusChart) {
      this.requestStatusChart.destroy();
    }

    this.requestStatusChart = new Chart(ctx, {
      type: "doughnut",
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
          },
          title: {
            display: false,
          },
        },
      },
    });
  },

  /**
   * 모든 차트 초기화
   */
  async initAllCharts() {
    try {
      const metrics = await window.MonitoringAPI.getMetrics();
      if (!metrics) return;

      this.initNetworkTrafficChart(metrics.networkTraffic);
      this.initDiskIoChart(metrics.diskIo);
      this.initResponseTimeChart(metrics.responseTime);
      this.initRequestStatusChart(metrics.requestStatus);
    } catch (error) {
      console.error("Error initializing charts:", error);
    }
  },
};
