/**
 * 글로벌 에러 바운더리 컴포넌트
 * React 애플리케이션의 예상치 못한 에러를 포착하고 처리
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

/**
 * 에러 바운더리 클래스 컴포넌트
 */
class ErrorBoundaryClass extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    }
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorId: Date.now().toString(36),
    }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    console.error('ErrorBoundary caught an error:', error, errorInfo)

    if (import.meta.env.MODE === 'production') {
      // TODO: Send to error tracking service
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallbackUI
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorId={this.state.errorId}
          onRetry={this.handleRetry}
          {...this.props}
        />
      )
    }

    return this.props.children
  }
}

/**
 * 에러 폴백 UI 컴포넌트
 */
function ErrorFallbackUI({ 
  error, 
  errorInfo, 
  errorId, 
  onRetry, 
  showDetails = true,
  level = 'error' 
}) {
  const { t } = useTranslation()

  const handleReload = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    window.location.href = '/dashboard'
  }

  const isMinorError = level === 'warning' || level === 'info'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className={`mx-auto w-16 h-16 ${isMinorError ? 'bg-yellow-100' : 'bg-red-100'} rounded-full flex items-center justify-center mb-4`}>
            <AlertTriangle className={`w-8 h-8 ${isMinorError ? 'text-yellow-600' : 'text-red-600'}`} />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {t('error.unexpected_error_title')}
          </CardTitle>
          <p className="text-gray-600 mt-2">
            {t('error.unexpected_error_description')}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-gray-100 rounded-lg p-3">
            <p className="text-sm text-gray-600">
              {t('error.error_id')}: <code className="font-mono">{errorId}</code>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={onRetry} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('error.try_again')}
            </Button>
            
            <Button onClick={handleReload} variant="outline" className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('error.reload_page')}
            </Button>
            
            <Button onClick={handleGoHome} variant="outline" className="flex-1">
              <Home className="w-4 h-4 mr-2" />
              {t('error.go_home')}
            </Button>
          </div>

          {showDetails && error && import.meta.env.MODE === 'development' && (
            <details className="border-t pt-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                {t('error.technical_details')}
              </summary>
              <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                <p className="text-sm font-medium text-red-600 mb-2">
                  {error.message}
                </p>
                {error.stack && (
                  <pre className="text-xs text-gray-600 overflow-auto whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                )}
              </div>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ErrorBoundaryClass