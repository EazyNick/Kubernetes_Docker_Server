/**
 * 모니터링 페이지 차트 모듈
 * 모니터링 페이지의 네트워크 트래픽, 디스크 I/O, 응답 시간, 요청 상태 차트를 관리
 */

// 모니터링 차트 네임스페이스
window.MonitoringCharts = {
  /**
   * 네트워크 트래픽 차트 초기화
   * 모니터링 페이지의 네트워크 트래픽 라인 차트를 생성합니다.
   */
  initNetworkTrafficChart() {
    const ctx = document.getElementById("networkTrafficChart");
    if (!ctx) return;

    if (typeof Chart === "undefined") {
      console.error("Chart.js가 로드되지 않았습니다.");
      return;
    }

    // 최근 24시간의 네트워크 트래픽 데이터 생성 (시뮬레이션)
    const labels = [];
    const inputData = [];
    const outputData = [];

    for (let i = 23; i >= 0; i--) {
      const time = new Date();
      time.setHours(time.getHours() - i);
      labels.push(time.getHours() + ":00");
      inputData.push(Math.random() * 100 + 10);
      outputData.push(Math.random() * 80 + 5);
    }

    const chartData = {
      labels: labels,
      datasets: [
        {
          label: "입력 (MB/s)",
          data: inputData,
          borderColor: "#059669",
          backgroundColor: "rgba(5, 150, 105, 0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "출력 (MB/s)",
          data: outputData,
          borderColor: "#d97706",
          backgroundColor: "rgba(217, 119, 6, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    };

    new Chart(ctx, {
      type: "line",
      data: chartData,
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
        elements: {
          point: {
            radius: 4,
            hoverRadius: 6,
          },
        },
      },
    });
  },

  /**
   * 디스크 I/O 차트 초기화
   * 모니터링 페이지의 디스크 I/O 라인 차트를 생성합니다.
   */
  initDiskIoChart() {
    const ctx = document.getElementById("diskIoChart");
    if (!ctx) return;

    if (typeof Chart === "undefined") {
      console.error("Chart.js가 로드되지 않았습니다.");
      return;
    }

    // 최근 24시간의 디스크 I/O 데이터 생성 (시뮬레이션)
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

    const chartData = {
      labels: labels,
      datasets: [
        {
          label: "읽기 (IOPS)",
          data: readData,
          borderColor: "#0891b2",
          backgroundColor: "rgba(8, 145, 178, 0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "쓰기 (IOPS)",
          data: writeData,
          borderColor: "#dc2626",
          backgroundColor: "rgba(220, 38, 38, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    };

    new Chart(ctx, {
      type: "line",
      data: chartData,
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
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "I/O (IOPS)",
            },
          },
          x: {
            title: {
              display: true,
              text: "시간",
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
  },

  /**
   * 응답 시간 차트 초기화
   * 모니터링 페이지의 응답 시간 라인 차트를 생성합니다.
   */
  initResponseTimeChart() {
    const ctx = document.getElementById("responseTimeChart");
    if (!ctx) return;

    if (typeof Chart === "undefined") {
      console.error("Chart.js가 로드되지 않았습니다.");
      return;
    }

    // 최근 24시간의 응답 시간 데이터 생성 (시뮬레이션)
    const labels = [];
    const responseData = [];

    for (let i = 23; i >= 0; i--) {
      const time = new Date();
      time.setHours(time.getHours() - i);
      labels.push(time.getHours() + ":00");
      responseData.push(Math.random() * 200 + 50);
    }

    const chartData = {
      labels: labels,
      datasets: [
        {
          label: "평균 응답 시간 (ms)",
          data: responseData,
          borderColor: "#059669",
          backgroundColor: "rgba(5, 150, 105, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    };

    new Chart(ctx, {
      type: "line",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
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
        elements: {
          point: {
            radius: 4,
            hoverRadius: 6,
          },
        },
      },
    });
  },

  /**
   * 요청 상태 분포 차트 초기화
   * 모니터링 페이지의 요청 상태별 분포 도넛 차트를 생성합니다.
   */
  initRequestStatusChart() {
    const ctx = document.getElementById("requestStatusChart");
    if (!ctx) return;

    if (typeof Chart === "undefined") {
      console.error("Chart.js가 로드되지 않았습니다.");
      return;
    }

    const chartData = {
      labels: ["2xx", "3xx", "4xx", "5xx"],
      datasets: [
        {
          data: [75, 15, 8, 2],
          backgroundColor: [
            "#059669", // 2xx - 성공
            "#0891b2", // 3xx - 리다이렉트
            "#d97706", // 4xx - 클라이언트 오류
            "#dc2626", // 5xx - 서버 오류
          ],
          borderColor: [
            "#047857", // 2xx
            "#0e7490", // 3xx
            "#b45309", // 4xx
            "#b91c1c", // 5xx
          ],
          borderWidth: 2,
        },
      ],
    };

    new Chart(ctx, {
      type: "doughnut",
      data: chartData,
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
  },

  /**
   * 모든 모니터링 차트 초기화
   */
  initAllCharts() {
    this.initNetworkTrafficChart();
    this.initDiskIoChart();
    this.initResponseTimeChart();
    this.initRequestStatusChart();
  },
};
