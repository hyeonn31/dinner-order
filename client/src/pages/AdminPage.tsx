import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Check, RefreshCw, Store, AlertTriangle, Lock, Eye, EyeOff, Lock as LockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  "일식": { bg: "oklch(0.95 0.04 200)", text: "oklch(0.36 0.10 200)", border: "oklch(0.76 0.09 200)" },
};

const ADMIN_PASSWORD = "2101";

function PasswordPrompt({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    if (password === ADMIN_PASSWORD) {
      onSuccess();
      toast.success("관리자 페이지에 접근했습니다.");
    } else {
      toast.error("비밀번호가 틀렸습니다.");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.35 0.08 250)" }}>
              <Lock className="w-6 h-6" style={{ color: "oklch(0.85 0.15 250)" }} />
            </div>
          </div>
          <CardTitle>관리자 페이지</CardTitle>
          <CardDescription>비밀번호를 입력하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
              className="pr-10"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <Button
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            접근
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminContent() {
  const utils = trpc.useUtils();
  const { data: allRestaurants, isLoading } = trpc.restaurant.list.useQuery();
  const { data: todaySettings } = trpc.daily.todayRestaurants.useQuery();
  const { data: todayOrders } = trpc.order.todayAll.useQuery();

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    if (todaySettings) {
      setSelected(new Set(todaySettings.map(s => s.restaurantId)));
      setIsClosed(todaySettings[0]?.isClosed || false);
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

  const handleToggle = (restaurantId: number) => {
    const newSelected = new Set(selected);
    if (newSelected.has(restaurantId)) {
      newSelected.delete(restaurantId);
    } else {
      newSelected.add(restaurantId);
    }
    setSelected(newSelected);
  };

  const handleSave = () => {
    setRestaurantsMutation.mutate({ restaurantIds: Array.from(selected), password: ADMIN_PASSWORD });
  };

  const handleReset = () => {
    resetMutation.mutate({ password: ADMIN_PASSWORD });
  };

  const toggleClosedMutation = trpc.daily.toggleClosed.useMutation({
    onSuccess: (data) => {
      setIsClosed(data.isClosed);
      toast.success(data.isClosed ? "신청이 마감되었습니다." : "신청이 다시 열렸습니다.");
    },
    onError: () => toast.error("상태 변경 중 오류가 발생했습니다."),
  });

  const handleToggleClosed = () => {
    toggleClosedMutation.mutate({ password: ADMIN_PASSWORD });
  };

  const clearOrdersMutation = trpc.order.clearAll.useMutation({
    onSuccess: () => {
      utils.order.todayAll.invalidate();
      utils.order.summary.invalidate();
      utils.order.getHistory.invalidate();
      toast.success("모든 주문 데이터가 삭제되었습니다.");
    },
    onError: () => toast.error("삭제 중 오류가 발생했습니다.")
  });

  const handleClearOrders = () => {
    clearOrdersMutation.mutate({ password: ADMIN_PASSWORD });
  };

  const groupedByCategory = allRestaurants?.reduce((acc, r) => {
    if (!acc[r.categoryName]) acc[r.categoryName] = [];
    acc[r.categoryName].push(r);
    return acc;
  }, {} as Record<string, typeof allRestaurants>);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "oklch(0.20 0.03 250)" }}>관리자 페이지</h1>
          <p className="text-muted-foreground">오늘의 식당을 선택하고 관리하세요</p>
        </div>

        {/* Closed Status Alert */}
        {isClosed && (
          <Card className="mb-6" style={{ background: "oklch(0.95 0.08 30)", border: "1px solid oklch(0.75 0.15 30)" }}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <LockIcon className="w-5 h-5 flex-shrink-0" style={{ color: "oklch(0.55 0.18 30)" }} />
                <div>
                  <p className="font-semibold" style={{ color: "oklch(0.30 0.10 30)" }}>신청이 마감되었습니다</p>
                  <p className="text-sm" style={{ color: "oklch(0.50 0.08 30)" }}>직원들이 더 이상 신청할 수 없습니다. &quot;오픈&quot; 버튼으로 다시 열 수 있습니다.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5" style={{ color: "oklch(0.55 0.18 250)" }} />
              오늘의 식당 ({selected.size}개 선택)
            </CardTitle>
            <CardDescription>
              {todayOrders && todayOrders.length > 0 && `현재 ${todayOrders.length}명이 신청했습니다`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
            ) : (
              <>
                {groupedByCategory && Object.entries(groupedByCategory).map(([category, restaurants]) => (
                  <div key={category}>
                    <h3 className="font-semibold mb-3 text-sm" style={{ color: CATEGORY_COLORS[category]?.text }}>
                      {category}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                      {restaurants?.map(r => (
                        <button
                          key={r.id}
                          onClick={() => handleToggle(r.id)}
                          className="p-3 rounded-lg text-left transition-all"
                          style={{
                            background: selected.has(r.id) ? CATEGORY_COLORS[category]?.bg : "oklch(0.97 0.01 250)",
                            border: `2px solid ${selected.has(r.id) ? CATEGORY_COLORS[category]?.border : "oklch(0.88 0.01 60)"}`,
                            color: selected.has(r.id) ? CATEGORY_COLORS[category]?.text : "oklch(0.50 0.03 250)",
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{r.name}</span>
                            {selected.has(r.id) && <Check className="w-5 h-5" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={handleSave}
            disabled={setRestaurantsMutation.isPending}
            className="flex-1 min-w-[120px] bg-blue-600 hover:bg-blue-700"
          >
            {setRestaurantsMutation.isPending ? "저장 중..." : "저장"}
          </Button>

          <Button
            onClick={handleToggleClosed}
            disabled={toggleClosedMutation.isPending}
            className={`flex-1 min-w-[120px] ${isClosed ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700"}`}
          >
            {toggleClosedMutation.isPending ? (isClosed ? "오픈 중..." : "마감 중...") : (isClosed ? "오픈" : "마감")}
          </Button>

          {isClosed && (
            <Button
              onClick={handleToggleClosed}
              disabled={toggleClosedMutation.isPending}
              variant="outline"
              className="flex-1 min-w-[120px] border-green-600 text-green-700 hover:bg-green-50"
            >
              {toggleClosedMutation.isPending ? "마감 해제 중..." : "마감 해제"}
            </Button>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 min-w-[120px]"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                오늘 초기화
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  오늘 데이터 초기화
                </AlertDialogTitle>
                <AlertDialogDescription>
                  이 작업은 되돌릴 수 없습니다. 오늘의 모든 신청 데이터가 삭제됩니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleReset}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  초기화
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 min-w-[120px] border-red-600 text-red-700 hover:bg-red-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                전체 삭제
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  모든 주문 데이터 삭제
                </AlertDialogTitle>
                <AlertDialogDescription>
                  ⚠️ 주의: 이 작업은 되돌릴 수 없습니다. 모든 주문 이력 데이터가 영구 삭제됩니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearOrders}
                  disabled={clearOrdersMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {clearOrdersMutation.isPending ? "삭제 중..." : "삭제"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <PasswordPrompt onSuccess={() => setIsAuthenticated(true)} />;
  }

  return <AdminContent />;
}
