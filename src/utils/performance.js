/**
 * 성능 최적화 유틸리티 함수들
 */

import { memo, useCallback, useMemo } from 'react'

/**
 * 깊은 비교 메모이제이션
 * 객체나 배열의 깊은 비교를 통한 리렌더링 최적화
 */
export function deepMemo(Component) {
  return memo(Component, deepEqual)
}

/**
 * 깊은 동등성 비교
 */
export function deepEqual(a, b) {
  if (a === b) return true
  
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime()
  }
  
  if (!a || !b || (typeof a !== 'object' && typeof b !== 'object')) {
    return a === b
  }
  
  if (a === null || a === undefined || b === null || b === undefined) {
    return false
  }
  
  if (a.prototype !== b.prototype) return false
  
  const keys = Object.keys(a)
  if (keys.length !== Object.keys(b).length) {
    return false
  }
  
  return keys.every(k => deepEqual(a[k], b[k]))
}

/**
 * 선택적 프로퍼티 메모이제이션
 * 특정 props만 비교하여 리렌더링 결정
 */
export function selectiveMemo(Component, propsToCompare = []) {
  return memo(Component, (prevProps, nextProps) => {
    if (propsToCompare.length === 0) {
      return shallowEqual(prevProps, nextProps)
    }
    
    return propsToCompare.every(prop => 
      deepEqual(prevProps[prop], nextProps[prop])
    )
  })
}

/**
 * 얕은 동등성 비교
 */
export function shallowEqual(a, b) {
  if (a === b) return true
  
  if (!a || !b) return false
  
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  
  if (aKeys.length !== bKeys.length) return false
  
  return aKeys.every(key => a[key] === b[key])
}

/**
 * 함수 메모이제이션 헬퍼
 * 의존성 배열 기반의 함수 캐싱
 */
export function memoizeFunction(fn, deps = []) {
  let lastDeps = []
  let lastResult = null
  
  return (...args) => {
    if (
      lastDeps.length === deps.length &&
      deps.every((dep, i) => dep === lastDeps[i])
    ) {
      return lastResult
    }
    
    lastDeps = deps
    lastResult = fn(...args)
    return lastResult
  }
}

/**
 * 배치 업데이트 헬퍼
 * 여러 상태 업데이트를 하나로 묶어 리렌더링 최소화
 */
export function batchUpdates(updates) {
  import('react-dom').then(({ unstable_batchedUpdates }) => {
    unstable_batchedUpdates(() => {
      updates()
    })
  })
}

/**
 * 레이지 초기화 헬퍼
 * 무거운 초기화 작업을 지연 실행
 */
export function lazyInitialize(initializer) {
  let initialized = false
  let value = null
  
  return () => {
    if (!initialized) {
      value = initializer()
      initialized = true
    }
    return value
  }
}

/**
 * 컴포넌트 프로파일러
 * 렌더링 성능 측정
 */
export function withProfiler(Component, id) {
  return function ProfiledComponent(props) {
    const onRender = useCallback((
      id,
      phase,
      actualDuration,
      baseDuration,
      startTime,
      commitTime,
      interactions
    ) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Profiler] ${id}:`, {
          phase,
          actualDuration,
          baseDuration,
          startTime,
          commitTime,
          interactions: Array.from(interactions),
        })
      }
    }, [])
    
    return (
      <Profiler id={id} onRender={onRender}>
        <Component {...props} />
      </Profiler>
    )
  }
}

/**
 * 이벤트 핸들러 최적화
 * 불필요한 함수 재생성 방지
 */
export function useEventHandler(handler) {
  const handlerRef = useRef(handler)
  
  useEffect(() => {
    handlerRef.current = handler
  })
  
  return useCallback((...args) => {
    const fn = handlerRef.current
    return fn(...args)
  }, [])
}

/**
 * 조건부 렌더링 최적화
 * 조건이 충족될 때만 컴포넌트 렌더링
 */
export function ConditionalRender({ condition, children, fallback = null }) {
  return useMemo(() => {
    return condition ? children : fallback
  }, [condition, children, fallback])
}

/**
 * 지연 렌더링 컴포넌트
 * 일정 시간 후에 컴포넌트 렌더링
 */
export function DelayedRender({ delay = 0, children }) {
  const [shouldRender, setShouldRender] = useState(delay === 0)
  
  useEffect(() => {
    if (delay === 0) return
    
    const timer = setTimeout(() => {
      setShouldRender(true)
    }, delay)
    
    return () => clearTimeout(timer)
  }, [delay])
  
  return shouldRender ? children : null
}

/**
 * RAF 스케줄러
 * 애니메이션 프레임에 맞춰 업데이트 스케줄링
 */
export class RAFScheduler {
  constructor() {
    this.callbacks = new Set()
    this.rafId = null
  }
  
  add(callback) {
    this.callbacks.add(callback)
    this.schedule()
  }
  
  remove(callback) {
    this.callbacks.delete(callback)
    if (this.callbacks.size === 0 && this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }
  
  schedule() {
    if (this.rafId || this.callbacks.size === 0) return
    
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null
      const callbacks = Array.from(this.callbacks)
      callbacks.forEach(cb => cb())
      
      if (this.callbacks.size > 0) {
        this.schedule()
      }
    })
  }
}

/**
 * 아이들 시간 스케줄러
 * 브라우저가 유휴 상태일 때 작업 실행
 */
export function scheduleIdleTask(task, options = {}) {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(task, options)
  }
  
  // 폴백: setTimeout 사용
  const timeout = options.timeout || 1
  return setTimeout(() => {
    task({
      didTimeout: false,
      timeRemaining: () => 50,
    })
  }, timeout)
}

/**
 * 웹 워커 유틸리티
 * CPU 집약적 작업을 백그라운드에서 실행
 */
export function createWorker(workerFunction) {
  const blob = new Blob(
    [`(${workerFunction.toString()})()`],
    { type: 'application/javascript' }
  )
  const url = URL.createObjectURL(blob)
  const worker = new Worker(url)
  
  // 클린업 함수
  worker.terminate = () => {
    URL.revokeObjectURL(url)
    Worker.prototype.terminate.call(worker)
  }
  
  return worker
}

/**
 * 메모리 사용량 모니터
 * 개발 환경에서 메모리 누수 감지
 */
export function monitorMemory(componentName) {
  if (process.env.NODE_ENV !== 'development') return
  
  if ('memory' in performance) {
    const initialMemory = performance.memory.usedJSHeapSize
    
    return () => {
      const currentMemory = performance.memory.usedJSHeapSize
      const diff = currentMemory - initialMemory
      
      if (diff > 10 * 1024 * 1024) { // 10MB 이상 증가
        console.warn(
          `[Memory Warning] ${componentName}: Memory increased by ${
            (diff / 1024 / 1024).toFixed(2)
          }MB`
        )
      }
    }
  }
  
  return () => {}
}