import { useTranslation } from 'react-i18next'

export function LoadingState() {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-center py-24 text-[#888888] text-sm gap-2">
      <span className="h-3.5 w-3.5 rounded-full border-2 border-[#2a2a2a] border-t-[#6B5CE7] animate-spin" />
      {t('common.loading')}
    </div>
  )
}

export function NotFoundState({ message }: { message: string }) {
  return <div className="text-center py-24 text-[#888888] text-sm">{message}</div>
}
