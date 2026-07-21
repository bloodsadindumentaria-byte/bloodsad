import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'

export function BackLink() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className="inline-flex items-center gap-1.5 text-sm text-[#888888] hover:text-[#e0e0e0] transition-colors mb-3"
    >
      <ArrowLeft className="h-4 w-4" />
      {t('common.back')}
    </button>
  )
}
