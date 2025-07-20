import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MoreVertical, Trash2, FileText, Square } from 'lucide-react'
import { BATCH_JOB_STATUS } from '@/store/api/batchApi'

const BatchJobActions = ({
  job,
  onViewLogs,
  onStopJob,
  onDeleteJob,
  isDeleting = false,
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      await onDeleteJob(job.id)
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error('작업 삭제 실패:', error)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onViewLogs(job.id)}>
            <FileText className="mr-2 h-4 w-4" />
            로그 보기
          </DropdownMenuItem>
          {job.status === BATCH_JOB_STATUS.RUNNING && (
            <DropdownMenuItem onClick={() => onStopJob(job.id)}>
              <Square className="mr-2 h-4 w-4" />
              중단
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDeleteClick}
            className="text-red-600"
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? '삭제 중...' : '삭제'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>작업 삭제 확인</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              <br />
              <strong>작업 ID:</strong> {job.id}
              <br />
              <strong>작업 타입:</strong> {job.job_type}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default BatchJobActions
