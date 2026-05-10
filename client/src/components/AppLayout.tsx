import { Link, useLocation } from "wouter";
import { UtensilsCrossed, Settings, ClipboardList, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/order", label: "저녁 신청", icon: UtensilsCrossed, desc: "메뉴를 선택하세요" },
  { path: "/admin", label: "관리자", icon: Settings, desc: "식당 설정" },
  { path: "/summary", label: "주문 취합", icon: BarChart3, desc: "주문 현황 확인" },
];

const manageItems = [
  { path: "/employee-manage", label: "직원 관리" },
  { path: "/restaurant-manage", label: "식당/메뉴 관리" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "oklch(0.97 0.01 250)" }}>
      {/* Header */}
      <header style={{ background: "oklch(0.35 0.08 250)" }} className="sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: "oklch(0.55 0.18 250 / 0.2)", border: "1px solid oklch(0.55 0.18 250 / 0.4)" }}>
                <UtensilsCrossed className="w-5 h-5" style={{ color: "oklch(0.55 0.18 250)" }} />
              </div>
              <div>
                <div className="font-semibold text-white text-sm tracking-wide" style={{ fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 600 }}>
                  Dinner Order
                </div>
                <div className="text-xs" style={{ color: "oklch(0.70 0.05 250)" }}>저녁식사 신청 시스템</div>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              {navItems.map(({ path, label, icon: Icon }) => {
                const isActive = location === path || (path === "/order" && location === "/");
                return (
                  <Link key={path} href={path}>
                    <button
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive
                          ? "text-white"
                          : "text-white/60 hover:text-white/90 hover:bg-white/5"
                      )}
                      style={isActive ? {
                        background: "oklch(0.55 0.18 250 / 0.2)",
                        border: "1px solid oklch(0.55 0.18 250 / 0.35)",
                        color: "oklch(0.85 0.15 250)"
                      } : {}}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{label}</span>
                    </button>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Blue accent line */}
        <div style={{ background: "linear-gradient(90deg, transparent, oklch(0.55 0.18 250 / 0.6), transparent)", height: "1px" }} />
      </header>

      {/* Main */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs" style={{ color: "oklch(0.50 0.03 250)", borderTop: "1px solid oklch(0.90 0.01 250)" }}>
        저녁식사 신청 시스템 &mdash; 매일 오후 4시~6시 운영
      </footer>
    </div>
  );
}
