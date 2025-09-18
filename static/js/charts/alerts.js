/**
 * 알림 페이지 차트 모듈
 * 알림 페이지의 알림 발생 추이 라인 차트를 관리
 */

// 알림 차트 네임스페이스
window.AlertCharts = {
  /**
   * 알림 트렌드 차트 초기화
   * 알림 페이지의 알림 발생 트렌드 라인 차트를 생성합니다.
   */
  initTrendChart() {
    const ctx = document.getElementById("alertTrendChart");
    if (!ctx) return;

    if (typeof Chart === "undefined") {
      console.error("Chart.js가 로드되지 않았습니다.");
      return;
    }

    // 최근 7일간의 알림 데이터 생성 (시뮬레이션)
    const labels = [];
    const criticalData = [];
    const warningData = [];
    const infoData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(
        date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
      );

      // 랜덤 데이터 생성
      criticalData.push(Math.floor(Math.random() * 10));
      warningData.push(Math.floor(Math.random() * 20) + 5);
      infoData.push(Math.floor(Math.random() * 30) + 10);
    }

    const chartData = {
      labels: labels,
      datasets: [
        {
          label: "위험 알림",
          data: criticalData,
          borderColor: "#dc2626",
          backgroundColor: "rgba(220, 38, 38, 0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "경고 알림",
          data: warningData,
          borderColor: "#d97706",
          backgroundColor: "rgba(217, 119, 6, 0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "정보 알림",
          data: infoData,
          borderColor: "#0891b2",
          backgroundColor: "rgba(8, 145, 178, 0.1)",
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
              text: "알림 수",
            },
          },
          x: {
            title: {
              display: true,
              text: "날짜",
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
   * 모든 알림 차트 초기화
   */
  initAllCharts() {
    this.initTrendChart();
  },
};
