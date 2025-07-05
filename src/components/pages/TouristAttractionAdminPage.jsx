import { useState } from 'react'
import TouristAttractionList from './TouristAttractionList'
import TouristAttractionForm from './TouristAttractionForm'

function TouristAttractionAdminPage() {
  const [mode, setMode] = useState('list') // "list" | "create" | "edit"
  const [editId, setEditId] = useState(null)

  if (mode === 'create') {
    return (
      <TouristAttractionForm
        onDone={() => {
          setMode('list')
          setEditId(null)
        }}
      />
    )
  }
  if (mode === 'edit') {
    return (
      <TouristAttractionForm
        contentId={editId}
        onDone={() => {
          setMode('list')
          setEditId(null)
        }}
      />
    )
  }
  return (
    <TouristAttractionList
      onEdit={(id) => {
        setEditId(id)
        setMode('edit')
      }}
      onCreate={() => setMode('create')}
    />
  )
}

export default TouristAttractionAdminPage
