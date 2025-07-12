import { useState } from 'react'
import { Plus, Pencil, Trash2, ChevronRight, ChevronDown, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { PageContainer } from '@/components/layouts/PageContainer'
import { PageHeader } from '@/components/layouts/PageHeader'
import { ContentSection } from '@/components/layouts/ContentSection'
import {
  useGetRegionsQuery,
  useGetRegionTreeQuery,
  useCreateRegionMutation,
  useUpdateRegionMutation,
  useDeleteRegionMutation,
} from '@/store/api/regionsApi'

export default function RegionsPage() {
  const [view, setView] = useState('list') // 'list' or 'tree'
  const [search, setSearch] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState(null)
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
  const handleDelete = async () => {
    try {
      await deleteRegion(selectedRegion.region_code).unwrap()
      toast.success('지역이 삭제되었습니다.')
      setIsDeleteOpen(false)
      refetch()
    } catch (error) {
      toast.error(error.data?.detail || '지역 삭제에 실패했습니다.')
    }
  }

  // 트리 렌더링
  const renderTree = (nodes, level = 0) => {
    return nodes?.map((node) => {
      const hasChildren = node.children && node.children.length > 0
      const isExpanded = expandedNodes.has(node.region_code)

      return (
        <div key={node.region_code} style={{ marginLeft: `${level * 24}px` }}>
          <div className="flex items-center gap-2 py-2 hover:bg-accent rounded-md px-2 cursor-pointer">
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
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{node.region_name}</span>
            <span className="text-sm text-muted-foreground">({node.region_code})</span>
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
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4 items-center">
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
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            지역 추가
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">로딩 중...</div>
        ) : view === 'list' ? (
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3">지역코드</th>
                  <th className="text-left p-3">지역명</th>
                  <th className="text-left p-3">상위지역</th>
                  <th className="text-left p-3">레벨</th>
                  <th className="text-left p-3">위도</th>
                  <th className="text-left p-3">경도</th>
                  <th className="text-right p-3">작업</th>
                </tr>
              </thead>
              <tbody>
                {data?.regions?.map((region) => (
                  <tr key={region.region_code} className="border-b">
                    <td className="p-3">{region.region_code}</td>
                    <td className="p-3 font-medium">{region.region_name}</td>
                    <td className="p-3">{region.parent_region_code || '-'}</td>
                    <td className="p-3">{region.region_level}</td>
                    <td className="p-3">{region.latitude?.toFixed(6) || '-'}</td>
                    <td className="p-3">{region.longitude?.toFixed(6) || '-'}</td>
                    <td className="p-3 text-right">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border rounded-md p-4">
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
              {selectedRegion?.region_name}을(를) 삭제하시겠습니까?
              이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}

// 지역 폼 다이얼로그 컴포넌트
function RegionFormDialog({ open, onOpenChange, title, onSubmit, initialData, regions, isEdit }) {
  const [formData, setFormData] = useState({
    region_code: '',
    region_name: '',
    parent_region_code: '',
    region_level: '1',
    latitude: '',
    longitude: '',
  })

  // 초기 데이터 설정
  useState(() => {
    if (open) {
      if (initialData) {
        setFormData({
          region_code: initialData.region_code || '',
          region_name: initialData.region_name || '',
          parent_region_code: initialData.parent_region_code || '',
          region_level: initialData.region_level?.toString() || '1',
          latitude: initialData.latitude?.toString() || '',
          longitude: initialData.longitude?.toString() || '',
        })
      } else {
        setFormData({
          region_code: '',
          region_name: '',
          parent_region_code: '',
          region_level: '1',
          latitude: '',
          longitude: '',
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
      const { region_code, ...updateData } = submitData
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
                onChange={(e) => setFormData({ ...formData, region_code: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, region_name: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="region_level" className="text-right">
                레벨
              </Label>
              <Select
                value={formData.region_level}
                onValueChange={(value) => setFormData({ ...formData, region_level: value })}
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
                value={formData.parent_region_code}
                onValueChange={(value) => setFormData({ ...formData, parent_region_code: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="선택 안 함" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">선택 안 함</SelectItem>
                  {regions
                    ?.filter((r) => r.region_level === 1)
                    .map((region) => (
                      <SelectItem key={region.region_code} value={region.region_code}>
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
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                className="col-span-3"
                placeholder="127.123456"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit">{isEdit ? '수정' : '생성'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}