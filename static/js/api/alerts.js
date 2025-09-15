/**
 * 알림 관련 API 함수들
 * /api/alerts/* 엔드포인트 호출
 */

// 알림 목록 조회
async function getAlerts() {
  try {
    console.log("🚨 [알림API] 알림 목록 요청 중...");
    const response = await fetch("/api/alerts");
    const data = await response.json();
    console.log("🚨 [알림API] 알림 목록 응답:", data);
    return data;
  } catch (error) {
    console.error("❌ [알림API] 알림 목록 요청 실패:", error);
    return null;
  }
}

// 특정 알림 상세 정보 조회
async function getAlert(alertId) {
  try {
    const response = await fetch(`/api/alerts/${alertId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching alert:", error);
    return null;
  }
}

// 알림 해결 처리
async function resolveAlert(alertId) {
  try {
    const response = await fetch(`/api/alerts/${alertId}/resolve`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error resolving alert:", error);
    return null;
  }
}

// 알림 규칙 목록 조회
async function getAlertRules() {
  try {
    const response = await fetch("/api/alert-rules");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching alert rules:", error);
    return null;
  }
}

// 알림 페이지 데이터 로딩
async function loadAlertsData() {
  if (!window.AlertsAPI) {
    console.error("AlertsAPI not available");
    return;
  }

  try {
    const response = await window.AlertsAPI.getAlerts();
    if (response && response.success) {
      const alerts = response.data.alerts;
      const summary = response.data.summary;
      const tbody = document.getElementById("alertsTableBody");

      // 알림 통계 업데이트
      updateElement("criticalAlerts", summary.critical);
      updateElement("warningAlerts", summary.warning);
      updateElement("infoAlerts", summary.info);
      updateElement("resolvedAlerts", summary.resolved);

      if (tbody) {
        tbody.innerHTML = "";

        if (alerts.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="7" class="text-center text-muted py-4">
                <i class="fas fa-info-circle me-2"></i>
                알림이 없습니다.
              </td>
            </tr>
          `;
          return;
        }

        alerts.forEach((alert) => {
          const statusClass =
            alert.severity === "Critical"
              ? "stopped"
              : alert.severity === "Warning"
              ? "warning"
              : "pending";
          const rowClass =
            alert.severity === "Critical"
              ? "table-danger"
              : alert.severity === "Warning"
              ? "table-warning"
              : "";

          const row = document.createElement("tr");
          if (rowClass) row.className = rowClass;

          row.innerHTML = `
            <td>
              <span class="status-badge ${statusClass}">
                <span class="status-indicator"></span>
                ${alert.severity}
              </span>
            </td>
            <td><strong>${alert.alert_type}</strong></td>
            <td>${alert.target}</td>
            <td>${alert.message}</td>
            <td>${new Date(alert.created_at).toLocaleString("ko-KR")}</td>
            <td>${alert.duration}</td>
            <td>
              <div class="btn-group-actions">
                <button class="btn btn-sm btn-outline-success" title="해결됨으로 표시" onclick="resolveAlert('${
                  alert.id
                }')">
                  <i class="fas fa-check"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning" title="알림 음소거">
                  <i class="fas fa-volume-mute"></i>
                </button>
                <button class="btn btn-sm btn-outline-info" title="상세 보기">
                  <i class="fas fa-eye"></i>
                </button>
              </div>
            </td>
          `;
          tbody.appendChild(row);
        });
      }
    }
  } catch (error) {
    console.error("Error loading alerts data:", error);
    const tbody = document.getElementById("alertsTableBody");
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-danger py-4">
            <i class="fas fa-exclamation-triangle me-2"></i>
            알림 데이터를 불러오는데 실패했습니다.
          </td>
        </tr>
      `;
    }
  }
}

// 알림 규칙 데이터 로딩
async function loadAlertRulesData() {
  if (!window.AlertsAPI) {
    console.error("AlertsAPI not available");
    return;
  }

  if (typeof window.AlertsAPI.getAlertRules !== "function") {
    console.error("getAlertRules function not available in AlertsAPI");
    return;
  }

  try {
    const response = await window.AlertsAPI.getAlertRules();
    if (response && response.success) {
      const rules = response.data.rules;
      const tbody = document.getElementById("alertRulesTableBody");

      if (tbody) {
        tbody.innerHTML = "";

        if (rules.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="6" class="text-center text-muted py-4">
                <i class="fas fa-info-circle me-2"></i>
                알림 규칙이 없습니다.
              </td>
            </tr>
          `;
          return;
        }

        rules.forEach((rule) => {
          const severityClass =
            rule.severity === "Critical"
              ? "danger"
              : rule.severity === "Warning"
              ? "warning"
              : "info";
          const statusClass =
            rule.status === "Active"
              ? "running"
              : rule.status === "Inactive"
              ? "stopped"
              : "warning";
          const statusText =
            rule.status === "Active"
              ? "활성"
              : rule.status === "Inactive"
              ? "비활성"
              : "테스트";

          const row = document.createElement("tr");
          row.innerHTML = `
            <td><strong>${rule.name}</strong></td>
            <td>${rule.target}</td>
            <td>${rule.condition}</td>
            <td><span class="badge bg-${severityClass}">${rule.severity}</span></td>
            <td><span class="status-badge ${statusClass}"><span class="status-indicator"></span>${statusText}</span></td>
            <td>
              <div class="btn-group-actions">
                <button class="btn btn-sm btn-outline-primary" onclick="editAlertRule('${rule.id}')">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteAlertRule('${rule.id}')">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          `;
          tbody.appendChild(row);
        });
      }
    }
  } catch (error) {
    console.error("Error loading alert rules data:", error);
    const tbody = document.getElementById("alertRulesTableBody");
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-muted py-4">
            <i class="fas fa-exclamation-triangle me-2"></i>
            알림 규칙을 불러오는 중 오류가 발생했습니다.
          </td>
        </tr>
      `;
    }
  }
}

// 최근 알림 로딩 (대시보드용)
async function loadRecentAlerts() {
  if (!window.AlertsAPI) {
    return;
  }

  try {
    const response = await window.AlertsAPI.getAlerts();
    if (response && response.success) {
      const alerts = response.data.alerts.slice(0, 3); // 최근 3개만
      const container = document.getElementById("recentAlerts");

      if (container) {
        if (alerts.length === 0) {
          container.innerHTML = `
            <div class="text-center text-muted py-4">
              <i class="fas fa-info-circle me-2"></i>
              최근 알림이 없습니다.
            </div>
          `;
          return;
        }

        container.innerHTML = alerts
          .map((alert) => {
            const alertClass =
              alert.severity === "Critical"
                ? "danger"
                : alert.severity === "Warning"
                ? "warning"
                : "success";
            const statusClass =
              alert.severity === "Critical"
                ? "stopped"
                : alert.severity === "Warning"
                ? "warning"
                : "running";
            const statusText =
              alert.severity === "Critical"
                ? "위험"
                : alert.severity === "Warning"
                ? "경고"
                : "정상";

            return `
            <div class="alert-item ${alertClass}">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <strong>${alert.alert_type}</strong>
                  <p class="mb-1 text-muted small">${alert.message}</p>
                  <small class="text-muted">${new Date(
                    alert.created_at
                  ).toLocaleString("ko-KR")}</small>
                </div>
                <span class="status-badge ${statusClass}">${statusText}</span>
              </div>
            </div>
          `;
          })
          .join("");
      }
    }
  } catch (error) {
    console.error("Error loading recent alerts:", error);
  }
}

// 알림 해결 함수 (전역으로 노출)
async function resolveAlert(alertId) {
  if (!window.AlertsAPI) {
    console.error("AlertsAPI not available");
    return;
  }

  try {
    const response = await window.AlertsAPI.resolveAlert(alertId);
    if (response && response.success) {
      // 알림 목록 새로고침
      await window.AlertsAPI.loadAlertsData();
    }
  } catch (error) {
    console.error("Error resolving alert:", error);
  }
}

// 알림 규칙 편집 함수 (전역으로 노출)
function editAlertRule(ruleId) {
  console.log("편집할 알림 규칙 ID:", ruleId);
  // TODO: 알림 규칙 편집 모달 또는 페이지로 이동
  alert(`알림 규칙 ${ruleId} 편집 기능은 아직 구현되지 않았습니다.`);
}

// 알림 규칙 삭제 함수 (전역으로 노출)
function deleteAlertRule(ruleId) {
  if (confirm(`알림 규칙 ${ruleId}를 삭제하시겠습니까?`)) {
    console.log("삭제할 알림 규칙 ID:", ruleId);
    // TODO: 알림 규칙 삭제 API 호출
    alert(`알림 규칙 ${ruleId} 삭제 기능은 아직 구현되지 않았습니다.`);
  }
}

// 알림 API 함수들을 전역으로 노출
window.AlertsAPI = {
  getAlerts,
  getAlert,
  resolveAlert,
  getAlertRules,
  loadAlertsData,
  loadAlertRulesData,
  loadRecentAlerts,
};
