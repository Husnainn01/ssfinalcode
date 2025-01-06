import { Clock } from 'lucide-react'
import { useJapanTime } from '@/hooks/useJapanTime'

export function JapanTimeDisplay() {
  const { japanTime } = useJapanTime()

  if (!japanTime) {
    return (
      <div className="flex items-center gap-1 text-sm">
        <Clock className="h-4 w-4" />
        <span>Loading...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 text-sm">
      <Clock className="h-4 w-4" />
      <span>Japan Time: {japanTime}</span>
    </div>
  )
}
