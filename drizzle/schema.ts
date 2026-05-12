import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  date,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// 식당 카테고리
export const restaurantCategories = mysqlTable("restaurant_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 50 }).notNull(), // 한식, 양식, 샐러드, 햄버거, 일식
  sortOrder: int("sortOrder").default(0).notNull(),
});

// 식당
export const restaurants = mysqlTable("restaurants", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// 메뉴 항목
export const menuItems = mysqlTable("menu_items", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull(),
  name: varchar("name", { length: 300 }).notNull(),
  itemType: mysqlEnum("itemType", ["main", "side", "drink", "option"]).default("main").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
});

// 직원 (닉네임 목록)
export const employees = mysqlTable("employees", {
  id: int("id").autoincrement().primaryKey(),
  nickname: varchar("nickname", { length: 100 }).notNull().unique(),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
});

// 일일 식당 설정 (관리자가 오늘의 식당 선택)
export const dailySettings = mysqlTable("daily_settings", {
  id: int("id").autoincrement().primaryKey(),
  settingDate: date("settingDate").notNull(),
  restaurantId: int("restaurantId").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  isClosed: boolean("isClosed").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// 메뉴 신청
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderDate: date("orderDate").notNull(),
  employeeId: int("employeeId").notNull(),
  restaurantId: int("restaurantId").notNull(),
  mainMenuId: int("mainMenuId"),
  mainMenuName: varchar("mainMenuName", { length: 300 }),
  sideMenuId: int("sideMenuId"),
  sideMenuName: varchar("sideMenuName", { length: 300 }),
  drinkOption: varchar("drinkOption", { length: 100 }), // 제로콜라, 펩시제로 등
  extraOption: varchar("extraOption", { length: 300 }), // 기타 추가 옵션
  note: text("note"), // 요청사항
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Restaurant = typeof restaurants.$inferSelect;
export type MenuItem = typeof menuItems.$inferSelect;
export type Employee = typeof employees.$inferSelect;
export type DailySetting = typeof dailySettings.$inferSelect;
export type Order = typeof orders.$inferSelect;
