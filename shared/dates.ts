/** `<input type="date">`용 로컬 날짜 (YYYY-MM-DD) */
export function formatDateInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** 주문 이력 기본 범위: 시작 = 한 달 전, 종료 = 오늘 */
export function getHistoryDefaultDateRange() {
  const end = new Date();
  const start = new Date(end);
  start.setMonth(start.getMonth() - 1);
  return {
    startDate: formatDateInput(start),
    endDate: formatDateInput(end),
  };
}
