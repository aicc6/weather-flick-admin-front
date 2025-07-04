import React from 'react'
import { Alert, AlertDescription } from '../ui/alert'
import { Button } from '../ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(_error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    })
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 p-8">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              페이지를 불러오는 중 오류가 발생했습니다.
              {this.state.error && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm">
                    오류 세부정보
                  </summary>
                  <pre className="mt-2 text-xs whitespace-pre-wrap">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </AlertDescription>
          </Alert>
          <Button onClick={this.handleRetry} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            다시 시도
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
