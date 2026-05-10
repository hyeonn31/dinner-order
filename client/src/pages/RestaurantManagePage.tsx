import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Trash2, Loader2 } from "lucide-react";

export default function RestaurantManagePage() {
  const utils = trpc.useUtils();
  const { data: restaurants, isLoading: restaurantsLoading } = trpc.restaurant.list.useQuery();
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);
  const [newRestaurantName, setNewRestaurantName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [newMenuName, setNewMenuName] = useState("");
  const [selectedMenuType, setSelectedMenuType] = useState<string>("main");

  const categories = [
    { id: 1, name: "한식" },
    { id: 2, name: "양식" },
    { id: 3, name: "샐러드" },
    { id: 4, name: "햄버거" },
  ];

  const menuTypes = [
    { value: "main", label: "메인메뉴" },
    { value: "side", label: "사이드" },
    { value: "drink", label: "음료" },
    { value: "extra", label: "추가옵션" },
  ];

  const selectedRestaurant = restaurants?.find(r => r.id === selectedRestaurantId);
  const { data: menus, isLoading: menusLoading } = trpc.restaurant.menus.useQuery(
    { restaurantId: selectedRestaurantId || 0 },
    { enabled: !!selectedRestaurantId }
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">식당 & 메뉴 관리</h1>
          <p className="text-muted-foreground">식당과 메뉴를 추가, 수정, 삭제할 수 있습니다</p>
        </div>

        <Tabs defaultValue="restaurants" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="restaurants">식당 관리</TabsTrigger>
            <TabsTrigger value="menus">메뉴 관리</TabsTrigger>
          </TabsList>

          {/* 식당 관리 탭 */}
          <TabsContent value="restaurants" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>식당 추가</CardTitle>
                <CardDescription>새로운 식당을 추가하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="식당 이름"
                    value={newRestaurantName}
                    onChange={(e) => setNewRestaurantName(e.target.value)}
                  />
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="카테고리" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button className="bg-accent hover:bg-accent/90">
                    <Plus className="w-4 h-4" />
                    추가
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>식당 목록</CardTitle>
                <CardDescription>총 {restaurants?.length || 0}개의 식당</CardDescription>
              </CardHeader>
              <CardContent>
                {restaurantsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-accent" />
                  </div>
                ) : restaurants && restaurants.length > 0 ? (
                  <div className="space-y-2">
                    {restaurants.map(restaurant => (
                      <div
                        key={restaurant.id}
                        className="flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition"
                        onClick={() => setSelectedRestaurantId(restaurant.id)}
                      >
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{restaurant.name}</p>
                          <p className="text-sm text-muted-foreground">{restaurant.categoryName}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    식당이 없습니다
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 메뉴 관리 탭 */}
          <TabsContent value="menus" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>식당 선택</CardTitle>
                <CardDescription>메뉴를 관리할 식당을 선택하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedRestaurantId?.toString() || ""} onValueChange={(v) => setSelectedRestaurantId(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="식당을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants?.map(r => (
                      <SelectItem key={r.id} value={r.id.toString()}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {selectedRestaurant && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>메뉴 추가</CardTitle>
                    <CardDescription>{selectedRestaurant.name}에 새로운 메뉴를 추가하세요</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="메뉴 이름"
                        value={newMenuName}
                        onChange={(e) => setNewMenuName(e.target.value)}
                      />
                      <Select value={selectedMenuType} onValueChange={setSelectedMenuType}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {menuTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button className="bg-accent hover:bg-accent/90">
                        <Plus className="w-4 h-4" />
                        추가
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>메뉴 목록</CardTitle>
                    <CardDescription>{selectedRestaurant.name} - 총 {menus?.length || 0}개 메뉴</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {menusLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-accent" />
                      </div>
                    ) : menus && menus.length > 0 ? (
                      <div className="space-y-2">
                        {menus.map(menu => (
                          <div
                            key={menu.id}
                            className="flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:bg-muted/50 transition"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{menu.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {menuTypes.find(t => t.value === menu.itemType)?.label}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        메뉴가 없습니다
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
