import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Check, RefreshCw, Store, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "한식": { bg: "oklch(0.95 0.04 30)", text: "oklch(0.38 0.10 30)", border: "oklch(0.80 0.08 30)" },
  "양식": { bg: "oklch(0.95 0.04 220)", text: "oklch(0.35 0.10 220)", border: "oklch(0.75 0.08 220)" },
  "샐러드": { bg: "oklch(0.95 0.05 145)", text: "oklch(0.38 0.12 145)", border: "oklch(0.75 0.10 145)" },
  "햄버거": { bg: "oklch(0.95 0.05 60)", text: "oklch(0.42 0.12 60)", border: "oklch(0.78 0.10 60)" },
};

export default function AdminPage() {
  const utils = trpc.useUtils();
  const { data: allRestaurants, isLoading } = trpc.restaurant.list.useQuery();
  const { data: todaySettings } = trpc.daily.todayRestaurants.useQuery();
  const { data: todayOrders } = trpc.order.todayAll.useQuery();

  const [selected, setSelected] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (todaySettings) {
      setSelected(new Set(todaySettings.map(s => s.restaurantId)));
    }
  }, [todaySettings]);

  const setRestaurantsMutation = trpc.daily.setRestaurants.useMutation({
    onSuccess: () => {
      utils.daily.todayRestaurants.invalidate();
      toast.success("오늘의 식당이 설정되었습니다!");
    },
    onError: () => toast.error("설정 중 오류가 발생했습니다."),
  });

  const resetMutation = trpc.daily.reset.useMutation({
    onSuccess: () => {
      utils.daily.todayRestaurants.invalidate();
      utils.order.todayAll.invalidate();
      utils.order.summary.invalidate();
      setSelected(new Set());
      toast.success("오늘 데이터가 초기화되었습니다.");
    },
    onError: () => toast.error("초기화 중 오류가 발생했습니다."),
  });

  const toggleRestaurant = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = () => {
    setRestaurantsMutation.mutate({ restaurantIds: Array.from(selected) });
  };

  // 카테고리별 그룹핑
  const grouped = allRestaurants?.reduce((acc, r) => {
    if (!acc[r.categoryName]) acc[r.categoryName] = [];
    acc[r.categoryName].push(r);
    return acc;
  }, {} as Record<string, typeof allRestaurants>) ?? {};

  const today = new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "long" });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: "oklch(0.20 0.03 250)", fontFamily: "'Noto Sans KR', serif" }}>
              관리자 설정
            </h1>
            <p className="text-sm" style={{ color: "oklch(0.50 0.03 250)" }}>
              {today} &mdash; 오늘의 식당을 선택하세요
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* 초기화 버튼 */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 text-red-600 border-red-200 hover:bg-red-50">
                  <RefreshCw className="w-4 h-4" />
                  오늘 초기화
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    오늘 데이터 초기화
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    오늘의 식당 설정과 모든 신청 내역이 삭제됩니다.
                    {todayOrders && todayOrders.length > 0 && (
                      <strong className="block mt-2 text-red-600">
                        현재 {todayOrders.length}명의 신청 내역이 삭제됩니다!
                      </strong>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => resetMutation.mutate()}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    초기화
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* 저장 버튼 */}
            <Button
              onClick={handleSave}
              disabled={setRestaurantsMutation.isPending}
              className="gap-2 font-medium"
              style={{ background: "oklch(0.35 0.08 250)", color: "oklch(0.85 0.15 250)" }}
            >
              <Check className="w-4 h-4" />
              {setRestaurantsMutation.isPending ? "저장 중..." : `저장 (${selected.size}개 선택)`}
            </Button>
          </div>
        </div>
      </div>

      {/* Selected Summary */}
      {selected.size > 0 && (
        <div className="rounded-xl p-4 mb-6 flex flex-wrap gap-2 items-center"
          style={{ background: "oklch(0.97 0.03 70)", border: "1px solid oklch(0.72 0.12 75 / 0.3)" }}>
          <span className="text-sm font-medium mr-2" style={{ color: "oklch(0.42 0.08 65)" }}>선택된 식당:</span>
          {allRestaurants?.filter(r => selected.has(r.id)).map(r => (
            <span key={r.id} className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ background: "oklch(0.35 0.08 250)", color: "oklch(0.85 0.15 250)" }}>
              {r.name}
            </span>
          ))}
        </div>
      )}

      {/* Restaurant Grid by Category */}
      {isLoading ? (
        <div className="text-center py-12" style={{ color: "oklch(0.50 0.03 250)" }}>불러오는 중...</div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, restaurants]) => {
            const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS["한식"];
            return (
              <div key={category}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 rounded-full text-sm font-semibold"
                    style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                    {category}
                  </span>
                  <div className="flex-1 h-px" style={{ background: "oklch(0.88 0.01 60)" }} />
                  <span className="text-xs" style={{ color: "oklch(0.65 0.02 60)" }}>
                    {restaurants.filter(r => selected.has(r.id)).length}/{restaurants.length} 선택
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {restaurants.map(restaurant => {
                    const isSelected = selected.has(restaurant.id);
                    return (
                      <button
                        key={restaurant.id}
                        onClick={() => toggleRestaurant(restaurant.id)}
                        className="relative rounded-xl p-4 text-left transition-all duration-200 hover:-translate-y-0.5"
                        style={{
                          background: isSelected ? "oklch(0.35 0.08 250)" : "white",
                          border: isSelected
                            ? "2px solid oklch(0.72 0.12 75 / 0.8)"
                            : "1px solid oklch(0.88 0.01 60)",
                          boxShadow: isSelected
                            ? "0 4px 20px oklch(0.22 0.04 30 / 0.2)"
                            : "0 1px 6px oklch(0.18 0.02 30 / 0.05)",
                        }}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: "oklch(0.55 0.18 250)" }}>
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <Store className="w-5 h-5 mb-2"
                          style={{ color: isSelected ? "oklch(0.55 0.18 250)" : "oklch(0.65 0.02 60)" }} />
                        <div className="text-sm font-medium leading-tight"
                          style={{ color: isSelected ? "white" : "oklch(0.20 0.03 250)" }}>
                          {restaurant.name}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Current Status */}
      {todayOrders && todayOrders.length > 0 && (
        <div className="mt-8 rounded-xl p-5" style={{ background: "white", border: "1px solid oklch(0.88 0.01 60)" }}>
          <h3 className="font-semibold mb-3" style={{ color: "oklch(0.20 0.03 250)" }}>
            현재 신청 현황 ({todayOrders.length}명)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {todayOrders.map(order => (
              <div key={order.id} className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "oklch(0.65 0.15 145)" }} />
                <span style={{ color: "oklch(0.35 0.02 30)" }}>{order.employeeNickname}</span>
                <span className="text-xs truncate" style={{ color: "oklch(0.55 0.02 30)" }}>
                  {order.restaurantName}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
