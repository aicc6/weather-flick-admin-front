import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../../contexts/AuthContext'
import { useSelector, useDispatch } from 'react-redux'
import { clearError } from '../../../states/slices/authSlice'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import { Alert, AlertDescription } from '../../../components/ui/alert'
import { Eye, EyeOff, Loader2, Shield, Cloud } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
})

/**
 * URL: '/login'
 */
export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { login } = useAuth()
  const { isAuthenticated, error } = useSelector((state) => state.auth)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    // 이미 로그인된 경우 메인 페이지로 리다이렉트
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    // 컴포넌트 언마운트 시 에러 클리어
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password)
    if (result.success) {
      // 로그인 성공 시 메인 페이지로 이동
      navigate('/')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8">
        {/* 로고 및 브랜딩 섹션 */}
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex items-center space-x-3">
              <div className="rounded-xl bg-blue-600 p-3">
                <Cloud className="h-8 w-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-gray-900">
                  Weather Flick
                </h1>
                <p className="text-sm text-gray-600">관리자 시스템</p>
              </div>
            </div>
          </div>
        </div>

        <Card className="w-full border-0 shadow-2xl">
          <CardHeader className="space-y-3 pb-6">
            <div className="mb-4 flex items-center justify-center">
              <div className="rounded-full bg-blue-100 p-3">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-center text-3xl font-bold text-gray-900">
              관리자 로그인
            </CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="text-base">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Label htmlFor="email" className="text-base font-medium">
                  이메일
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@weatherflick.com"
                  {...register('email')}
                  className={`h-12 text-base ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-base font-medium">
                  비밀번호
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="비밀번호를 입력하세요"
                    {...register('password')}
                    className={`h-12 text-base ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="h-12 w-full bg-blue-600 text-lg font-semibold hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    로그인 중...
                  </>
                ) : (
                  '로그인'
                )}
              </Button>
            </form>

            <div className="mt-8 rounded-lg bg-gray-50 p-4">
              <p className="text-center text-sm text-gray-600">
                <span className="font-semibold">테스트 계정:</span>
                <br />
                이메일: admin@weatherflick.com
                <br />
                비밀번호: admin123
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 추가 정보 */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            © 2024 Weather Flick. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
