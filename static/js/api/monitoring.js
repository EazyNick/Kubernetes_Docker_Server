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
      console.log("🌐 [모니터링API] 네트워크 트래픽 데이터 요청 중...");
      const response = await fetch("/api/monitoring/network-traffic");
      if (!response.ok) throw new Error("네트워크 응답이 정상이 아닙니다");
      const result = await response.json();
      console.log("🌐 [모니터링API] 네트워크 트래픽 데이터 응답:", result);
      return result.success ? result.data : this.getMockNetworkTrafficData();
    } catch (error) {
      console.error(
        "❌ [모니터링API] 네트워크 트래픽 데이터 요청 실패:",
        error
      );
      return this.getMockNetworkTrafficData();
    }
  },

  /**
   * 디스크 I/O 데이터 가져오기
   */
  async getDiskIoData() {
    try {
      console.log("💾 [모니터링API] 디스크 I/O 데이터 요청 중...");
      const response = await fetch("/api/monitoring/disk-io");
      if (!response.ok) throw new Error("네트워크 응답이 정상이 아닙니다");
      const result = await response.json();
      console.log("💾 [모니터링API] 디스크 I/O 데이터 응답:", result);
      return result.success ? result.data : this.getMockDiskIoData();
    } catch (error) {
      console.error("❌ [모니터링API] 디스크 I/O 데이터 요청 실패:", error);
      return this.getMockDiskIoData();
    }
  },

  /**
   * 응답 시간 데이터 가져오기
   */
  async getResponseTimeData() {
    try {
      console.log("⏱️ [모니터링API] 응답 시간 데이터 요청 중...");
      const response = await fetch("/api/monitoring/response-time");
      if (!response.ok) throw new Error("네트워크 응답이 정상이 아닙니다");
      const result = await response.json();
      console.log("⏱️ [모니터링API] 응답 시간 데이터 응답:", result);
      return result.success ? result.data : this.getMockResponseTimeData();
    } catch (error) {
      console.error("❌ [모니터링API] 응답 시간 데이터 요청 실패:", error);
      return this.getMockResponseTimeData();
    }
  },

  /**
   * 요청 상태 분포 데이터 가져오기
   */
  async getRequestStatusData() {
    try {
      console.log("📊 [모니터링API] 요청 상태 데이터 요청 중...");
      const response = await fetch("/api/monitoring/request-status");
      if (!response.ok) throw new Error("네트워크 응답이 정상이 아닙니다");
      const result = await response.json();
      console.log("📊 [모니터링API] 요청 상태 데이터 응답:", result);
      return result.success ? result.data : this.getMockRequestStatusData();
    } catch (error) {
      console.error("❌ [모니터링API] 요청 상태 데이터 요청 실패:", error);
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

  /**
   * 모니터링 페이지 데이터 로딩 (간단한 버전)
   */
  async loadMonitoringData() {
    // 원래 HTML의 waitForAPI 로직을 여기서 처리
    const waitForAPI = () => {
      if (window.NodesAPI && typeof window.NodesAPI.getNodes === "function") {
        this.renderMonitoringData();
      } else {
        setTimeout(waitForAPI, 100);
      }
    };
    waitForAPI();
  },

  /**
   * 컨테이너 데이터 로딩 (간단한 버전)
   */
  async loadContainerData() {
    // 원래 HTML의 waitForAPI 로직을 여기서 처리
    const waitForAPI = () => {
      if (
        window.ContainersAPI &&
        typeof window.ContainersAPI.getContainers === "function"
      ) {
        this.renderContainerData();
      } else {
        setTimeout(waitForAPI, 100);
      }
    };
    waitForAPI();
  },

  /**
   * 실제 노드 데이터 렌더링
   */
  async renderMonitoringData() {
    if (!window.NodesAPI) return;

    try {
      console.log("📊 [모니터링API] 노드 데이터 렌더링 시작...");
      const response = await window.NodesAPI.getNodes();
      console.log("📊 [모니터링API] 노드 데이터 응답:", response);
      if (response && response.success) {
        const nodes = response.data.nodes;
        const container = document.getElementById("monitoringNodesContainer");

        if (container) {
          if (nodes.length === 0) {
            container.innerHTML = `
              <div class="col-12 text-center py-4">
                <i class="fas fa-info-circle me-2"></i>
                노드가 없습니다.
              </div>
            `;
            return;
          }

          container.innerHTML = nodes
            .map((node, index) => {
              console.log(`🖥️ [모니터링API] 노드 ${index + 1}:`, {
                name: node.name,
                status: node.status,
                cpu: node.cpu,
                memory: node.memory,
                disk: node.disk,
              });

              const statusInfo = this.getNodeStatusInfo(node.status);
              const cpuColor =
                node.cpu.usage < 30
                  ? "var(--success-color)"
                  : node.cpu.usage < 70
                  ? "var(--warning-color)"
                  : "var(--danger-color)";
              const memoryColor =
                node.memory.usage < 30
                  ? "var(--success-color)"
                  : node.memory.usage < 70
                  ? "var(--warning-color)"
                  : "var(--danger-color)";
              const diskColor =
                node.disk.usage < 30
                  ? "var(--success-color)"
                  : node.disk.usage < 70
                  ? "var(--info-color)"
                  : "var(--warning-color)";

              return `
                <div class="col-md-3 mb-3">
                  <div class="metric-card">
                    <div style="padding: 1rem;">
                      <div class="d-flex justify-content-between align-items-center mb-2">
                        <h6 class="mb-0">${node.name}</h6>
                        <span class="status-badge ${statusInfo.class}">
                          <i class="fas ${statusInfo.icon} me-1"></i>
                          <span class="status-indicator"></span>
                          ${statusInfo.text}
                        </span>
                      </div>
                      <div class="mb-2">
                        <div class="d-flex justify-content-between">
                          <small>CPU</small>
                          <small>${node.cpu.usage}%</small>
                        </div>
                        <div class="progress" style="height: 4px;">
                          <div class="progress-bar" style="width: ${node.cpu.usage}%; background-color: ${cpuColor};"></div>
                        </div>
                      </div>
                      <div class="mb-2">
                        <div class="d-flex justify-content-between">
                          <small>메모리</small>
                          <small>${node.memory.usage}%</small>
                        </div>
                        <div class="progress" style="height: 4px;">
                          <div class="progress-bar" style="width: ${node.memory.usage}%; background-color: ${memoryColor};"></div>
                        </div>
                      </div>
                      <div>
                        <div class="d-flex justify-content-between">
                          <small>디스크</small>
                          <small>${node.disk.usage}%</small>
                        </div>
                        <div class="progress" style="height: 4px;">
                          <div class="progress-bar" style="width: ${node.disk.usage}%; background-color: ${diskColor};"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              `;
            })
            .join("");
        }
      }
    } catch (error) {
      console.error("Error loading monitoring data:", error);
    }
  },

  /**
   * 실제 컨테이너 데이터 렌더링 (Top 리소스 사용 컨테이너)
   */
  async renderContainerData() {
    if (!window.ContainersAPI) return;

    const tableBody = document.getElementById("monitoringTableBody");
    if (!tableBody) return;

    try {
      console.log("🐳 [모니터링API] 컨테이너 데이터 렌더링 시작...");
      const response = await window.ContainersAPI.getContainers();
      console.log("🐳 [모니터링API] 컨테이너 데이터 응답:", response);

      if (
        response &&
        response.success &&
        response.data &&
        response.data.containers
      ) {
        const containers = response.data.containers;

        if (containers.length === 0) {
          tableBody.innerHTML = `
            <tr>
              <td colspan="8" class="text-center text-muted py-4">
                <i class="fas fa-info-circle me-2"></i>
                컨테이너가 없습니다.
              </td>
            </tr>
          `;
          return;
        }

        // 상위 컨테이너들을 CPU 사용률 기준으로 정렬
        const sortedContainers = containers
          .sort((a, b) => parseFloat(b.cpu) - parseFloat(a.cpu))
          .slice(0, 10); // 상위 10개만 표시

        tableBody.innerHTML = sortedContainers
          .map((container, index) => {
            const cpuUsage = parseFloat(container.cpu);
            const memoryUsage = parseFloat(container.memory.usage);

            console.log(`🐳 [모니터링API] 컨테이너 ${index + 1}:`, {
              name: container.name,
              cpu: container.cpu,
              memory: container.memory,
              status: container.status,
            });

            const cpuColor =
              cpuUsage < 30
                ? "var(--success-color)"
                : cpuUsage < 70
                ? "var(--warning-color)"
                : "var(--danger-color)";
            const memoryColor =
              memoryUsage < 30
                ? "var(--success-color)"
                : memoryUsage < 70
                ? "var(--warning-color)"
                : "var(--danger-color)";

            const badgeClass =
              index === 0
                ? "bg-danger"
                : index === 1
                ? "bg-warning"
                : index === 2
                ? "bg-info"
                : "bg-secondary";

            const iconClass = container.image.includes("elasticsearch")
              ? "fas fa-cube text-primary"
              : container.image.includes("postgres")
              ? "fab fa-docker text-info"
              : container.image.includes("api")
              ? "fas fa-cube text-success"
              : "fas fa-cube text-secondary";

            return `
            <tr>
              <td><span class="badge ${badgeClass}">${index + 1}</span></td>
              <td>
                <div class="d-flex align-items-center">
                  <i class="${iconClass} me-2"></i>
                  <strong>${container.name}</strong>
                </div>
              </td>
              <td>${container.node || "Unknown"}</td>
              <td>
                <div class="progress-modern mb-1">
                  <div class="progress-bar-modern" style="width: ${cpuUsage}%; background: ${cpuColor};"></div>
                </div>
                <small>${cpuUsage.toFixed(1)}%</small>
              </td>
              <td>
                <div class="progress-modern mb-1">
                  <div class="progress-bar-modern" style="width: ${memoryUsage}%; background: ${memoryColor};"></div>
                </div>
                <small>${memoryUsage}%</small>
              </td>
              <td><small>${
                container.network
                  ? this.formatBytesPerSecond(container.network.rx)
                  : "0 B/s"
              }</small></td>
              <td><small>${
                container.network
                  ? this.formatBytesPerSecond(container.network.tx)
                  : "0 B/s"
              }</small></td>
              <td><span class="status-badge ${container.status.toLowerCase()}"><span class="status-indicator"></span>${
              container.status
            }</span></td>
            </tr>
          `;
          })
          .join("");
      } else {
        tableBody.innerHTML = `
          <tr>
            <td colspan="8" class="text-center text-muted py-4">
              <i class="fas fa-exclamation-triangle me-2"></i>
              컨테이너 데이터를 불러올 수 없습니다.
            </td>
          </tr>
        `;
      }
    } catch (error) {
      console.error("Error loading container data:", error);
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center text-muted py-4">
            <i class="fas fa-exclamation-triangle me-2"></i>
            컨테이너 데이터를 불러오는데 실패했습니다.
          </td>
        </tr>
      `;
    }
  },

  /**
   * 바이트를 읽기 쉬운 형태로 변환
   */
  formatBytesPerSecond(bytes) {
    if (bytes === 0) return "0 B/s";
    const k = 1024;
    const sizes = ["B/s", "KB/s", "MB/s", "GB/s"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },

  /**
   * 노드 상태 정보 가져오기
   */
  getNodeStatusInfo(status) {
    switch (status) {
      case "Ready":
        return {
          class: "status-ready",
          icon: "fa-check-circle",
          text: "정상",
        };
      case "NotReady":
        return {
          class: "status-not-ready",
          icon: "fa-times-circle",
          text: "비정상",
        };
      case "Warning":
        return {
          class: "status-warning",
          icon: "fa-exclamation-triangle",
          text: "경고",
        };
      default:
        return {
          class: "status-unknown",
          icon: "fa-question-circle",
          text: "알 수 없음",
        };
    }
  },

  /**
   * 컨테이너 상태 정보 가져오기
   */
  getContainerStatusInfo(status) {
    switch (status) {
      case "running":
        return {
          class: "status-running",
          icon: "fa-play-circle",
          text: "실행 중",
        };
      case "stopped":
        return {
          class: "status-stopped",
          icon: "fa-stop-circle",
          text: "중지됨",
        };
      case "paused":
        return {
          class: "status-paused",
          icon: "fa-pause-circle",
          text: "일시정지",
        };
      case "exited":
        return {
          class: "status-exited",
          icon: "fa-times-circle",
          text: "종료됨",
        };
      default:
        return {
          class: "status-unknown",
          icon: "fa-question-circle",
          text: "알 수 없음",
        };
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
