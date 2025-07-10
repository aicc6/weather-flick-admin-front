import { useTranslation } from 'react-i18next'
import { PageHeader } from './PageHeader'

export function DashboardHeader() {
  const { t } = useTranslation()

  return (
    <PageHeader
      title={t('dashboard.title')}
      description={t('dashboard.description')}
    />
  )
}
