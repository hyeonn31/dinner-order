import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// DB 모킹
vi.mock("./db", () => ({
  getAllRestaurantsWithCategories: vi.fn().mockResolvedValue([
    { id: 1, name: "한솥도시락", categoryId: 1, categoryName: "한식", categorySortOrder: 1, sortOrder: 1, isActive: true },
    { id: 2, name: "맥도날드", categoryId: 4, categoryName: "햄버거", categorySortOrder: 4, sortOrder: 1, isActive: true },
  ]),
  getMenusByRestaurant: vi.fn().mockResolvedValue([
    { id: 1, restaurantId: 1, name: "불고기도시락", itemType: "main", sortOrder: 1 },
    { id: 2, restaurantId: 1, name: "제로콜라", itemType: "drink", sortOrder: 1 },
  ]),
  getAllEmployees: vi.fn().mockResolvedValue([
    { id: 1, nickname: "홍길동", sortOrder: 1, isActive: true },
    { id: 2, nickname: "김철수", sortOrder: 2, isActive: true },
  ]),
  getTodaySettings: vi.fn().mockResolvedValue([
    { id: 1, restaurantId: 1, restaurantName: "한솥도시락", categoryId: 1, categoryName: "한식" },
  ]),
  setTodayRestaurants: vi.fn().mockResolvedValue(undefined),
  getTodayOrders: vi.fn().mockResolvedValue([
    {
      id: 1,
      employeeId: 1,
      employeeNickname: "홍길동",
      restaurantId: 1,
      restaurantName: "한솥도시락",
      mainMenuName: "불고기도시락",
      sideMenuName: null,
      drinkOption: "제로콜라",
      extraOption: null,
      note: null,
      createdAt: new Date(),
    },
  ]),
  getOrderByEmployee: vi.fn().mockResolvedValue(null),
  upsertOrder: vi.fn().mockResolvedValue(undefined),
  deleteOrder: vi.fn().mockResolvedValue(undefined),
  resetTodayData: vi.fn().mockResolvedValue(undefined),
  getOrderSummary: vi.fn().mockResolvedValue([
    {
      restaurant: "한솥도시락",
      items: [
        { menu: "불고기도시락", count: 1 },
        { menu: "[음료] 제로콜라", count: 1 },
      ],
    },
  ]),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
  getDb: vi.fn().mockResolvedValue(null),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("restaurant router", () => {
  it("list returns all restaurants with categories", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.restaurant.list();
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("한솥도시락");
    expect(result[0].categoryName).toBe("한식");
  });

  it("menus returns menus for a restaurant", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.restaurant.menus({ restaurantId: 1 });
    expect(result).toHaveLength(2);
    expect(result[0].itemType).toBe("main");
  });
});

describe("employee router", () => {
  it("list returns all active employees", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.employee.list();
    expect(result).toHaveLength(2);
    expect(result[0].nickname).toBe("홍길동");
  });
});

describe("daily router", () => {
  it("todayRestaurants returns today settings", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.daily.todayRestaurants();
    expect(result).toHaveLength(1);
    expect(result[0].restaurantName).toBe("한솥도시락");
  });

  it("setRestaurants returns success", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.daily.setRestaurants({ restaurantIds: [1, 2] });
    expect(result.success).toBe(true);
  });

  it("reset returns success", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.daily.reset();
    expect(result.success).toBe(true);
  });
});

describe("order router", () => {
  it("todayAll returns today orders", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.order.todayAll();
    expect(result).toHaveLength(1);
    expect(result[0].employeeNickname).toBe("홍길동");
    expect(result[0].mainMenuName).toBe("불고기도시락");
  });

  it("submit returns success", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.order.submit({
      employeeId: 1,
      restaurantId: 1,
      mainMenuName: "불고기도시락",
      drinkOption: "제로콜라",
    });
    expect(result.success).toBe(true);
  });

  it("cancel returns success", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.order.cancel({ employeeId: 1 });
    expect(result.success).toBe(true);
  });

  it("summary returns grouped order summary", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.order.summary();
    expect(result).toHaveLength(1);
    expect(result[0].restaurant).toBe("한솥도시락");
    expect(result[0].items[0].menu).toBe("불고기도시락");
    expect(result[0].items[0].count).toBe(1);
  });
});
