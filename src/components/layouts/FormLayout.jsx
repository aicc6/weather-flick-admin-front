import { Button } from '../ui/button'

export function FormLayout({
  children,
  onSubmit,
  onCancel,
  submitText = '저장',
  cancelText = '취소',
  showActions = true,
  className = '',
}) {
  return (
    <form onSubmit={onSubmit} className={`section-layout ${className}`}>
      <div className="form-layout">{children}</div>

      {showActions && (
        <div className="form-actions">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              {cancelText}
            </Button>
          )}
          <Button type="submit">{submitText}</Button>
        </div>
      )}
    </form>
  )
}
