import { useParams, useNavigate } from 'react-router-dom'
import TouristAttractionDetail from './TouristAttractionDetail'

export default function TouristAttractionDetailWrapper() {
  const { contentId } = useParams()
  const navigate = useNavigate()

  return (
    <TouristAttractionDetail
      contentId={contentId}
      onEdit={(id) => navigate(`/tourist-attractions/${id}/edit`)} // 필요시
      onDelete={() => navigate('/tourist-attractions')}
      onBack={() => navigate('/tourist-attractions')}
    />
  )
}
