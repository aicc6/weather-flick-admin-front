import { useState } from 'react'
import {
  useGetTravelCoursesQuery,
  useCreateTravelCourseMutation,
  useDeleteTravelCourseMutation,
} from '../../store/api/contentApi'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '../ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../ui/table'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '../ui/dialog'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '../ui/alert-dialog'

export const ContentPage = () => {
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState({ course_name: '', region_code: '' })
  const { data, isLoading, error, refetch } = useGetTravelCoursesQuery({
    limit: 20,
    offset: 0,
  })
  const [createTravelCourse, { isLoading: isCreating }] =
    useCreateTravelCourseMutation()
  const [deleteTravelCourse, { isLoading: isDeleting }] =
    useDeleteTravelCourseMutation()

  const filtered = data?.items?.filter(
    (c) =>
      c.course_name.toLowerCase().includes(search.toLowerCase()) ||
      c.region_code.toLowerCase().includes(search.toLowerCase()),
  )

  const handleAdd = async (e) => {
    e.preventDefault()
    await createTravelCourse(form)
    setForm({ course_name: '', region_code: '' })
    setAddOpen(false)
    refetch()
  }

  const handleDelete = async () => {
    if (deleteId) {
      await deleteTravelCourse(deleteId)
      setDeleteId(null)
      refetch()
    }
  }

  return (
    <div className="mx-auto max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>여행코스 관리</CardTitle>
          <CardDescription>
            여행코스 DB를 조회/추가/삭제할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Input
              placeholder="코스명 또는 지역코드 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm">+ 새 코스 추가</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>여행코스 추가</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAdd} className="space-y-4">
                  <Input
                    required
                    placeholder="코스명"
                    value={form.course_name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, course_name: e.target.value }))
                    }
                  />
                  <Input
                    required
                    placeholder="지역코드"
                    value={form.region_code}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, region_code: e.target.value }))
                    }
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={isCreating}>
                      추가
                    </Button>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        취소
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>코스명</TableHead>
                  <TableHead>지역코드</TableHead>
                  <TableHead>생성일</TableHead>
                  <TableHead>관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4}>로딩 중...</TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={4}>에러: {error.message}</TableCell>
                  </TableRow>
                ) : filtered?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}>데이터 없음</TableCell>
                  </TableRow>
                ) : (
                  filtered?.map((course) => (
                    <TableRow key={course.content_id}>
                      <TableCell>{course.course_name}</TableCell>
                      <TableCell>{course.region_code}</TableCell>
                      <TableCell>
                        {course.created_at?.slice(0, 10) || '-'}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeleteId(course.content_id)}
                              disabled={isDeleting}
                            >
                              삭제
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                정말 삭제할까요?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                이 작업은 되돌릴 수 없습니다.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>취소</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDelete}
                                autoFocus
                              >
                                삭제
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
