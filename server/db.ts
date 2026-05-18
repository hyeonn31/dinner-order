import { and, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users, restaurants, restaurantCategories,
  menuItems, employees, dailySettings, orders
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── 식당 관련 ────────────────────────────────────────────────
export async function getAllRestaurantsWithCategories() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select({
      id: restaurants.id,
      name: restaurants.name,
      isActive: restaurants.isActive,
      sortOrder: restaurants.sortOrder,
      categoryId: restaurantCategories.id,
      categoryName: restaurantCategories.name,
      categorySortOrder: restaurantCategories.sortOrder,
    })
    .from(restaurants)
    .innerJoin(restaurantCategories, eq(restaurants.categoryId, restaurantCategories.id))
    .orderBy(restaurantCategories.sortOrder, restaurants.sortOrder);
}

export async function getMenusByRestaurant(restaurantId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.restaurantId, restaurantId))
    .orderBy(menuItems.itemType, menuItems.sortOrder);
}

// ─── 직원 관련 ────────────────────────────────────────────────
export async function getAllEmployees() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(employees)
    .where(eq(employees.isActive, true))
    .orderBy(employees.sortOrder);
}

// ─── 일일 설정 관련 ──────────────────────────────────────────
export async function getTodaySettings(today: string) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select({
      id: dailySettings.id,
      restaurantId: dailySettings.restaurantId,
      restaurantName: restaurants.name,
      categoryId: restaurantCategories.id,
      categoryName: restaurantCategories.name,
      isClosed: dailySettings.isClosed,
    })
    .from(dailySettings)
    .innerJoin(restaurants, eq(dailySettings.restaurantId, restaurants.id))
    .innerJoin(restaurantCategories, eq(restaurants.categoryId, restaurantCategories.id))
    .where(and(sql`DATE(${dailySettings.settingDate}) = ${today}`, eq(dailySettings.isActive, true)))
    .orderBy(restaurantCategories.sortOrder, restaurants.sortOrder);
}

export async function setTodayRestaurants(today: string, restaurantIds: number[]) {
  const db = await getDb();
  if (!db) return;
  await db.delete(dailySettings).where(sql`DATE(${dailySettings.settingDate}) = ${today}`);
  if (restaurantIds.length > 0) {
    await db.insert(dailySettings).values(
      restaurantIds.map(rid => ({
        settingDate: today as unknown as Date,
        restaurantId: rid,
        isActive: true,
      }))
    );
  }
}

// ─── 주문 관련 ────────────────────────────────────────────────
export async function getTodayOrders(today: string) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select({
      id: orders.id,
      employeeId: orders.employeeId,
      employeeNickname: employees.nickname,
      restaurantId: orders.restaurantId,
      restaurantName: restaurants.name,
      mainMenuName: orders.mainMenuName,
      sideMenuName: orders.sideMenuName,
      drinkOption: orders.drinkOption,
      extraOption: orders.extraOption,
      note: orders.note,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .innerJoin(employees, eq(orders.employeeId, employees.id))
    .innerJoin(restaurants, eq(orders.restaurantId, restaurants.id))
    .where(sql`DATE(${orders.orderDate}) = ${today}`)
    .orderBy(restaurants.name, employees.nickname);
}

export async function getOrderByEmployee(today: string, employeeId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(orders)
    .where(and(sql`DATE(${orders.orderDate}) = ${today}`, eq(orders.employeeId, employeeId)))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function upsertOrder(data: {
  today: string;
  employeeId: number;
  restaurantId: number;
  mainMenuName?: string;
  sideMenuName?: string;
  drinkOption?: string;
  extraOption?: string;
  note?: string;
}) {
  const db = await getDb();
  if (!db) return;
  const existing = await getOrderByEmployee(data.today, data.employeeId);
  if (existing) {
    await db.update(orders).set({
      restaurantId: data.restaurantId,
      mainMenuName: data.mainMenuName ?? null,
      sideMenuName: data.sideMenuName ?? null,
      drinkOption: data.drinkOption ?? null,
      extraOption: data.extraOption ?? null,
      note: data.note ?? null,
    }).where(and(sql`DATE(${orders.orderDate}) = ${data.today}`, eq(orders.employeeId, data.employeeId)));
  } else {
    await db.insert(orders).values({
      orderDate: data.today as unknown as Date,
      employeeId: data.employeeId,
      restaurantId: data.restaurantId,
      mainMenuName: data.mainMenuName ?? null,
      sideMenuName: data.sideMenuName ?? null,
      drinkOption: data.drinkOption ?? null,
      extraOption: data.extraOption ?? null,
      note: data.note ?? null,
    });
  }
}

export async function deleteOrder(today: string, employeeId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(orders).where(
    and(sql`DATE(${orders.orderDate}) = ${today}`, eq(orders.employeeId, employeeId))
  );
}

export async function resetTodayData(today: string) {
  const db = await getDb();
  if (!db) return;
  await db.delete(orders).where(sql`DATE(${orders.orderDate}) = ${today}`);
  await db.delete(dailySettings).where(sql`DATE(${dailySettings.settingDate}) = ${today}`);
}

// ─── 주문 취합 통계 ──────────────────────────────────────────
export async function getOrderSummary(today: string) {
  const allOrders = await getTodayOrders(today);
  const summaryMap = new Map<string, Map<string, number>>();

  for (const order of allOrders) {
    const restName = order.restaurantName;
    if (!summaryMap.has(restName)) summaryMap.set(restName, new Map());
    const menuMap = summaryMap.get(restName)!;

    // 한 명의 주문을 하나의 키로 생성 (메인메뉴 + 사이드 + 음료 + 추가옵션 조합)
    const menuParts = [order.mainMenuName || "메뉴 미선택"];
    
    // 햄버거의 경우 사이드 추가
    const isHamburger = restName.includes('맘스터치') || restName.includes('롯데리아') || restName.includes('프랭크');
    if (isHamburger && order.sideMenuName) {
      menuParts.push(order.sideMenuName);
    }
    
    // 음료 추가
    if (order.drinkOption) {
      menuParts.push(order.drinkOption);
    }
    
    // 추가옵션 추가
    if (order.extraOption) {
      menuParts.push(order.extraOption);
    }
    
    const combinedKey = menuParts.join(" + ");
    menuMap.set(combinedKey, (menuMap.get(combinedKey) || 0) + 1);
  }

  return Array.from(summaryMap.entries()).map(([restaurant, menus]) => ({
    restaurant,
    items: Array.from(menus.entries()).map(([menu, count]) => ({ menu, count })),
  }));
}
