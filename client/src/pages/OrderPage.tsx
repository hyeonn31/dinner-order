import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ChevronDown, Send, X, CheckCircle2, UtensilsCrossed, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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

  const { data: menus } = trpc.restaurant.menus.useQuery(
    { restaurantId: selectedRestaurantId! },
    { enabled: !!selectedRestaurantId }
  );

  const { data: myOrder, refetch: refetchMyOrder } = trpc.order.myOrder.useQuery(
    { employeeId: selectedEmployeeId! },
    { enabled: !!selectedEmployeeId }
  );

  useEffect(() => {
    if (myOrder) {
      setSelectedRestaurantId(myOrder.restaurantId);
      setMainMenu(myOrder.mainMenuName || "");
      setSideMenu(myOrder.sideMenuName || "");
      setDrinkOption(myOrder.drinkOption || "");
      setExtraOption(myOrder.extraOption || "");
      setNote(myOrder.note || "");
      setSubmitted(true);
    } else if (selectedEmployeeId) {
      setSelectedRestaurantId(null);
      setMainMenu("");
      setSideMenu("");
      setDrinkOption("");
      setExtraOption("");
      setNote("");
      setSubmitted(false);
    }
  }, [myOrder, selectedEmployeeId]);

  const submitMutation = trpc.order.submit.useMutation({
    onSuccess: () => {
      utils.order.todayAll.invalidate();
      utils.order.summary.invalidate();
      refetchMyOrder();
      setSubmitted(true);
      toast.success("신청이 완료되었습니다!");
    },
    onError: () => toast.error("신청 중 오류가 발생했습니다."),
  });

  const cancelMutation = trpc.order.cancel.useMutation({
    onSuccess: () => {
      utils.order.todayAll.invalidate();
      utils.order.summary.invalidate();
      refetchMyOrder();
      setSubmitted(false);
      setSelectedRestaurantId(null);
      setMainMenu("");
      setSideMenu("");
      setDrinkOption("");
      setExtraOption("");
      setNote("");
      toast.success("신청이 취소되었습니다.");
    },
    onError: () => toast.error("취소 중 오류가 발생했습니다."),
  });

  const handleSubmit = () => {
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

  const mainMenus = menus?.filter(m => m.itemType === "main") ?? [];
  const sideMenus = menus?.filter(m => m.itemType === "side") ?? [];
  const drinkMenus = menus?.filter(m => m.itemType === "drink") ?? [];
  const optionMenus = menus?.filter(m => m.itemType === "option") ?? [];

  const hasNoSetup = !todayRestaurants || todayRestaurants.length === 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "oklch(0.18 0.02 30)", fontFamily: "'Playfair Display', serif" }}>
          저녁식사 신청
        </h1>
        <p className="text-sm" style={{ color: "oklch(0.52 0.02 30)" }}>
          이름을 선택하고 원하는 메뉴를 신청하세요
        </p>
      </div>

      {/* No Setup Warning */}
      {hasNoSetup && (
        <div className="rounded-xl p-5 mb-6 flex items-start gap-3"
          style={{ background: "oklch(0.97 0.03 60)", border: "1px solid oklch(0.85 0.05 60)" }}>
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "oklch(0.65 0.12 60)" }} />
          <div>
            <div className="font-medium text-sm mb-1" style={{ color: "oklch(0.42 0.08 60)" }}>
              오늘의 식당이 아직 설정되지 않았습니다
            </div>
            <div className="text-sm" style={{ color: "oklch(0.55 0.05 60)" }}>
              관리자 페이지에서 오늘의 식당을 먼저 설정해 주세요.
            </div>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "white", border: "1px solid oklch(0.88 0.01 60)", boxShadow: "0 4px 24px oklch(0.18 0.02 30 / 0.08)" }}>

        {/* Step 1: 이름 선택 */}
        <div className="p-6 border-b" style={{ borderColor: "oklch(0.92 0.01 60)" }}>
          <Label className="text-sm font-semibold mb-3 block" style={{ color: "oklch(0.35 0.03 30)" }}>
            1. 이름 선택
          </Label>
          <Select
            value={selectedEmployeeId?.toString() ?? ""}
            onValueChange={v => setSelectedEmployeeId(Number(v))}
          >
            <SelectTrigger className="w-full h-11">
              <SelectValue placeholder="이름을 선택하세요..." />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {employees?.map(emp => (
                <SelectItem key={emp.id} value={emp.id.toString()}>
                  {emp.nickname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Step 2: 식당 선택 */}
        {selectedEmployeeId && (
          <div className="p-6 border-b" style={{ borderColor: "oklch(0.92 0.01 60)" }}>
            <Label className="text-sm font-semibold mb-3 block" style={{ color: "oklch(0.35 0.03 30)" }}>
              2. 식당 선택
            </Label>
            {hasNoSetup ? (
              <div className="text-sm py-2" style={{ color: "oklch(0.65 0.02 60)" }}>
                오늘의 식당이 설정되지 않았습니다.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {todayRestaurants?.map(r => (
                  <button
                    key={r.restaurantId}
                    onClick={() => {
                      setSelectedRestaurantId(r.restaurantId);
                      setMainMenu("");
                      setSideMenu("");
                      setDrinkOption("");
                      setExtraOption("");
                    }}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-left transition-all duration-150"
                    style={{
                      background: selectedRestaurantId === r.restaurantId ? "oklch(0.22 0.04 30)" : "oklch(0.97 0.005 60)",
                      border: selectedRestaurantId === r.restaurantId
                        ? "2px solid oklch(0.72 0.12 75 / 0.8)"
                        : "1px solid oklch(0.88 0.01 60)",
                      color: selectedRestaurantId === r.restaurantId ? "oklch(0.88 0.07 75)" : "oklch(0.35 0.02 30)",
                    }}
                  >
                    <div className="text-xs mb-0.5" style={{ opacity: 0.7 }}>{r.categoryName}</div>
                    {r.restaurantName}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: 메뉴 선택 */}
        {selectedRestaurantId && (
          <div className="p-6 border-b" style={{ borderColor: "oklch(0.92 0.01 60)" }}>
            <Label className="text-sm font-semibold mb-3 block" style={{ color: "oklch(0.35 0.03 30)" }}>
              3. 메뉴 선택
            </Label>
            <div className="space-y-3">
              {/* 메인 메뉴 */}
              <div>
                <div className="text-xs font-medium mb-1.5" style={{ color: "oklch(0.55 0.02 30)" }}>메인 메뉴 *</div>
                <Select value={mainMenu} onValueChange={setMainMenu}>
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder="메인 메뉴를 선택하세요..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {mainMenus.map(m => (
                      <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 사이드 메뉴 */}
              {sideMenus.length > 0 && (
                <div>
                  <div className="text-xs font-medium mb-1.5" style={{ color: "oklch(0.55 0.02 30)" }}>사이드 메뉴</div>
                  <Select value={sideMenu} onValueChange={setSideMenu}>
                    <SelectTrigger className="w-full h-11">
                      <SelectValue placeholder="사이드 메뉴 (선택사항)" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      <SelectItem value="none">선택 안함</SelectItem>
                      {sideMenus.map(m => (
                        <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* 추가 옵션 */}
              {optionMenus.length > 0 && (
                <div>
                  <div className="text-xs font-medium mb-1.5" style={{ color: "oklch(0.55 0.02 30)" }}>추가 옵션</div>
                  <Select value={extraOption} onValueChange={setExtraOption}>
                    <SelectTrigger className="w-full h-11">
                      <SelectValue placeholder="추가 옵션 (선택사항)" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      <SelectItem value="none">선택 안함</SelectItem>
                      {optionMenus.map(m => (
                        <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* 음료 */}
              <div>
                <div className="text-xs font-medium mb-1.5" style={{ color: "oklch(0.55 0.02 30)" }}>음료</div>
                <Select value={drinkOption} onValueChange={setDrinkOption}>
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder="음료 선택 (선택사항)" />
                  </SelectTrigger>
                  <SelectContent>
                    {drinkMenus.length > 0 ? (
                      <>
                        <SelectItem value="none">선택 안함</SelectItem>
                        {drinkMenus.map(m => (
                          <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                        ))}
                      </>
                    ) : (
                      DRINK_OPTIONS.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: 요청사항 */}
        {selectedRestaurantId && (
          <div className="p-6 border-b" style={{ borderColor: "oklch(0.92 0.01 60)" }}>
            <Label className="text-sm font-semibold mb-3 block" style={{ color: "oklch(0.35 0.03 30)" }}>
              4. 요청사항 (선택)
            </Label>
            <Textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="특별 요청사항을 입력하세요..."
              className="resize-none h-20 text-sm"
            />
          </div>
        )}

        {/* Submit */}
        {selectedEmployeeId && (
          <div className="p-6">
            {submitted && myOrder ? (
              <div className="space-y-4">
                {/* 신청 완료 상태 */}
                <div className="rounded-xl p-4 flex items-start gap-3"
                  style={{ background: "oklch(0.96 0.04 145 / 0.3)", border: "1px solid oklch(0.65 0.15 145 / 0.3)" }}>
                  <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "oklch(0.55 0.15 145)" }} />
                  <div>
                    <div className="font-semibold text-sm mb-1" style={{ color: "oklch(0.38 0.12 145)" }}>
                      신청 완료!
                    </div>
                    <div className="text-sm space-y-0.5" style={{ color: "oklch(0.45 0.08 145)" }}>
                      <div><strong>식당:</strong> {todayRestaurants?.find(r => r.restaurantId === myOrder.restaurantId)?.restaurantName}</div>
                      <div><strong>메뉴:</strong> {myOrder.mainMenuName}</div>
                      {myOrder.sideMenuName && <div><strong>사이드:</strong> {myOrder.sideMenuName}</div>}
                      {myOrder.drinkOption && <div><strong>음료:</strong> {myOrder.drinkOption}</div>}
                      {myOrder.extraOption && <div><strong>추가옵션:</strong> {myOrder.extraOption}</div>}
                      {myOrder.note && <div><strong>요청사항:</strong> {myOrder.note}</div>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => setSubmitted(false)}
                  >
                    수정하기
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => cancelMutation.mutate({ employeeId: selectedEmployeeId! })}
                    disabled={cancelMutation.isPending}
                  >
                    <X className="w-4 h-4" />
                    신청 취소
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                className="w-full h-12 gap-2 text-base font-semibold"
                onClick={handleSubmit}
                disabled={submitMutation.isPending || !mainMenu}
                style={{ background: "oklch(0.22 0.04 30)", color: "oklch(0.88 0.07 75)" }}
              >
                <Send className="w-5 h-5" />
                {submitMutation.isPending ? "신청 중..." : "저녁식사 신청하기"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
