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
      console.log("🌐 [네트워크 트래픽 API] 데이터 요청 시작...");
      console.log(
        "🌐 [네트워크 트래픽 API] 요청 URL: /api/monitoring/network-traffic"
      );
      console.log(
        "🌐 [네트워크 트래픽 API] 요청 시간:",
        new Date().toLocaleTimeString("ko-KR")
      );

      const response = await fetch("/api/monitoring/network-traffic");

      console.log(
        "🌐 [네트워크 트래픽 API] HTTP 응답 상태:",
        response.status,
        response.statusText
      );
      console.log(
        "🌐 [네트워크 트래픽 API] 응답 헤더:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("🌐 [네트워크 트래픽 API] JSON 응답 데이터:", result);
      console.log("🌐 [네트워크 트래픽 API] 응답 구조 분석:");
      console.log("  - success:", result.success);
      console.log("  - message:", result.message);
      console.log("  - data 존재 여부:", !!result.data);
      console.log("  - data 타입:", typeof result.data);
      console.log("  - data 내용:", result.data);

      if (result.success) {
        console.log("🌐 [네트워크 트래픽 API] 데이터 구조 분석:");
        console.log("  - labels:", result.data?.labels);
        console.log("  - labels 개수:", result.data?.labels?.length || 0);
        console.log("  - datasets:", result.data?.datasets);
        console.log("  - datasets 개수:", result.data?.datasets?.length || 0);

        if (result.data?.datasets && result.data.datasets.length > 0) {
          result.data.datasets.forEach((dataset, index) => {
            console.log(`  - dataset[${index}]:`, {
              label: dataset.label,
              dataLength: dataset.data?.length || 0,
              dataSample: dataset.data?.slice(0, 3) || [],
              borderColor: dataset.borderColor,
              backgroundColor: dataset.backgroundColor,
            });
          });
        }

        console.log("✅ [네트워크 트래픽 API] 데이터 요청 성공");
        return result.data;
      } else {
        console.warn(
          "⚠️ [네트워크 트래픽 API] 서버에서 실패 응답:",
          result.message
        );
        return null;
      }
    } catch (error) {
      console.error("❌ [네트워크 트래픽 API] 데이터 요청 실패:", error);
      console.error("❌ [네트워크 트래픽 API] 에러 상세:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      return null;
    }
  },

  /**
   * 디스크 I/O 데이터 가져오기
   */
  async getDiskIoData() {
    try {
      console.log("💾 [디스크 I/O API] 데이터 요청 시작...");
      console.log("💾 [디스크 I/O API] 요청 URL: /api/monitoring/disk-io");
      console.log(
        "💾 [모니터링API] 요청 시간:",
        new Date().toLocaleTimeString("ko-KR")
      );

      const response = await fetch("/api/monitoring/disk-io");

      console.log(
        "💾 [디스크 I/O API] HTTP 응답 상태:",
        response.status,
        response.statusText
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("💾 [디스크 I/O API] JSON 응답 데이터:", result);

      if (result.success) {
        console.log(
          "💾 [디스크 I/O API] 데이터 라벨 개수:",
          result.data?.labels?.length || 0
        );
        console.log(
          "💾 [디스크 I/O API] 데이터셋 개수:",
          result.data?.datasets?.length || 0
        );
        console.log(
          "💾 [디스크 I/O API] 읽기 데이터 샘플:",
          result.data?.datasets?.[0]?.data?.slice(0, 5) || []
        );
        console.log(
          "💾 [디스크 I/O API] 쓰기 데이터 샘플:",
          result.data?.datasets?.[1]?.data?.slice(0, 5) || []
        );
        console.log("✅ [디스크 I/O API] 데이터 요청 성공");
        return result.data;
      } else {
        console.warn("⚠️ [디스크 I/O API] 서버에서 실패 응답:", result.message);
        return null;
      }
    } catch (error) {
      console.error("❌ [디스크 I/O API] 데이터 요청 실패:", error);
      return null;
    }
  },

  /**
   * 응답 시간 데이터 가져오기
   */
  async getResponseTimeData() {
    try {
      console.log("⏱️ [응답 시간 API] 데이터 요청 시작...");
      console.log("⏱️ [응답 시간 API] 요청 URL: /api/monitoring/response-time");
      console.log(
        "⏱️ [모니터링API] 요청 시간:",
        new Date().toLocaleTimeString("ko-KR")
      );

      const response = await fetch("/api/monitoring/response-time");

      console.log(
        "⏱️ [응답 시간 API] HTTP 응답 상태:",
        response.status,
        response.statusText
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("⏱️ [응답 시간 API] JSON 응답 데이터:", result);

      if (result.success) {
        console.log(
          "⏱️ [응답 시간 API] 데이터 라벨 개수:",
          result.data?.labels?.length || 0
        );
        console.log(
          "⏱️ [응답 시간 API] 데이터셋 개수:",
          result.data?.datasets?.length || 0
        );
        console.log(
          "⏱️ [응답 시간 API] 서비스 목록:",
          result.data?.datasets?.map((ds) => ds.label) || []
        );
        console.log("✅ [응답 시간 API] 데이터 요청 성공");
        return result.data;
      } else {
        console.warn("⚠️ [응답 시간 API] 서버에서 실패 응답:", result.message);
        return null;
      }
    } catch (error) {
      console.error("❌ [응답 시간 API] 데이터 요청 실패:", error);
      return null;
    }
  },

  /**
   * 요청 상태 분포 데이터 가져오기
   */
  async getRequestStatusData() {
    try {
      console.log("📊 [요청 상태 API] 데이터 요청 시작...");
      console.log(
        "📊 [요청 상태 API] 요청 URL: /api/monitoring/request-status"
      );
      console.log(
        "📊 [모니터링API] 요청 시간:",
        new Date().toLocaleTimeString("ko-KR")
      );

      const response = await fetch("/api/monitoring/request-status");

      console.log(
        "📊 [요청 상태 API] HTTP 응답 상태:",
        response.status,
        response.statusText
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("📊 [요청 상태 API] JSON 응답 데이터:", result);

      if (result.success) {
        console.log("📊 [요청 상태 API] 상태 라벨:", result.data?.labels || []);
        console.log(
          "📊 [요청 상태 API] 상태 데이터:",
          result.data?.datasets?.[0]?.data || []
        );
        console.log(
          "📊 [요청 상태 API] 총 요청 수:",
          result.data?.datasets?.[0]?.data?.reduce((a, b) => a + b, 0) || 0
        );
        console.log("✅ [요청 상태 API] 데이터 요청 성공");
        return result.data;
      } else {
        console.warn("⚠️ [요청 상태 API] 서버에서 실패 응답:", result.message);
        return null;
      }
    } catch (error) {
      console.error("❌ [요청 상태 API] 데이터 요청 실패:", error);
      return null;
    }
  },

  /**
   * 모든 모니터링 메트릭 가져오기
   */
  async getMetrics() {
    try {
      console.log("📈 [메트릭 수집기] 모든 메트릭 데이터 수집 시작...");
      console.log("📈 [메트릭 수집기] 병렬로 4개 API 요청 실행 중...");

      const startTime = Date.now();
      const [networkData, diskData, responseData, statusData] =
        await Promise.all([
          this.getNetworkTrafficData(),
          this.getDiskIoData(),
          this.getResponseTimeData(),
          this.getRequestStatusData(),
        ]);

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log("📈 [메트릭 수집기] 모든 API 요청 완료");
      console.log("📈 [메트릭 수집기] 총 소요 시간:", duration + "ms");
      console.log(
        "📈 [메트릭 수집기] 네트워크 트래픽 데이터:",
        networkData ? "✅ 성공" : "❌ 실패"
      );
      console.log(
        "📈 [메트릭 수집기] 디스크 I/O 데이터:",
        diskData ? "✅ 성공" : "❌ 실패"
      );
      console.log(
        "📈 [메트릭 수집기] 응답 시간 데이터:",
        responseData ? "✅ 성공" : "❌ 실패"
      );
      console.log(
        "📈 [메트릭 수집기] 요청 상태 데이터:",
        statusData ? "✅ 성공" : "❌ 실패"
      );

      const result = {
        networkTraffic: networkData,
        diskIo: diskData,
        responseTime: responseData,
        requestStatus: statusData,
      };

      console.log("✅ [메트릭 수집기] 모든 메트릭 데이터 수집 완료");
      return result;
    } catch (error) {
      console.error("❌ [메트릭 수집기] 메트릭 데이터 수집 실패:", error);
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
    console.log("🌐 [네트워크 트래픽 차트] 초기화 시작...");
    const ctx = document.getElementById("networkTrafficChart");
    if (!ctx) {
      console.warn("⚠️ [네트워크 트래픽 차트] 캔버스를 찾을 수 없습니다.");
      return;
    }

    if (this.networkTrafficChart) {
      console.log("🔄 [네트워크 트래픽 차트] 기존 차트 제거 중...");
      this.networkTrafficChart.destroy();
    }

    if (!data) {
      console.warn(
        "⚠️ [네트워크 트래픽 차트] 데이터가 없어 에러 메시지를 표시합니다."
      );
      ctx.innerHTML =
        '<div class="text-center text-muted py-4">데이터를 불러올 수 없습니다.</div>';
      return;
    }

    console.log("🌐 [네트워크 트래픽 차트] 차트 생성 중...");
    console.log("🌐 [네트워크 트래픽 차트] 받은 데이터:", data);
    console.log("🌐 [네트워크 트래픽 차트] 데이터 타입:", typeof data);
    console.log(
      "🌐 [네트워크 트래픽 차트] 데이터 라벨 개수:",
      data.labels?.length || 0
    );
    console.log(
      "🌐 [네트워크 트래픽 차트] 데이터셋 개수:",
      data.datasets?.length || 0
    );
    console.log("🌐 [네트워크 트래픽 차트] 라벨 내용:", data.labels);
    console.log("🌐 [네트워크 트래픽 차트] 데이터셋 내용:", data.datasets);

    // 데이터셋 스타일 속성 확인 및 강제 적용
    if (data.datasets && data.datasets.length > 0) {
      const defaultColors = [
        { borderColor: "#4CAF50", backgroundColor: "rgba(76, 175, 80, 0.1)" }, // 녹색
        { borderColor: "#2196F3", backgroundColor: "rgba(33, 150, 243, 0.1)" }, // 파란색
        { borderColor: "#FF9800", backgroundColor: "rgba(255, 152, 0, 0.1)" }, // 주황색
        { borderColor: "#9C27B0", backgroundColor: "rgba(156, 39, 176, 0.1)" }, // 보라색
      ];

      data.datasets.forEach((dataset, index) => {
        console.log(`🌐 [네트워크 트래픽 차트] dataset[${index}] 원본 속성:`, {
          label: dataset.label,
          borderColor: dataset.borderColor,
          backgroundColor: dataset.backgroundColor,
          borderWidth: dataset.borderWidth,
          pointBackgroundColor: dataset.pointBackgroundColor,
          pointBorderColor: dataset.pointBorderColor,
          fill: dataset.fill,
          tension: dataset.tension,
          showLine: dataset.showLine,
        });

        // 색상이 없거나 투명한 경우 기본 색상 적용
        if (
          !dataset.borderColor ||
          dataset.borderColor === "transparent" ||
          dataset.borderColor === "rgba(0,0,0,0)"
        ) {
          dataset.borderColor =
            defaultColors[index % defaultColors.length].borderColor;
          console.log(
            `🔄 [네트워크 트래픽 차트] dataset[${index}] borderColor 적용:`,
            dataset.borderColor
          );
        }
        if (
          !dataset.backgroundColor ||
          dataset.backgroundColor === "transparent" ||
          dataset.backgroundColor === "rgba(0,0,0,0)"
        ) {
          dataset.backgroundColor =
            defaultColors[index % defaultColors.length].backgroundColor;
          console.log(
            `🔄 [네트워크 트래픽 차트] dataset[${index}] backgroundColor 적용:`,
            dataset.backgroundColor
          );
        }

        // 기타 필수 속성들 강제 적용
        dataset.borderWidth = dataset.borderWidth || 2;
        dataset.pointBackgroundColor =
          dataset.pointBackgroundColor || dataset.borderColor;
        dataset.pointBorderColor =
          dataset.pointBorderColor || dataset.borderColor;
        dataset.pointRadius = dataset.pointRadius || 4;
        dataset.pointHoverRadius = dataset.pointHoverRadius || 6;
        dataset.fill = dataset.fill !== undefined ? dataset.fill : false;
        dataset.tension = dataset.tension || 0.1;
        dataset.showLine =
          dataset.showLine !== undefined ? dataset.showLine : true;

        console.log(`🌐 [네트워크 트래픽 차트] dataset[${index}] 최종 속성:`, {
          label: dataset.label,
          borderColor: dataset.borderColor,
          backgroundColor: dataset.backgroundColor,
          borderWidth: dataset.borderWidth,
          pointBackgroundColor: dataset.pointBackgroundColor,
          pointBorderColor: dataset.pointBorderColor,
          fill: dataset.fill,
          tension: dataset.tension,
          showLine: dataset.showLine,
        });
      });
    }

    // Chart.js 로드 확인
    console.log(
      "🌐 [네트워크 트래픽 차트] Chart.js 로드 상태:",
      typeof Chart !== "undefined" ? "✅ 로드됨" : "❌ 로드 안됨"
    );
    if (typeof Chart === "undefined") {
      console.error(
        "❌ [네트워크 트래픽 차트] Chart.js가 로드되지 않았습니다!"
      );
      ctx.innerHTML =
        '<div class="text-center text-muted py-4">Chart.js를 로드할 수 없습니다.</div>';
      return;
    }

    console.log("🌐 [네트워크 트래픽 차트] Chart 객체 생성 시작...");
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

    console.log("🌐 [네트워크 트래픽 차트] Chart 객체 생성 완료");
    console.log(
      "🌐 [네트워크 트래픽 차트] 생성된 차트:",
      this.networkTrafficChart
    );
    console.log(
      "🌐 [네트워크 트래픽 차트] 차트 데이터:",
      this.networkTrafficChart?.data
    );
    console.log(
      "🌐 [네트워크 트래픽 차트] 차트 옵션:",
      this.networkTrafficChart?.options
    );
    console.log("✅ [네트워크 트래픽 차트] 초기화 완료");
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

    if (!data) {
      ctx.innerHTML =
        '<div class="text-center text-muted py-4">데이터를 불러올 수 없습니다.</div>';
      return;
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

    if (!data) {
      ctx.innerHTML =
        '<div class="text-center text-muted py-4">데이터를 불러올 수 없습니다.</div>';
      return;
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

    if (!data) {
      ctx.innerHTML =
        '<div class="text-center text-muted py-4">데이터를 불러올 수 없습니다.</div>';
      return;
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
      console.log("📊 [차트 렌더러] 모든 차트 초기화 시작...");
      console.log("📊 [차트 렌더러] 메트릭 데이터 요청 중...");

      const metrics = await window.MonitoringAPI.getMetrics();
      if (!metrics) {
        console.warn(
          "⚠️ [차트 렌더러] 메트릭 데이터를 받을 수 없어 차트 초기화를 중단합니다."
        );
        return;
      }

      console.log("📊 [차트 렌더러] 네트워크 트래픽 차트 초기화 중...");
      this.initNetworkTrafficChart(metrics.networkTraffic);

      console.log("📊 [차트 렌더러] 디스크 I/O 차트 초기화 중...");
      this.initDiskIoChart(metrics.diskIo);

      console.log("📊 [차트 렌더러] 응답 시간 차트 초기화 중...");
      this.initResponseTimeChart(metrics.responseTime);

      console.log("📊 [차트 렌더러] 요청 상태 차트 초기화 중...");
      this.initRequestStatusChart(metrics.requestStatus);

      console.log("✅ [차트 렌더러] 모든 차트 초기화 완료");
    } catch (error) {
      console.error("❌ [차트 렌더러] 차트 초기화 실패:", error);
    }
  },
};
