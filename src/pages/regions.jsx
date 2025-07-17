import { useState, useEffect } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  ChevronDown,
  MapPin,
  Navigation,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { PageContainer } from '@/layouts/PageContainer'
import { PageHeader } from '@/layouts/PageHeader'
import { ContentSection } from '@/layouts/ContentSection'
import { LoadingState, EmptyState } from '@/components/common'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useGetRegionsQuery,
  useGetRegionTreeQuery,
  useCreateRegionMutation,
  useUpdateRegionMutation,
  useDeleteRegionMutation,
  useUpdateCoordinatesMutation,
  useGetMissingCoordinatesQuery,
} from '@/store/api/regionsApi'

export default function RegionsPage() {
  const [view, setView] = useState('list') // 'list' or 'tree'
  const [search, setSearch] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isForceDeleteOpen, setIsForceDeleteOpen] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const [expandedNodes, setExpandedNodes] = useState(new Set())

  // API 호출
  const { data, isLoading, refetch } = useGetRegionsQuery({
    search,
    region_level: selectedLevel === 'all' ? undefined : parseInt(selectedLevel),
  })
  const { data: treeData } = useGetRegionTreeQuery()
  const [createRegion] = useCreateRegionMutation()
  const [updateRegion] = useUpdateRegionMutation()
  const [deleteRegion] = useDeleteRegionMutation()
  const [updateCoordinates, { isLoading: isUpdatingCoordinates }] =
    useUpdateCoordinatesMutation()
  const { data: missingCoordData } = useGetMissingCoordinatesQuery()

  // 트리 노드 토글
  const toggleNode = (regionCode) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(regionCode)) {
      newExpanded.delete(regionCode)
    } else {
      newExpanded.add(regionCode)
    }
    setExpandedNodes(newExpanded)
  }

  // 지역 생성
  const handleCreate = async (formData) => {
    try {
      await createRegion(formData).unwrap()
      toast.success('지역이 생성되었습니다.')
      setIsCreateOpen(false)
      refetch()
    } catch (error) {
      toast.error(error.data?.detail || '지역 생성에 실패했습니다.')
    }
  }

  // 지역 수정
  const handleUpdate = async (formData) => {
    try {
      await updateRegion({
        regionCode: selectedRegion.region_code,
        ...formData,
      }).unwrap()
      toast.success('지역 정보가 수정되었습니다.')
      setIsEditOpen(false)
      refetch()
    } catch (error) {
      toast.error(error.data?.detail || '지역 수정에 실패했습니다.')
    }
  }

  // 지역 삭제
  const handleDelete = async (force = false) => {
    try {
      await deleteRegion({ 
        regionCode: selectedRegion.region_code,
        force: force 
      }).unwrap()
      toast.success(force ? '지역이 하위 지역과 함께 삭제되었습니다.' : '지역이 삭제되었습니다.')
      setIsDeleteOpen(false)
      setIsForceDeleteOpen(false)
      setDeleteError(null)
      refetch()
    } catch (error) {
      if (error.data?.detail?.child_count > 0 && !force) {
        // 하위 지역이 있을 때 강제 삭제 다이얼로그 표시
        setDeleteError(error.data.detail)
        setIsDeleteOpen(false)
        setIsForceDeleteOpen(true)
      } else if (error.data?.detail?.related_data && !force) {
        // 관련 데이터가 있을 때
        toast.error(`이 지역에는 ${error.data.detail.related_data.join(', ')} 데이터가 있어 삭제할 수 없습니다. 하위 지역이 있는 경우에만 강제 삭제가 가능합니다.`)
      } else {
        toast.error(error.data?.detail?.message || error.data?.detail || '지역 삭제에 실패했습니다.')
      }
    }
  }

  // 좌표 일괄 업데이트
  const handleUpdateCoordinates = async () => {
    try {
      const result = await updateCoordinates().unwrap()
      toast.success(
        `좌표 업데이트 완료: ${result.updated}개 업데이트, ${result.skipped}개 스킵, ${result.not_found}개 미발견`,
      )
      refetch()
    } catch (error) {
      toast.error(error.data?.detail || '좌표 업데이트에 실패했습니다.')
    }
  }

  // 트리 렌더링
  const renderTree = (nodes, level = 0) => {
    return nodes?.map((node) => {
      const hasChildren = node.children && node.children.length > 0
      const isExpanded = expandedNodes.has(node.region_code)

      return (
        <div key={node.region_code} style={{ marginLeft: `${level * 24}px` }}>
          <div className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md px-2 py-2">
            <button
              onClick={() => hasChildren && toggleNode(node.region_code)}
              className="p-0.5"
              disabled={!hasChildren}
            >
              {hasChildren ? (
                isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )
              ) : (
                <div className="w-4" />
              )}
            </button>
            <MapPin className="text-muted-foreground h-4 w-4" />
            <span className="font-medium">{node.region_name}</span>
            <span className="text-muted-foreground text-sm">
              ({node.region_code})
            </span>
            <div className="ml-auto flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedRegion(node)
                  setIsEditOpen(true)
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedRegion(node)
                  setIsDeleteOpen(true)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {hasChildren && isExpanded && (
            <div>{renderTree(node.children, level + 1)}</div>
          )}
        </div>
      )
    })
  }

  return (
    <PageContainer>
      <PageHeader title="지역 관리" />

      <ContentSection title="지역 목록">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <Button
                variant={view === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('list')}
              >
                목록
              </Button>
              <Button
                variant={view === 'tree' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('tree')}
              >
                계층구조
              </Button>
            </div>
            {view === 'list' && (
              <>
                <Input
                  placeholder="지역명 또는 코드 검색"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64"
                />
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="1">시/도</SelectItem>
                    <SelectItem value="2">시/군/구</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
          <div className="flex gap-2">
            {missingCoordData?.total > 0 && (
              <Button
                variant="outline"
                onClick={handleUpdateCoordinates}
                disabled={isUpdatingCoordinates}
              >
                <Navigation className="mr-2 h-4 w-4" />
                {isUpdatingCoordinates
                  ? '업데이트 중...'
                  : `좌표 업데이트 (${missingCoordData.total}개 누락)`}
              </Button>
            )}
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              지역 추가
            </Button>
          </div>
        </div>

        {isLoading ? (
          <LoadingState message="지역 데이터를 불러오는 중..." />
        ) : !data?.regions || data.regions.length === 0 ? (
          <EmptyState
            type="database"
            message={
              search || selectedLevel !== 'all'
                ? '검색 결과가 없습니다'
                : '등록된 지역이 없습니다'
            }
            description={
              search || selectedLevel !== 'all'
                ? '다른 검색 조건으로 시도해보세요'
                : '새로운 지역을 추가해주세요'
            }
            action={
              !(search || selectedLevel !== 'all') && (
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  지역 추가
                </Button>
              )
            }
          />
        ) : view === 'list' ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>지역코드</TableHead>
                  <TableHead>지역명</TableHead>
                  <TableHead>전체 지역명</TableHead>
                  <TableHead>상위지역</TableHead>
                  <TableHead>레벨</TableHead>
                  <TableHead>위도</TableHead>
                  <TableHead>경도</TableHead>
                  <TableHead>활성화</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.regions?.map((region) => (
                  <TableRow key={region.region_code}>
                    <TableCell>{region.region_code}</TableCell>
                    <TableCell className="font-medium">
                      {region.region_name}
                    </TableCell>
                    <TableCell>{region.region_name_full || '-'}</TableCell>
                    <TableCell>{region.parent_region_code || '-'}</TableCell>
                    <TableCell>{region.region_level}</TableCell>
                    <TableCell>{region.latitude?.toFixed(6) || '-'}</TableCell>
                    <TableCell>{region.longitude?.toFixed(6) || '-'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={region.is_active ? 'success' : 'secondary'}
                      >
                        {region.is_active ? (
                          <>
                            <CheckCircle className="mr-1 h-3 w-3" />
                            활성
                          </>
                        ) : (
                          <>
                            <XCircle className="mr-1 h-3 w-3" />
                            비활성
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedRegion(region)
                          setIsEditOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedRegion(region)
                          setIsDeleteOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="rounded-md border p-4">
            {renderTree(treeData?.tree)}
          </div>
        )}
      </ContentSection>

      {/* 지역 생성 다이얼로그 */}
      <RegionFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="지역 추가"
        onSubmit={handleCreate}
        regions={data?.regions}
      />

      {/* 지역 수정 다이얼로그 */}
      <RegionFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="지역 수정"
        onSubmit={handleUpdate}
        initialData={selectedRegion}
        regions={data?.regions}
        isEdit
      />

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>지역 삭제</DialogTitle>
            <DialogDescription>
              {selectedRegion?.region_name}을(를) 삭제하시겠습니까? 이 작업은
              되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={() => handleDelete(false)}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 강제 삭제 확인 다이얼로그 */}
      <Dialog open={isForceDeleteOpen} onOpenChange={setIsForceDeleteOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">⚠️ 경고: 하위 지역이 존재합니다</DialogTitle>
            <DialogDescription className="space-y-4">
              <div className="text-red-600 font-semibold">
                {selectedRegion?.region_name}에는 {deleteError?.child_count}개의 하위 지역이 있습니다.
              </div>
              
              {deleteError?.child_regions && (
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md space-y-1">
                  <p className="font-medium text-sm">삭제될 하위 지역:</p>
                  <ul className="text-sm space-y-1">
                    {deleteError.child_regions.map(child => (
                      <li key={child.region_code} className="ml-4">
                        • {child.region_name} ({child.region_code})
                      </li>
                    ))}
                    {deleteError.has_more && (
                      <li className="ml-4 text-gray-500">
                        ... 외 {deleteError.child_count - 5}개 지역
                      </li>
                    )}
                  </ul>
                </div>
              )}
              
              <div className="text-red-600 font-bold">
                정말로 하위 지역을 포함하여 모두 삭제하시겠습니까?
                <br />
                이 작업은 절대 되돌릴 수 없습니다!
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsForceDeleteOpen(false)
                setDeleteError(null)
              }}
            >
              취소
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleDelete(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              강제 삭제 (하위 지역 포함)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}

// 지역 폼 다이얼로그 컴포넌트
function RegionFormDialog({
  open,
  onOpenChange,
  title,
  onSubmit,
  initialData,
  regions,
  isEdit,
}) {
  const [formData, setFormData] = useState({
    region_code: '',
    region_name: '',
    region_name_full: '',
    parent_region_code: '',
    region_level: '1',
    latitude: '',
    longitude: '',
    is_active: true,
  })

  // 초기 데이터 설정
  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          region_code: initialData.region_code || '',
          region_name: initialData.region_name || '',
          region_name_full: initialData.region_name_full || '',
          parent_region_code: initialData.parent_region_code || '',
          region_level: initialData.region_level?.toString() || '1',
          latitude: initialData.latitude?.toString() || '',
          longitude: initialData.longitude?.toString() || '',
          is_active: initialData.is_active ?? true,
        })
      } else {
        setFormData({
          region_code: '',
          region_name: '',
          region_name_full: '',
          parent_region_code: '',
          region_level: '1',
          latitude: '',
          longitude: '',
          is_active: true,
        })
      }
    }
  }, [open, initialData])

  const handleSubmit = (e) => {
    e.preventDefault()
    const submitData = {
      ...formData,
      region_level: parseInt(formData.region_level),
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      parent_region_code: formData.parent_region_code || null,
    }

    if (isEdit) {
      const { region_code: _region_code, ...updateData } = submitData
      onSubmit(updateData)
    } else {
      onSubmit(submitData)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="region_code" className="text-right">
                지역코드
              </Label>
              <Input
                id="region_code"
                value={formData.region_code}
                onChange={(e) =>
                  setFormData({ ...formData, region_code: e.target.value })
                }
                className="col-span-3"
                required
                disabled={isEdit}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="region_name" className="text-right">
                지역명
              </Label>
              <Input
                id="region_name"
                value={formData.region_name}
                onChange={(e) =>
                  setFormData({ ...formData, region_name: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="region_name_full" className="text-right">
                전체 지역명
              </Label>
              <Input
                id="region_name_full"
                value={formData.region_name_full}
                onChange={(e) =>
                  setFormData({ ...formData, region_name_full: e.target.value })
                }
                className="col-span-3"
                placeholder="서울특별시 강남구"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="region_level" className="text-right">
                레벨
              </Label>
              <Select
                value={formData.region_level}
                onValueChange={(value) =>
                  setFormData({ ...formData, region_level: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 (시/도)</SelectItem>
                  <SelectItem value="2">2 (시/군/구)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="parent_region_code" className="text-right">
                상위지역
              </Label>
              <Select
                value={formData.parent_region_code || 'none'}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    parent_region_code: value === 'none' ? '' : value,
                  })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="선택 안 함" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">선택 안 함</SelectItem>
                  {regions
                    ?.filter((r) => r.region_level === 1)
                    .map((region) => (
                      <SelectItem
                        key={region.region_code}
                        value={region.region_code}
                      >
                        {region.region_name} ({region.region_code})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="latitude" className="text-right">
                위도
              </Label>
              <Input
                id="latitude"
                type="number"
                step="0.000001"
                value={formData.latitude}
                onChange={(e) =>
                  setFormData({ ...formData, latitude: e.target.value })
                }
                className="col-span-3"
                placeholder="37.123456"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="longitude" className="text-right">
                경도
              </Label>
              <Input
                id="longitude"
                type="number"
                step="0.000001"
                value={formData.longitude}
                onChange={(e) =>
                  setFormData({ ...formData, longitude: e.target.value })
                }
                className="col-span-3"
                placeholder="127.123456"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_active" className="text-right">
                활성화 상태
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
                <Label htmlFor="is_active" className="font-normal">
                  {formData.is_active ? '활성' : '비활성'}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit">{isEdit ? '수정' : '생성'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
