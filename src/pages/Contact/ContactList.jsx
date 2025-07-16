import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contactApi } from '@/api/contact';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

const ContactList = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    skip: 0,
    limit: 20,
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [contactsData, statsData, categoriesData] = await Promise.all([
        contactApi.getContacts(filters),
        contactApi.getContactStats(),
        contactApi.getCategories(),
      ]);
      
      setContacts(contactsData || []);
      setStats(statsData);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value, skip: 0 }));
  };

  const handleCategoryChange = (value) => {
    setFilters(prev => ({ ...prev, category: value === 'all' ? '' : value, skip: 0 }));
  };

  const handleStatusChange = (value) => {
    setFilters(prev => ({ ...prev, status: value === 'all' ? '' : value, skip: 0 }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary">대기중</Badge>;
      case 'PROCESSING':
        return <Badge variant="outline">처리중</Badge>;
      case 'COMPLETE':
        return <Badge variant="default">완료</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleContactClick = (id) => {
    navigate(`/contact/${id}`);
  };

  const handlePageChange = (direction) => {
    setFilters(prev => ({
      ...prev,
      skip: direction === 'next' ? prev.skip + prev.limit : Math.max(0, prev.skip - prev.limit),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">로딩중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">문의 관리</h2>
          <p className="text-muted-foreground">
            고객 문의사항을 확인하고 답변을 관리합니다.
          </p>
        </div>
      </div>

      {/* 통계 카드 */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 문의</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">대기중</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">처리중</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.processing}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">완료</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.complete}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 필터 및 검색 */}
      <Card>
        <CardHeader>
          <CardTitle>문의 목록</CardTitle>
          <CardDescription>
            등록된 문의사항을 검색하고 관리합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Input
              placeholder="제목, 이름, 이메일로 검색..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="max-w-sm"
            />
            <Select value={filters.category || 'all'} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="분류 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="PENDING">대기중</SelectItem>
                <SelectItem value="PROCESSING">처리중</SelectItem>
                <SelectItem value="COMPLETE">완료</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">번호</TableHead>
                <TableHead className="w-24">분류</TableHead>
                <TableHead>제목</TableHead>
                <TableHead className="w-32">작성자</TableHead>
                <TableHead className="w-24">상태</TableHead>
                <TableHead className="w-20">답변</TableHead>
                <TableHead className="w-40">등록일</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    문의사항이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((contact) => (
                  <TableRow
                    key={contact.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleContactClick(contact.id)}
                  >
                    <TableCell>{contact.id}</TableCell>
                    <TableCell>{contact.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {contact.title}
                        {contact.is_private && (
                          <Badge variant="secondary" className="text-xs">
                            비공개
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{contact.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {contact.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(contact.approval_status)}</TableCell>
                    <TableCell>
                      {contact.has_answer ? (
                        <Badge variant="outline">답변완료</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(contact.created_at), 'PPP', { locale: ko })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              총 {contacts.length}개 항목
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange('prev')}
                disabled={filters.skip === 0}
              >
                이전
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange('next')}
                disabled={contacts.length < filters.limit}
              >
                다음
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactList;