/**
 * 이벤트 페이지 차트 모듈
 * 이벤트 페이지의 이벤트 발생 추이 라인 차트와 이벤트 타입 분포 도넛 차트를 관리
 */

// 이벤트 차트 네임스페이스
window.EventCharts = {
  /**
   * 이벤트 트렌드 차트 초기화
   * 이벤트 페이지의 이벤트 발생 트렌드 라인 차트를 생성합니다.
   */
  initTrendChart() {
    const ctx = document.getElementById("eventTrendChart");
    if (!ctx) return;

    if (typeof Chart === "undefined") {
      console.error("Chart.js가 로드되지 않았습니다.");
      return;
    }

    // 최근 24시간의 이벤트 데이터 생성 (시뮬레이션)
    const labels = [];
    const eventData = [];

    for (let i = 23; i >= 0; i--) {
      const time = new Date();
      time.setHours(time.getHours() - i);
      labels.push(time.getHours() + ":00");
      eventData.push(Math.floor(Math.random() * 50) + 10);
    }

    const chartData = {
      labels: labels,
      datasets: [
        {
          label: "이벤트 수",
          data: eventData,
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
              text: "이벤트 수",
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
   * 이벤트 타입 분포 차트 초기화
   * 이벤트 페이지의 이벤트 타입별 분포 도넛 차트를 생성합니다.
   */
  initTypeChart() {
    const ctx = document.getElementById("eventTypeChart");
    if (!ctx) return;

    if (typeof Chart === "undefined") {
      console.error("Chart.js가 로드되지 않았습니다.");
      return;
    }

    const chartData = {
      labels: ["정상", "경고", "오류", "정보"],
      datasets: [
        {
          data: [45, 25, 15, 15],
          backgroundColor: [
            "#059669", // 정상 - 녹색
            "#d97706", // 경고 - 주황색
            "#dc2626", // 오류 - 빨간색
            "#0891b2", // 정보 - 파란색
          ],
          borderColor: [
            "#047857", // 정상
            "#b45309", // 경고
            "#b91c1c", // 오류
            "#0e7490", // 정보
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
   * 모든 이벤트 차트 초기화
   */
  initAllCharts() {
    this.initTrendChart();
    this.initTypeChart();
  },
};
