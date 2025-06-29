import { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Plus, Search, Edit, Trash2, Shield, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';

export const UsersPage = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAdmins();
      setAdmins(data);
    } catch (error) {
      setError('관리자 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    try {
      await apiService.createAdmin(formData);
      setIsCreateDialogOpen(false);
      setFormData({ email: '', username: '', password: '' });
      fetchAdmins();
    } catch (error) {
      setError('관리자 생성에 실패했습니다.');
    }
  };

  const handleUpdateAdmin = async () => {
    try {
      await apiService.updateAdmin(selectedAdmin.id, formData);
      setIsEditDialogOpen(false);
      setSelectedAdmin(null);
      setFormData({ email: '', username: '', password: '' });
      fetchAdmins();
    } catch (error) {
      setError('관리자 수정에 실패했습니다.');
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    try {
      await apiService.deleteAdmin(adminId);
      fetchAdmins();
    } catch (error) {
      setError('관리자 삭제에 실패했습니다.');
    }
  };

  const handleActivateAdmin = async (adminId) => {
    try {
      await apiService.activateAdmin(adminId);
      fetchAdmins();
    } catch (error) {
      setError('관리자 활성화에 실패했습니다.');
    }
  };

  const handleDeactivateAdmin = async (adminId) => {
    try {
      await apiService.deactivateAdmin(adminId);
      fetchAdmins();
    } catch (error) {
      setError('관리자 비활성화에 실패했습니다.');
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">관리자 관리</h2>
          <p className="text-muted-foreground">
            시스템의 모든 관리자를 확인하고 관리할 수 있습니다.
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              새 관리자 추가
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 관리자 추가</DialogTitle>
              <DialogDescription>
                새로운 관리자 계정을 생성합니다.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="username">사용자명</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateAdmin}>생성</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center space-x-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="관리자 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredAdmins.map((admin) => (
          <Card key={admin.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {admin.is_superuser ? (
                    <Shield className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <User className="h-5 w-5 text-gray-600" />
                  )}
                  <div>
                    <CardTitle className="text-lg">{admin.username}</CardTitle>
                    <CardDescription>{admin.email}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={admin.is_active ? "default" : "secondary"}>
                    {admin.is_active ? "활성" : "비활성"}
                  </Badge>
                  {admin.is_superuser && (
                    <Badge variant="outline">슈퍼유저</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  생성일: {new Date(admin.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center space-x-2">
                  <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAdmin(admin);
                          setFormData({
                            email: admin.email,
                            username: admin.username,
                            password: ''
                          });
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>관리자 수정</DialogTitle>
                        <DialogDescription>
                          관리자 정보를 수정합니다.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="edit-email">이메일</Label>
                          <Input
                            id="edit-email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-username">사용자명</Label>
                          <Input
                            id="edit-username"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-password">새 비밀번호 (선택사항)</Label>
                          <Input
                            id="edit-password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleUpdateAdmin}>수정</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {admin.is_active ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeactivateAdmin(admin.id)}
                    >
                      비활성화
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleActivateAdmin(admin.id)}
                    >
                      활성화
                    </Button>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>관리자 삭제</AlertDialogTitle>
                        <AlertDialogDescription>
                          정말로 이 관리자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteAdmin(admin.id)}
                        >
                          삭제
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAdmins.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">관리자가 없습니다.</p>
        </div>
      )}
    </div>
  );
};
