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
    if (!summary || summary.length === 0) return "신청 내역이 없습니다.";
    const today = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "long" });
    const lines: string[] = [`📋 저녁식사 주문 취합 (${today})`, ""];

    for (const group of summary) {
      lines.push(`▶ ${group.restaurant}`);
      for (const item of group.items) {
        lines.push(`  • ${item.menu} × ${item.count}`);
      }
      lines.push("");
    }

    lines.push(`총 신청 인원: ${orders?.length ?? 0}명`);
    return lines.join("\n");
  };

  const handleCopyAll = () => {
    const text = generateCopyText();
    navigator.clipboard.writeText(text).then(() => {
      toast.success("클립보드에 복사되었습니다!");
    }).catch(() => toast.error("복사에 실패했습니다."));
  };

  const handleCopyRestaurant = (restaurantName: string, items: { menu: string; count: number }[]) => {
    const lines = [`▶ ${restaurantName}`];
    for (const item of items) {
      lines.push(`  • ${item.menu} × ${item.count}`);
    }
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      toast.success(`${restaurantName} 주문이 복사되었습니다!`);
    }).catch(() => toast.error("복사에 실패했습니다."));
  };

  const today = new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "long" });

  // 미신청 직원 목록 (신청한 직원 ID 기준)
  const orderedEmployeeIds = new Set(orders?.map(o => o.employeeId) ?? []);

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
            disabled={!summary || summary.length === 0}
            className="gap-2"
            style={{ background: "oklch(0.35 0.08 250)", color: "oklch(0.85 0.15 250)" }}
          >
            <Copy className="w-4 h-4" />
            전체 복사
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
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
          value={summary?.length ?? 0}
          unit="건"
          color="oklch(0.38 0.10 220)"
        />
        <StatCard
          label="메뉴 종류"
          value={summary?.reduce((acc, g) => acc + g.items.length, 0) ?? 0}
          unit="가지"
          color="oklch(0.42 0.12 145)"
        />
      </div>

      <Tabs defaultValue="summary">
        <TabsList className="mb-6">
          <TabsTrigger value="summary">주문 취합</TabsTrigger>
          <TabsTrigger value="detail">직원별 상세</TabsTrigger>
          <TabsTrigger value="text">복사용 텍스트</TabsTrigger>
        </TabsList>

        {/* 주문 취합 탭 */}
        <TabsContent value="summary">
          {summaryLoading ? (
            <LoadingState />
          ) : !summary || summary.length === 0 ? (
            <EmptyState message="아직 신청 내역이 없습니다." />
          ) : (
            <div className="space-y-4">
              {summary.map(group => {
                const isExpanded = expandedRestaurants.has(group.restaurant);
                const totalCount = group.items.reduce((acc, i) => acc + i.count, 0);
                return (
                  <div key={group.restaurant} className="rounded-2xl overflow-hidden"
                    style={{ background: "white", border: "1px solid oklch(0.88 0.01 60)", boxShadow: "0 2px 12px oklch(0.18 0.02 30 / 0.05)" }}>
                    {/* Restaurant Header */}
                    <div
                      className="flex items-center justify-between p-5 cursor-pointer"
                      style={{ borderBottom: isExpanded ? "1px solid oklch(0.92 0.01 60)" : "none" }}
                      onClick={() => toggleExpand(group.restaurant)}
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
                            {group.restaurant}
                          </div>
                          <div className="text-xs" style={{ color: "oklch(0.55 0.02 30)" }}>
                            {group.items.length}가지 메뉴 · {totalCount}명
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-xs h-8"
                          onClick={e => { e.stopPropagation(); handleCopyRestaurant(group.restaurant, group.items); }}
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
                        {group.items.map(item => (
                          <div key={item.menu} className="flex items-center justify-between py-2 px-3 rounded-lg"
                            style={{ background: "oklch(0.97 0.005 60)" }}>
                            <span className="text-sm" style={{ color: "oklch(0.25 0.02 30)" }}>
                              {item.menu}
                            </span>
                            <span className="font-bold text-sm px-2.5 py-0.5 rounded-full"
                              style={{ background: "oklch(0.35 0.08 250)", color: "oklch(0.85 0.15 250)" }}>
                              × {item.count}
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
                        {/* 햄버거 + 사이드 조합 표시 */}
                        {order.sideMenuName && (order.restaurantName.includes('맘스터치') || order.restaurantName.includes('롯데리아') || order.restaurantName.includes('프랭크'))
                          ? `${order.mainMenuName} + ${order.sideMenuName}`
                          : order.mainMenuName || "-"}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-xs" style={{ color: "oklch(0.55 0.02 30)" }}>
                        {(() => {
                          const isHamburger = order.restaurantName.includes('맘스터치') || order.restaurantName.includes('롯데리아') || order.restaurantName.includes('프랭크');
                          const extras = isHamburger
                            ? [order.drinkOption, order.extraOption].filter(Boolean)
                            : [order.drinkOption, order.extraOption].filter(Boolean);
                          return extras.join(" / ") || "-";
                        })()}
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
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "white", border: "1px solid oklch(0.88 0.01 60)", boxShadow: "0 2px 12px oklch(0.18 0.02 30 / 0.05)" }}>
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid oklch(0.92 0.01 60)", background: "oklch(0.97 0.005 60)" }}>
              <span className="text-sm font-semibold" style={{ color: "oklch(0.35 0.02 30)" }}>
                메신저 붙여넣기용 텍스트
              </span>
              <Button
                size="sm"
                onClick={handleCopyAll}
                disabled={!summary || summary.length === 0}
                className="gap-2"
                style={{ background: "oklch(0.35 0.08 250)", color: "oklch(0.85 0.15 250)" }}
              >
                <Copy className="w-4 h-4" />
                복사
              </Button>
            </div>
            <pre className="p-5 text-sm whitespace-pre-wrap font-mono leading-relaxed"
              style={{ color: "oklch(0.25 0.02 30)", background: "white", minHeight: "200px" }}>
              {generateCopyText()}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "white", border: "1px solid oklch(0.88 0.01 60)" }}>
      <div className="text-2xl font-bold mb-1" style={{ color }}>
        {value}<span className="text-sm font-normal ml-1" style={{ color: "oklch(0.55 0.02 30)" }}>{unit}</span>
      </div>
      <div className="text-xs" style={{ color: "oklch(0.55 0.02 30)" }}>{label}</div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="text-center py-12" style={{ color: "oklch(0.55 0.02 30)" }}>
      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
      불러오는 중...
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16 rounded-2xl"
      style={{ background: "white", border: "1px solid oklch(0.88 0.01 60)" }}>
      <Users className="w-10 h-10 mx-auto mb-3" style={{ color: "oklch(0.75 0.02 60)" }} />
      <div className="text-sm" style={{ color: "oklch(0.55 0.02 30)" }}>{message}</div>
    </div>
  );
}
