import { useState, useMemo, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ChevronDown, Send, X, CheckCircle2, UtensilsCrossed, AlertCircle, Search, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const DRINK_OPTIONS = ["선택 안함", "제로콜라", "펩시제로", "사이다제로", "콜라", "사이다"];

export default function OrderPage() {
  const utils = trpc.useUtils();
  const { data: employees } = trpc.employee.list.useQuery();
  const { data: todayRestaurants } = trpc.daily.todayRestaurants.useQuery();

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);
  const [mainMenu, setMainMenu] = useState("");
  const [sideMenu, setSideMenu] = useState("");
  const [drinkOption, setDrinkOption] = useState("");
  const [extraOption, setExtraOption] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState("");
  const [isClosed, setIsClosed] = useState(false);

  const { data: menus } = trpc.restaurant.menus.useQuery(
    { restaurantId: selectedRestaurantId! },
    { enabled: !!selectedRestaurantId }
  );

  // 마감 상태 폴링 (5초마다 확인)
  useEffect(() => {
    if (todayRestaurants && todayRestaurants.length > 0) {
      setIsClosed(todayRestaurants[0].isClosed || false);
    }
  }, [todayRestaurants]);

  useEffect(() => {
    const interval = setInterval(() => {
      utils.daily.todayRestaurants.invalidate();
    }, 5000);
    return () => clearInterval(interval);
  }, [utils]);

  // 음료 기본값 설정 - 햄버거 제외 전부 제로콜라
  useEffect(() => {
    if (selectedRestaurantId && todayRestaurants) {
      const restaurant = todayRestaurants.find(r => r.restaurantId === selectedRestaurantId);
      if (restaurant && restaurant.categoryName !== "햄버거") {
        setDrinkOption("제로콜라");
      } else {
        setDrinkOption("");
      }
    }
  }, [selectedRestaurantId, todayRestaurants]);

  const submitMutation = trpc.order.submit.useMutation({
    onSuccess: () => {
      toast.success("신청이 완료되었습니다");
      setSubmitted(true);
      setTimeout(() => {
        setSelectedEmployeeId(null);
        setSelectedRestaurantId(null);
        setMainMenu("");
        setSideMenu("");
        setDrinkOption("");
        setExtraOption("");
        setNote("");
        setSubmitted(false);
        setEmployeeSearchQuery("");
        utils.order.todayAll.invalidate();
      }, 2000);
    },
    onError: (error: any) => {
      toast.error(error.message || "신청에 실패했습니다");
    },
  });

  const handleSubmit = () => {
    if (isClosed) {
      toast.error("신청이 마감되었습니다");
      return;
    }
    if (!selectedEmployeeId) return toast.error("이름을 선택해 주세요.");
    if (!selectedRestaurantId) return toast.error("식당을 선택해 주세요.");
    if (!mainMenu) return toast.error("메인 메뉴를 선택해 주세요.");

    const normalizeOption = (v: string) => (!v || v === "none" || v === "선택 안함") ? undefined : v;
    submitMutation.mutate({
      employeeId: selectedEmployeeId,
      restaurantId: selectedRestaurantId,
      mainMenuName: mainMenu,
      sideMenuName: normalizeOption(sideMenu),
      drinkOption: normalizeOption(drinkOption),
      extraOption: normalizeOption(extraOption),
      note: note || undefined,
    });
  };

  const mainMenus = menus?.filter((m: any) => m.itemType === "main") ?? [];
  const sideMenus = menus?.filter((m: any) => m.itemType === "side") ?? [];
  const drinkMenus = menus?.filter((m: any) => m.itemType === "drink") ?? [];
  const optionMenus = menus?.filter((m: any) => m.itemType === "option" || m.itemType === "extra") ?? [];

  const filteredEmployees = useMemo(() => {
    if (!employees) return [];
    if (!employeeSearchQuery.trim()) return employees;
    return employees.filter(emp =>
      emp.nickname.toLowerCase().includes(employeeSearchQuery.toLowerCase())
    );
  }, [employees, employeeSearchQuery]);

  const hasNoSetup = !todayRestaurants || todayRestaurants.length === 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "oklch(0.20 0.03 250)" }}>
          저녁식사 신청
        </h1>
        <p className="text-sm" style={{ color: "oklch(0.50 0.03 250)" }}>
          이름을 선택하고 원하는 메뉴를 신청하세요
        </p>
      </div>

      {/* 마감 안내 메시지 */}
      {isClosed && (
        <div className="mb-6 p-4 rounded-lg flex gap-3" style={{ background: "oklch(0.95 0.08 30)", border: "1px solid oklch(0.75 0.15 30)" }}>
          <Lock className="w-5 h-5 flex-shrink-0" style={{ color: "oklch(0.55 0.18 30)" }} />
          <div>
            <p className="font-medium mb-1" style={{ color: "oklch(0.30 0.10 30)" }}>신청이 마감되었습니다</p>
            <p className="text-sm" style={{ color: "oklch(0.50 0.08 30)" }}>더 이상 신청을 받지 않습니다. 관리자 페이지에서 다시 열어주세요.</p>
          </div>
        </div>
      )}

      {/* 오류 메시지 */}
      {hasNoSetup && (
        <div className="mb-6 p-4 rounded-lg flex gap-3" style={{ background: "oklch(0.97 0.01 250)", border: "1px solid oklch(0.90 0.01 250)" }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: "oklch(0.55 0.18 250)" }} />
          <div>
            <p className="font-medium mb-1" style={{ color: "oklch(0.20 0.03 250)" }}>오늘의 식당이 아직 설정되지 않았습니다</p>
            <p className="text-sm" style={{ color: "oklch(0.50 0.03 250)" }}>관리자 페이지에서 오늘의 식당을 먼저 설정해 주세요.</p>
          </div>
        </div>
      )}

      {/* 완료 메시지 */}
      {submitted && (
        <div className="mb-6 p-4 rounded-lg flex gap-3" style={{ background: "oklch(0.92 0.05 140)", border: "1px solid oklch(0.70 0.15 140)" }}>
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: "oklch(0.55 0.18 140)" }} />
          <div>
            <p className="font-medium" style={{ color: "oklch(0.20 0.03 250)" }}>신청이 완료되었습니다!</p>
          </div>
        </div>
      )}

      {!hasNoSetup && (
        <>
          {/* Main Form Card */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid oklch(0.90 0.01 250)", boxShadow: "0 4px 24px oklch(0.20 0.03 250 / 0.08)" }}>

            {/* Step 1: 이름 선택 */}
            <div className="p-6 border-b" style={{ borderColor: "oklch(0.92 0.01 250)" }}>
              <Label className="text-sm font-semibold mb-3 block" style={{ color: "oklch(0.35 0.03 250)" }}>
                1. 이름 선택
              </Label>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="이름 검색..."
                  value={employeeSearchQuery}
                  onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedEmployeeId?.toString() || ""} onValueChange={(v) => setSelectedEmployeeId(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="이름을 선택하세요..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredEmployees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.nickname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Step 2: 식당 선택 */}
            {selectedEmployeeId && (
              <div className="p-6 border-b" style={{ borderColor: "oklch(0.92 0.01 250)" }}>
                <Label className="text-sm font-semibold mb-3 block" style={{ color: "oklch(0.35 0.03 250)" }}>
                  2. 식당 선택
                </Label>
                <Select value={selectedRestaurantId?.toString() || ""} onValueChange={(v) => setSelectedRestaurantId(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="식당을 선택하세요..." />
                  </SelectTrigger>
                  <SelectContent>
                    {todayRestaurants?.map((r) => (
                      <SelectItem key={r.restaurantId} value={r.restaurantId.toString()}>
                        {r.restaurantName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Step 3: 메뉴 선택 */}
            {selectedEmployeeId && selectedRestaurantId && (
              <div className="p-6 border-b" style={{ borderColor: "oklch(0.92 0.01 250)" }}>
                <Label className="text-sm font-semibold mb-4 block" style={{ color: "oklch(0.35 0.03 250)" }}>
                  3. 메뉴 선택
                </Label>
                <div className="space-y-4">
                  {/* 메인메뉴 */}
                  <div>
                    <div className="text-xs font-medium mb-1.5" style={{ color: "oklch(0.55 0.02 250)" }}>메인메뉴 *</div>
                    <Select value={mainMenu} onValueChange={setMainMenu}>
                      <SelectTrigger className="w-full h-11">
                        <SelectValue placeholder="메인메뉴를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {mainMenus.map((m: any) => (
                          <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 사이드 */}
                  {sideMenus.length > 0 && (
                    <div>
                      <div className="text-xs font-medium mb-1.5" style={{ color: "oklch(0.55 0.02 250)" }}>사이드</div>
                      <Select value={sideMenu} onValueChange={setSideMenu}>
                        <SelectTrigger className="w-full h-11">
                          <SelectValue placeholder="사이드를 선택하세요" />
                        </SelectTrigger>
                        <SelectContent className="max-h-64">
                          <SelectItem value="none">선택 안함</SelectItem>
                          {sideMenus.map((m: any) => (
                            <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* 음료 */}
                  {drinkMenus.length > 0 || todayRestaurants?.find(r => r.restaurantId === selectedRestaurantId)?.categoryName !== "햄버거" ? (
                    <div>
                      <div className="text-xs font-medium mb-1.5" style={{ color: "oklch(0.55 0.02 250)" }}>음료</div>
                      <Select value={drinkOption} onValueChange={setDrinkOption}>
                        <SelectTrigger className="w-full h-11">
                          <SelectValue placeholder="음료를 선택하세요" />
                        </SelectTrigger>
                        <SelectContent className="max-h-64">
                          {drinkMenus.length > 0 ? (
                            <>
                              <SelectItem value="none">선택 안함</SelectItem>
                              {drinkMenus.map((m: any) => (
                                <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                              ))}
                            </>
                          ) : (
                            DRINK_OPTIONS.map((opt) => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : null}

                  {/* 추가 옵션 */}
                  {optionMenus.length > 0 && (
                    <div>
                      <div className="text-xs font-medium mb-1.5" style={{ color: "oklch(0.55 0.02 250)" }}>추가 옵션</div>
                      <Select value={extraOption} onValueChange={setExtraOption}>
                        <SelectTrigger className="w-full h-11">
                          <SelectValue placeholder="추가 옵션을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent className="max-h-64">
                          <SelectItem value="none">선택 안함</SelectItem>
                          {optionMenus.map((m: any) => (
                            <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* 특수 요청 */}
                  <div>
                    <div className="text-xs font-medium mb-1.5" style={{ color: "oklch(0.55 0.02 250)" }}>특수 요청</div>
                    <Textarea
                      placeholder="특수 요청사항이 있으면 입력하세요 (예: 맵게, 덜 맵게, 소스 제외 등)"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            {selectedEmployeeId && selectedRestaurantId && (
              <div className="p-6 flex gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending || isClosed}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {submitMutation.isPending ? "신청 중..." : "신청하기"}
                </Button>
                <Button
                  onClick={() => {
                    setSelectedEmployeeId(null);
                    setSelectedRestaurantId(null);
                    setMainMenu("");
                    setSideMenu("");
                    setDrinkOption("");
                    setExtraOption("");
                    setNote("");
                  }}
                  variant="outline"
                  className="px-4"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
