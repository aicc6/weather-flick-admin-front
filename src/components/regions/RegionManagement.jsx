import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/use-toast'
import { Search, Plus, Edit, MapPin, Database, Settings } from 'lucide-react'

/**
 * 지역 관리 컴포넌트
 * - 지역 정보 조회/수정
 * - 좌표 정보 관리
 * - API 매핑 정보 관리
 */
export default function RegionManagement() {
  const [regions, setRegions] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({})

  // 지역 목록 조회
  const fetchRegions = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/regions')
      if (!response.ok) throw new Error('Failed to fetch regions')
      
      const data = await response.json()
      setRegions(data.regions || [])
    } catch (error) {
      console.error('지역 정보 조회 실패:', error)
      toast({
        title: '오류',
        description: '지역 정보를 불러오는데 실패했습니다.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRegions()
  }, [])

  // 검색 필터링
  const filteredRegions = regions.filter(region =>
    region.region_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    region.region_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    region.region_name_full?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 편집 모달 열기
  const openEditModal = (region) => {
    setSelectedRegion(region)
    setEditForm({
      region_name: region.region_name || '',
      region_name_full: region.region_name_full || '',
      latitude: region.latitude || '',
      longitude: region.longitude || '',
      grid_x: region.grid_x || '',
      grid_y: region.grid_y || '',
      is_active: region.is_active || false,
      api_mappings: JSON.stringify(region.api_mappings || {}, null, 2),
    })
    setIsEditModalOpen(true)
  }

  // 지역 정보 저장
  const handleSaveRegion = async () => {
    try {
      const updateData = {
        ...editForm,
        latitude: editForm.latitude ? parseFloat(editForm.latitude) : null,
        longitude: editForm.longitude ? parseFloat(editForm.longitude) : null,
        grid_x: editForm.grid_x ? parseInt(editForm.grid_x) : null,
        grid_y: editForm.grid_y ? parseInt(editForm.grid_y) : null,
        api_mappings: editForm.api_mappings ? JSON.parse(editForm.api_mappings) : {},
      }

      const response = await fetch(`/api/admin/regions/${selectedRegion.region_code}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) throw new Error('Failed to update region')

      toast({
        title: '성공',
        description: '지역 정보가 업데이트되었습니다.',
      })

      setIsEditModalOpen(false)
      fetchRegions()
    } catch (error) {
      console.error('지역 정보 저장 실패:', error)
      toast({
        title: '오류',
        description: '지역 정보 저장에 실패했습니다.',
        variant: 'destructive',
      })
    }
  }

  // 좌표 일괄 업데이트
  const handleBulkCoordinateUpdate = async () => {
    try {
      const response = await fetch('/api/admin/regions/coordinates/bulk-update', {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to bulk update coordinates')

      toast({
        title: '성공',
        description: '좌표 정보가 일괄 업데이트되었습니다.',
      })

      fetchRegions()
    } catch (error) {
      console.error('좌표 일괄 업데이트 실패:', error)
      toast({
        title: '오류',
        description: '좌표 일괄 업데이트에 실패했습니다.',
        variant: 'destructive',
      })
    }
  }

  const stats = {
    total: regions.length,
    active: regions.filter(r => r.is_active).length,
    provinces: regions.filter(r => r.region_level === 1).length,
    cities: regions.filter(r => r.region_level === 2).length,
    withCoordinates: regions.filter(r => r.latitude && r.longitude).length,
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">지역 관리</h1>
          <p className="text-muted-foreground">
            전국 지역 정보, 좌표, API 매핑 관리
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleBulkCoordinateUpdate} variant="outline">
            <MapPin className="mr-2 h-4 w-4" />
            좌표 일괄 업데이트
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">총 지역</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">활성 지역</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.provinces}</div>
            <p className="text-xs text-muted-foreground">광역시도</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.cities}</div>
            <p className="text-xs text-muted-foreground">시군구</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.withCoordinates}</div>
            <p className="text-xs text-muted-foreground">좌표 보유</p>
          </CardContent>
        </Card>
      </div>

      {/* 메인 콘텐츠 */}
      <Card>
        <CardHeader>
          <CardTitle>지역 목록</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="지역명, 지역코드로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>지역코드</TableHead>
                  <TableHead>지역명</TableHead>
                  <TableHead>레벨</TableHead>
                  <TableHead>좌표</TableHead>
                  <TableHead>격자좌표</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>API 매핑</TableHead>
                  <TableHead>작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      로딩 중...
                    </TableCell>
                  </TableRow>
                ) : filteredRegions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      검색 결과가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRegions.map((region) => (
                    <TableRow key={region.region_id}>
                      <TableCell className="font-mono text-sm">
                        {region.region_code}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{region.region_name}</div>
                          {region.region_name_full && (
                            <div className="text-sm text-muted-foreground">
                              {region.region_name_full}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={region.region_level === 1 ? 'default' : 'secondary'}>
                          {region.region_level === 1 ? '광역시도' : '시군구'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {region.latitude && region.longitude ? (
                          <div className="text-sm">
                            <div>{parseFloat(region.latitude).toFixed(4)}</div>
                            <div>{parseFloat(region.longitude).toFixed(4)}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">없음</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {region.grid_x && region.grid_y ? (
                          <div className="text-sm">
                            <span>({region.grid_x}, {region.grid_y})</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">없음</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={region.is_active ? 'default' : 'destructive'}>
                          {region.is_active ? '활성' : '비활성'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {region.api_mappings && Object.keys(region.api_mappings).length > 0 ? (
                          <Badge variant="outline">
                            {Object.keys(region.api_mappings).length}개
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">없음</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(region)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 편집 모달 */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>지역 정보 편집</DialogTitle>
          </DialogHeader>
          {selectedRegion && (
            <div className="space-y-4">
              <Tabs defaultValue="basic">
                <TabsList>
                  <TabsTrigger value="basic">기본 정보</TabsTrigger>
                  <TabsTrigger value="coordinates">좌표 정보</TabsTrigger>
                  <TabsTrigger value="api">API 매핑</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="region_name">지역명</Label>
                      <Input
                        id="region_name"
                        value={editForm.region_name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, region_name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="region_name_full">전체 지역명</Label>
                      <Input
                        id="region_name_full"
                        value={editForm.region_name_full}
                        onChange={(e) => setEditForm(prev => ({ ...prev, region_name_full: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={editForm.is_active}
                      onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="is_active">활성 상태</Label>
                  </div>
                </TabsContent>

                <TabsContent value="coordinates" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="latitude">위도</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="0.000001"
                        value={editForm.latitude}
                        onChange={(e) => setEditForm(prev => ({ ...prev, latitude: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="longitude">경도</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="0.000001"
                        value={editForm.longitude}
                        onChange={(e) => setEditForm(prev => ({ ...prev, longitude: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="grid_x">격자 X</Label>
                      <Input
                        id="grid_x"
                        type="number"
                        value={editForm.grid_x}
                        onChange={(e) => setEditForm(prev => ({ ...prev, grid_x: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="grid_y">격자 Y</Label>
                      <Input
                        id="grid_y"
                        type="number"
                        value={editForm.grid_y}
                        onChange={(e) => setEditForm(prev => ({ ...prev, grid_y: e.target.value }))}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="api" className="space-y-4">
                  <div>
                    <Label htmlFor="api_mappings">API 매핑 정보 (JSON)</Label>
                    <Textarea
                      id="api_mappings"
                      rows={10}
                      value={editForm.api_mappings}
                      onChange={(e) => setEditForm(prev => ({ ...prev, api_mappings: e.target.value }))}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      JSON 형식으로 API 매핑 정보를 입력하세요.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  취소
                </Button>
                <Button onClick={handleSaveRegion}>
                  저장
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}