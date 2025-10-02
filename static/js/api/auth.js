/**
 * 인증 관련 API 함수들
 * 로그인, 로그아웃 등의 인증 기능을 담당
 */

/**
 * 로그인 API 호출
 * @param {string} username - 사용자명
 * @param {string} password - 비밀번호
 * @param {boolean} rememberMe - 로그인 상태 유지 여부
 * @returns {Promise<Object>} 로그인 결과
 */
async function loginUser(username, password, rememberMe = false) {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
        remember_me: rememberMe,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      if (data.data.access_token) {
        saveToken(data.data.access_token, rememberMe);
      }
      return {
        success: true,
        data: data.data,
        message: data.message,
      };
    } else {
      return {
        success: false,
        message: data.message || "로그인에 실패했습니다.",
      };
    }
  } catch (error) {
    console.error("로그인 API 오류:", error);
    return {
      success: false,
      message: "로그인 중 오류가 발생했습니다. 다시 시도해주세요.",
    };
  }
}

/**
 * 로그아웃 API 호출
 * @returns {Promise<Object>} 로그아웃 결과
 */
async function logoutUserAPI() {
  try {
    const token = getToken();
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok) {
      // 로컬 및 세션 스토리지에서 토큰 제거
      localStorage.removeItem("access_token");
      sessionStorage.removeItem("access_token");
      localStorage.removeItem("rememberedUser");

      return {
        success: true,
        message: data.message,
      };
    } else {
      return {
        success: false,
        message: data.message || "로그아웃에 실패했습니다.",
      };
    }
  } catch (error) {
    console.error("로그아웃 API 오류:", error);
    return {
      success: false,
      message: "로그아웃 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 현재 사용자 정보 조회
 * @returns {Promise<Object>} 사용자 정보
 */
async function getCurrentUser() {
  try {
    const token = getToken();
    const response = await fetch("/api/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        data: data.data,
      };
    } else {
      return {
        success: false,
        message: data.message || "사용자 정보 조회에 실패했습니다.",
      };
    }
  } catch (error) {
    console.error("사용자 정보 조회 API 오류:", error);
    return {
      success: false,
      message: "사용자 정보 조회 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 토큰 저장
 * @param {string} token - 액세스 토큰
 * @param {boolean} rememberMe - 로그인 상태 유지 여부
 */
function saveToken(token, rememberMe = false) {
  if (rememberMe) {
    localStorage.setItem("access_token", token);
  } else {
    sessionStorage.setItem("access_token", token);
  }
}

/**
 * 저장된 토큰 가져오기
 * @returns {string|null} 액세스 토큰
 */
function getToken() {
  return (
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token")
  );
}

/**
 * 로그인 상태 확인
 * @returns {boolean} 로그인 여부
 */
function isLoggedIn() {
  return getToken() !== null;
}

/**
 * 로그인 페이지로 리다이렉트
 */
function redirectToLogin() {
  window.location.href = "/";
}

/**
 * 홈 페이지로 리다이렉트
 */
function redirectToHome() {
  window.location.href = "/home";
}

/**
 * 사용자 권한 확인 및 관리자 메뉴 제어
 */
async function checkUserPermissions() {
  try {
    console.log("사용자 권한 확인 시작");
    const userResult = await getCurrentUser();
    console.log("사용자 정보 조회 결과:", userResult);

    if (userResult.success) {
      const user = userResult.data;
      console.log("사용자 정보:", user);

      // 관리자 메뉴 요소 찾기
      const adminMenuItem = document.querySelector(
        'a[onclick="navigateToAdmin()"]'
      );
      console.log("관리자 메뉴 요소:", adminMenuItem);

      if (adminMenuItem) {
        if (user.role === "admin") {
          console.log("관리자 권한 확인됨 - 메뉴 표시");
          // 관리자인 경우 메뉴 표시
          adminMenuItem.style.display = "flex";
        } else {
          console.log("관리자 권한 없음 - 메뉴 숨김");
          // 관리자가 아닌 경우 메뉴 숨기기
          adminMenuItem.style.display = "none";
        }
      } else {
        console.log("관리자 메뉴 요소를 찾을 수 없음");
      }

      // 사용자 정보를 전역 변수에 저장 (다른 스크립트에서 사용 가능)
      window.currentUser = user;
      console.log("전역 사용자 정보 설정 완료:", window.currentUser);

      // 사용자 이름 표시 업데이트
      const userDisplayName = document.getElementById("userDisplayName");
      if (userDisplayName) {
        userDisplayName.textContent = user.username;
      }

      // 사용자 메뉴 표시
      const userMenu = document.querySelector(".user-menu");
      if (userMenu) {
        userMenu.style.display = "flex";
      }

      // 사용자 상태 업데이트 타이머 시작
      startUserStatusTimer();

      return user;
    } else {
      console.log("사용자 정보 조회 실패:", userResult.message);
      // 사용자 정보를 가져올 수 없는 경우 관리자 메뉴 숨기기
      const adminMenuItem = document.querySelector(
        'a[onclick="navigateToAdmin()"]'
      );
      if (adminMenuItem) {
        adminMenuItem.style.display = "none";
      }

      // 사용자 메뉴 숨기기
      const userMenu = document.querySelector(".user-menu");
      if (userMenu) {
        userMenu.style.display = "none";
      }

      return null;
    }
  } catch (error) {
    console.error("사용자 권한 확인 중 오류:", error);
    // 오류 발생 시 관리자 메뉴 숨기기
    const adminMenuItem = document.querySelector(
      'a[onclick="navigateToAdmin()"]'
    );
    if (adminMenuItem) {
      adminMenuItem.style.display = "none";
    }

    // 사용자 메뉴 숨기기
    const userMenu = document.querySelector(".user-menu");
    if (userMenu) {
      userMenu.style.display = "none";
    }

    return null;
  }
}

/**
 * 관리자 권한 확인
 * @returns {boolean} 관리자 권한 여부
 */
function isAdmin() {
  return window.currentUser && window.currentUser.role === "admin";
}

/**
 * 사용자 상태 업데이트 (1분 간격)
 */
async function updateUserStatus() {
  try {
    const token = getToken();
    if (!token) {
      return; // 토큰이 없으면 업데이트하지 않음
    }

    const response = await fetch("/api/auth/update-status", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // 토큰이 만료되었거나 유효하지 않은 경우
      if (response.status === 401) {
        console.log("토큰 만료, 로그아웃 처리");
        localStorage.removeItem("access_token");
        sessionStorage.removeItem("access_token");
        localStorage.removeItem("rememberedUser");
        window.location.href = "/";
      }
    }
  } catch (error) {
    console.error("사용자 상태 업데이트 오류:", error);
  }
}

/**
 * 사용자 상태 업데이트 타이머 시작
 */
function startUserStatusTimer() {
  // 로그인된 상태에서만 타이머 시작
  if (isLoggedIn()) {
    // 즉시 한 번 실행
    updateUserStatus();

    // 1분(60000ms) 간격으로 반복 실행
    setInterval(updateUserStatus, 60000);
  }
}

/**
 * 로그아웃 처리 (UI에서 호출)
 */
async function logoutUser() {
  try {
    const result = await logoutUserAPI();

    if (result.success) {
      // 로그아웃 성공 시 로그인 페이지로 리다이렉트
      alert("로그아웃되었습니다.");
      window.location.href = "/";
    } else {
      // 로그아웃 실패 시에도 토큰 제거하고 리다이렉트
      console.warn("로그아웃 API 실패, 로컬 토큰 제거:", result.message);
      localStorage.removeItem("access_token");
      sessionStorage.removeItem("access_token");
      localStorage.removeItem("rememberedUser");
      window.location.href = "/";
    }
  } catch (error) {
    console.error("로그아웃 처리 중 오류:", error);
    // 오류 발생 시에도 토큰 제거하고 리다이렉트
    localStorage.removeItem("access_token");
    sessionStorage.removeItem("access_token");
    localStorage.removeItem("rememberedUser");
    window.location.href = "/";
  }
}
