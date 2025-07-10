/**
 * 가상 스크롤 리스트 컴포넌트
 * 대량의 데이터를 효율적으로 렌더링
 */

import { useRef, useState, useEffect, useCallback, memo } from 'react'
import { useVirtualScroll } from '@/hooks/usePerformance'
import { cn } from '@/lib/utils'

export const VirtualList = memo(function VirtualList({
  items,
  itemHeight,
  containerHeight = 600,
  renderItem,
  className,
  buffer = 5,
  onScroll,
  emptyMessage = '데이터가 없습니다.',
}) {
  const scrollContainerRef = useRef(null)
  const [containerSize, setContainerSize] = useState(containerHeight)

  // 컨테이너 크기 자동 감지
  useEffect(() => {
    if (!scrollContainerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize(entry.contentRect.height)
      }
    })

    resizeObserver.observe(scrollContainerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const { visibleItems, handleScroll: handleVirtualScroll } = useVirtualScroll({
    items,
    itemHeight,
    containerHeight: containerSize,
    buffer,
  })

  const handleScrollEvent = useCallback(
    (e) => {
      handleVirtualScroll(e)
      onScroll?.(e)
    },
    [handleVirtualScroll, onScroll]
  )

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div
      ref={scrollContainerRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScrollEvent}
    >
      <div
        style={{
          height: visibleItems.totalHeight,
          position: 'relative',
        }}
      >
        <div
          style={{
            transform: `translateY(${visibleItems.offsetY}px)`,
          }}
        >
          {visibleItems.items.map((item, index) => (
            <div
              key={item.id || visibleItems.startIndex + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, visibleItems.startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

/**
 * 동적 높이를 가진 가상 리스트
 * 각 아이템의 높이가 다를 때 사용
 */
export const DynamicVirtualList = memo(function DynamicVirtualList({
  items,
  estimatedItemHeight = 50,
  containerHeight = 600,
  renderItem,
  className,
  buffer = 5,
  onScroll,
  emptyMessage = '데이터가 없습니다.',
}) {
  const scrollContainerRef = useRef(null)
  const itemHeights = useRef(new Map())
  const [scrollTop, setScrollTop] = useState(0)
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 })

  // 아이템 높이 측정
  const measureItem = useCallback((index, element) => {
    if (element) {
      const height = element.getBoundingClientRect().height
      itemHeights.current.set(index, height)
    }
  }, [])

  // 가시 영역 계산
  useEffect(() => {
    let accumulatedHeight = 0
    let startIndex = 0
    let endIndex = items.length - 1

    // 시작 인덱스 찾기
    for (let i = 0; i < items.length; i++) {
      const height = itemHeights.current.get(i) || estimatedItemHeight
      if (accumulatedHeight + height > scrollTop) {
        startIndex = Math.max(0, i - buffer)
        break
      }
      accumulatedHeight += height
    }

    // 종료 인덱스 찾기
    accumulatedHeight = 0
    for (let i = startIndex; i < items.length; i++) {
      const height = itemHeights.current.get(i) || estimatedItemHeight
      accumulatedHeight += height
      if (accumulatedHeight > containerHeight) {
        endIndex = Math.min(items.length - 1, i + buffer)
        break
      }
    }

    setVisibleRange({ start: startIndex, end: endIndex })
  }, [scrollTop, items.length, containerHeight, buffer, estimatedItemHeight])

  const handleScrollEvent = useCallback(
    (e) => {
      setScrollTop(e.target.scrollTop)
      onScroll?.(e)
    },
    [onScroll]
  )

  // 전체 높이 계산
  const totalHeight = items.reduce((sum, _, index) => {
    return sum + (itemHeights.current.get(index) || estimatedItemHeight)
  }, 0)

  // 오프셋 계산
  const offsetY = items
    .slice(0, visibleRange.start)
    .reduce((sum, _, index) => {
      return sum + (itemHeights.current.get(index) || estimatedItemHeight)
    }, 0)

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div
      ref={scrollContainerRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScrollEvent}
    >
      <div
        style={{
          height: totalHeight,
          position: 'relative',
        }}
      >
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
          }}
        >
          {items.slice(visibleRange.start, visibleRange.end + 1).map((item, relativeIndex) => {
            const absoluteIndex = visibleRange.start + relativeIndex
            return (
              <div
                key={item.id || absoluteIndex}
                ref={(el) => measureItem(absoluteIndex, el)}
              >
                {renderItem(item, absoluteIndex)}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
})

/**
 * 무한 스크롤 리스트
 * 페이지네이션을 자동으로 처리
 */
export const InfiniteList = memo(function InfiniteList({
  items,
  loadMore,
  hasMore,
  loading,
  renderItem,
  className,
  containerHeight = 600,
  threshold = 100,
  emptyMessage = '데이터가 없습니다.',
  loadingMessage = '로딩 중...',
  endMessage = '모든 데이터를 불러왔습니다.',
}) {
  const scrollContainerRef = useRef(null)

  const handleScroll = useCallback(
    (e) => {
      const { scrollTop, scrollHeight, clientHeight } = e.target
      
      if (
        scrollHeight - scrollTop - clientHeight < threshold &&
        hasMore &&
        !loading
      ) {
        loadMore()
      }
    },
    [hasMore, loading, loadMore, threshold]
  )

  if (items.length === 0 && !loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div
      ref={scrollContainerRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      {items.map((item, index) => (
        <div key={item.id || index}>{renderItem(item, index)}</div>
      ))}
      
      {loading && (
        <div className="flex items-center justify-center p-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm text-gray-500">{loadingMessage}</span>
          </div>
        </div>
      )}
      
      {!hasMore && items.length > 0 && (
        <div className="flex items-center justify-center p-4">
          <span className="text-sm text-gray-500">{endMessage}</span>
        </div>
      )}
    </div>
  )
})