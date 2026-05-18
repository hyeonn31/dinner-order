import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Copy, RefreshCw, Users, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SummaryPage() {
  const utils = trpc.useUtils();
  const { data: orders, isLoading: ordersLoading } = trpc.order.todayAll.useQuery(undefined, { refetchInterval: 30000 });
  const { data: summary, isLoading: summaryLoading } = trpc.order.summary.useQuery(undefined, { refetchInterval: 30000 });
  const { data: todayRestaurants } = trpc.daily.todayRestaurants.useQuery(undefined, { refetchInterval: 60000 });
  const [expandedRestaurants, setExpandedRestaurants] = useState<Set<string>>(new Set());

  const handleRefresh = () => {
    utils.order.todayAll.invalidate();
    utils.order.summary.invalidate();
    toast.success("새로고침 완료!");
  };

  const toggleExpand = (name: string) => {
    setExpandedRestaurants(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  // 복사용 텍스트 생성
  const generateCopyText = () => {
    if (!orders || orders.length === 0) return "신청 내역이 없습니다.";
    const today = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "long" });
    const lines: string[] = [`📋 저녁식사 주문 취합 (${today})`, ""];

    // 식당별로 그룹화
    const groupedByRestaurant = new Map<string, { items: string[], zeroCokCount: number }>();
    for (const order of orders) {
      const isHamburger = order.restaurantName.includes('맘스터치') || order.restaurantName.includes('롯데리아') || order.restaurantName.includes('프랭크');
      let menuParts = [order.mainMenuName];
      if (isHamburger && order.sideMenuName) menuParts.push(order.sideMenuName);
      if (order.drinkOption) menuParts.push(order.drinkOption);
      if (order.extraOption) menuParts.push(order.extraOption);
      const fullMenu = menuParts.filter(Boolean).join(" + ") || "-";

      if (!groupedByRestaurant.has(order.restaurantName)) {
        groupedByRestaurant.set(order.restaurantName, { items: [], zeroCokCount: 0 });
      }
      const group = groupedByRestaurant.get(order.restaurantName)!;
      group.items.push(fullMenu);
      if (order.drinkOption === "제로콜라") {
        group.zeroCokCount++;
      }
    }

    groupedByRestaurant.forEach((group, restaurant) => {
      lines.push(`▶ ${restaurant} (제로콜라 ${group.zeroCokCount}개)`);
      for (const item of group.items) {
        lines.push(`  • ${item}`);
      }
      lines.push("");
    });

    lines.push(`총 신청 인원: ${orders.length}명`);
    return lines.join("\n");
  };

  const handleCopyAll = () => {
    const text = generateCopyText();
    navigator.clipboard.writeText(text).then(() => {
      toast.success("클립보드에 복사되었습니다!");
    }).catch(() => toast.error("복사에 실패했습니다."));
  };

  const handleCopyRestaurant = (restaurantName: string, items: string[], zeroCokCount: number) => {
    const lines = [`▶ ${restaurantName} (제로콜라 ${zeroCokCount}개)`];
    for (const item of items) {
      lines.push(`  • ${item}`);
    }
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      toast.success(`${restaurantName} 주문이 복사되었습니다!`);
    }).catch(() => toast.error("복사에 실패했습니다."));
  };

  const today = new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "long" });

  // 미신청 직원 목록 (신청한 직원 ID 기준)
  const orderedEmployeeIds = new Set(orders?.map(o => o.employeeId) ?? []);

  // 식당별로 주문 그룹화
  const groupedByRestaurant = new Map<string, typeof orders>();
  if (orders) {
    for (const order of orders) {
      if (!groupedByRestaurant.has(order.restaurantName)) {
        groupedByRestaurant.set(order.restaurantName, []);
      }
      groupedByRestaurant.get(order.restaurantName)!.push(order);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "oklch(0.20 0.03 250)", fontFamily: "'Noto Sans KR', serif" }}>
            주문 취합
          </h1>
          <p className="text-sm" style={{ color: "oklch(0.50 0.03 250)" }}>
            {today} &mdash; 실시간 신청 현황
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            새로고침
          </Button>
          <Button
            size="sm"
            onClick={handleCopyAll}
            disabled={!orders || orders.length === 0}
            className="gap-2"
            style={{ background: "oklch(0.35 0.08 250)", color: "oklch(0.85 0.15 250)" }}
          >
            <Copy className="w-4 h-4" />
            전체 복사
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        <StatCard
          label="총 신청 인원"
          value={orders?.length ?? 0}
          unit="명"
          color="oklch(0.35 0.08 250)"
        />
        <StatCard
          label="오늘의 식당"
          value={todayRestaurants?.length ?? 0}
          unit="곳"
          color="oklch(0.55 0.18 250)"
        />
        <StatCard
          label="식당별 주문"
          value={groupedByRestaurant.size}
          unit="건"
          color="oklch(0.38 0.10 220)"
        />
        <StatCard
          label="메뉴 종류"
          value={orders?.length ?? 0}
          unit="가지"
          color="oklch(0.42 0.12 145)"
        />
        <StatCard
          label="제로콜라"
          value={orders?.filter(o => o.drinkOption === "제로콜라").length ?? 0}
          unit="개"
          color="oklch(0.35 0.15 280)"
        />
      </div>

      <Tabs defaultValue="summary">
        <TabsList className="mb-6">
          <TabsTrigger value="summary">주문 취합</TabsTrigger>
          <TabsTrigger value="detail">직원별 상세</TabsTrigger>
          <TabsTrigger value="text">복사용 텍스트</TabsTrigger>
        </TabsList>

        {/* 주문 취합 탭 - 식당별 그룹화 */}
        <TabsContent value="summary">
          {ordersLoading ? (
            <LoadingState />
          ) : !orders || orders.length === 0 ? (
            <EmptyState message="아직 신청 내역이 없습니다." />
          ) : (
            <div className="space-y-4">
              {Array.from(groupedByRestaurant.entries()).map(([restaurant, restaurantOrders]) => {
                const isExpanded = expandedRestaurants.has(restaurant);
                const totalCount = restaurantOrders?.length ?? 0;
                const zeroCokCount = (restaurantOrders ?? []).filter(o => o.drinkOption === "제로콜라").length;
                const items = (restaurantOrders ?? []).map(order => {
                  const isHamburger = order.restaurantName.includes('맘스터치') || order.restaurantName.includes('롯데리아') || order.restaurantName.includes('프랭크');
                  let menuParts = [order.mainMenuName];
                  if (isHamburger && order.sideMenuName) menuParts.push(order.sideMenuName);
                  if (order.drinkOption) menuParts.push(order.drinkOption);
                  if (order.extraOption) menuParts.push(order.extraOption);
                  return menuParts.filter(Boolean).join(" + ") || "-";
                });

                return (
                  <div key={restaurant} className="rounded-2xl overflow-hidden"
                    style={{ background: "white", border: "1px solid oklch(0.88 0.01 60)", boxShadow: "0 2px 12px oklch(0.18 0.02 30 / 0.05)" }}>
                    {/* Restaurant Header */}
                    <div
                      className="flex items-center justify-between p-5 cursor-pointer"
                      style={{ borderBottom: isExpanded ? "1px solid oklch(0.92 0.01 60)" : "none" }}
                      onClick={() => toggleExpand(restaurant)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: "oklch(0.35 0.08 250)" }}>
                          <span className="text-sm font-bold" style={{ color: "oklch(0.55 0.18 250)" }}>
                            {totalCount}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold" style={{ color: "oklch(0.20 0.03 250)" }}>
                            {restaurant}
                          </div>
                          <div className="text-xs" style={{ color: "oklch(0.55 0.02 30)" }}>
                            {totalCount}명 · 제로콜라 {zeroCokCount}개
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-xs h-8"
                          onClick={e => { e.stopPropagation(); handleCopyRestaurant(restaurant, items, zeroCokCount); }}
                        >
                          <Copy className="w-3 h-3" />
                          복사
                        </Button>
                        {isExpanded
                          ? <ChevronUp className="w-4 h-4" style={{ color: "oklch(0.55 0.02 30)" }} />
                          : <ChevronDown className="w-4 h-4" style={{ color: "oklch(0.55 0.02 30)" }} />
                        }
                      </div>
                    </div>

                    {/* Menu Items */}
                    {isExpanded && (
                      <div className="p-5 space-y-2">
                        {items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between py-2 px-3 rounded-lg"
                            style={{ background: "oklch(0.97 0.005 60)" }}>
                            <span className="text-sm" style={{ color: "oklch(0.25 0.02 30)" }}>
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* 직원별 상세 탭 */}
        <TabsContent value="detail">
          {ordersLoading ? (
            <LoadingState />
          ) : !orders || orders.length === 0 ? (
            <EmptyState message="아직 신청 내역이 없습니다." />
          ) : (
            <div className="rounded-2xl overflow-hidden"
              style={{ background: "white", border: "1px solid oklch(0.88 0.01 60)" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "oklch(0.97 0.005 60)", borderBottom: "1px solid oklch(0.90 0.01 60)" }}>
                    <th className="text-left px-4 py-3 font-semibold" style={{ color: "oklch(0.35 0.02 30)" }}>이름</th>
                    <th className="text-left px-4 py-3 font-semibold" style={{ color: "oklch(0.35 0.02 30)" }}>식당</th>
                    <th className="text-left px-4 py-3 font-semibold" style={{ color: "oklch(0.35 0.02 30)" }}>메인 메뉴</th>
                    <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell" style={{ color: "oklch(0.35 0.02 30)" }}>추가</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, idx) => (
                    <tr key={order.id}
                      style={{ borderBottom: idx < orders.length - 1 ? "1px solid oklch(0.93 0.005 60)" : "none" }}>
                      <td className="px-4 py-3 font-medium" style={{ color: "oklch(0.35 0.08 250)" }}>
                        {order.employeeNickname}
                      </td>
                      <td className="px-4 py-3" style={{ color: "oklch(0.42 0.03 30)" }}>
                        {order.restaurantName}
                      </td>
                      <td className="px-4 py-3" style={{ color: "oklch(0.35 0.02 30)" }}>
                        {(() => {
                          const isHamburger = order.restaurantName.includes('맘스터치') || order.restaurantName.includes('롯데리아') || order.restaurantName.includes('프랭크');
                          let menuParts = [order.mainMenuName];
                          
                          // 햄버거의 경우 사이드 추가
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
                          
                          return menuParts.filter(Boolean).join(" + ") || "-";
                        })()}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-xs" style={{ color: "oklch(0.55 0.02 30)" }}>
                        -
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* 복사용 텍스트 탭 */}
        <TabsContent value="text">
          {ordersLoading ? (
            <LoadingState />
          ) : (
            <div className="space-y-4">
              {/* 제로콜라 총 개수 */}
              <div className="rounded-2xl p-5" style={{ background: "oklch(0.35 0.08 250)" }}>
                <div className="text-lg font-semibold" style={{ color: "oklch(0.85 0.15 250)" }}>
                  제로콜라 총 개수: {orders?.filter(o => o.drinkOption === "제로콜라").length ?? 0}개
                </div>
              </div>
              
              {/* 복사용 텍스트 */}
              <div className="rounded-2xl p-6" style={{ background: "oklch(0.97 0.005 60)" }}>
                <pre className="text-xs whitespace-pre-wrap break-words font-mono" style={{ color: "oklch(0.35 0.02 30)" }}>
                  {generateCopyText()}
                </pre>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* 미신청 직원 */}
      {todayRestaurants && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4" style={{ color: "oklch(0.20 0.03 250)" }}>
            미신청 직원
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Placeholder for not-ordered employees */}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
function StatCard({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "white", border: "1px solid oklch(0.88 0.01 60)" }}>
      <div className="text-xs font-medium mb-2" style={{ color: "oklch(0.55 0.02 30)" }}>
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold" style={{ color }}>
          {value}
        </span>
        <span className="text-xs" style={{ color: "oklch(0.55 0.02 30)" }}>
          {unit}
        </span>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="w-8 h-8 rounded-full border-2 border-transparent mx-auto mb-4"
          style={{ borderTopColor: "oklch(0.35 0.08 250)", animation: "spin 1s linear infinite" }} />
        <p style={{ color: "oklch(0.55 0.02 30)" }}>로딩 중...</p>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Users className="w-12 h-12 mx-auto mb-3" style={{ color: "oklch(0.70 0.05 250)" }} />
        <p style={{ color: "oklch(0.55 0.02 30)" }}>{message}</p>
      </div>
    </div>
  );
}
