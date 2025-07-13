import { useState } from 'react'
import TouristAttractionList from './TouristAttractionList'
import TouristAttractionForm from './TouristAttractionForm'
import { PageContainer, PageHeader } from '@/layouts'

function TouristAttractionAdminPage() {
  const [mode, setMode] = useState('list') // "list" | "create" | "edit"
  const [editId, setEditId] = useState(null)

  if (mode === 'create') {
    return (
      <PageContainer>
        <PageHeader
          title="관광지 등록"
          description="새로운 관광지 정보를 등록합니다."
        />
        <TouristAttractionForm
          onDone={() => {
            setMode('list')
            setEditId(null)
          }}
        />
      </PageContainer>
    )
  }
  if (mode === 'edit') {
    return (
      <PageContainer>
        <PageHeader
          title="관광지 수정"
          description="관광지 정보를 수정합니다."
        />
        <TouristAttractionForm
          contentId={editId}
          onDone={() => {
            setMode('list')
            setEditId(null)
          }}
        />
      </PageContainer>
    )
  }
  return (
    <PageContainer>
      <PageHeader
        title="관광지 관리"
        description="관광지 정보를 등록, 수정, 삭제하고 검색할 수 있습니다."
      />
      <TouristAttractionList
        onEdit={(id) => {
          setEditId(id)
          setMode('edit')
        }}
        onCreate={() => setMode('create')}
      />
    </PageContainer>
  )
}

export default TouristAttractionAdminPage
