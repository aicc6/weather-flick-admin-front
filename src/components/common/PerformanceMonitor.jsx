/**
 * 성능 모니터링 컴포넌트
 * 개발 환경에서 성능 지표를 실시간으로 표시
 */

import { useState, useEffect, useRef } from 'react'
import { usePageVisibility } from '@/hooks/usePerformance'
import { cn } from '@/lib/utils'

export function PerformanceMonitor({
  position = 'bottom-right',
  showInProduction = false,
}) {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memory: 0,
    renderTime: 0,
    componentCount: 0,
  })
  const [isMinimized, setIsMinimized] = useState(false)
  const isVisible = usePageVisibility()
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(performance.now())

  // 프로덕션에서는 표시하지 않음
  if (!showInProduction && import.meta.env.MODE === 'production') {
    return null
  }

  // FPS 측정
  useEffect(() => {
    if (!isVisible) return

    let animationId

    const measureFPS = () => {
      frameCountRef.current++
      const currentTime = performance.now()
      const elapsed = currentTime - lastTimeRef.current

      if (elapsed >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / elapsed)

        setMetrics((prev) => ({
          ...prev,
          fps,
        }))

        frameCountRef.current = 0
        lastTimeRef.current = currentTime
      }

      animationId = requestAnimationFrame(measureFPS)
    }

    animationId = requestAnimationFrame(measureFPS)

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [isVisible])

  // 메모리 사용량 측정
  useEffect(() => {
    if (!isVisible || !performance.memory) return

    const interval = setInterval(() => {
      const usedMemory = performance.memory.usedJSHeapSize
      const totalMemory = performance.memory.jsHeapSizeLimit
      const memoryPercentage = (usedMemory / totalMemory) * 100

      setMetrics((prev) => ({
        ...prev,
        memory: memoryPercentage,
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [isVisible])

  // React DevTools 연동
  useEffect(() => {
    if (!window.__REACT_DEVTOOLS_GLOBAL_HOOK__) return

    const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__

    // 컴포넌트 수 추적
    const countComponents = () => {
      const fiberRoot = hook.getFiberRoots(1)?.values().next().value
      if (!fiberRoot) return 0

      let count = 0
      const countFiber = (fiber) => {
        if (!fiber) return

        if (fiber.elementType && typeof fiber.elementType !== 'string') {
          count++
        }

        if (fiber.child) countFiber(fiber.child)
        if (fiber.sibling) countFiber(fiber.sibling)
      }

      countFiber(fiberRoot.current)
      return count
    }

    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        componentCount: countComponents(),
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // 포지션 클래스 매핑
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  }

  // 메트릭 상태에 따른 색상
  const getFPSColor = (fps) => {
    if (fps >= 55) return 'text-green-500'
    if (fps >= 30) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getMemoryColor = (memory) => {
    if (memory <= 50) return 'text-green-500'
    if (memory <= 75) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div
      className={cn(
        'fixed z-50 rounded-lg bg-black/90 text-white shadow-lg transition-all duration-200',
        positionClasses[position],
        isMinimized ? 'h-12 w-12' : 'min-w-[200px] p-3',
      )}
    >
      <button
        onClick={() => setIsMinimized(!isMinimized)}
        className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded hover:bg-white/20"
      >
        {isMinimized ? '📊' : '−'}
      </button>

      {!isMinimized && (
        <div className="space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span>FPS:</span>
            <span className={cn('font-bold', getFPSColor(metrics.fps))}>
              {metrics.fps}
            </span>
          </div>

          {performance.memory && (
            <div className="flex items-center justify-between">
              <span>Memory:</span>
              <span className={cn('font-bold', getMemoryColor(metrics.memory))}>
                {metrics.memory.toFixed(1)}%
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span>Components:</span>
            <span className="font-bold">{metrics.componentCount}</span>
          </div>

          <div className="border-t border-white/20 pt-2">
            <div className="text-[10px] opacity-70">
              Press Shift+Ctrl+P to toggle
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * 렌더 카운터 컴포넌트
 * 특정 컴포넌트의 렌더링 횟수 추적
 */
export function RenderCounter({ name, showInProduction = false }) {
  const renderCount = useRef(0)
  renderCount.current++

  if (!showInProduction && import.meta.env.MODE === 'production') {
    return null
  }

  return (
    <div className="absolute top-0 right-0 z-50 rounded-bl bg-red-500 px-2 py-1 text-xs text-white">
      {name}: {renderCount.current}
    </div>
  )
}

/**
 * 성능 경고 컴포넌트
 * 성능 문제 감지 시 경고 표시
 */
export function PerformanceWarning({ threshold = 16.67, children }) {
  const [warning, setWarning] = useState(null)
  const lastRenderTime = useRef(performance.now())

  useEffect(() => {
    const currentTime = performance.now()
    const renderTime = currentTime - lastRenderTime.current

    if (renderTime > threshold) {
      setWarning(`Slow render detected: ${renderTime.toFixed(2)}ms`)

      // 3초 후 경고 제거
      setTimeout(() => setWarning(null), 3000)
    }

    lastRenderTime.current = currentTime
  })

  return (
    <>
      {children}
      {warning && import.meta.env.MODE === 'development' && (
        <div className="fixed top-0 left-1/2 z-50 -translate-x-1/2 transform animate-pulse rounded-b bg-yellow-500 px-4 py-2 text-black shadow-lg">
          ⚠️ {warning}
        </div>
      )}
    </>
  )
}
