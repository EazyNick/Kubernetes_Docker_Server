/**
 * 관리자 페이지 API 모듈
 * 사용자 관리, 통계 조회 등의 관리자 기능을 담당
 */

// 관리자 API 네임스페이스
window.AdminAPI = {
  currentPage: 1,
  perPage: 10,
  totalPages: 1,

  /**
   * 관리자 페이지 초기화
   */
  initAdmin() {
    console.log("🔧 관리자 페이지 초기화");
    this.loadAdminStats();
    this.loadUsers();
    this.bindEvents();
  },

  /**
   * 관리자 통계 로드
   */
  async loadAdminStats() {
    try {
      console.log("📊 관리자 통계 로드 중...");
      const response = await fetch("/api/admin/stats", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.updateStatsDisplay(data.data);
        console.log("📊 관리자 통계 로드 완료");
      } else {
        console.error("❌ 관리자 통계 로드 실패:", data.message);
        this.showToast("관리자 통계를 불러올 수 없습니다.", "error");
      }
    } catch (error) {
      console.error("❌ 관리자 통계 로드 오류:", error);
      this.showToast("관리자 통계 로드 중 오류가 발생했습니다.", "error");
    }
  },

  /**
   * 통계 표시 업데이트
   */
  updateStatsDisplay(stats) {
    this.updateElement("totalUsers", stats.total_users);
    this.updateElement("activeUsers", stats.active_users);
    this.updateElement("adminUsers", stats.admin_users);
    this.updateElement("recentLogins", stats.recent_logins);
  },

  /**
   * 사용자 목록 로드
   */
  async loadUsers(page = 1) {
    try {
      console.log(`👥 사용자 목록 로드 중... (페이지: ${page})`);
      this.currentPage = page;

      const response = await fetch(
        `/api/admin/users?page=${page}&per_page=${this.perPage}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.getToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        this.updateUsersTable(data.data.users);
        this.updatePagination(data.data);
        console.log("👥 사용자 목록 로드 완료");
      } else {
        console.error("❌ 사용자 목록 로드 실패:", data.message);
        this.showToast("사용자 목록을 불러올 수 없습니다.", "error");
      }
    } catch (error) {
      console.error("❌ 사용자 목록 로드 오류:", error);
      this.showToast("사용자 목록 로드 중 오류가 발생했습니다.", "error");
    }
  },

  /**
   * 사용자 테이블 업데이트
   */
  updateUsersTable(users) {
    const tbody = document.getElementById("usersTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (users.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center text-muted py-4">
            <i class="fas fa-users fa-2x mb-2"></i><br>
            등록된 사용자가 없습니다.
          </td>
        </tr>
      `;
      return;
    }

    users.forEach((user) => {
      const row = this.createUserRow(user);
      tbody.appendChild(row);
    });
  },

  /**
   * 사용자 행 생성
   */
  createUserRow(user) {
    const row = document.createElement("tr");

    const statusBadge = user.is_active
      ? '<span class="status-badge active"><i class="fas fa-check-circle"></i> 활성</span>'
      : '<span class="status-badge inactive"><i class="fas fa-times-circle"></i> 비활성</span>';

    const roleBadge =
      user.role === "admin"
        ? '<span class="role-badge admin"><i class="fas fa-user-shield"></i> 관리자</span>'
        : '<span class="role-badge user"><i class="fas fa-user"></i> 사용자</span>';

    const createdDate = new Date(user.created_at).toLocaleDateString("ko-KR");
    const lastLogin = user.last_login
      ? new Date(user.last_login).toLocaleDateString("ko-KR")
      : "없음";

    row.innerHTML = `
      <td><strong>${user.username}</strong></td>
      <td>${user.full_name}</td>
      <td>${user.email}</td>
      <td>${roleBadge}</td>
      <td>${statusBadge}</td>
      <td>${createdDate}</td>
      <td>${lastLogin}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-action btn-edit" onclick="AdminAPI.editUser('${user.user_id}')" title="수정">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-action btn-delete" onclick="AdminAPI.deleteUser('${user.user_id}')" title="삭제">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;

    return row;
  },

  /**
   * 페이지네이션 업데이트
   */
  updatePagination(data) {
    const pagination = document.getElementById("pagination");
    if (!pagination) return;

    this.totalPages = Math.ceil(data.total / data.per_page);
    pagination.innerHTML = "";

    // 이전 버튼
    const prevBtn = this.createPaginationButton(
      "이전",
      this.currentPage > 1 ? this.currentPage - 1 : null,
      this.currentPage <= 1
    );
    pagination.appendChild(prevBtn);

    // 페이지 번호들
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = this.createPaginationButton(
        i.toString(),
        i,
        false,
        i === this.currentPage
      );
      pagination.appendChild(pageBtn);
    }

    // 다음 버튼
    const nextBtn = this.createPaginationButton(
      "다음",
      this.currentPage < this.totalPages ? this.currentPage + 1 : null,
      this.currentPage >= this.totalPages
    );
    pagination.appendChild(nextBtn);
  },

  /**
   * 페이지네이션 버튼 생성
   */
  createPaginationButton(text, page, disabled = false, active = false) {
    const li = document.createElement("li");
    li.className = `page-item ${disabled ? "disabled" : ""} ${
      active ? "active" : ""
    }`;

    const a = document.createElement("a");
    a.className = "page-link";
    a.href = "#";
    a.textContent = text;

    if (!disabled && page) {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        this.loadUsers(page);
      });
    }

    li.appendChild(a);
    return li;
  },

  /**
   * 사용자 추가 모달 열기
   */
  openAddUserModal() {
    const modal = new bootstrap.Modal(document.getElementById("userModal"));
    document.getElementById("userModalLabel").textContent = "사용자 추가";
    document.getElementById("userForm").reset();
    document.getElementById("userId").value = "";
    this.clearFormErrors();
    modal.show();
  },

  /**
   * 사용자 수정 모달 열기
   */
  async editUser(userId) {
    try {
      console.log(`✏️ 사용자 수정 모달 열기: ${userId}`);

      // 사용자 정보 가져오기 (현재는 간단한 구현)
      const users = await this.getCurrentUsers();
      const user = users.find((u) => u.user_id === userId);

      if (!user) {
        this.showToast("사용자 정보를 찾을 수 없습니다.", "error");
        return;
      }

      const modal = new bootstrap.Modal(document.getElementById("userModal"));
      document.getElementById("userModalLabel").textContent = "사용자 수정";

      // 폼에 데이터 채우기
      document.getElementById("userId").value = user.user_id;
      document.getElementById("username").value = user.username;
      document.getElementById("password").value = ""; // 비밀번호는 비워둠
      document.getElementById("fullName").value = user.full_name;
      document.getElementById("email").value = user.email;
      document.getElementById("role").value = user.role;
      document.getElementById("isActive").checked = user.is_active;

      this.clearFormErrors();
      modal.show();
    } catch (error) {
      console.error("❌ 사용자 수정 모달 열기 오류:", error);
      this.showToast("사용자 정보를 불러올 수 없습니다.", "error");
    }
  },

  /**
   * 현재 사용자 목록 가져오기 (간단한 구현)
   */
  async getCurrentUsers() {
    const response = await fetch(`/api/admin/users?page=1&per_page=1000`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data.success ? data.data.users : [];
  },

  /**
   * 사용자 삭제 확인 모달 열기
   */
  deleteUser(userId) {
    document.getElementById("deleteUserId").value = userId;
    const modal = new bootstrap.Modal(document.getElementById("deleteModal"));
    modal.show();
  },

  /**
   * 사용자 저장 (추가/수정)
   */
  async saveUser() {
    const form = document.getElementById("userForm");
    const formData = new FormData(form);

    const userId = formData.get("userId");
    const userData = {
      username: formData.get("username"),
      password: formData.get("password"),
      full_name: formData.get("fullName"),
      email: formData.get("email"),
      role: formData.get("role"),
      is_active: formData.get("isActive") === "on",
    };

    // 유효성 검사
    if (!this.validateUserForm(userData, !userId)) {
      return;
    }

    try {
      console.log(`${userId ? "수정" : "추가"} 중...`, userData);

      const url = userId ? `/api/admin/users/${userId}` : "/api/admin/users";
      const method = userId ? "PUT" : "POST";

      // 수정 시 비밀번호가 비어있으면 제거
      if (userId && !userData.password) {
        delete userData.password;
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.showToast(
          `사용자가 성공적으로 ${userId ? "수정" : "추가"}되었습니다.`,
          "success"
        );

        // 모달 닫기
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("userModal")
        );
        modal.hide();

        // 사용자 목록 새로고침
        this.loadUsers(this.currentPage);
      } else {
        console.error(
          `❌ 사용자 ${userId ? "수정" : "추가"} 실패:`,
          data.message
        );
        this.showToast(
          data.message || `사용자 ${userId ? "수정" : "추가"}에 실패했습니다.`,
          "error"
        );
      }
    } catch (error) {
      console.error(`❌ 사용자 ${userId ? "수정" : "추가"} 오류:`, error);
      this.showToast(
        `사용자 ${userId ? "수정" : "추가"} 중 오류가 발생했습니다.`,
        "error"
      );
    }
  },

  /**
   * 사용자 삭제 실행
   */
  async confirmDelete() {
    const userId = document.getElementById("deleteUserId").value;

    try {
      console.log(`🗑️ 사용자 삭제 중: ${userId}`);

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.showToast("사용자가 성공적으로 삭제되었습니다.", "success");

        // 모달 닫기
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("deleteModal")
        );
        modal.hide();

        // 사용자 목록 새로고침
        this.loadUsers(this.currentPage);
      } else {
        console.error("❌ 사용자 삭제 실패:", data.message);
        this.showToast(data.message || "사용자 삭제에 실패했습니다.", "error");
      }
    } catch (error) {
      console.error("❌ 사용자 삭제 오류:", error);
      this.showToast("사용자 삭제 중 오류가 발생했습니다.", "error");
    }
  },

  /**
   * 사용자 폼 유효성 검사
   */
  validateUserForm(userData, isNewUser) {
    let isValid = true;
    this.clearFormErrors();

    // 사용자명 검사
    if (!userData.username || userData.username.trim() === "") {
      this.showFieldError("username", "사용자명을 입력해주세요.");
      isValid = false;
    }

    // 비밀번호 검사 (새 사용자이거나 비밀번호가 입력된 경우)
    if (
      (isNewUser || userData.password) &&
      (!userData.password || userData.password.length < 4)
    ) {
      this.showFieldError("password", "비밀번호는 4자 이상이어야 합니다.");
      isValid = false;
    }

    // 이름 검사
    if (!userData.full_name || userData.full_name.trim() === "") {
      this.showFieldError("fullName", "이름을 입력해주세요.");
      isValid = false;
    }

    // 이메일 검사
    if (!userData.email || userData.email.trim() === "") {
      this.showFieldError("email", "이메일을 입력해주세요.");
      isValid = false;
    } else if (!this.isValidEmail(userData.email)) {
      this.showFieldError("email", "올바른 이메일 형식이 아닙니다.");
      isValid = false;
    }

    return isValid;
  },

  /**
   * 이메일 형식 검사
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * 필드 에러 표시
   */
  showFieldError(fieldName, message) {
    const field = document.getElementById(fieldName);
    const errorElement = document.getElementById(fieldName + "Error");

    if (field) {
      field.classList.add("is-invalid");
    }

    if (errorElement) {
      errorElement.textContent = message;
    }
  },

  /**
   * 폼 에러 초기화
   */
  clearFormErrors() {
    const fields = ["username", "password", "fullName", "email"];
    fields.forEach((fieldName) => {
      const field = document.getElementById(fieldName);
      const errorElement = document.getElementById(fieldName + "Error");

      if (field) {
        field.classList.remove("is-invalid");
      }

      if (errorElement) {
        errorElement.textContent = "";
      }
    });
  },

  /**
   * 이벤트 바인딩
   */
  bindEvents() {
    // 사용자 추가 버튼
    const addUserBtn = document.getElementById("addUserBtn");
    if (addUserBtn) {
      addUserBtn.addEventListener("click", () => this.openAddUserModal());
    }

    // 사용자 저장 버튼
    const saveUserBtn = document.getElementById("saveUserBtn");
    if (saveUserBtn) {
      saveUserBtn.addEventListener("click", () => this.saveUser());
    }

    // 사용자 삭제 확인 버튼
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener("click", () => this.confirmDelete());
    }
  },

  /**
   * 토큰 가져오기
   */
  getToken() {
    return (
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token")
    );
  },

  /**
   * 요소 업데이트 헬퍼
   */
  updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  },

  /**
   * 토스트 알림 표시
   */
  showToast(message, type = "info") {
    const toast = document.getElementById("adminToast");
    const toastMessage = document.getElementById("toastMessage");

    if (toast && toastMessage) {
      toastMessage.textContent = message;

      // 토스트 타입에 따른 아이콘 변경
      const toastHeader = toast.querySelector(".toast-header");
      const icon = toastHeader.querySelector("i");

      if (icon) {
        icon.className = `fas me-2 ${
          type === "success"
            ? "fa-check-circle text-success"
            : type === "error"
            ? "fa-exclamation-circle text-danger"
            : type === "warning"
            ? "fa-exclamation-triangle text-warning"
            : "fa-info-circle text-primary"
        }`;
      }

      const bsToast = new bootstrap.Toast(toast);
      bsToast.show();
    }
  },
};
