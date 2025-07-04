import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog'

export function ConfirmDialog({
  open,
  onOpenChange,
  title = '확인',
  description = '이 작업을 계속하시겠습니까?',
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  variant = 'default'
}) {
  const handleConfirm = () => {
    onConfirm?.()
    onOpenChange?.(false)
  }

  const confirmButtonClass = variant === 'destructive' 
    ? 'bg-red-600 hover:bg-red-700' 
    : ''

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className={confirmButtonClass}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}