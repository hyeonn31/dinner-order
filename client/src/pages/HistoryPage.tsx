import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function HistoryPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");

  // 직원 목록 조회
  const { data: employees = [], isLoading: employeesLoading } = trpc.employee.list.useQuery();

  // 식당 목록 조회
  const { data: restaurants = [], isLoading: restaurantsLoading } = trpc.restaurant.list.useQuery();

  // 주문 이력 조회
  const { data: history = [], isLoading: historyLoading } = trpc.order.getHistory.useQuery({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    employeeId: selectedEmployee ? parseInt(selectedEmployee) : undefined,
    restaurantId: selectedRestaurant ? parseInt(selectedRestaurant) : undefined,
  });

  // 통계 계산
  const stats = useMemo(() => {
    const totalOrders = history.length;
    const uniqueDates = new Set(
      history.map((h) => new Date(h.orderDate).toLocaleDateString())
    ).size;
    const uniqueEmployees = new Set(history.map((h) => h.employeeId)).size;
    const uniqueRestaurants = new Set(history.map((h) => h.restaurantId)).size;

    // 인기 메뉴
    const menuCount = new Map<string, number>();
    history.forEach((h) => {
      const menu = h.mainMenuName || "메뉴 미선택";
      menuCount.set(menu, (menuCount.get(menu) || 0) + 1);
    });
    const topMenus = Array.from(menuCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // 인기 식당
    const restaurantCount = new Map<string, number>();
    history.forEach((h) => {
      restaurantCount.set(
        h.restaurantName,
        (restaurantCount.get(h.restaurantName) || 0) + 1
      );
    });
    const topRestaurants = Array.from(restaurantCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      totalOrders,
      uniqueDates,
      uniqueEmployees,
      uniqueRestaurants,
      topMenus,
      topRestaurants,
    };
  }, [history]);

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setSelectedEmployee("");
    setSelectedRestaurant("");
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">주문 이력 조회</h1>

      {/* 필터 섹션 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>필터 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">시작 날짜</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">종료 날짜</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">직원</label>
              <Select value={selectedEmployee} onValueChange={(val) => setSelectedEmployee(val === 'all' ? '' : val)} disabled={employeesLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={employeesLoading ? "로딩 중..." : "전체 직원"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 직원</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.nickname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">식당</label>
              <Select value={selectedRestaurant} onValueChange={(val) => setSelectedRestaurant(val === 'all' ? '' : val)} disabled={restaurantsLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={restaurantsLoading ? "로딩 중..." : "전체 식당"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 식당</SelectItem>
                  {restaurants.map((rest) => (
                    <SelectItem key={rest.id} value={rest.id.toString()}>
                      {rest.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleReset} variant="outline">
            필터 초기화
          </Button>
        </CardContent>
      </Card>

      {/* 통계 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {stats.totalOrders}
              </div>
              <div className="text-sm text-gray-600">총 주문 건수</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {stats.uniqueDates}
              </div>
              <div className="text-sm text-gray-600">주문 날짜</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {stats.uniqueEmployees}
              </div>
              <div className="text-sm text-gray-600">참여 직원</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {stats.uniqueRestaurants}
              </div>
              <div className="text-sm text-gray-600">이용 식당</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 인기 메뉴 및 식당 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>인기 메뉴 TOP 5</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.topMenus.length > 0 ? (
                stats.topMenus.map(([menu, count], idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-sm">{idx + 1}. {menu}</span>
                    <span className="font-bold text-blue-600">{count}건</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">데이터가 없습니다</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>인기 식당 TOP 5</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.topRestaurants.length > 0 ? (
                stats.topRestaurants.map(([restaurant, count], idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-sm">{idx + 1}. {restaurant}</span>
                    <span className="font-bold text-green-600">{count}건</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">데이터가 없습니다</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 주문 이력 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>주문 상세 내역</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>날짜</TableHead>
                  <TableHead>직원</TableHead>
                  <TableHead>식당</TableHead>
                  <TableHead>메인메뉴</TableHead>
                  <TableHead>사이드</TableHead>
                  <TableHead>음료</TableHead>
                  <TableHead>추가옵션</TableHead>
                  <TableHead>특수요청</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                      로딩 중...
                    </TableCell>
                  </TableRow>
                ) : history.length > 0 ? (
                  history.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="text-sm">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm">
                        {order.employeeNickname}
                      </TableCell>
                      <TableCell className="text-sm">
                        {order.restaurantName}
                      </TableCell>
                      <TableCell className="text-sm">
                        {order.mainMenuName || "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {order.sideMenuName || "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {order.drinkOption || "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {order.extraOption || "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {order.note || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                      조회 결과가 없습니다
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
