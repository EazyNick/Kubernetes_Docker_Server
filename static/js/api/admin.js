/**
 * 관리자 페이지 관련 JavaScript 함수들
 * 권한 확인, 관리자 페이지 접근, 사용자 관리 등의 기능을 담당
 */

/**
 * 관리자 페이지로 이동하는 함수
 */
async function navigateToAdmin() {
  const token = getToken();
  if (!token) {
    alert("로그인이 필요합니다.");
    window.location.href = "/";
    return;
  }

  try {
    // 토큰을 쿼리 파라미터로 전달하여 관리자 페이지 접근
    window.location.href = `/admin?token=${encodeURIComponent(token)}`;
  } catch (error) {
    console.error("관리자 페이지 접근 오류:", error);
    alert("페이지 접근 중 오류가 발생했습니다.");
  }
}

/**
 * 관리자 페이지 초기화
 */
async function initializeAdminPage() {
  try {
    console.log("관리자 페이지 초기화 시작");

    // 관리자 통계 로드
    await loadAdminStats();

    // 사용자 목록 로드
    await loadUsers();

    // 이벤트 리스너 설정
    setupEventListeners();

    console.log("관리자 페이지 초기화 완료");
  } catch (error) {
    console.error("관리자 페이지 초기화 오류:", error);
  }
}

/**
 * 관리자 통계 로드
 */
async function loadAdminStats() {
  try {
    const token = getToken();
    const response = await fetch("/api/admin/stats", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        updateStatsDisplay(data.data);
      }
    } else {
      console.error("통계 로드 실패:", response.status);
    }
  } catch (error) {
    console.error("통계 로드 오류:", error);
  }
}

/**
 * 통계 표시 업데이트
 */
function updateStatsDisplay(stats) {
  const elements = {
    totalUsers: document.getElementById("totalUsers"),
    activeUsers: document.getElementById("activeUsers"),
    adminUsers: document.getElementById("adminUsers"),
    recentLogins: document.getElementById("recentLogins"),
    newUsersToday: document.getElementById("newUsersToday"),
  };

  if (elements.totalUsers)
    elements.totalUsers.textContent = stats.total_users || 0;
  if (elements.activeUsers)
    elements.activeUsers.textContent = stats.active_users || 0;
  if (elements.adminUsers)
    elements.adminUsers.textContent = stats.admin_users || 0;
  if (elements.recentLogins)
    elements.recentLogins.textContent = stats.recent_logins || 0;
  if (elements.newUsersToday)
    elements.newUsersToday.textContent = stats.new_users_today || 0;
}

/**
 * 사용자 목록 로드
 */
async function loadUsers(page = 1, search = "") {
  try {
    const token = getToken();
    const url = new URL("/api/admin/users", window.location.origin);
    url.searchParams.append("page", page);
    url.searchParams.append("per_page", 10);
    if (search) {
      url.searchParams.append("search", search);
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        updateUsersTable(data.data);
        updatePagination(data.data);
      }
    } else {
      console.error("사용자 목록 로드 실패:", response.status);
    }
  } catch (error) {
    console.error("사용자 목록 로드 오류:", error);
  }
}

/**
 * 사용자 테이블 업데이트
 */
function updateUsersTable(data) {
  const tbody = document.querySelector("#usersTable tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  data.users.forEach((user) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>
                <span class="badge ${getRoleBadgeClass(
                  user.role
                )}">${getRoleText(user.role)}</span>
            </td>
            <td>
                <span class="badge ${getStatusBadgeClass(
                  user.is_active
                )}">${getStatusText(user.is_active)}</span>
            </td>
            <td>${formatDate(user.created_at)}</td>
            <td>${user.last_login ? formatDate(user.last_login) : "없음"}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="editUser('${
                  user.user_id
                }')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteUser('${
                  user.user_id
                }')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
    tbody.appendChild(row);
  });
}

/**
 * 역할 배지 클래스 반환
 */
function getRoleBadgeClass(role) {
  switch (role) {
    case "admin":
      return "bg-danger";
    case "user":
      return "bg-primary";
    case "guest":
      return "bg-secondary";
    default:
      return "bg-secondary";
  }
}

/**
 * 역할 텍스트 반환
 */
function getRoleText(role) {
  switch (role) {
    case "admin":
      return "관리자";
    case "user":
      return "사용자";
    case "guest":
      return "게스트";
    default:
      return "알 수 없음";
  }
}

/**
 * 상태 배지 클래스 반환
 */
function getStatusBadgeClass(isActive) {
  return isActive ? "bg-success" : "bg-warning";
}

/**
 * 상태 텍스트 반환
 */
function getStatusText(isActive) {
  return isActive ? "활성" : "비활성";
}

/**
 * 날짜 포맷팅
 */
function formatDate(dateString) {
  if (!dateString) return "없음";
  const date = new Date(dateString);
  return (
    date.toLocaleDateString("ko-KR") + " " + date.toLocaleTimeString("ko-KR")
  );
}

/**
 * 페이지네이션 업데이트
 */
function updatePagination(data) {
  const pagination = document.getElementById("pagination");
  if (!pagination) return;

  const totalPages = data.total_pages || 1;
  const currentPage = data.page || 1;

  let paginationHTML = "";

  // 이전 페이지
  if (currentPage > 1) {
    paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="loadUsers(${
      currentPage - 1
    })">이전</a></li>`;
  }

  // 페이지 번호들
  for (let i = 1; i <= totalPages; i++) {
    const activeClass = i === currentPage ? "active" : "";
    paginationHTML += `<li class="page-item ${activeClass}"><a class="page-link" href="#" onclick="loadUsers(${i})">${i}</a></li>`;
  }

  // 다음 페이지
  if (currentPage < totalPages) {
    paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="loadUsers(${
      currentPage + 1
    })">다음</a></li>`;
  }

  pagination.innerHTML = paginationHTML;
}

/**
 * 이벤트 리스너 설정
 */
function setupEventListeners() {
  // 사용자 검색
  const searchInput = document.getElementById("userSearch");
  if (searchInput) {
    searchInput.addEventListener(
      "input",
      debounce((e) => {
        loadUsers(1, e.target.value);
      }, 500)
    );
  }

  // 새 사용자 추가 버튼
  const addUserBtn = document.getElementById("addUserBtn");
  if (addUserBtn) {
    addUserBtn.addEventListener("click", showAddUserModal);
  }

  // 사용자 저장 버튼
  const saveUserBtn = document.getElementById("saveUserBtn");
  if (saveUserBtn) {
    saveUserBtn.addEventListener("click", saveUser);
  }

  // 사용자 삭제 확인 버튼
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", confirmDeleteUser);
  }
}

/**
 * 디바운스 함수
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 사용자 편집
 */
async function editUser(userId) {
  try {
    const token = getToken();
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        const user = data.data;

        // 모달에 데이터 채우기
        document.getElementById("userModalLabel").textContent = "사용자 수정";
        document.getElementById("userId").value = user.user_id;
        document.getElementById("username").value = user.username;
        document.getElementById("email").value = user.email;
        document.getElementById("role").value = user.role;
        document.getElementById("isActive").checked = user.is_active;

        // 비밀번호 필드 숨기기 (수정 시에는 비밀번호 변경 불가)
        const passwordField = document.getElementById("password").parentElement;
        if (passwordField) {
          passwordField.style.display = "none";
        }

        // 비밀번호 필드 필수 해제
        document.getElementById("password").required = false;

        // 모달 표시
        const modal = new bootstrap.Modal(document.getElementById("userModal"));
        modal.show();
      }
    } else {
      alert("사용자 정보를 가져올 수 없습니다.");
    }
  } catch (error) {
    console.error("사용자 편집 오류:", error);
    alert("사용자 편집 중 오류가 발생했습니다.");
  }
}

/**
 * 사용자 삭제
 */
async function deleteUser(userId) {
  // 삭제 확인 모달 표시
  const deleteModal = new bootstrap.Modal(
    document.getElementById("deleteModal")
  );
  document.getElementById("deleteUserId").value = userId;
  deleteModal.show();
}

/**
 * 사용자 삭제 확인 실행
 */
async function confirmDeleteUser() {
  const userId = document.getElementById("deleteUserId").value;

  if (!userId) {
    alert("삭제할 사용자 ID가 없습니다.");
    return;
  }

  try {
    const token = getToken();

    // 삭제 버튼 비활성화 (중복 클릭 방지)
    const deleteBtn = document.getElementById("confirmDeleteBtn");
    const originalText = deleteBtn.innerHTML;
    deleteBtn.disabled = true;
    deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 삭제 중...';

    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // 버튼 상태 복원
    deleteBtn.disabled = false;
    deleteBtn.innerHTML = originalText;

    if (response.ok) {
      // 삭제 모달 닫기
      const deleteModal = bootstrap.Modal.getInstance(
        document.getElementById("deleteModal")
      );
      deleteModal.hide();

      // 성공 메시지 표시
      showToast("사용자가 성공적으로 삭제되었습니다.", "success");

      // 목록과 통계 모두 새로고침
      await Promise.all([loadUsers(), loadAdminStats()]);
    } else {
      const data = await response.json();
      showToast("삭제 실패: " + (data.message || "알 수 없는 오류"), "error");
    }
  } catch (error) {
    console.error("사용자 삭제 오류:", error);
    showToast("사용자 삭제 중 오류가 발생했습니다.", "error");

    // 버튼 상태 복원
    const deleteBtn = document.getElementById("confirmDeleteBtn");
    deleteBtn.disabled = false;
    deleteBtn.innerHTML = "삭제";
  }
}

/**
 * 새 사용자 추가 모달 표시
 */
function showAddUserModal() {
  // 모달 초기화
  document.getElementById("userModalLabel").textContent = "사용자 추가";
  document.getElementById("userForm").reset();
  document.getElementById("userId").value = "";

  // 비밀번호 필드 표시 (추가 모드)
  const passwordField = document.getElementById("password").parentElement;
  passwordField.style.display = "block";

  // 비밀번호 필드 필수로 설정
  document.getElementById("password").required = true;

  // 활성 상태 체크박스 기본값 설정
  document.getElementById("isActive").checked = true;

  // 역할 기본값 설정
  document.getElementById("role").value = "user";

  // 모달 표시
  const modal = new bootstrap.Modal(document.getElementById("userModal"));
  modal.show();
}

/**
 * 사용자 저장 (추가/수정)
 */
async function saveUser() {
  const form = document.getElementById("userForm");
  const formData = new FormData(form);

  // 입력 검증
  const username = formData.get("username");
  const password = formData.get("password");
  const email = formData.get("email");
  const role = formData.get("role");
  const isActive = formData.get("isActive") === "on";

  // 필수 필드 검증
  if (!username || !email) {
    alert("사용자명과 이메일은 필수 입력 항목입니다.");
    return;
  }

  const userId = document.getElementById("userId").value;
  const isEdit = userId !== "";

  // 새 사용자 추가 시 비밀번호 필수
  if (!isEdit && !password) {
    alert("새 사용자 추가 시 비밀번호는 필수 입력 항목입니다.");
    return;
  }

  // 이메일 형식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("올바른 이메일 형식을 입력해주세요.");
    return;
  }

  const userData = {
    username: username,
    password: password,
    email: email,
    role: role,
    is_active: isActive,
  };

  try {
    const token = getToken();
    const url = isEdit ? `/api/admin/users/${userId}` : "/api/admin/users";
    const method = isEdit ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      const data = await response.json();

      // 성공 메시지 표시
      showToast(
        isEdit
          ? "사용자 정보가 수정되었습니다."
          : "사용자가 성공적으로 추가되었습니다.",
        "success"
      );

      // 모달 닫기
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("userModal")
      );
      modal.hide();

      // 목록과 통계 새로고침
      await Promise.all([loadUsers(), loadAdminStats()]);
    } else {
      const errorData = await response.json();
      showToast(
        "저장 실패: " + (errorData.detail || "알 수 없는 오류"),
        "error"
      );
    }
  } catch (error) {
    console.error("사용자 저장 오류:", error);
    showToast("사용자 저장 중 오류가 발생했습니다.", "error");
  }
}

/**
 * Toast 메시지 표시
 */
function showToast(message, type = "info") {
  const toastElement = document.getElementById("adminToast");
  const toastBody = document.getElementById("toastMessage");

  if (toastElement && toastBody) {
    // 메시지 설정
    toastBody.textContent = message;

    // 타입에 따른 아이콘 설정
    const toastHeader = toastElement.querySelector(".toast-header i");
    if (toastHeader) {
      toastHeader.className = `fas me-2 text-${
        type === "success" ? "success" : type === "error" ? "danger" : "primary"
      }`;
      toastHeader.className +=
        type === "success"
          ? " fa-check-circle"
          : type === "error"
          ? " fa-exclamation-circle"
          : " fa-info-circle";
    }

    // Toast 표시
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
  } else {
    // Toast 요소가 없으면 기본 alert 사용
    alert(message);
  }
}

/**
 * 모달 포커스 관리 (전역 이벤트 리스너)
 */
document.addEventListener("DOMContentLoaded", function () {
  // 사용자 모달 포커스 관리
  const userModal = document.getElementById("userModal");
  if (userModal) {
    userModal.addEventListener("shown.bs.modal", function () {
      const firstInput = document.getElementById("username");
      if (firstInput) {
        firstInput.focus();
      }
    });

    // 모달이 닫히기 전에 포커스 제거
    userModal.addEventListener("hide.bs.modal", function () {
      const activeElement = document.activeElement;
      if (activeElement && userModal.contains(activeElement)) {
        activeElement.blur();
      }
    });

    // 포커스 트랩 (Tab 키로 모달 밖으로 나가는 것 방지)
    userModal.addEventListener("keydown", function (e) {
      if (e.key === "Tab") {
        const focusableElements = userModal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    });
  }

  // 삭제 모달 포커스 관리
  const deleteModal = document.getElementById("deleteModal");
  if (deleteModal) {
    deleteModal.addEventListener("shown.bs.modal", function () {
      const confirmBtn = document.getElementById("confirmDeleteBtn");
      if (confirmBtn) {
        confirmBtn.focus();
      }
    });

    // 모달이 닫히기 전에 포커스 제거
    deleteModal.addEventListener("hide.bs.modal", function () {
      const activeElement = document.activeElement;
      if (activeElement && deleteModal.contains(activeElement)) {
        activeElement.blur();
      }
    });
  }
});

/**
 * 페이지 로드 시 사용자 권한 확인
 */
document.addEventListener("DOMContentLoaded", async function () {
  // 로그인 상태 확인
  if (isLoggedIn()) {
    // 사용자 권한 확인 및 메뉴 제어
    await checkUserPermissions();
  } else {
    // 로그인하지 않은 경우 관리자 메뉴와 사용자 메뉴 숨기기
    const adminMenuItem = document.querySelector(
      'a[onclick="navigateToAdmin()"]'
    );
    if (adminMenuItem) {
      adminMenuItem.style.display = "none";
    }

    const userMenu = document.querySelector(".user-menu");
    if (userMenu) {
      userMenu.style.display = "none";
    }
  }

  // 관리자 페이지인 경우 초기화
  if (
    window.location.pathname === "/admin" ||
    window.location.pathname.includes("/admin")
  ) {
    // 약간의 지연을 두고 초기화 (DOM이 완전히 로드된 후)
    setTimeout(async () => {
      await initializeAdminPage();
    }, 100);
  }
});
