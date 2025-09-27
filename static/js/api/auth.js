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
    const token = localStorage.getItem("access_token");
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok) {
      // 로컬 스토리지에서 토큰 제거
      localStorage.removeItem("access_token");
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
    const token = localStorage.getItem("access_token");
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
