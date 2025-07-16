import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { contactApi } from '@/api/contact'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ArrowLeft, Mail, User, Calendar, Eye, Lock } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { toast } from 'react-hot-toast'

const ContactDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [contact, setContact] = useState(null)
  const [loading, setLoading] = useState(true)
  const [answerContent, setAnswerContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (id) {
      loadContact()
    }
  }, [id])

  const loadContact = async () => {
    try {
      setLoading(true)
      const data = await contactApi.getContact(Number(id))
      setContact(data)
      if (data.answer) {
        setAnswerContent(data.answer.content)
      }
    } catch (error) {
      console.error('Failed to load contact:', error)
      toast.error('문의를 불러오는데 실패했습니다.')
      navigate('/contact')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (status) => {
    if (!contact) return

    try {
      await contactApi.updateContactStatus(contact.id, {
        approval_status: status,
      })
      toast.success('상태가 변경되었습니다.')
      loadContact()
    } catch (error) {
      console.error('Failed to update status:', error)
      toast.error('상태 변경에 실패했습니다.')
    }
  }

  const handleAnswerSubmit = async () => {
    if (!contact || !answerContent.trim()) return

    setSubmitting(true)
    try {
      if (contact.answer) {
        // 답변 수정
        await contactApi.updateAnswer(contact.id, {
          content: answerContent,
        })
        toast.success('답변이 수정되었습니다.')
      } else {
        // 답변 작성
        await contactApi.createAnswer(contact.id, {
          content: answerContent,
        })
        toast.success('답변이 작성되었습니다.')
      }
      setIsEditing(false)
      loadContact()
    } catch (error) {
      console.error('Failed to submit answer:', error)
      toast.error('답변 처리에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAnswerDelete = async () => {
    if (!contact) return

    try {
      await contactApi.deleteAnswer(contact.id)
      toast.success('답변이 삭제되었습니다.')
      setAnswerContent('')
      loadContact()
    } catch (error) {
      console.error('Failed to delete answer:', error)
      toast.error('답변 삭제에 실패했습니다.')
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary">대기중</Badge>
      case 'PROCESSING':
        return <Badge variant="outline">처리중</Badge>
      case 'COMPLETE':
        return <Badge variant="default">완료</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-lg">로딩중...</div>
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-lg">문의를 찾을 수 없습니다.</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate('/contact')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">문의 상세</h2>
        </div>
        <div className="flex gap-2">
          <Select
            value={contact.approval_status}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">대기중</SelectItem>
              <SelectItem value="PROCESSING">처리중</SelectItem>
              <SelectItem value="COMPLETE">완료</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 문의 정보 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">{contact.title}</CardTitle>
              <CardDescription>
                <div className="mt-2 flex items-center gap-4">
                  <Badge variant="outline">{contact.category}</Badge>
                  {getStatusBadge(contact.approval_status)}
                  {contact.is_private && (
                    <div className="text-muted-foreground flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      <span className="text-xs">비공개</span>
                    </div>
                  )}
                </div>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="text-muted-foreground h-4 w-4" />
              <span className="text-muted-foreground">작성자:</span>
              <span>{contact.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="text-muted-foreground h-4 w-4" />
              <span className="text-muted-foreground">이메일:</span>
              <span>{contact.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="text-muted-foreground h-4 w-4" />
              <span className="text-muted-foreground">작성일:</span>
              <span>
                {format(
                  new Date(contact.created_at),
                  'yyyy년 MM월 dd일 HH:mm',
                  {
                    locale: ko,
                  },
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="text-muted-foreground h-4 w-4" />
              <span className="text-muted-foreground">조회수:</span>
              <span>{contact.views}</span>
            </div>
          </div>
          <div className="border-t pt-4">
            <h4 className="mb-2 font-semibold">문의 내용</h4>
            <div className="bg-muted rounded-lg p-4 whitespace-pre-wrap">
              {contact.content}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 답변 섹션 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>답변</CardTitle>
            {contact.answer && !isEditing && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(true)
                    setAnswerContent(contact.answer.content)
                  }}
                >
                  수정
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      삭제
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        답변을 삭제하시겠습니까?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        이 작업은 되돌릴 수 없습니다. 답변이 영구적으로
                        삭제됩니다.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction onClick={handleAnswerDelete}>
                        삭제
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {contact.answer && !isEditing ? (
            <div className="space-y-4">
              <div className="text-muted-foreground text-sm">
                <span>답변자: {contact.answer.admin_name}</span>
                <span className="mx-2">•</span>
                <span>
                  작성일:{' '}
                  {format(
                    new Date(contact.answer.created_at),
                    'yyyy.MM.dd HH:mm',
                    {
                      locale: ko,
                    },
                  )}
                </span>
                {contact.answer.updated_at !== contact.answer.created_at && (
                  <>
                    <span className="mx-2">•</span>
                    <span>
                      수정일:{' '}
                      {format(
                        new Date(contact.answer.updated_at),
                        'yyyy.MM.dd HH:mm',
                        {
                          locale: ko,
                        },
                      )}
                    </span>
                  </>
                )}
              </div>
              <div className="bg-muted rounded-lg p-4 whitespace-pre-wrap">
                {contact.answer.content}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Textarea
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                placeholder="답변을 작성해주세요..."
                className="min-h-[200px]"
              />
              <div className="flex justify-end gap-2">
                {isEditing && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      setAnswerContent(contact.answer?.content || '')
                    }}
                    disabled={submitting}
                  >
                    취소
                  </Button>
                )}
                <Button
                  onClick={handleAnswerSubmit}
                  disabled={!answerContent.trim() || submitting}
                >
                  {submitting
                    ? '처리중...'
                    : contact.answer
                      ? '답변 수정'
                      : '답변 작성'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ContactDetail
