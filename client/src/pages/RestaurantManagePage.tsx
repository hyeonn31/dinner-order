import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Trash2, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function RestaurantManagePage() {
  const utils = trpc.useUtils();
  const { data: restaurants, isLoading: restaurantsLoading } = trpc.restaurant.list.useQuery();
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);
  const [newRestaurantName, setNewRestaurantName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [newMenuName, setNewMenuName] = useState("");
  const [selectedMenuType, setSelectedMenuType] = useState<string>("main");
  const [deleteRestaurantId, setDeleteRestaurantId] = useState<number | null>(null);
  const [deleteMenuId, setDeleteMenuId] = useState<number | null>(null);

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
    { value: "option", label: "추가옵션" },
  ];

  const selectedRestaurant = restaurants?.find(r => r.id === selectedRestaurantId);
  const { data: menus, isLoading: menusLoading } = trpc.restaurant.menus.useQuery(
    { restaurantId: selectedRestaurantId || 0 },
    { enabled: !!selectedRestaurantId }
  );

  // 식당 추가
  const addRestaurantMutation = trpc.restaurant.addRestaurant.useMutation({
    onSuccess: () => {
      toast.success("식당이 추가되었습니다");
      setNewRestaurantName("");
      setSelectedCategory("");
      utils.restaurant.list.invalidate();
    },
    onError: (error) => {
      toast.error(`식당 추가 실패: ${error.message}`);
    },
  });

  // 식당 삭제
  const deleteRestaurantMutation = trpc.restaurant.deleteRestaurant.useMutation({
    onSuccess: () => {
      toast.success("식당이 삭제되었습니다");
      utils.restaurant.list.invalidate();
      setDeleteRestaurantId(null);
    },
    onError: (error) => {
      toast.error(`식당 삭제 실패: ${error.message}`);
    },
  });

  // 메뉴 추가
  const addMenuMutation = trpc.restaurant.addMenu.useMutation({
    onSuccess: () => {
      toast.success("메뉴가 추가되었습니다");
      setNewMenuName("");
      setSelectedMenuType("main");
      utils.restaurant.menus.invalidate();
    },
    onError: (error) => {
      toast.error(`메뉴 추가 실패: ${error.message}`);
    },
  });

  // 메뉴 삭제
  const deleteMenuMutation = trpc.restaurant.deleteMenu.useMutation({
    onSuccess: () => {
      toast.success("메뉴가 삭제되었습니다");
      utils.restaurant.menus.invalidate();
      setDeleteMenuId(null);
    },
    onError: (error) => {
      toast.error(`메뉴 삭제 실패: ${error.message}`);
    },
  });

  const handleAddRestaurant = () => {
    if (!newRestaurantName.trim()) {
      toast.error("식당 이름을 입력하세요");
      return;
    }
    if (!selectedCategory) {
      toast.error("카테고리를 선택하세요");
      return;
    }
    addRestaurantMutation.mutate({
      name: newRestaurantName,
      categoryId: parseInt(selectedCategory),
    });
  };

  const handleDeleteRestaurant = (restaurantId: number) => {
    deleteRestaurantMutation.mutate({ restaurantId });
  };

  const handleAddMenu = () => {
    if (!newMenuName.trim()) {
      toast.error("메뉴 이름을 입력하세요");
      return;
    }
    if (!selectedRestaurantId) {
      toast.error("식당을 선택하세요");
      return;
    }
    addMenuMutation.mutate({
      restaurantId: selectedRestaurantId,
      name: newMenuName,
      itemType: selectedMenuType,
    });
  };

  const handleDeleteMenu = (menuId: number) => {
    deleteMenuMutation.mutate({ menuId });
  };

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
                  <Button 
                    onClick={handleAddRestaurant}
                    disabled={addRestaurantMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {addRestaurantMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        추가
                      </>
                    )}
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
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
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
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteRestaurantId(restaurant.id);
                          }}
                        >
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
                      <Button 
                        onClick={handleAddMenu}
                        disabled={addMenuMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {addMenuMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            추가
                          </>
                        )}
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
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
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
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive"
                              onClick={() => setDeleteMenuId(menu.id)}
                            >
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

      {/* 식당 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteRestaurantId !== null} onOpenChange={(open) => !open && setDeleteRestaurantId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>식당 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 식당을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteRestaurantId && handleDeleteRestaurant(deleteRestaurantId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* 메뉴 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteMenuId !== null} onOpenChange={(open) => !open && setDeleteMenuId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>메뉴 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 메뉴를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMenuId && handleDeleteMenu(deleteMenuId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
