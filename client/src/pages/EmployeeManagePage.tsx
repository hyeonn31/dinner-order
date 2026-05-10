import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Trash2, Loader2 } from "lucide-react";

export default function EmployeeManagePage() {
  const utils = trpc.useUtils();
  const { data: employees, isLoading } = trpc.employee.list.useQuery();
  const [newName, setNewName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nickname: string } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const addMutation = trpc.employee.add.useMutation({
    onSuccess: () => {
      toast.success("직원이 추가되었습니다");
      setNewName("");
      setIsDialogOpen(false);
      utils.employee.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "직원 추가에 실패했습니다");
    },
  });

  const deleteMutation = trpc.employee.delete.useMutation({
    onSuccess: () => {
      toast.success("직원이 삭제되었습니다");
      setDeleteTarget(null);
      utils.employee.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "직원 삭제에 실패했습니다");
    },
  });

  const handleAdd = () => {
    if (!newName.trim()) {
      toast.error("이름을 입력해 주세요");
      return;
    }
    addMutation.mutate({ nickname: newName.trim() });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate({ employeeId: deleteTarget.id });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">직원 관리</h1>
          <p className="text-muted-foreground">직원을 추가하거나 삭제할 수 있습니다</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>직원 추가</CardTitle>
            <CardDescription>새로운 직원의 이름을 입력하고 추가 버튼을 클릭하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="직원 이름 (닉네임)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAdd()}
                disabled={addMutation.isPending}
              />
              <Button
                onClick={handleAdd}
                disabled={addMutation.isPending}
                className="bg-accent hover:bg-accent/90"
              >
                {addMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                추가
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>직원 목록</CardTitle>
            <CardDescription>총 {employees?.length || 0}명의 직원</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
              </div>
            ) : employees && employees.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {employees.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:bg-muted/50 transition"
                  >
                    <span className="font-medium text-foreground">{emp.nickname}</span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget({ id: emp.id, nickname: emp.nickname })}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>직원 삭제</AlertDialogTitle>
                          <AlertDialogDescription>
                            '{deleteTarget?.nickname}'을(를) 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex gap-3 justify-end">
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            {deleteMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : null}
                            삭제
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                직원이 없습니다
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
