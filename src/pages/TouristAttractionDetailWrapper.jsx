import { useParams } from 'react-router-dom'
import TouristAttractionDetail from './TouristAttractionDetail'

export default function TouristAttractionDetailWrapper() {
  const { contentId } = useParams()
  return <TouristAttractionDetail contentId={contentId} />
}
