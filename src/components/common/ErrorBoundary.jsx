import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 p-8">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          페이지를 불러오는 중 오류가 발생했습니다.
          {error && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm">
                오류 세부정보
              </summary>
              <pre className="mt-2 text-xs whitespace-pre-wrap">
                {error.toString()}
              </pre>
            </details>
          )}
        </AlertDescription>
      </Alert>
      <Button onClick={resetErrorBoundary} variant="outline">
        <RefreshCw className="mr-2 h-4 w-4" />
        다시 시도
      </Button>
    </div>
  )
}

function ErrorBoundary({ children }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('ErrorBoundary caught an error:', error, errorInfo)
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}

export default ErrorBoundary
