/**
 * 노드 페이지 차트 모듈
 * 노드 페이지의 CPU 사용률과 메모리 사용률 바 차트를 관리
 */

// 노드 차트 네임스페이스
window.NodeCharts = {
  /**
   * 노드 CPU 사용률 차트 초기화
   * 노드 페이지의 CPU 사용률 바 차트를 생성합니다.
   */
  initCpuChart() {
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
                  y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                      display: true,
                      text: "CPU 사용률 (%)",
                    },
                  },
                  x: {
                    title: {
                      display: true,
                      text: "노드명",
                    },
                  },
                },
              },
            });
          } else {
            console.error("노드 데이터를 가져올 수 없습니다.");
          }
        } else {
          console.error("NodesAPI가 로드되지 않았습니다.");
        }
      } catch (error) {
        console.error("노드 CPU 차트 생성 중 오류:", error);
      }
    }

    createNodeCpuChart();
  },

  /**
   * 노드 메모리 사용률 차트 초기화
   * 노드 페이지의 메모리 사용률 바 차트를 생성합니다.
   */
  initMemoryChart() {
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
                  y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                      display: true,
                      text: "메모리 사용률 (%)",
                    },
                  },
                  x: {
                    title: {
                      display: true,
                      text: "노드명",
                    },
                  },
                },
              },
            });
          } else {
            console.error("노드 데이터를 가져올 수 없습니다.");
          }
        } else {
          console.error("NodesAPI가 로드되지 않았습니다.");
        }
      } catch (error) {
        console.error("노드 메모리 차트 생성 중 오류:", error);
      }
    }

    createNodeMemoryChart();
  },

  /**
   * 모든 노드 차트 초기화
   */
  initAllCharts() {
    this.initCpuChart();
    this.initMemoryChart();
  },
};
