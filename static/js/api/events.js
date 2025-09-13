/**
 * 이벤트 관련 API 함수들
 * /api/events/* 엔드포인트 호출
 */

// 이벤트 목록 조회
async function getEvents() {
  try {
    const response = await fetch("/api/events");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching events:", error);
    return null;
  }
}

// 특정 이벤트 상세 정보 조회
async function getEvent(eventId) {
  try {
    const response = await fetch(`/api/events/${eventId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}

// 특정 네임스페이스의 이벤트 조회
async function getEventsByNamespace(namespace) {
  try {
    const response = await fetch(`/api/events/namespace/${namespace}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching events by namespace:", error);
    return null;
  }
}

// 이벤트 API 함수들을 전역으로 노출
window.EventsAPI = {
  getEvents,
  getEvent,
  getEventsByNamespace,
};
