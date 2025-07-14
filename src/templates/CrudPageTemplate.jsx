import { useState } from 'react'
import { ContentSection, PageContainer, PageHeader } from '@/layouts'
import {
  LoadingState,
  EmptyState,
  ErrorState,
  StandardTable,
  SearchForm,
  StandardButton,
  StandardInput,
  StandardSelect,
} from '@/components/common'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MoreHorizontal, Plus } from 'lucide-react'

/**
 * CRUD 페이지 공통 템플릿
 * 
 * @param {Object} props
 * @param {string} props.title - 페이지 제목
 * @param {string} props.description - 페이지 설명
 * @param {boolean} props.loading - 로딩 상태
 * @param {Error} props.error - 에러 객체
 * @param {Function} props.onRetry - 재시도 함수
 * @param {Array} props.data - 표시할 데이터 배열
 * @param {Object} props.searchConfig - 검색 설정
 * @param {Array} props.searchConfig.fields - 검색 필드 설정
 * @param {Array} props.searchConfig.actionButtons - 액션 버튼 설정
 * @param {Function} props.searchConfig.onSubmit - 검색 제출 함수
 * @param {Object} props.tableConfig - 테이블 설정
 * @param {Array} props.tableConfig.columns - 테이블 컬럼 설정
 * @param {Function} props.tableConfig.renderRow - 행 렌더링 함수
 * @param {Object} props.emptyConfig - 빈 상태 설정
 * @param {string} props.emptyConfig.message - 빈 상태 메시지
 * @param {string} props.emptyConfig.description - 빈 상태 설명
 * @param {ReactNode} props.emptyConfig.action - 빈 상태 액션
 * @param {Object} props.dialogConfig - 다이얼로그 설정
 * @param {boolean} props.dialogConfig.isOpen - 다이얼로그 열림 상태
 * @param {Function} props.dialogConfig.onOpenChange - 다이얼로그 상태 변경 함수
 * @param {string} props.dialogConfig.title - 다이얼로그 제목
 * @param {string} props.dialogConfig.description - 다이얼로그 설명
 * @param {ReactNode} props.dialogConfig.content - 다이얼로그 내용
 * @param {Function} props.dialogConfig.onConfirm - 확인 함수
 * @param {ReactNode} props.children - 추가 컨텐츠
 */
export function CrudPageTemplate({
  title,
  description,
  loading,
  error,
  onRetry,
  data = [],
  searchConfig = {},
  tableConfig = {},
  emptyConfig = {},
  dialogConfig = {},
  children,
}) {
  return (
    <PageContainer>
      <PageHeader title={title} description={description} />

      {/* 검색 및 필터 */}
      {searchConfig.fields && (
        <ContentSection>
          <SearchForm
            onSubmit={searchConfig.onSubmit || ((e) => e.preventDefault())}
            searchFields={searchConfig.fields}
            actionButtons={searchConfig.actionButtons}
          />
        </ContentSection>
      )}

      {/* 추가 컨텐츠 */}
      {children}

      {/* 데이터 테이블 */}
      <ContentSection>
        {loading ? (
          <LoadingState message={`${title} 목록을 불러오는 중...`} />
        ) : error ? (
          <ErrorState
            error={error}
            onRetry={onRetry}
            message={`${title} 목록을 불러올 수 없습니다`}
          />
        ) : data.length === 0 ? (
          <EmptyState
            type={emptyConfig.type || 'search'}
            message={emptyConfig.message || '데이터가 없습니다'}
            description={emptyConfig.description}
            action={emptyConfig.action}
          />
        ) : (
          <StandardTable>
            {tableConfig.columns && (
              <thead>
                <tr>
                  {tableConfig.columns.map((column, index) => (
                    <th key={index}>{column}</th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {data.map((item, index) =>
                tableConfig.renderRow ? (
                  tableConfig.renderRow(item, index)
                ) : (
                  <tr key={index}>
                    <td colSpan={tableConfig.columns?.length || 1}>
                      데이터 렌더링 함수가 필요합니다
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </StandardTable>
        )}
      </ContentSection>

      {/* 생성/수정 다이얼로그 */}
      {dialogConfig.isOpen !== undefined && (
        <Dialog
          open={dialogConfig.isOpen}
          onOpenChange={dialogConfig.onOpenChange}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{dialogConfig.title}</DialogTitle>
              {dialogConfig.description && (
                <DialogDescription>{dialogConfig.description}</DialogDescription>
              )}
            </DialogHeader>
            {dialogConfig.content}
            <DialogFooter>
              <StandardButton
                variant="outline"
                onClick={() => dialogConfig.onOpenChange(false)}
              >
                취소
              </StandardButton>
              <StandardButton onClick={dialogConfig.onConfirm}>
                {dialogConfig.confirmText || '확인'}
              </StandardButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </PageContainer>
  )
}

/**
 * 테이블 액션 드롭다운 메뉴 컴포넌트
 */
export function TableActionMenu({ actions = [] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">메뉴 열기</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>액션</DropdownMenuLabel>
        {actions.map((action, index) => {
          if (action.separator) {
            return <DropdownMenuSeparator key={index} />
          }
          
          if (action.confirmDialog) {
            return (
              <AlertDialog key={index}>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className={action.className}
                    onSelect={(e) => e.preventDefault()}
                  >
                    {action.icon}
                    {action.label}
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {action.confirmDialog.title}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {action.confirmDialog.description}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction onClick={action.onClick}>
                      {action.confirmDialog.confirmText || '확인'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )
          }

          return (
            <DropdownMenuItem
              key={index}
              onClick={action.onClick}
              className={action.className}
            >
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}