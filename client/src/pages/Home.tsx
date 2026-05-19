import { Link } from "wouter";
import { UtensilsCrossed, Settings, BarChart3, ArrowRight, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { data: todayRestaurants } = trpc.daily.todayRestaurants.useQuery();
  const { data: orders } = trpc.order.todayAll.useQuery();

  const hasSetup = todayRestaurants && todayRestaurants.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
          style={{ background: "oklch(0.88 0.07 75 / 0.3)", color: "oklch(0.55 0.18 250)", border: "1px solid oklch(0.72 0.12 75 / 0.3)" }}>
          <Clock className="w-4 h-4" />
          매일 오후 5시 ~ 6시 운영
        </div>
        <h1 className="text-4xl font-bold mb-3" style={{ color: "oklch(0.20 0.03 250)", fontFamily: "'Noto Sans KR', serif" }}>
          저녁식사 신청 시스템
        </h1>

      </div>

      {/* Status Card */}
      <div className="rounded-2xl p-6 mb-8 text-center"
        style={{
          background: hasSetup ? "oklch(0.96 0.04 145 / 0.3)" : "oklch(0.97 0.02 60)",
          border: `1px solid ${hasSetup ? "oklch(0.65 0.15 145 / 0.3)" : "oklch(0.88 0.01 60)"}`,
        }}>
        {hasSetup ? (
          <>
            <div className="text-sm font-medium mb-2" style={{ color: "oklch(0.45 0.12 145)" }}>
              오늘의 식당이 설정되었습니다
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {todayRestaurants.map(r => (
                <span key={r.restaurantId} className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ background: "oklch(0.35 0.08 250)", color: "oklch(0.85 0.15 250)" }}>
                  {r.restaurantName}
                </span>
              ))}
            </div>
            {orders && orders.length > 0 && (
              <div className="mt-3 text-sm" style={{ color: "oklch(0.45 0.12 145)" }}>
                현재 <strong>{orders.length}명</strong>이 신청 완료
              </div>
            )}
          </>
        ) : (
          <div className="text-sm" style={{ color: "oklch(0.50 0.03 250)" }}>
            아직 오늘의 식당이 설정되지 않았습니다. 관리자 페이지에서 식당을 선택해 주세요.
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/order">
          <div className="group rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:-translate-y-1"
            style={{ background: "white", border: "1px solid oklch(0.88 0.01 60)", boxShadow: "0 2px 12px oklch(0.18 0.02 30 / 0.06)" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: "oklch(0.35 0.08 250)" }}>
              <UtensilsCrossed className="w-6 h-6" style={{ color: "oklch(0.55 0.18 250)" }} />
            </div>
            <h3 className="font-semibold text-base mb-1" style={{ color: "oklch(0.20 0.03 250)" }}>저녁 신청</h3>
            <p className="text-sm mb-4" style={{ color: "oklch(0.50 0.03 250)" }}>메뉴를 선택하고 신청하세요</p>
            <div className="flex items-center gap-1 text-sm font-medium" style={{ color: "oklch(0.55 0.18 250)" }}>
              신청하기 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        <Link href="/admin">
          <div className="group rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:-translate-y-1"
            style={{ background: "white", border: "1px solid oklch(0.88 0.01 60)", boxShadow: "0 2px 12px oklch(0.18 0.02 30 / 0.06)" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: "oklch(0.35 0.08 250)" }}>
              <Settings className="w-6 h-6" style={{ color: "oklch(0.55 0.18 250)" }} />
            </div>
            <h3 className="font-semibold text-base mb-1" style={{ color: "oklch(0.20 0.03 250)" }}>관리자</h3>
            <p className="text-sm mb-4" style={{ color: "oklch(0.50 0.03 250)" }}>오늘의 식당을 설정하세요</p>
            <div className="flex items-center gap-1 text-sm font-medium" style={{ color: "oklch(0.55 0.18 250)" }}>
              설정하기 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        <Link href="/summary">
          <div className="group rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:-translate-y-1"
            style={{ background: "white", border: "1px solid oklch(0.88 0.01 60)", boxShadow: "0 2px 12px oklch(0.18 0.02 30 / 0.06)" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: "oklch(0.35 0.08 250)" }}>
              <BarChart3 className="w-6 h-6" style={{ color: "oklch(0.55 0.18 250)" }} />
            </div>
            <h3 className="font-semibold text-base mb-1" style={{ color: "oklch(0.20 0.03 250)" }}>주문 취합</h3>
            <p className="text-sm mb-4" style={{ color: "oklch(0.50 0.03 250)" }}>신청 현황을 확인하세요</p>
            <div className="flex items-center gap-1 text-sm font-medium" style={{ color: "oklch(0.55 0.18 250)" }}>
              확인하기 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
