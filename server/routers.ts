import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  getAllRestaurantsWithCategories,
  getMenusByRestaurant,
  getAllEmployees,
  getTodaySettings,
  setTodayRestaurants,
  getTodayOrders,
  getOrderByEmployee,
  upsertOrder,
  deleteOrder,
  resetTodayData,
  getOrderSummary,
} from "./db";

function getToday() {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── 식당 ─────────────────────────────────────────────────
  restaurant: router({
    list: publicProcedure.query(async () => {
      return await getAllRestaurantsWithCategories();
    }),
    menus: publicProcedure
      .input(z.object({ restaurantId: z.number() }))
      .query(async ({ input }) => {
        return await getMenusByRestaurant(input.restaurantId);
      }),
  }),

  // ─── 직원 ─────────────────────────────────────────────────
  employee: router({
    list: publicProcedure.query(async () => {
      return await getAllEmployees();
    }),
  }),

  // ─── 일일 설정 ─────────────────────────────────────────────
  daily: router({
    todayRestaurants: publicProcedure.query(async () => {
      const today = getToday();
      return await getTodaySettings(today);
    }),
    setRestaurants: publicProcedure
      .input(z.object({ restaurantIds: z.array(z.number()) }))
      .mutation(async ({ input }) => {
        const today = getToday();
        await setTodayRestaurants(today, input.restaurantIds);
        return { success: true, today };
      }),
    reset: publicProcedure.mutation(async () => {
      const today = getToday();
      await resetTodayData(today);
      return { success: true };
    }),
  }),

  // ─── 주문 ─────────────────────────────────────────────────
  order: router({
    todayAll: publicProcedure.query(async () => {
      const today = getToday();
      return await getTodayOrders(today);
    }),
    myOrder: publicProcedure
      .input(z.object({ employeeId: z.number() }))
      .query(async ({ input }) => {
        const today = getToday();
        return await getOrderByEmployee(today, input.employeeId);
      }),
    submit: publicProcedure
      .input(z.object({
        employeeId: z.number(),
        restaurantId: z.number(),
        mainMenuName: z.string().optional(),
        sideMenuName: z.string().optional(),
        drinkOption: z.string().optional(),
        extraOption: z.string().optional(),
        note: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const today = getToday();
        await upsertOrder({ today, ...input });
        return { success: true };
      }),
    cancel: publicProcedure
      .input(z.object({ employeeId: z.number() }))
      .mutation(async ({ input }) => {
        const today = getToday();
        await deleteOrder(today, input.employeeId);
        return { success: true };
      }),
    summary: publicProcedure.query(async () => {
      const today = getToday();
      return await getOrderSummary(today);
    }),
  }),
});

export type AppRouter = typeof appRouter;
