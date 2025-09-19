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

// 특정 알림 기본 정보 조회
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

// 특정 알림 상세 정보 조회 (상세보기용)
async function getAlertDetail(alertId) {
  try {
    console.log("🔍 [API] 상세정보 요청 URL:", `/api/alerts/${alertId}/detail`);
    const response = await fetch(`/api/alerts/${alertId}/detail`);
    console.log("🔍 [API] 응답 상태:", response.status, response.statusText);

    // HTTP 응답이 성공적이지 않은 경우 (4xx, 5xx 에러)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("🔍 [API] 응답 데이터:", data);
    return data;
  } catch (error) {
    // 상세정보 요청 실패 시 오류 로그 출력하고 null 반환
    console.error("❌ [API] 상세정보 요청 실패:", error);
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

// 알림 규칙 삭제 API 호출
async function deleteAlertRuleAPI(ruleId) {
  try {
    console.log("🗑️ [알림규칙API] 알림 규칙 삭제 요청:", ruleId);
    const response = await fetch(`/api/alert-rules/${ruleId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    console.log("🗑️ [알림규칙API] 삭제 응답:", data);
    return data;
  } catch (error) {
    console.error("❌ [알림규칙API] 알림 규칙 삭제 실패:", error);
    return null;
  }
}

// 알림 규칙 수정 API 호출
async function updateAlertRuleAPI(ruleId, ruleData) {
  try {
    console.log("✏️ [알림규칙API] 알림 규칙 수정 요청:", ruleId, ruleData);
    const response = await fetch(`/api/alert-rules/${ruleId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ruleData),
    });
    const data = await response.json();
    console.log("✏️ [알림규칙API] 수정 응답:", data);
    return data;
  } catch (error) {
    console.error("❌ [알림규칙API] 알림 규칙 수정 실패:", error);
    return null;
  }
}

// 알림 페이지 데이터 로딩
async function loadAlertsData() {
  // AlertsAPI가 사용 가능한지 확인
  if (!window.AlertsAPI) {
    console.error("AlertsAPI not available");
    return;
  }

  try {
    const response = await window.AlertsAPI.getAlerts();
    // API 응답이 성공적이고 데이터가 있는 경우
    if (response && response.success) {
      const alerts = response.data.alerts;
      const summary = response.data.summary;

      // 전역 변수 업데이트
      alertsData = alerts;
      const tbody = document.getElementById("alertsTableBody");

      // 알림 통계 업데이트
      updateElement("criticalAlerts", summary.critical);
      updateElement("warningAlerts", summary.warning);
      updateElement("infoAlerts", summary.info);
      updateElement("resolvedAlerts", summary.resolved);

      // 테이블 본문이 존재하는 경우
      if (tbody) {
        tbody.innerHTML = "";

        // 알림이 없는 경우 빈 상태 메시지 표시
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
          // 심각도에 따른 상태 클래스 결정
          const statusClass =
            alert.severity === "Critical"
              ? "stopped"
              : alert.severity === "Warning"
              ? "warning"
              : "pending";
          // 심각도에 따른 행 클래스 결정
          const rowClass =
            alert.severity === "Critical"
              ? "table-danger"
              : alert.severity === "Warning"
              ? "table-warning"
              : "";

          const row = document.createElement("tr");
          // 행 클래스가 있는 경우에만 적용
          if (rowClass) row.className = rowClass;
          row.setAttribute("data-alert-id", alert.id);

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
            <td class="text-center">${alert.duration}</td>
            <td>
              <div class="btn-group-actions">
                <button class="btn btn-sm btn-outline-success" title="해결됨으로 표시" onclick="toggleAlertResolve('${
                  alert.id
                }', true)">
                  <i class="fas fa-check"></i>
                </button>
                <button class="btn btn-sm btn-outline-info" title="상세 보기" onclick="showAlertDetail('${
                  alert.id
                }')">
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
    // 데이터 로딩 실패 시 오류 메시지 표시
    console.error("Error loading alerts data:", error);
    const tbody = document.getElementById("alertsTableBody");
    // 테이블 본문이 존재하는 경우 오류 메시지 표시
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
  // AlertsAPI가 사용 가능한지 확인
  if (!window.AlertsAPI) {
    console.error("AlertsAPI not available");
    return;
  }

  // getAlertRules 함수가 사용 가능한지 확인
  if (typeof window.AlertsAPI.getAlertRules !== "function") {
    console.error("getAlertRules function not available in AlertsAPI");
    return;
  }

  try {
    const response = await window.AlertsAPI.getAlertRules();
    // API 응답이 성공적이고 데이터가 있는 경우
    if (response && response.success) {
      const rules = response.data.rules;

      // 전역 변수에 규칙 데이터 저장 (편집 시 사용)
      window.alertRulesData = rules;

      const tbody = document.getElementById("alertRulesTableBody");

      // 테이블 본문이 존재하는 경우
      if (tbody) {
        tbody.innerHTML = "";

        // 알림 규칙이 없는 경우 빈 상태 메시지 표시
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
          // 심각도에 따른 배지 클래스 결정
          const severityClass =
            rule.severity === "Critical"
              ? "danger"
              : rule.severity === "Warning"
              ? "warning"
              : "info";
          // 상태에 따른 상태 클래스 결정
          const statusClass =
            rule.status === "Active"
              ? "running"
              : rule.status === "Inactive"
              ? "stopped"
              : "warning";
          // 상태에 따른 텍스트 결정
          const statusText =
            rule.status === "Active"
              ? "활성"
              : rule.status === "Inactive"
              ? "비활성"
              : "테스트";

          const row = document.createElement("tr");
          row.setAttribute("data-rule-id", rule.id);
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
    // 데이터 로딩 실패 시 오류 메시지 표시
    console.error("Error loading alert rules data:", error);
    const tbody = document.getElementById("alertRulesTableBody");
    // 테이블 본문이 존재하는 경우 오류 메시지 표시
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
  // AlertsAPI가 사용 가능한지 확인
  if (!window.AlertsAPI) {
    return;
  }

  try {
    const response = await window.AlertsAPI.getAlerts();
    // API 응답이 성공적이고 데이터가 있는 경우
    if (response && response.success) {
      const alerts = response.data.alerts.slice(0, 3); // 최근 3개만
      const container = document.getElementById("recentAlerts");

      // 컨테이너가 존재하는 경우
      if (container) {
        // 알림이 없는 경우 빈 상태 메시지 표시
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
            // 심각도에 따른 알림 클래스 결정
            const alertClass =
              alert.severity === "Critical"
                ? "danger"
                : alert.severity === "Warning"
                ? "warning"
                : "success";
            // 심각도에 따른 상태 클래스 결정
            const statusClass =
              alert.severity === "Critical"
                ? "stopped"
                : alert.severity === "Warning"
                ? "warning"
                : "running";
            // 심각도에 따른 상태 텍스트 결정
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
    // 최근 알림 로딩 실패 시 오류 로그 출력
    console.error("Error loading recent alerts:", error);
  }
}

// 알림 해결 함수 (전역으로 노출)
async function resolveAlert(alertId) {
  // AlertsAPI가 사용 가능한지 확인
  if (!window.AlertsAPI) {
    console.error("AlertsAPI not available");
    return;
  }

  try {
    const response = await window.AlertsAPI.resolveAlert(alertId);
    // 해결 처리 성공 시 알림 목록 새로고침
    if (response && response.success) {
      // 알림 목록 새로고침
      await window.AlertsAPI.loadAlertsData();
    }
  } catch (error) {
    // 알림 해결 처리 실패 시 오류 로그 출력
    console.error("Error resolving alert:", error);
  }
}

// 알림 규칙 편집 함수 (전역으로 노출)
function editAlertRule(ruleId) {
  console.log("✏️ [알림규칙] 편집할 알림 규칙 ID:", ruleId);

  // 현재 규칙 데이터 찾기
  const currentRules = window.alertRulesData || [];
  const rule = currentRules.find((r) => r.id === ruleId);

  if (!rule) {
    showToast("편집할 규칙을 찾을 수 없습니다.", "error");
    return;
  }

  // 모달에 데이터 채우기
  populateEditModal(rule);

  // 모달 표시
  const modal = new bootstrap.Modal(document.getElementById("editRuleModal"));
  modal.show();
}

// 편집 모달에 데이터 채우기
function populateEditModal(rule) {
  document.getElementById("editRuleId").value = rule.id;
  document.getElementById("editRuleName").value = rule.name || "";
  document.getElementById("editRuleTarget").value = rule.target || "";
  document.getElementById("editRuleCondition").value = rule.condition || "";
  document.getElementById("editRuleSeverity").value = rule.severity || "";
  document.getElementById("editRuleStatus").value = rule.status || "";
}

// 알림 규칙 저장 함수
async function saveAlertRule() {
  const ruleId = document.getElementById("editRuleId").value;
  const form = document.getElementById("editRuleForm");

  // 폼 유효성 검사
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  // 폼 데이터 수집
  const formData = new FormData(form);
  const ruleData = {
    name: formData.get("name"),
    target: formData.get("target"),
    condition: formData.get("condition"),
    severity: formData.get("severity"),
    status: formData.get("status"),
  };

  try {
    // 로딩 상태 표시
    showToast("알림 규칙을 저장하는 중...", "info");

    // 저장 버튼 비활성화
    const saveBtn = document.getElementById("saveRuleBtn");
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>저장 중...';

    // API 호출
    const response = await window.AlertsAPI.updateAlertRuleAPI(
      ruleId,
      ruleData
    );

    if (response && response.success) {
      // 저장 성공 시
      showToast(
        `알림 규칙 ${ruleId}이(가) 성공적으로 저장되었습니다.`,
        "success"
      );

      // 모달 닫기
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("editRuleModal")
      );
      modal.hide();

      // 알림 규칙 목록 새로고침
      await window.AlertsAPI.loadAlertRulesData();
    } else {
      // 저장 실패 시
      const errorMessage =
        response?.message || "알 수 없는 오류가 발생했습니다.";
      showToast(`알림 규칙 저장 실패: ${errorMessage}`, "error");
      console.error("❌ [알림규칙] 저장 실패:", response);
    }
  } catch (error) {
    // 예외 발생 시
    showToast("알림 규칙 저장 중 오류가 발생했습니다.", "error");
    console.error("❌ [알림규칙] 저장 중 오류:", error);
  } finally {
    // 저장 버튼 복원
    const saveBtn = document.getElementById("saveRuleBtn");
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<i class="fas fa-save me-2"></i>저장';
  }
}

// 알림 규칙 삭제 함수 (전역으로 노출)
async function deleteAlertRule(ruleId) {
  if (confirm(`알림 규칙 ${ruleId}를 삭제하시겠습니까?`)) {
    console.log("🗑️ [알림규칙] 삭제할 알림 규칙 ID:", ruleId);

    try {
      // 로딩 상태 표시
      showToast("알림 규칙을 삭제하는 중...", "info");

      // 삭제 API 호출
      const response = await window.AlertsAPI.deleteAlertRuleAPI(ruleId);

      if (response && response.success) {
        // 삭제 성공 시
        showToast(
          `알림 규칙 ${ruleId}이(가) 성공적으로 삭제되었습니다.`,
          "success"
        );

        // 테이블에서 해당 행 제거
        const row = document.querySelector(`tr[data-rule-id="${ruleId}"]`);
        if (row) {
          row.remove();
        }

        // 알림 규칙 목록 새로고침
        await window.AlertsAPI.loadAlertRulesData();
      } else {
        // 삭제 실패 시
        const errorMessage =
          response?.message || "알 수 없는 오류가 발생했습니다.";
        showToast(`알림 규칙 삭제 실패: ${errorMessage}`, "error");
        console.error("❌ [알림규칙] 삭제 실패:", response);
      }
    } catch (error) {
      // 예외 발생 시
      showToast("알림 규칙 삭제 중 오류가 발생했습니다.", "error");
      console.error("❌ [알림규칙] 삭제 중 오류:", error);
    }
  }
}

// 알림 상세보기 팝업 표시
async function showAlertDetail(alertId) {
  try {
    console.log("🔍 [알림상세] 알림 상세 정보 요청:", alertId);

    // 로딩 상태 표시
    showModalLoading(true);

    // 알림 상세보기 팝업 표시
    const modal = new bootstrap.Modal(
      document.getElementById("alertDetailModal")
    );
    modal.show();

    // 알림 상세보기 팝업이 완전히 열린 후 포커스 관리
    document.getElementById("alertDetailModal").addEventListener(
      "shown.bs.modal",
      function () {
        const firstFocusable = this.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (firstFocusable) {
          firstFocusable.focus();
        }
      },
      { once: true }
    );

    // 알림 상세 정보 가져오기
    const response = await window.AlertsAPI.getAlertDetail(alertId);

    if (response && response.success) {
      const alert = response.data.alert;
      console.log("🔍 [알림상세] 알림 상세 정보:", alert);

      // 로딩 상태 해제하고 HTML 복원
      showModalLoading(false);

      // 알림 상세보기 팝업에 데이터 채우기
      populateAlertDetailModal(alert);
    } else {
      console.error("❌ [알림상세] 알림 상세 정보 가져오기 실패:", response);
      showModalError(
        `알림 상세 정보를 가져올 수 없습니다. (${
          response?.message || "알 수 없는 오류"
        })`
      );
    }
  } catch (error) {
    console.error("❌ [알림상세] 알림 상세보기 오류:", error);
    showModalError("알림 상세보기 중 오류가 발생했습니다.");
  }
}

// 알림 상세보기 팝업에 알림 상세 정보 채우기
function populateAlertDetailModal(alert) {
  console.log("🔍 [알림상세팝업] 데이터 채우기 시작:", alert);

  // 기본 정보
  const alertIdElement = document.getElementById("detailAlertId");
  // 알림 ID 요소가 존재하는 경우
  if (alertIdElement) {
    alertIdElement.textContent = alert.id || "-";
  } else {
    console.error("❌ [알림상세팝업] detailAlertId 요소를 찾을 수 없습니다");
  }

  const alertTypeElement = document.getElementById("detailAlertType");
  // 알림 유형 요소가 존재하는 경우
  if (alertTypeElement) {
    alertTypeElement.textContent = alert.alert_type || "-";
  } else {
    console.error("❌ [알림상세팝업] detailAlertType 요소를 찾을 수 없습니다");
  }

  const targetElement = document.getElementById("detailTarget");
  // 대상 요소가 존재하는 경우
  if (targetElement) {
    targetElement.textContent = alert.target || "-";
  } else {
    console.error("❌ [알림상세팝업] detailTarget 요소를 찾을 수 없습니다");
  }

  // 심각도 배지
  const severityElement = document.getElementById("detailSeverity");
  // 심각도 정보가 있는 경우 배지로 표시
  if (alert.severity) {
    const severityClass = alert.severity.toLowerCase();
    severityElement.innerHTML = `<span class="status-badge ${severityClass}">${alert.severity}</span>`;
  } else {
    severityElement.textContent = "-";
  }

  // 상태 배지
  const statusElement = document.getElementById("detailStatus");
  // 상태 정보가 있는 경우 배지로 표시
  if (alert.status) {
    const statusClass =
      alert.status === "Resolved"
        ? "resolved"
        : alert.severity === "Critical"
        ? "critical"
        : alert.severity === "Warning"
        ? "warning"
        : "info";
    statusElement.innerHTML = `<span class="status-badge ${statusClass}">${alert.status}</span>`;
  } else {
    statusElement.textContent = "-";
  }

  // 시간 정보
  const createdAtElement = document.getElementById("detailCreatedAt");
  if (createdAtElement) {
    createdAtElement.textContent = alert.created_at
      ? new Date(alert.created_at).toLocaleString("ko-KR")
      : "-";
  }

  const durationElement = document.getElementById("detailDuration");
  if (durationElement) {
    durationElement.textContent = alert.duration || "-";
  }

  const updatedAtElement = document.getElementById("detailUpdatedAt");
  if (updatedAtElement) {
    updatedAtElement.textContent = alert.updated_at
      ? new Date(alert.updated_at).toLocaleString("ko-KR")
      : "-";
  }

  const resolvedAtElement = document.getElementById("detailResolvedAt");
  if (resolvedAtElement) {
    resolvedAtElement.textContent = alert.resolved_at
      ? new Date(alert.resolved_at).toLocaleString("ko-KR")
      : "-";
  }

  // 메시지 및 설명
  const messageElement = document.getElementById("detailMessage");
  if (messageElement) {
    if (alert.message) {
      messageElement.innerHTML = `<div class="message-box">${alert.message}</div>`;
    } else {
      messageElement.textContent = "-";
    }
  }

  const descriptionElement = document.getElementById("detailDescription");
  if (descriptionElement) {
    descriptionElement.textContent = alert.description || "-";
  }

  // 추가 정보
  const sourceElement = document.getElementById("detailSource");
  if (sourceElement) {
    sourceElement.textContent = alert.source || "-";
  }

  // 라벨 처리
  const labelsElement = document.getElementById("detailLabels");
  // 라벨 요소가 존재하는 경우
  if (labelsElement) {
    // 라벨 데이터가 있고 비어있지 않은 경우
    if (alert.labels && Object.keys(alert.labels).length > 0) {
      const labelHtml = Object.entries(alert.labels)
        .map(
          ([key, value]) => `<span class="label-badge">${key}: ${value}</span>`
        )
        .join("");
      labelsElement.innerHTML = `<div class="label-group">${labelHtml}</div>`;
    } else {
      labelsElement.textContent = "-";
    }
  }

  const metricValueElement = document.getElementById("detailMetricValue");
  if (metricValueElement) {
    metricValueElement.textContent = alert.metric_value || "-";
  }

  const thresholdElement = document.getElementById("detailThreshold");
  if (thresholdElement) {
    thresholdElement.textContent = alert.threshold || "-";
  }

  // 추가 정보
  const escalationLevelElement = document.getElementById(
    "detailEscalationLevel"
  );
  if (escalationLevelElement) {
    escalationLevelElement.textContent = alert.escalation_level
      ? `Level ${alert.escalation_level}`
      : "-";
  }

  const assignedToElement = document.getElementById("detailAssignedTo");
  if (assignedToElement) {
    assignedToElement.textContent = alert.assigned_to || "-";
  }

  // 태그 처리
  const tagsElement = document.getElementById("detailTags");
  if (tagsElement) {
    if (alert.tags && alert.tags.length > 0) {
      const tagHtml = alert.tags
        .map((tag) => `<span class="label-badge">${tag}</span>`)
        .join("");
      tagsElement.innerHTML = `<div class="label-group">${tagHtml}</div>`;
    } else {
      tagsElement.textContent = "-";
    }
  }

  // 영향받는 서비스
  const affectedServicesElement = document.getElementById(
    "detailAffectedServices"
  );
  if (affectedServicesElement) {
    if (alert.affected_services && alert.affected_services.length > 0) {
      const serviceHtml = alert.affected_services
        .map((service) => `<span class="label-badge">${service}</span>`)
        .join("");
      affectedServicesElement.innerHTML = `<div class="label-group">${serviceHtml}</div>`;
    } else {
      affectedServicesElement.textContent = "-";
    }
  }

  // 해결 노트
  const resolutionNotesElement = document.getElementById(
    "detailResolutionNotes"
  );
  if (resolutionNotesElement) {
    if (alert.resolution_notes) {
      resolutionNotesElement.innerHTML = `<div class="message-box">${alert.resolution_notes}</div>`;
    } else {
      resolutionNotesElement.textContent = "-";
    }
  }

  // 알림 상세보기 팝업 버튼 이벤트 설정
  setupModalButtons(alert.id);

  // 해결된 알림인 경우 버튼 상태 업데이트
  updateModalButtonStates(alert.id);
}

// 알림 상세보기 팝업 버튼 이벤트 설정
function setupModalButtons(alertId) {
  // 해결됨으로 표시 버튼은 HTML의 onclick으로 처리
  // 별도의 이벤트 리스너 설정 불필요

  // 새로고침 버튼
  const refreshBtn = document.getElementById("refreshAlertBtn");
  refreshBtn.onclick = async () => {
    try {
      showModalLoading(true);
      const response = await window.AlertsAPI.getAlertDetail(alertId);
      if (response && response.success) {
        // 로딩 상태 해제하고 HTML 복원
        showModalLoading(false);

        // 알림 상세보기 팝업에 데이터 채우기
        populateAlertDetailModal(response.data.alert);
        showToast("알림 정보가 새로고침되었습니다.", "success");
      } else {
        showToast("알림 정보 새로고침에 실패했습니다.", "error");
        showModalLoading(false);
      }
    } catch (error) {
      console.error("알림 새로고침 오류:", error);
      showToast("알림 새로고침 중 오류가 발생했습니다.", "error");
      showModalLoading(false);
    }
  };
}

// 알림 상세보기 팝업 해결 버튼 클릭 핸들러
function handleModalResolve() {
  // 현재 알림 상세보기 팝업에 표시된 알림 ID 가져오기
  const alertIdElement = document.getElementById("detailAlertId");
  if (!alertIdElement) {
    console.error("알림 ID를 찾을 수 없습니다.");
    return;
  }

  const alertId = alertIdElement.textContent;
  if (!alertId || alertId === "-") {
    console.error("유효한 알림 ID가 없습니다.");
    return;
  }

  // 해당 알림이 해결된 상태인지 확인
  const row = document.querySelector(`tr[data-alert-id="${alertId}"]`);
  const isResolved = row && row.style.display === "none";

  // 해결/복원 처리
  toggleAlertResolve(alertId, !isResolved);

  // 현재 포커스된 요소의 포커스 강제 해제 (접근성 개선)
  if (document.activeElement) {
    document.activeElement.blur();
  }

  // 알림 상세보기 팝업 닫기
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("alertDetailModal")
  );
  if (modal) {
    modal.hide();
  }

  // 알림 상세보기 팝업이 완전히 닫힌 후 포커스 이동 (접근성 개선)
  setTimeout(() => {
    const focusableElement = document.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElement) {
      focusableElement.focus();
    }
  }, 300); // Bootstrap 알림 상세보기 팝업 애니메이션 완료 후 실행
}

// 알림 상세보기 팝업 버튼 상태 업데이트
function updateModalButtonStates(alertId) {
  const resolveBtn = document.getElementById("resolveAlertBtn");
  const row = document.querySelector(`tr[data-alert-id="${alertId}"]`);

  // 해당 알림이 해결된 상태인지 확인
  if (row && row.style.display === "none") {
    // 해결된 상태: 버튼을 "복원" 버튼으로 변경
    resolveBtn.innerHTML = '<i class="fas fa-undo me-2"></i>복원';
    resolveBtn.className = "btn btn-warning";
    resolveBtn.title = "알림 복원";
  } else {
    // 활성 상태: 기본 "해결됨으로 표시" 버튼
    resolveBtn.innerHTML = '<i class="fas fa-check me-2"></i>해결됨으로 표시';
    resolveBtn.className = "btn btn-success";
    resolveBtn.title = "해결됨으로 표시";
  }
}

// 알림 상세보기 팝업 로딩 상태 표시
function showModalLoading(show) {
  const modalBody = document.querySelector("#alertDetailModal .modal-body");
  if (show) {
    modalBody.innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">로딩 중...</span>
        </div>
        <p class="mt-3 text-muted">알림 정보를 불러오는 중...</p>
      </div>
    `;
  } else {
    // 로딩이 끝나면 원래 HTML 구조 복원
    restoreModalHTML();
  }
}

// 알림 상세보기 팝업 HTML 구조 복원
function restoreModalHTML() {
  const modalBody = document.querySelector("#alertDetailModal .modal-body");
  if (modalBody) {
    modalBody.innerHTML = `
      <div class="row">
        <!-- 알림 기본 정보 -->
        <div class="col-md-6">
          <div class="alert-detail-section">
            <h6 class="alert-detail-title">
              <i class="fas fa-info-circle me-2"></i>
              기본 정보
            </h6>
            <div class="alert-detail-content">
              <div class="detail-item">
                <span class="detail-label">알림 ID:</span>
                <span class="detail-value" id="detailAlertId">-</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">알림 유형:</span>
                <span class="detail-value" id="detailAlertType">-</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">대상:</span>
                <span class="detail-value" id="detailTarget">-</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">심각도:</span>
                <span class="detail-value" id="detailSeverity">-</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">상태:</span>
                <span class="detail-value" id="detailStatus">-</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 시간 정보 -->
        <div class="col-md-6">
          <div class="alert-detail-section">
            <h6 class="alert-detail-title">
              <i class="fas fa-clock me-2"></i>
              시간 정보
            </h6>
            <div class="alert-detail-content">
              <div class="detail-item">
                <span class="detail-label">발생 시간:</span>
                <span class="detail-value" id="detailCreatedAt">-</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">지속 시간:</span>
                <span class="detail-value" id="detailDuration">-</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">마지막 업데이트:</span>
                <span class="detail-value" id="detailUpdatedAt">-</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">해결 시간:</span>
                <span class="detail-value" id="detailResolvedAt">-</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 메시지 및 설명 -->
      <div class="alert-detail-section mt-3">
        <h6 class="alert-detail-title">
          <i class="fas fa-comment-alt me-2"></i>
          메시지 및 설명
        </h6>
        <div class="alert-detail-content">
          <div class="detail-item">
            <span class="detail-label">메시지:</span>
            <div class="detail-value" id="detailMessage">-</div>
          </div>
          <div class="detail-item">
            <span class="detail-label">설명:</span>
            <div class="detail-value" id="detailDescription">-</div>
          </div>
        </div>
      </div>
      
      <!-- 추가 정보 -->
      <div class="alert-detail-section mt-3">
        <h6 class="alert-detail-title">
          <i class="fas fa-cogs me-2"></i>
          추가 정보
        </h6>
        <div class="alert-detail-content">
          <div class="detail-item">
            <span class="detail-label">소스:</span>
            <span class="detail-value" id="detailSource">-</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">라벨:</span>
            <div class="detail-value" id="detailLabels">-</div>
          </div>
          <div class="detail-item">
            <span class="detail-label">메트릭 값:</span>
            <span class="detail-value" id="detailMetricValue">-</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">임계값:</span>
            <span class="detail-value" id="detailThreshold">-</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">에스컬레이션 레벨:</span>
            <span class="detail-value" id="detailEscalationLevel">-</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">담당자:</span>
            <span class="detail-value" id="detailAssignedTo">-</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">태그:</span>
            <div class="detail-value" id="detailTags">-</div>
          </div>
        </div>
      </div>
      
      <!-- 영향받는 서비스 -->
      <div class="alert-detail-section mt-3">
        <h6 class="alert-detail-title">
          <i class="fas fa-exclamation-triangle me-2"></i>
          영향받는 서비스
        </h6>
        <div class="alert-detail-content">
          <div class="detail-item">
            <span class="detail-label">서비스 목록:</span>
            <div class="detail-value" id="detailAffectedServices">-</div>
          </div>
        </div>
      </div>
      
      <!-- 해결 노트 -->
      <div class="alert-detail-section mt-3">
        <h6 class="alert-detail-title">
          <i class="fas fa-sticky-note me-2"></i>
          해결 노트
        </h6>
        <div class="alert-detail-content">
          <div class="detail-item">
            <span class="detail-label">노트:</span>
            <div class="detail-value" id="detailResolutionNotes">-</div>
          </div>
        </div>
      </div>
    `;
  }
}

// 알림 상세보기 팝업 오류 표시
function showModalError(message) {
  const modalBody = document.querySelector("#alertDetailModal .modal-body");
  modalBody.innerHTML = `
    <div class="text-center py-5">
      <i class="fas fa-exclamation-triangle text-danger" style="font-size: 3rem;"></i>
      <p class="mt-3 text-danger">${message}</p>
      <button class="btn btn-primary" onclick="location.reload()">
        <i class="fas fa-refresh me-2"></i>
        페이지 새로고침
      </button>
    </div>
  `;
}

// 토스트 메시지 표시 (간단한 구현)
function showToast(message, type = "info") {
  // 기존 토스트가 있으면 제거
  const existingToast = document.querySelector(".toast-container");
  if (existingToast) {
    existingToast.remove();
  }

  // 토스트 컨테이너 생성
  const toastContainer = document.createElement("div");
  toastContainer.className = "toast-container position-fixed top-0 end-0 p-3";
  toastContainer.style.zIndex = "9999";

  // 토스트 아이콘과 색상 설정
  const iconClass =
    type === "success"
      ? "fa-check-circle text-success"
      : type === "error"
      ? "fa-exclamation-circle text-danger"
      : "fa-info-circle text-info";

  toastContainer.innerHTML = `
    <div class="toast show" role="alert">
      <div class="toast-header">
        <i class="fas ${iconClass} me-2"></i>
        <strong class="me-auto">알림</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
      </div>
      <div class="toast-body">
        ${message}
      </div>
    </div>
  `;

  document.body.appendChild(toastContainer);

  // 3초 후 자동 제거
  setTimeout(() => {
    if (toastContainer.parentNode) {
      toastContainer.remove();
    }
  }, 3000);
}

// 전역 변수
let alertsData = []; // 알림 데이터
let resolvedAlerts = []; // 해결된 알림 히스토리
let undoStack = []; // Ctrl+Z를 위한 스택

// 알림 해결/복원 기능
function toggleAlertResolve(alertId, isResolved) {
  const row = document.querySelector(`tr[data-alert-id="${alertId}"]`);
  // 해당 알림 행이 존재하지 않는 경우 함수 종료
  if (!row) return;

  // 해결 처리인 경우
  if (isResolved) {
    // 해결 처리: 행을 숨기고 히스토리에 추가
    row.style.display = "none";
    row.classList.add("alert-resolved");

    // 해결된 알림 정보 저장
    const alertData = alertsData.find((alert) => alert.id === alertId);
    // 알림 데이터가 존재하는 경우
    if (alertData) {
      resolvedAlerts.push({
        ...alertData,
        resolvedAt: new Date().toISOString(),
        originalRow: row.cloneNode(true),
      });

      // undo 스택에 추가
      undoStack.push({
        action: "resolve",
        alertId: alertId,
        timestamp: Date.now(),
      });
    }

    showToast(
      `알림 "${alertData?.alert_type || alertId}"이 해결됨으로 표시되었습니다.`,
      "success"
    );
  } else {
    // 복원 처리: 행을 다시 표시
    row.style.display = "";
    row.classList.remove("alert-resolved");

    // 해결된 알림 목록에서 제거
    resolvedAlerts = resolvedAlerts.filter((alert) => alert.id !== alertId);

    showToast(`알림이 복원되었습니다.`, "info");
  }

  // 알림 상세보기 팝업이 열려있는 경우 버튼 상태 업데이트
  const modal = document.getElementById("alertDetailModal");
  if (modal && modal.classList.contains("show")) {
    updateModalButtonStates(alertId);
  }
}

// Ctrl+Z로 마지막 해결된 알림 복원
function undoLastResolve() {
  // 복원할 항목이 없는 경우
  if (undoStack.length === 0) {
    showToast("복원할 항목이 없습니다.", "warning");
    return;
  }

  const lastAction = undoStack.pop();
  // 마지막 액션이 해결 처리인 경우
  if (lastAction.action === "resolve") {
    const resolvedAlert = resolvedAlerts.find(
      (alert) => alert.id === lastAction.alertId
    );
    // 해결된 알림 데이터가 존재하는 경우
    if (resolvedAlert) {
      const row = document.querySelector(
        `tr[data-alert-id="${lastAction.alertId}"]`
      );
      // 해당 행이 존재하는 경우
      if (row) {
        row.style.display = "";
        row.classList.remove("alert-resolved");

        // 체크박스 해제
        const checkbox = row.querySelector(".alert-resolve-checkbox");
        // 체크박스가 존재하는 경우
        if (checkbox) {
          checkbox.checked = false;
        }

        // 해결된 알림 목록에서 제거
        resolvedAlerts = resolvedAlerts.filter(
          (alert) => alert.id !== lastAction.alertId
        );

        showToast(
          `알림 "${resolvedAlert.alert_type}"이 복원되었습니다.`,
          "success"
        );

        // 알림 상세보기 팝업이 열려있는 경우 버튼 상태 업데이트
        const modal = document.getElementById("alertDetailModal");
        if (modal && modal.classList.contains("show")) {
          updateModalButtonStates(lastAction.alertId);
        }
      }
    }
  }
}

// 키보드 이벤트 리스너 (Ctrl+Z)
document.addEventListener("keydown", function (event) {
  // Ctrl+Z 키 조합이 눌린 경우
  if (event.ctrlKey && event.key === "z") {
    event.preventDefault();
    undoLastResolve();
  }
});

// 알림 API 함수들을 전역으로 노출
window.AlertsAPI = {
  getAlerts,
  getAlert,
  getAlertDetail,
  resolveAlert,
  getAlertRules,
  deleteAlertRuleAPI,
  updateAlertRuleAPI,
  loadAlertsData,
  loadAlertRulesData,
  loadRecentAlerts,
  showAlertDetail,
  toggleAlertResolve,
  undoLastResolve,
};

// 전역 함수로 노출
window.handleModalResolve = handleModalResolve;
window.saveAlertRule = saveAlertRule;
