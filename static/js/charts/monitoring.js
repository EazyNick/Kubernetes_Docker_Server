/**
 * 모니터링 페이지 차트 모듈
 * 모니터링 페이지의 네트워크 트래픽, 디스크 I/O, 응답 시간, 요청 상태 차트를 관리
 */

// CSS 변수 가져오기 유틸리티 함수
const getCSSVariable = (variable) =>
  getComputedStyle(document.documentElement).getPropertyValue(variable).trim();

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

    // API에서 데이터를 가져와서 차트를 초기화
    if (window.MonitoringAPI) {
      window.MonitoringAPI.getNetworkTrafficData().then((data) => {
        if (data) {
          this.createNetworkTrafficChart(ctx, data);
        } else {
          ctx.innerHTML =
            '<div class="text-center text-muted py-4">데이터를 불러올 수 없습니다.</div>';
        }
      });
    } else {
      ctx.innerHTML =
        '<div class="text-center text-muted py-4">API를 사용할 수 없습니다.</div>';
    }
  },

  createNetworkTrafficChart(ctx, data) {
    // API에서 받은 데이터에 스타일 적용
    const styledDatasets = data.datasets.map((dataset, index) => {
      const colors = [
        {
          border: getCSSVariable("--chart-network-rx-color"),
          background: getCSSVariable("--chart-network-rx-bg"),
        },
        {
          border: getCSSVariable("--chart-network-tx-color"),
          background: getCSSVariable("--chart-network-tx-bg"),
        },
      ];

      return {
        ...dataset,
        borderColor: colors[index]?.border || "#666666",
        backgroundColor:
          colors[index]?.background || "rgba(102, 102, 102, 0.1)",
        borderWidth: parseInt(getCSSVariable("--chart-border-width")),
        pointRadius: parseInt(getCSSVariable("--chart-point-radius")),
        pointBackgroundColor: colors[index]?.border || "#666666",
        pointBorderColor: colors[index]?.border || "#666666",
        fill: false,
        tension: parseFloat(getCSSVariable("--chart-tension")),
        showLine: true,
      };
    });

    const chartData = {
      labels: data.labels,
      datasets: styledDatasets,
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

    // API에서 데이터를 가져와서 차트를 초기화
    if (window.MonitoringAPI) {
      window.MonitoringAPI.getDiskIoData().then((data) => {
        if (data) {
          this.createDiskIoChart(ctx, data);
        } else {
          ctx.innerHTML =
            '<div class="text-center text-muted py-4">데이터를 불러올 수 없습니다.</div>';
        }
      });
    } else {
      ctx.innerHTML =
        '<div class="text-center text-muted py-4">API를 사용할 수 없습니다.</div>';
    }
  },

  createDiskIoChart(ctx, data) {
    // API에서 받은 데이터에 스타일 적용
    const styledDatasets = data.datasets.map((dataset, index) => {
      const colors = [
        {
          border: getCSSVariable("--chart-disk-read-color"),
          background: getCSSVariable("--chart-disk-read-bg"),
        },
        {
          border: getCSSVariable("--chart-disk-write-color"),
          background: getCSSVariable("--chart-disk-write-bg"),
        },
      ];

      return {
        ...dataset,
        borderColor: colors[index]?.border || "#666666",
        backgroundColor:
          colors[index]?.background || "rgba(102, 102, 102, 0.1)",
        tension: parseFloat(getCSSVariable("--chart-tension")),
        fill: true,
      };
    });

    const chartData = {
      labels: data.labels,
      datasets: styledDatasets,
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

    // API에서 데이터를 가져와서 차트를 초기화
    if (window.MonitoringAPI) {
      window.MonitoringAPI.getResponseTimeData().then((data) => {
        if (data) {
          this.createResponseTimeChart(ctx, data);
        } else {
          ctx.innerHTML =
            '<div class="text-center text-muted py-4">데이터를 불러올 수 없습니다.</div>';
        }
      });
    } else {
      ctx.innerHTML =
        '<div class="text-center text-muted py-4">API를 사용할 수 없습니다.</div>';
    }
  },

  createResponseTimeChart(ctx, data) {
    // API에서 받은 데이터에 스타일 적용
    const serviceColors = [
      getCSSVariable("--chart-service-1-color"),
      getCSSVariable("--chart-service-2-color"),
      getCSSVariable("--chart-service-3-color"),
      getCSSVariable("--chart-service-4-color"),
      getCSSVariable("--chart-service-5-color"),
    ];

    const styledDatasets = data.datasets.map((dataset, index) => {
      const color = serviceColors[index % serviceColors.length];
      return {
        ...dataset,
        borderColor: color,
        backgroundColor: color.replace("rgb", "rgba").replace(")", ", 0.1)"),
        tension: parseFloat(getCSSVariable("--chart-tension")),
        fill: false,
      };
    });

    const chartData = {
      labels: data.labels,
      datasets: styledDatasets,
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

    // API에서 데이터를 가져와서 차트를 초기화
    if (window.MonitoringAPI) {
      window.MonitoringAPI.getRequestStatusData().then((data) => {
        if (data) {
          this.createRequestStatusChart(ctx, data);
        } else {
          ctx.innerHTML =
            '<div class="text-center text-muted py-4">데이터를 불러올 수 없습니다.</div>';
        }
      });
    } else {
      ctx.innerHTML =
        '<div class="text-center text-muted py-4">API를 사용할 수 없습니다.</div>';
    }
  },

  createRequestStatusChart(ctx, data) {
    // API에서 받은 데이터에 스타일 적용
    const colors = {
      backgroundColor: [
        getCSSVariable("--chart-status-2xx-bg"),
        getCSSVariable("--chart-status-3xx-bg"),
        getCSSVariable("--chart-status-4xx-bg"),
        getCSSVariable("--chart-status-5xx-bg"),
      ],
      borderColor: getCSSVariable("--chart-border-color"),
    };

    const chartData = {
      labels: data.labels,
      datasets: [
        {
          data: data.data,
          backgroundColor: colors.backgroundColor,
          borderColor: "#fff",
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
