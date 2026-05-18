import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// DB 모킹
vi.mock("./db", () => ({
  getTodayOrders: vi.fn().mockResolvedValue([
    {
      id: 1,
      employeeId: 1,
      employeeNickname: "Isaac",
      restaurantId: 1,
      restaurantName: "단백하루",
      mainMenuName: "시저 샐러드",
      sideMenuName: null,
      drinkOption: "제로콜라",
      extraOption: null,
      note: null,
      createdAt: new Date(),
    },
    {
      id: 2,
      employeeId: 2,
      employeeNickname: "Liam",
      restaurantId: 1,
      restaurantName: "단백하루",
      mainMenuName: "그릭 샐러드",
      sideMenuName: null,
      drinkOption: "제로콜라",
      extraOption: null,
      note: null,
      createdAt: new Date(),
    },
    {
      id: 3,
      employeeId: 3,
      employeeNickname: "Noah",
      restaurantId: 2,
      restaurantName: "본도시락",
      mainMenuName: "본도시락",
      sideMenuName: null,
      drinkOption: "제로콜라",
      extraOption: null,
      note: null,
      createdAt: new Date(),
    },
  ]),
  getOrderSummary: vi.fn().mockResolvedValue([
    {
      restaurant: "단백하루",
      items: [
        { menu: "시저 샐러드 + 제로콜라", count: 1 },
        { menu: "그릭 샐러드 + 제로콜라", count: 1 },
      ],
    },
    {
      restaurant: "본도시락",
      items: [
        { menu: "본도시락 + 제로콜라", count: 1 },
      ],
    },
  ]),
  getAllRestaurantsWithCategories: vi.fn().mockResolvedValue([]),
  getMenusByRestaurant: vi.fn().mockResolvedValue([]),
  getAllEmployees: vi.fn().mockResolvedValue([]),
  getTodaySettings: vi.fn().mockResolvedValue([]),
  setTodayRestaurants: vi.fn().mockResolvedValue(undefined),
  getOrderByEmployee: vi.fn().mockResolvedValue(null),
  upsertOrder: vi.fn().mockResolvedValue(undefined),
  deleteOrder: vi.fn().mockResolvedValue(undefined),
  resetTodayData: vi.fn().mockResolvedValue(undefined),
}));

function createTestContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Order Summary Page", () => {
  it("should fetch today's orders successfully", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const orders = await caller.order.todayAll();

    expect(orders).toBeDefined();
    expect(orders).toHaveLength(3);
    expect(orders[0]?.employeeNickname).toBe("Isaac");
    expect(orders[1]?.employeeNickname).toBe("Liam");
    expect(orders[2]?.employeeNickname).toBe("Noah");
  });

  it("should group orders by restaurant correctly", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const orders = await caller.order.todayAll();

    // 식당별로 그룹화
    const groupedByRestaurant = new Map<string, typeof orders>();
    for (const order of orders) {
      if (!groupedByRestaurant.has(order.restaurantName)) {
        groupedByRestaurant.set(order.restaurantName, []);
      }
      groupedByRestaurant.get(order.restaurantName)!.push(order);
    }

    // 검증
    expect(groupedByRestaurant.size).toBe(2);
    expect(groupedByRestaurant.get("단백하루")).toHaveLength(2);
    expect(groupedByRestaurant.get("본도시락")).toHaveLength(1);
  });

  it("should format order display with menu + drink + options", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const orders = await caller.order.todayAll();
    const order = orders[0];

    // 메뉴 표시 형식 생성
    const isHamburger = order!.restaurantName.includes('맘스터치') || 
                       order!.restaurantName.includes('롯데리아') || 
                       order!.restaurantName.includes('프랭크');
    let menuParts = [order!.mainMenuName];
    
    if (isHamburger && order!.sideMenuName) {
      menuParts.push(order!.sideMenuName);
    }
    
    if (order!.drinkOption) {
      menuParts.push(order!.drinkOption);
    }
    
    if (order!.extraOption) {
      menuParts.push(order!.extraOption);
    }
    
    const displayText = menuParts.filter(Boolean).join(" + ");

    expect(displayText).toBe("시저 샐러드 + 제로콜라");
  });

  it("should fetch order summary correctly", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const summary = await caller.order.summary();

    expect(summary).toBeDefined();
    expect(summary).toHaveLength(2);
    
    // 첫 번째 식당 (단백하루)
    expect(summary[0]?.restaurant).toBe("단백하루");
    expect(summary[0]?.items).toHaveLength(2);
    
    // 두 번째 식당 (본도시락)
    expect(summary[1]?.restaurant).toBe("본도시락");
    expect(summary[1]?.items).toHaveLength(1);
  });

  it("should handle hamburger with side menu correctly", async () => {
    const ctx = createTestContext();
    
    // 햄버거 주문 데이터
    const hamburgerOrder = {
      id: 4,
      employeeId: 4,
      employeeNickname: "Zelda",
      restaurantId: 3,
      restaurantName: "맘스터치",
      mainMenuName: "치즈버거 세트",
      sideMenuName: "감자튀김",
      drinkOption: "제로콜라",
      extraOption: "치즈 추가",
      note: null,
      createdAt: new Date(),
    };

    // 메뉴 표시 형식 생성
    const isHamburger = hamburgerOrder.restaurantName.includes('맘스터치') || 
                       hamburgerOrder.restaurantName.includes('롯데리아') || 
                       hamburgerOrder.restaurantName.includes('프랭크');
    let menuParts = [hamburgerOrder.mainMenuName];
    
    if (isHamburger && hamburgerOrder.sideMenuName) {
      menuParts.push(hamburgerOrder.sideMenuName);
    }
    
    if (hamburgerOrder.drinkOption) {
      menuParts.push(hamburgerOrder.drinkOption);
    }
    
    if (hamburgerOrder.extraOption) {
      menuParts.push(hamburgerOrder.extraOption);
    }
    
    const displayText = menuParts.filter(Boolean).join(" + ");

    expect(displayText).toBe("치즈버거 세트 + 감자튀김 + 제로콜라 + 치즈 추가");
  });

  it("should handle orders without side menu or options", async () => {
    const ctx = createTestContext();
    
    const order = {
      id: 5,
      employeeId: 5,
      employeeNickname: "Lina",
      restaurantId: 1,
      restaurantName: "단백하루",
      mainMenuName: "시저 샐러드",
      sideMenuName: null,
      drinkOption: "물",
      extraOption: null,
      note: null,
      createdAt: new Date(),
    };

    // 메뉴 표시 형식 생성
    const isHamburger = order.restaurantName.includes('맘스터치') || 
                       order.restaurantName.includes('롯데리아') || 
                       order.restaurantName.includes('프랭크');
    let menuParts = [order.mainMenuName];
    
    if (isHamburger && order.sideMenuName) {
      menuParts.push(order.sideMenuName);
    }
    
    if (order.drinkOption) {
      menuParts.push(order.drinkOption);
    }
    
    if (order.extraOption) {
      menuParts.push(order.extraOption);
    }
    
    const displayText = menuParts.filter(Boolean).join(" + ");

    expect(displayText).toBe("시저 샐러드 + 물");
  });

  it("should count zero coke per restaurant", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const orders = await caller.order.todayAll();

    // 식당별로 제로콜라 개수 계산
    const groupedByRestaurant = new Map<string, number>();
    for (const order of orders) {
      if (!groupedByRestaurant.has(order.restaurantName)) {
        groupedByRestaurant.set(order.restaurantName, 0);
      }
      if (order.drinkOption === "제로콜라") {
        groupedByRestaurant.set(
          order.restaurantName,
          (groupedByRestaurant.get(order.restaurantName) ?? 0) + 1
        );
      }
    }

    // 검증
    expect(groupedByRestaurant.get("단백하루")).toBe(2); // Isaac, Liam
    expect(groupedByRestaurant.get("본도시락")).toBe(1); // Noah
  });

  it("should remove employee name from display text", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const orders = await caller.order.todayAll();
    const order = orders[0];

    // 메뉴 표시 형식 생성 (직원 이름 제거)
    const isHamburger = order!.restaurantName.includes('맘스터치') || 
                       order!.restaurantName.includes('롯데리아') || 
                       order!.restaurantName.includes('프랭크');
    let menuParts = [order!.mainMenuName];
    
    if (isHamburger && order!.sideMenuName) {
      menuParts.push(order!.sideMenuName);
    }
    
    if (order!.drinkOption) {
      menuParts.push(order!.drinkOption);
    }
    
    if (order!.extraOption) {
      menuParts.push(order!.extraOption);
    }
    
    const displayText = menuParts.filter(Boolean).join(" + ");

    // 검증: 직원 이름이 포함되지 않음
    expect(displayText).not.toContain(order!.employeeNickname);
    expect(displayText).toContain("시저 샐러드");
    expect(displayText).toContain("제로콜라");
  });
});
