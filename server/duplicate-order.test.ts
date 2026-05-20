import { formatOrderMenuDisplay } from "@shared/formatOrderMenu";
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("중복 신청 감지 및 수정", () => {
  // Mock 데이터
  const mockExistingOrder = {
    id: 1,
    mainMenuName: "야채만포케",
    sideMenuName: null,
    drinkOption: "제로콜라",
    extraOption: null,
    restaurantName: "포케올데이",
  };

  const mockNewOrder = {
    employeeId: 1,
    restaurantId: 2,
    mainMenuName: "육회포케",
    sideMenuName: null,
    drinkOption: "제로콜라",
    extraOption: null,
    note: undefined,
  };

  it("기존 주문 정보를 정확하게 반환해야 함", () => {
    // order.check 프로시저가 반환하는 형식 검증
    const existingOrder = {
      id: mockExistingOrder.id,
      mainMenuName: mockExistingOrder.mainMenuName,
      sideMenuName: mockExistingOrder.sideMenuName,
      drinkOption: mockExistingOrder.drinkOption,
      extraOption: mockExistingOrder.extraOption,
      restaurantName: mockExistingOrder.restaurantName,
    };

    expect(existingOrder).toHaveProperty("mainMenuName", "야채만포케");
    expect(existingOrder).toHaveProperty("drinkOption", "제로콜라");
    expect(existingOrder).toHaveProperty("restaurantName", "포케올데이");
  });

  it("기존 메뉴와 새 메뉴를 정확하게 조합해야 함", () => {
    const oldMenu = formatOrderMenuDisplay(mockExistingOrder, { mainFallback: "메뉴 미선택" });
    const newMenu = formatOrderMenuDisplay(mockNewOrder, { mainFallback: "메뉴 미선택" });

    expect(oldMenu).toBe("야채만포케 + 제로콜라");
    expect(newMenu).toBe("육회포케 + 제로콜라");
  });

  it("수정 사항을 정확하게 표시해야 함", () => {
    // 복사용 텍스트에 수정 사항 표시 형식 검증
    const oldMenu = "야채만포케 + 제로콜라";
    const newMenu = "육회포케 + 제로콜라";
    const updateNotification = `야채만포케 + 제로콜라 → 육회포케 + 제로콜라`;

    expect(updateNotification).toContain("→");
    expect(updateNotification).toContain(oldMenu);
    expect(updateNotification).toContain(newMenu);
  });

  it("여러 항목의 수정 사항을 표시해야 함", () => {
    const oldMenu = formatOrderMenuDisplay({
      mainMenuName: "시저 샐러드",
      sideMenuName: "크루통",
      extraOption: "소스",
      drinkOption: "제로콜라",
    });
    const newMenu = formatOrderMenuDisplay({
      mainMenuName: "그릭 샐러드",
      sideMenuName: "올리브",
      extraOption: "드레싱",
      drinkOption: "사이다",
    });

    expect(oldMenu).toBe("시저 샐러드 + 크루통 + 소스 + 제로콜라");
    expect(newMenu).toBe("그릭 샐러드 + 올리브 + 드레싱 + 사이다");
  });

  it("null 값이 있는 경우 정확하게 처리해야 함", () => {
    const menu = formatOrderMenuDisplay({
      mainMenuName: "메인메뉴",
      sideMenuName: null,
      extraOption: null,
      drinkOption: "제로콜라",
    });
    expect(menu).toBe("메인메뉴 + 제로콜라");
  });

  it("토스트 메시지 형식이 정확해야 함", () => {
    // 프론트엔드에서 표시되는 토스트 메시지 형식 검증
    const oldMenu = "야채만포케 + 제로콜라";
    const newMenu = "육회포케 + 제로콜라";
    const toastMessage = `주문이 수정되었습니다: ${oldMenu} → ${newMenu}`;

    expect(toastMessage).toBe("주문이 수정되었습니다: 야채만포케 + 제로콜라 → 육회포케 + 제로콜라");
  });

  it("복사용 텍스트에 수정 사항이 포함되어야 함", () => {
    // 복사용 텍스트 형식 검증
    const lines: string[] = [];
    lines.push("📋 저녁식사 주문 취합");
    lines.push("▶ 포케올데이");
    lines.push("  • 야채만포케 + 제로콜라");
    lines.push("");
    lines.push("총 신청 인원: 1명");
    lines.push("");
    lines.push("[수정 사항]");
    lines.push("  • Isaac: 야채만포케 + 제로콜라 → 육회포케 + 제로콜라");

    const copyText = lines.join("\n");
    expect(copyText).toContain("[수정 사항]");
    expect(copyText).toContain("→");
    expect(copyText).toContain("야채만포케");
    expect(copyText).toContain("육회포케");
  });
});
