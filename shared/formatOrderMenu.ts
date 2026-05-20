export type OrderMenuFields = {
  mainMenuName?: string | null;
  sideMenuName?: string | null;
  extraOption?: string | null;
  drinkOption?: string | null;
};

const SKIP_MENU_PARTS = new Set(["", "none", "선택 안함"]);

/** 직원이 실제로 선택한 메뉴 항목인지 (식당 종류와 무관) */
export function isSelectedMenuPart(value?: string | null): boolean {
  if (!value?.trim()) return false;
  return !SKIP_MENU_PARTS.has(value.trim());
}

/** 주문 메뉴 표시: 메인 + 사이드 + 추가옵션 + 음료 (사이드는 선택 시 모든 식당에 표시) */
export function formatOrderMenuDisplay(
  order: OrderMenuFields,
  options?: { mainFallback?: string }
): string {
  const parts: string[] = [];
  if (order.mainMenuName) {
    parts.push(order.mainMenuName);
  } else if (options?.mainFallback) {
    parts.push(options.mainFallback);
  }
  if (isSelectedMenuPart(order.sideMenuName)) parts.push(order.sideMenuName!.trim());
  if (isSelectedMenuPart(order.extraOption)) parts.push(order.extraOption!.trim());
  if (isSelectedMenuPart(order.drinkOption)) parts.push(order.drinkOption!.trim());
  return parts.length > 0 ? parts.join(" + ") : "-";
}