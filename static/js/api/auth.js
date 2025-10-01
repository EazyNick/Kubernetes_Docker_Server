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
async function logoutUser() {
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
          adminMenuItem.style.display = "block";
          adminMenuItem.parentElement.style.display = "block";
        } else {
          console.log("관리자 권한 없음 - 메뉴 숨김");
          // 관리자가 아닌 경우 메뉴 숨기기
          adminMenuItem.style.display = "none";
          adminMenuItem.parentElement.style.display = "none";
        }
      } else {
        console.log("관리자 메뉴 요소를 찾을 수 없음");
      }

      // 사용자 정보를 전역 변수에 저장 (다른 스크립트에서 사용 가능)
      window.currentUser = user;
      console.log("전역 사용자 정보 설정 완료:", window.currentUser);

      return user;
    } else {
      console.log("사용자 정보 조회 실패:", userResult.message);
      // 사용자 정보를 가져올 수 없는 경우 관리자 메뉴 숨기기
      const adminMenuItem = document.querySelector(
        'a[onclick="navigateToAdmin()"]'
      );
      if (adminMenuItem) {
        adminMenuItem.style.display = "none";
        adminMenuItem.parentElement.style.display = "none";
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
      adminMenuItem.parentElement.style.display = "none";
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
