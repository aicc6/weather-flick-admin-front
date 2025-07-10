/**
 * 최적화된 이미지 컴포넌트
 * - Lazy loading
 * - Progressive loading
 * - WebP 포맷 지원
 * - 반응형 이미지
 */

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

export function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  sizes,
  srcSet,
  onLoad,
  onError,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const imgRef = useRef(null)

  // Intersection Observer를 사용한 lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.unobserve(entry.target)
          }
        })
      },
      {
        rootMargin: '50px', // 50px 전에 미리 로드 시작
      },
    )

    observer.observe(imgRef.current)

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current)
      }
    }
  }, [priority])

  const handleLoad = (e) => {
    setIsLoaded(true)
    onLoad?.(e)
  }

  const handleError = (e) => {
    setIsError(true)
    onError?.(e)
  }

  // 이미지 소스 생성 (WebP 지원)
  const generateSources = () => {
    if (!isInView) return null

    const sources = []

    // WebP 포맷 지원
    if (srcSet || src) {
      sources.push(
        <source
          key="webp"
          type="image/webp"
          srcSet={
            srcSet
              ? srcSet.replace(/\.(jpg|jpeg|png)/g, '.webp')
              : `${src.replace(/\.(jpg|jpeg|png)$/, '.webp')}`
          }
          sizes={sizes}
        />,
      )
    }

    // 원본 포맷
    if (srcSet) {
      sources.push(<source key="original" srcSet={srcSet} sizes={sizes} />)
    }

    return sources
  }

  return (
    <div
      ref={imgRef}
      className={cn('relative overflow-hidden', className)}
      style={{
        width: width || 'auto',
        height: height || 'auto',
      }}
    >
      {/* 블러 플레이스홀더 */}
      {placeholder === 'blur' && !isLoaded && (
        <div
          className="absolute inset-0 bg-gray-200"
          style={{
            backgroundImage: blurDataURL ? `url(${blurDataURL})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(20px)',
            transform: 'scale(1.1)',
          }}
        />
      )}

      {/* 스켈레톤 플레이스홀더 */}
      {placeholder === 'skeleton' && !isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-200" />
      )}

      {/* 에러 상태 */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-500">이미지 로드 실패</p>
          </div>
        </div>
      )}

      {/* 실제 이미지 */}
      {isInView && !isError && (
        <picture>
          {generateSources()}
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              'transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0',
              'h-full w-full object-cover',
            )}
            loading={priority ? 'eager' : 'lazy'}
            {...props}
          />
        </picture>
      )}
    </div>
  )
}

/**
 * 이미지 프리로더
 * 중요한 이미지들을 미리 로드
 */
export function preloadImages(urls) {
  urls.forEach((url) => {
    const img = new Image()
    img.src = url
  })
}

/**
 * 반응형 이미지 srcSet 생성기
 */
export function generateSrcSet(src, sizes = [640, 768, 1024, 1280, 1536]) {
  const extension = src.match(/\.[^.]+$/)?.[0] || ''
  const baseName = src.replace(extension, '')

  return sizes
    .map((size) => `${baseName}-${size}w${extension} ${size}w`)
    .join(', ')
}

/**
 * 반응형 sizes 속성 생성기
 */
export function generateSizes(
  breakpoints = {
    640: '100vw',
    768: '50vw',
    1024: '33vw',
  },
) {
  return Object.entries(breakpoints)
    .map(([breakpoint, size]) => `(max-width: ${breakpoint}px) ${size}`)
    .join(', ')
}

/**
 * 블러 데이터 URL 생성기 (서버에서 생성하는 것을 권장)
 */
export async function generateBlurDataURL(src, width = 10, height = 10) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = function () {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      ctx.filter = 'blur(4px)'
      ctx.drawImage(img, 0, 0, width, height)

      resolve(canvas.toDataURL())
    }

    img.onerror = function () {
      resolve(null)
    }

    img.src = src
  })
}
